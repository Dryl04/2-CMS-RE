import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

export const DEFAULT_TEMP_PASSWORD_HASH =
  "$2b$10$dQkoICwIrfsixo/jUzsu7OWaQQdcE94DOQpYi1UirxLceVTQrkNTS";

interface CliOptions {
  inputPath: string;
  outputPath: string;
  tempPasswordHash: string;
}

function stripLeadingSqlComments(input: string): string {
  return input.replace(/^(?:\s*--.*(?:\r?\n|$))+/, "").trimStart();
}

function splitSqlStatements(sql: string): string[] {
  const statements: string[] = [];
  let current = "";
  let inString = false;

  for (let index = 0; index < sql.length; index += 1) {
    const char = sql[index];
    const next = sql[index + 1];

    if (!inString && char === "-" && next === "-") {
      while (index < sql.length && sql[index] !== "\n") {
        index += 1;
      }
      continue;
    }

    current += char;

    if (char === "'") {
      if (inString && next === "'") {
        current += next;
        index += 1;
        continue;
      }

      inString = !inString;
      continue;
    }

    if (char === ";" && !inString) {
      const statement = current.trim();
      if (statement) {
        statements.push(statement);
      }
      current = "";
    }
  }

  const trailingStatement = current.trim();
  if (trailingStatement) {
    statements.push(trailingStatement);
  }

  return statements;
}

function splitSqlList(input: string): string[] {
  const values: string[] = [];
  let current = "";
  let inString = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const next = input[index + 1];

    if (char === "'") {
      current += char;

      if (inString && next === "'") {
        current += next;
        index += 1;
        continue;
      }

      inString = !inString;
      continue;
    }

    if (char === "," && !inString) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  if (current.trim()) {
    values.push(current.trim());
  }

  return values;
}

function parseColumns(columnsRaw: string): string[] {
  return columnsRaw
    .split(",")
    .map((column) => column.trim().replace(/^"+|"+$/g, ""))
    .filter(Boolean);
}

function normalizeNullableValue(value: string | undefined): string {
  return value?.trim() || "NULL";
}

function toSqlStringLiteral(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function convertJsonbUuidArrayValue(value: string | undefined): string {
  const normalized = normalizeNullableValue(value);

  if (/^NULL$/i.test(normalized)) {
    return "ARRAY[]::uuid[]";
  }

  const jsonbMatch = normalized.match(/^'(.*)'::jsonb$/is);
  if (!jsonbMatch) {
    return normalized;
  }

  try {
    const parsed = JSON.parse(jsonbMatch[1].replace(/''/g, "'"));
    if (!Array.isArray(parsed)) {
      return normalized;
    }

    if (parsed.length === 0) {
      return "ARRAY[]::uuid[]";
    }

    return `ARRAY[${parsed.map((item) => toSqlStringLiteral(String(item))).join(", ")}]::uuid[]`;
  } catch {
    return normalized;
  }
}

function transformUserProfilesInsert(
  statement: string,
  tempPasswordHash: string,
): string {
  const match = statement.match(
    /^INSERT INTO public\.(?:"user_profiles"|user_profiles)\s*\(([\s\S]*?)\)\s*VALUES\s*\(([\s\S]*?)\);?\s*$/i,
  );

  if (!match) {
    return statement;
  }

  const columns = parseColumns(match[1]);
  const values = splitSqlList(match[2]);
  const valueByColumn = new Map(
    columns.map((column, index) => [column, values[index] ?? "NULL"]),
  );

  const usersColumns = [
    "id",
    "email",
    "password_hash",
    "full_name",
    "role",
    "avatar_url",
    "created_at",
    "updated_at",
  ];

  const usersValues = [
    normalizeNullableValue(valueByColumn.get("id")),
    normalizeNullableValue(valueByColumn.get("email")),
    `'${tempPasswordHash}'`,
    normalizeNullableValue(valueByColumn.get("full_name")),
    normalizeNullableValue(valueByColumn.get("role")),
    normalizeNullableValue(valueByColumn.get("avatar_url")),
    normalizeNullableValue(valueByColumn.get("created_at")),
    normalizeNullableValue(valueByColumn.get("updated_at")),
  ];

  return `INSERT INTO public.users (${usersColumns.join(", ")}) VALUES (${usersValues.join(", ")});`;
}

function transformGlobalHfSettingsInsert(statement: string): string {
  const match = statement.match(
    /^INSERT INTO public\."global_hf_settings"\s*\(([\s\S]*?)\)\s*VALUES\s*\(([\s\S]*?)\);?\s*$/i,
  );

  if (!match) {
    return statement;
  }

  const columns = parseColumns(match[1]);
  const values = splitSqlList(match[2]);

  const transformedValues = columns.map((column, index) => {
    const value = values[index] ?? "NULL";

    if (column === "target_page_ids") {
      return convertJsonbUuidArrayValue(value);
    }

    return value;
  });

  const quotedColumns = columns.map((column) => `"${column}"`);

  return `INSERT INTO public."global_hf_settings" (${quotedColumns.join(", ")}) VALUES (${transformedValues.join(", ")});`;
}

export function transformSql(
  sql: string,
  tempPasswordHash = DEFAULT_TEMP_PASSWORD_HASH,
): string {
  const statements = splitSqlStatements(sql);

  const transformedStatements = statements.flatMap((statement) => {
    if (/\bauth\./i.test(statement)) {
      return [];
    }

    const normalizedStatement = stripLeadingSqlComments(statement);

    if (
      /^INSERT INTO public\.(?:"user_profiles"|user_profiles)\s*\(/i.test(
        normalizedStatement,
      )
    ) {
      return [
        transformUserProfilesInsert(normalizedStatement, tempPasswordHash),
      ];
    }

    if (
      /^INSERT INTO public\."global_hf_settings"\s*\(/i.test(
        normalizedStatement,
      )
    ) {
      return [transformGlobalHfSettingsInsert(normalizedStatement)];
    }

    return [
      normalizedStatement.endsWith(";")
        ? normalizedStatement
        : `${normalizedStatement};`,
    ];
  });

  return [
    "-- Generated by scripts/transform-export.ts",
    "-- Temporary password hashes injected for migrated users.",
    ...transformedStatements,
    "",
  ].join("\n");
}

function parseCliOptions(argv: string[]): CliOptions {
  const rootDir = resolve(import.meta.dirname, "..");
  const options: CliOptions = {
    inputPath: resolve(rootDir, "scripts/supabase_export.sql"),
    outputPath: resolve(rootDir, "scripts/postgres_import.sql"),
    tempPasswordHash:
      process.env.MIGRATION_TEMP_PASSWORD_HASH || DEFAULT_TEMP_PASSWORD_HASH,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--input" && next) {
      options.inputPath = resolve(next);
      index += 1;
      continue;
    }

    if (arg === "--output" && next) {
      options.outputPath = resolve(next);
      index += 1;
      continue;
    }

    if (arg === "--temp-password-hash" && next) {
      options.tempPasswordHash = next;
      index += 1;
    }
  }

  return options;
}

async function main() {
  const options = parseCliOptions(process.argv.slice(2));
  const input = await readFile(options.inputPath, "utf8");
  const output = transformSql(input, options.tempPasswordHash);
  await writeFile(options.outputPath, output, "utf8");
  console.log(`Import SQL generated: ${options.outputPath}`);
}

const entrypoint = process.argv[1] ? resolve(process.argv[1]) : null;
if (entrypoint && import.meta.url === `file://${entrypoint}`) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export {
  convertJsonbUuidArrayValue,
  parseCliOptions,
  splitSqlList,
  transformGlobalHfSettingsInsert,
  transformUserProfilesInsert,
};
