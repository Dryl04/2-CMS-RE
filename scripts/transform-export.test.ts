import assert from "node:assert/strict";
import { test } from "node:test";

import {
  convertJsonbUuidArrayValue,
  DEFAULT_TEMP_PASSWORD_HASH,
  splitSqlList,
  transformGlobalHfSettingsInsert,
  transformSql,
  transformUserProfilesInsert,
} from "./transform-export.ts";

test("splitSqlList keeps commas inside SQL strings", () => {
  const parts = splitSqlList(
    "'user-1', 'Jean, Dupont', '{\"role\":\"admin\"}', NULL",
  );

  assert.deepEqual(parts, [
    "'user-1'",
    "'Jean, Dupont'",
    '\'{"role":"admin"}\'',
    "NULL",
  ]);
});

test("transformUserProfilesInsert remaps user_profiles rows to users with a temp password hash", () => {
  const statement =
    'INSERT INTO public."user_profiles" ("id", "email", "full_name", "role", "avatar_url", "created_at", "updated_at") VALUES (\'user-1\', \'landry@example.com\', \'Landry\', \'seo_manager\', NULL, \'2024-01-01T00:00:00.000Z\', \'2024-01-02T00:00:00.000Z\');';

  const output = transformUserProfilesInsert(
    statement,
    DEFAULT_TEMP_PASSWORD_HASH,
  );

  assert.match(output, /^INSERT INTO public\.users/);
  assert.match(output, /password_hash/);
  assert.match(output, /must_change_password/);
  assert.match(
    output,
    new RegExp(DEFAULT_TEMP_PASSWORD_HASH.replace(/\$/g, "\\$")),
  );
  assert.match(output, /true/);
  assert.match(output, /'seo_manager'/);
});

test("transformSql removes auth references and preserves regular public inserts", () => {
  const input = `
    SET statement_timeout = 0;
    INSERT INTO auth.audit_log (id) VALUES ('audit-1');
    -- Table: user_profiles
    INSERT INTO public."user_profiles" ("id", "email", "full_name", "role", "created_at", "updated_at") VALUES ('user-1', 'landry@example.com', 'Landry', 'admin', '2024-01-01T00:00:00.000Z', '2024-01-02T00:00:00.000Z');
    INSERT INTO public."seo_metadata" ("id", "page_key", "title") VALUES ('page-1', 'landing-home', 'Landing Home');
  `;

  const output = transformSql(input);

  assert.ok(!output.includes("auth.audit_log"));
  assert.ok(output.includes("INSERT INTO public.users"));
  assert.ok(output.includes('INSERT INTO public."seo_metadata"'));
  assert.ok(output.includes("ChangeMe123!") === false);
});

test("transformSql keeps semicolons inside SQL string literals intact", () => {
  const input = `
    INSERT INTO public."page_templates" ("id", "name", "sections_data") VALUES ('tpl-1', 'Template', '[{"type":"embed","content":"<p>a;b</p>"}]'::jsonb);
    INSERT INTO public."user_profiles" ("id", "email", "full_name", "role", "created_at", "updated_at") VALUES ('user-2', 'arcadius@example.com', 'Arcadius', 'content_creator', '2024-01-01T00:00:00.000Z', '2024-01-02T00:00:00.000Z');
  `;

  const output = transformSql(input);

  assert.ok(output.includes("<p>a;b</p>"));
  assert.ok(output.includes("INSERT INTO public.users"));
  assert.ok(output.includes('INSERT INTO public."page_templates"'));
});

test("convertJsonbUuidArrayValue converts jsonb arrays and NULL to uuid[] literals", () => {
  assert.equal(
    convertJsonbUuidArrayValue(`'["a","b"]'::jsonb`),
    `ARRAY['a', 'b']::uuid[]`,
  );
  assert.equal(convertJsonbUuidArrayValue(`'[]'::jsonb`), "ARRAY[]::uuid[]");
  assert.equal(convertJsonbUuidArrayValue("NULL"), "ARRAY[]::uuid[]");
});

test("transformGlobalHfSettingsInsert rewrites target_page_ids to uuid[]", () => {
  const statement =
    'INSERT INTO public."global_hf_settings" ("id", "label", "target_page_ids") VALUES (\'cfg-1\', \'Header\', \'["11111111-1111-1111-1111-111111111111","22222222-2222-2222-2222-222222222222"]\'::jsonb);';

  const output = transformGlobalHfSettingsInsert(statement);

  assert.match(
    output,
    /ARRAY\['11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222'\]::uuid\[\]/,
  );
});
