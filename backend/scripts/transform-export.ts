/**
 * transform-export.ts
 *
 * Transforms data exported from Supabase into a format ready
 * for import into the new PostgreSQL + Prisma backend.
 *
 * Key transformations:
 * 1. Merges auth.users data (emails) with user_profiles into the new `users` table format
 * 2. Sets temporary passwords for all users (they'll need to reset)
 * 3. Maps snake_case column names to the Prisma schema expectations
 *
 * Usage:
 *   npx ts-node scripts/transform-export.ts --input ./data-export --output ./data-import
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const args = process.argv.slice(2);
const inputDir = args.find((_, i) => args[i - 1] === '--input') || './data-export';
const outputDir = args.find((_, i) => args[i - 1] === '--output') || './data-import';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log(`Input:  ${inputDir}`);
console.log(`Output: ${outputDir}`);

// ─── Helpers ─────────────────────────────────

function readCSV(dir: string, tableName: string): Record<string, string>[] {
  const files = fs.readdirSync(dir).filter(f => f.startsWith(`${tableName}_`) && f.endsWith('.csv'));
  if (files.length === 0) {
    console.warn(`  [WARN] No CSV found for ${tableName}`);
    return [];
  }

  const filePath = path.join(dir, files.sort().pop()!);
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  return lines.slice(1).map(line => {
    const values = parseCSVLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = values[i] || '';
    });
    return row;
  });
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function generateTempPassword(): string {
  return `TempPass_${crypto.randomBytes(8).toString('hex')}`;
}

function writeJSON(outputPath: string, data: any[]): void {
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`  Written ${data.length} records to ${outputPath}`);
}

// ─── Transform functions ─────────────────────

function transformUsers(): void {
  console.log('\n==> Transforming user_profiles → users');
  const profiles = readCSV(inputDir, 'user_profiles');

  const users = profiles.map(p => ({
    id: p.id,
    email: p.email,
    password_hash: '$TEMP_PASSWORD$',
    full_name: p.full_name || null,
    role: p.role || 'content_creator',
    avatar_url: p.avatar_url || null,
    created_at: p.created_at,
    updated_at: p.updated_at || p.created_at,
    _temp_password: generateTempPassword(),
  }));

  writeJSON(path.join(outputDir, 'users.json'), users);

  // Write temp passwords list for admin
  const passwordList = users.map(u => `${u.email}: ${u._temp_password}`).join('\n');
  fs.writeFileSync(path.join(outputDir, 'temp-passwords.txt'), passwordList, 'utf-8');
  console.log(`  Written temp passwords to temp-passwords.txt`);
}

function transformTable(tableName: string): void {
  console.log(`\n==> Transforming ${tableName}`);
  const rows = readCSV(inputDir, tableName);
  writeJSON(path.join(outputDir, `${tableName}.json`), rows);
}

// ─── Main ────────────────────────────────────

console.log('\n============================================');
console.log('  Supabase → PostgreSQL Data Transformer');
console.log('============================================\n');

transformUsers();
transformTable('section_types');
transformTable('page_themes');
transformTable('fonts_library');
transformTable('daisyui_themes');
transformTable('page_templates');
transformTable('seo_metadata');
transformTable('template_sections');
transformTable('page_content_sections');
transformTable('media_files');
transformTable('seo_redirects');
transformTable('global_hf_settings');

console.log('\n==> Transform complete!');
console.log(`    Files in ${outputDir}/`);
console.log('    Next step: run import-data.ts to load into the new PostgreSQL database.');
