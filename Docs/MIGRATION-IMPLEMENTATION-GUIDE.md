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
export SUPABASE_DB_URL='postgresql://postgres:password@db.example.supabase.co:5432/postgres?sslmode=require'
npm run migrate:export-supabase
```

This writes `scripts/supabase_export.sql`.

### 2. Transform the export for the new schema

```bash
npm run migrate:transform-export
```

This writes `scripts/postgres_import.sql`.

What the transform currently does:

- removes statements referencing the `auth` schema
- converts `public.user_profiles` inserts into `public.users`
- injects a temporary bcrypt hash for the password `ChangeMe123!`
- preserves other public table inserts as-is

### 3. Import into PostgreSQL

```bash
psql "$DATABASE_URL" < scripts/postgres_import.sql
```

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
