# Migration implementation guide

This document captures the implemented migration foundation from direct Supabase access to a PostgreSQL + NestJS architecture, plus the operational steps required to run it safely.

## What is implemented

### Backend foundation

- `backend/` now contains a NestJS application with Prisma and JWT auth.
- Prisma models cover the migration target for users, pages, templates, themes, fonts, redirects, media, and global header/footer settings.
- The backend serves local uploads from `/uploads` and exposes CRUD routes aligned with `MIGRATION_PLAN.md`.
- Unit tests and e2e-style tests are included in `backend/src/**/*.spec.ts` and `backend/test/**`.

### Frontend migration slice

- `src/lib/api.ts` is the new HTTP layer targeting the NestJS backend.
- `src/lib/supabase.ts` is now a transitional compatibility adapter. Existing components can continue to call `supabase.auth.*`, `supabase.from(...)`, and `supabase.storage.from('media')` while traffic is routed to the new backend.
- Critical auth and public page flows are now backed by the NestJS API.
- `src/lib/supabase.test.ts` validates the adapter behavior for auth, public page loading, and media upload bridging.

### Migration data tooling

- `scripts/export-supabase.sh` exports public schema data from Supabase in read-only mode.
- `scripts/transform-export.ts` converts the export into a PostgreSQL import file compatible with the new `users` table.
- `scripts/transform-export.test.ts` covers the transformation logic.
- `scripts/import-postgres.sh` imports `scripts/postgres_import.sql` into any PostgreSQL database URL compatible with the Prisma schema.

## Validation commands

Run these commands from the repository root.

### Frontend

```bash
npm test
npm run build
```

### Backend

```bash
npm run backend:build
npm run backend:test
npm run backend:test:e2e
```

### Docker

```bash
docker compose config -q
```

## Environment setup

1. Copy `.env.example` to `.env`.
2. Fill at minimum:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `VITE_API_URL`
3. For data export only, also set:
   - `SUPABASE_DB_URL`

## Local run workflow

### Start PostgreSQL

```bash
docker compose up -d postgres
```

### Start the backend

```bash
cd backend
npm install
npm run prisma:generate
npm run start:dev
```

### Start the frontend

```bash
npm install
npm run dev
```

## Data migration workflow

### 1. Export Supabase data

```bash
export SUPABASE_DB_POOLER_URL='postgresql://postgres.PROJECT_REF:YOUR_DB_PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres?sslmode=require'
npm run migrate:export-supabase
```

This writes `scripts/supabase_export.sql`.

Notes:

- this export is read-only: `pg_dump` does not modify or delete data in Supabase
- use the Session pooler URL when your machine does not support IPv6 routing
- the direct host `db.PROJECT_REF.supabase.co:5432` is IPv6-only by default

Fallback when no IPv4 pooler is available:

```bash
export SUPABASE_URL='https://jpyzyxdmdqfujprgyndc.supabase.co'
export SUPABASE_SERVICE_ROLE_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpweXp5eGRtZHFmdWpwcmd5bmRjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMxODAxNCwiZXhwIjoyMDg2ODk0MDE0fQ.46-LOAEJpQt3r8nGESD1GSGPO5xltpwVHQrJ6_CO-z0'
npm run migrate:export-supabase
```

This uses the HTTPS REST API in read-only mode and still generates `scripts/supabase_export.sql`.

### 2. Transform the export for the new schema

```bash
npm run migrate:transform-export
```

This writes `scripts/postgres_import.sql`.

What the transform currently does:

- removes statements referencing the `auth` schema
- converts `public.user_profiles` inserts into `public.users`
- injects a temporary bcrypt hash for the password `ChangeMe123!`
- converts `global_hf_settings.target_page_ids` from exported JSONB arrays into PostgreSQL `uuid[]`
- preserves other public table inserts as-is

### 3. Import into PostgreSQL

Recommended command from the repository root:

```bash
npm run migrate:import-postgres
```

This script:

- opens a single SQL transaction
- truncates the migrated tables in dependency-safe order
- imports [scripts/postgres_import.sql](scripts/postgres_import.sql)
- commits only if the full import succeeds

You can also target any PostgreSQL database directly with a connection string, without editing `.env`:

```bash
bash ./scripts/import-postgres.sh --db-url 'postgresql://cms_user:cms_password@localhost:5432/cms_db'
```

Or with a positional argument:

```bash
bash ./scripts/import-postgres.sh 'postgresql://cms_user:cms_password@localhost:5432/cms_db'
```

To import a different SQL file:

```bash
bash ./scripts/import-postgres.sh \
   --db-url 'postgresql://cms_user:cms_password@localhost:5432/cms_db' \
   --file /absolute/path/to/postgres_import.sql
```

Fallback manual command, only if you are sure the target database is empty or already reset:

```bash
psql 'postgresql://cms_user:cms_password@localhost:5432/cms_db' < scripts/postgres_import.sql
```

### 4. Post-import validation

After import, verify that the main migrated tables contain data:

```bash
psql "$DATABASE_URL" -At <<'SQL'
SELECT 'users', count(*) FROM public.users
UNION ALL SELECT 'page_themes', count(*) FROM public.page_themes
UNION ALL SELECT 'daisyui_themes', count(*) FROM public.daisyui_themes
UNION ALL SELECT 'fonts_library', count(*) FROM public.fonts_library
UNION ALL SELECT 'section_types', count(*) FROM public.section_types
UNION ALL SELECT 'page_templates', count(*) FROM public.page_templates
UNION ALL SELECT 'seo_metadata', count(*) FROM public.seo_metadata
UNION ALL SELECT 'media_files', count(*) FROM public.media_files
UNION ALL SELECT 'seo_redirects', count(*) FROM public.seo_redirects
UNION ALL SELECT 'global_hf_settings', count(*) FROM public.global_hf_settings
ORDER BY 1;
SQL
```

Validated import counts on the local migration run:

- `users`: 2
- `page_themes`: 6
- `daisyui_themes`: 35
- `fonts_library`: 12
- `section_types`: 8
- `page_templates`: 23
- `seo_metadata`: 40
- `media_files`: 49
- `seo_redirects`: 4
- `global_hf_settings`: 2

### 5. Authorization notes after migration

The imported users currently receive the role `content_creator`.

The backend now allows `admin`, `seo_manager`, and `content_creator` to manage the main editor resources used in the UI, including:

- global header/footer settings
- templates
- pages
- redirects
- DaisyUI themes
- font deletion

This avoids post-migration `403 Forbidden` errors for authenticated editor users on standard CMS actions.

## Media migration

The backend now supports local uploads through `POST /api/media/upload`.

For existing Supabase-hosted files, keep this rollout plan:

1. import database rows first
2. audit `media_files.file_path`
3. either:
   - keep Supabase URLs temporarily, or
   - download and re-upload assets into `/uploads`

The current adapter keeps working with uploaded backend media and explicitly fails on unsupported direct media writes.

## Password migration note

Supabase Auth password hashes are not exportable through the public schema dump. The current migration tooling therefore assigns every imported user the temporary password:

```text
ChangeMe123!
```

Required rollout action:

1. communicate the reset policy to users
2. implement the planned `POST /auth/change-password` endpoint
3. force password change at first login during the next migration slice

## Known remaining gaps

- Root `npm run lint` still fails because of pre-existing repository issues unrelated to this migration slice.
- Root `npm run typecheck` still fails because of pre-existing type errors unrelated to the migration slice.
- The transitional `src/lib/supabase.ts` adapter should be removed once all components call `src/lib/api.ts` directly.
- The legacy `ThemeContext.tsx` dead code has not been removed yet.
- `@supabase/supabase-js` is still present in `package.json` until the compatibility phase is fully retired.

## Recommended next migration slice

1. remove remaining direct Supabase assumptions from SEO, theme, and media UI modules
2. implement `change-password` and refresh-token flows in the backend
3. migrate or delete legacy duplicate components
4. remove `@supabase/supabase-js`
5. archive `supabase/` assets that are no longer needed
