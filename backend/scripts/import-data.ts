/**
 * import-data.ts
 *
 * Imports transformed data into the new PostgreSQL database via Prisma.
 *
 * Prerequisites:
 * 1. Backend .env configured with DATABASE_URL pointing to the new PostgreSQL
 * 2. `npx prisma migrate deploy` has been run
 * 3. `transform-export.ts` has been run to produce JSON files in data-import/
 *
 * Usage:
 *   npx ts-node scripts/import-data.ts --input ./data-import
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

const args = process.argv.slice(2);
const inputDir = args.find((_, i) => args[i - 1] === '--input') || './data-import';
const prisma = new PrismaClient();

function readJSON(fileName: string): any[] {
  const filePath = path.join(inputDir, fileName);
  if (!fs.existsSync(filePath)) {
    console.warn(`  [WARN] ${filePath} not found, skipping.`);
    return [];
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

async function importUsers(): Promise<void> {
  console.log('\n==> Importing users...');
  const users = readJSON('users.json');

  for (const u of users) {
    const passwordHash = await bcrypt.hash(u._temp_password, 10);
    try {
      await prisma.user.upsert({
        where: { id: u.id },
        update: {},
        create: {
          id: u.id,
          email: u.email,
          passwordHash,
          fullName: u.full_name,
          role: u.role as any,
          avatarUrl: u.avatar_url,
        },
      });
    } catch (err: any) {
      console.warn(`  [WARN] Failed to import user ${u.email}: ${err.message}`);
    }
  }
  console.log(`  Imported ${users.length} users`);
}

async function importSectionTypes(): Promise<void> {
  console.log('\n==> Importing section_types...');
  const rows = readJSON('section_types.json');

  for (const r of rows) {
    try {
      await prisma.sectionType.upsert({
        where: { id: r.id },
        update: {},
        create: {
          id: r.id,
          name: r.name,
          label: r.label,
          description: r.description,
          icon: r.icon,
          schema: r.schema ? JSON.parse(r.schema) : null,
          previewImage: r.preview_image,
          isSystem: r.is_system === 'true' || r.is_system === true,
        },
      });
    } catch (err: any) {
      console.warn(`  [WARN] Failed to import section_type ${r.name}: ${err.message}`);
    }
  }
  console.log(`  Imported ${rows.length} section types`);
}

async function importGenericTable(
  fileName: string,
  upsertFn: (row: any) => Promise<void>,
  label: string,
): Promise<void> {
  console.log(`\n==> Importing ${label}...`);
  const rows = readJSON(fileName);

  let count = 0;
  for (const r of rows) {
    try {
      await upsertFn(r);
      count++;
    } catch (err: any) {
      console.warn(`  [WARN] Failed to import ${label} row: ${err.message}`);
    }
  }
  console.log(`  Imported ${count}/${rows.length} ${label}`);
}

async function main(): Promise<void> {
  console.log('============================================');
  console.log('  Data Import (Supabase → new PostgreSQL)');
  console.log('============================================');

  await importUsers();
  await importSectionTypes();

  await importGenericTable('daisyui_themes.json', async (r) => {
    await prisma.daisyuiTheme.upsert({
      where: { id: r.id },
      update: {},
      create: {
        id: r.id,
        name: r.name,
        slug: r.slug,
        source: r.source as any,
        tokens: typeof r.tokens === 'string' ? JSON.parse(r.tokens) : r.tokens,
        fontConfig: r.font_config ? (typeof r.font_config === 'string' ? JSON.parse(r.font_config) : r.font_config) : null,
        isActive: r.is_active === 'true' || r.is_active === true,
        userId: r.user_id || null,
      },
    });
  }, 'daisyui_themes');

  await importGenericTable('page_themes.json', async (r) => {
    await prisma.pageTheme.upsert({
      where: { id: r.id },
      update: {},
      create: {
        id: r.id,
        name: r.name,
        description: r.description,
        css: r.css ? (typeof r.css === 'string' ? JSON.parse(r.css) : r.css) : null,
        userId: r.user_id || null,
        isDefault: r.is_default === 'true' || r.is_default === true,
      },
    });
  }, 'page_themes');

  await importGenericTable('fonts_library.json', async (r) => {
    await prisma.fontsLibrary.upsert({
      where: { id: r.id },
      update: {},
      create: {
        id: r.id,
        fontName: r.font_name,
        fontFamily: r.font_family,
        fontUrl: r.font_url,
        fontWeights: r.font_weights ? (typeof r.font_weights === 'string' ? JSON.parse(r.font_weights) : r.font_weights) : [],
        isGoogleFont: r.is_google_font === 'true' || r.is_google_font === true,
        importedBy: r.imported_by || null,
        isSystem: r.is_system === 'true' || r.is_system === true,
      },
    });
  }, 'fonts_library');

  await importGenericTable('page_templates.json', async (r) => {
    await prisma.pageTemplate.upsert({
      where: { id: r.id },
      update: {},
      create: {
        id: r.id,
        name: r.name,
        description: r.description,
        thumbnail: r.thumbnail,
        sectionsData: r.sections_data ? (typeof r.sections_data === 'string' ? JSON.parse(r.sections_data) : r.sections_data) : null,
        seoH1: r.seo_h1,
        seoH2: r.seo_h2,
        daisyThemeSlug: r.daisy_theme_slug,
        folder: r.folder,
        isPublic: r.is_public === 'true' || r.is_public === true,
        isSystem: r.is_system === 'true' || r.is_system === true,
        createdBy: r.created_by || null,
      },
    });
  }, 'page_templates');

  await importGenericTable('seo_metadata.json', async (r) => {
    await prisma.seoMetadata.upsert({
      where: { id: r.id },
      update: {},
      create: {
        id: r.id,
        pageKey: r.page_key,
        title: r.title,
        description: r.description,
        keywords: r.keywords ? (typeof r.keywords === 'string' ? JSON.parse(r.keywords) : r.keywords) : [],
        ogTitle: r.og_title,
        ogDescription: r.og_description,
        ogImage: r.og_image,
        canonicalUrl: r.canonical_url,
        language: r.language || 'fr',
        status: r.status as any,
        content: r.content,
        sectionsData: r.sections_data ? (typeof r.sections_data === 'string' ? JSON.parse(r.sections_data) : r.sections_data) : null,
        seoH1: r.seo_h1,
        seoH2: r.seo_h2,
        daisyThemeSlug: r.daisy_theme_slug,
        folder: r.folder,
        userId: r.user_id || null,
        templateId: r.template_id || null,
      },
    });
  }, 'seo_metadata');

  await importGenericTable('seo_redirects.json', async (r) => {
    await prisma.seoRedirect.upsert({
      where: { id: r.id },
      update: {},
      create: {
        id: r.id,
        sourcePath: r.source_path,
        targetPath: r.target_path,
        sourcePageId: r.source_page_id || null,
        targetPageId: r.target_page_id || null,
        reason: r.reason,
        isActive: r.is_active === 'true' || r.is_active === true,
        createdBy: r.created_by || null,
      },
    });
  }, 'seo_redirects');

  await importGenericTable('global_hf_settings.json', async (r) => {
    await prisma.globalHfSetting.upsert({
      where: { id: r.id },
      update: {},
      create: {
        id: r.id,
        label: r.label,
        headerSection: r.header_section ? (typeof r.header_section === 'string' ? JSON.parse(r.header_section) : r.header_section) : null,
        footerSection: r.footer_section ? (typeof r.footer_section === 'string' ? JSON.parse(r.footer_section) : r.footer_section) : null,
        applyOnImport: r.apply_on_import === 'true' || r.apply_on_import === true,
        applyOnCreate: r.apply_on_create === 'true' || r.apply_on_create === true,
        isActive: r.is_active === 'true' || r.is_active === true,
        targetPageIds: r.target_page_ids ? (typeof r.target_page_ids === 'string' ? JSON.parse(r.target_page_ids) : r.target_page_ids) : [],
        createdBy: r.created_by || null,
      },
    });
  }, 'global_hf_settings');

  console.log('\n==> Import complete!');
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('Import failed:', err);
  prisma.$disconnect();
  process.exit(1);
});
