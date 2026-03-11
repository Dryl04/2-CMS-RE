# CMS RE Backend Foundation

This directory contains the first production-minded backend foundation for the CMS migration from direct Supabase access to a NestJS + Prisma API.

The implementation matches the migration plan goals for:

- NestJS feature-module architecture
- Prisma schema covering the target CMS data model
- JWT authentication with role-based authorization
- Public page and redirects read endpoints
- Authenticated CRUD foundations for pages, templates, media, themes, redirects, and global header/footer settings
- Local uploads with a storage abstraction ready for Cloudflare R2 later
- Unit and functional/e2e-style tests that mock Prisma instead of requiring a live database

## Structure

```text
backend/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── auth/
│   ├── global-hf/
│   ├── media/
│   ├── pages/
│   ├── prisma/
│   ├── redirects/
│   ├── storage/
│   ├── templates/
│   └── themes/
├── test/
├── uploads/
├── Dockerfile
├── nest-cli.json
├── package.json
├── tsconfig.build.json
└── tsconfig.json
```

## Environment variables

The root `.env.example` is the source of truth for local setup. The backend uses these variables:

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `DATABASE_URL` | Yes for real DB work | – | Prisma PostgreSQL connection string |
| `PORT` | No | `3001` | NestJS HTTP port |
| `NODE_ENV` | No | `development` | Runtime mode |
| `JWT_SECRET` | Yes in real environments | fallback for tests/dev only | JWT signing secret |
| `JWT_EXPIRES_IN` | No | `7d` | Access token lifetime |
| `JWT_REFRESH_SECRET` | No for current foundation | – | Reserved for refresh-token phase |
| `JWT_REFRESH_EXPIRES_IN` | No | `30d` | Reserved for refresh-token phase |
| `CORS_ORIGIN` | No | `http://localhost:5173` | Allowed frontend origin |
| `STORAGE_TYPE` | No | `local` | `local` or `r2` |
| `UPLOADS_DIR` | No | `./uploads` | Local uploads directory |
| `UPLOADS_PUBLIC_PATH` | No | `/uploads` | Public path served by Nest |
| `R2_ACCOUNT_ID` | Only if `STORAGE_TYPE=r2` | – | Cloudflare R2 account |
| `R2_ACCESS_KEY_ID` | Only if `STORAGE_TYPE=r2` | – | Cloudflare R2 access key |
| `R2_SECRET_ACCESS_KEY` | Only if `STORAGE_TYPE=r2` | – | Cloudflare R2 secret key |
| `R2_BUCKET_NAME` | Only if `STORAGE_TYPE=r2` | – | R2 bucket name |
| `R2_PUBLIC_URL` | Only if `STORAGE_TYPE=r2` | – | Public base URL for media |

## Install

From the repository root:

```bash
cd backend
npm install
npm run prisma:generate
```

## Local development

1. Copy the root env template:

   ```bash
   cp .env.example .env
   ```

2. Start PostgreSQL (optional for build/tests, required for real Prisma queries):

   ```bash
   docker compose up -d postgres
   ```

3. Start the backend:

   ```bash
   cd backend
   npm run start:dev
   ```

The API will be available on `http://localhost:3001` by default.

## Build and test

### Build

```bash
cd backend
npm run prisma:generate
npm run build
```

### Unit tests

```bash
cd backend
npm test
```

### Functional / e2e-style tests

```bash
cd backend
npm run test:e2e
```

### Prisma validation

```bash
cd backend
npm run prisma:validate
```

> Important: tests are intentionally designed to mock `PrismaService`. No live database is required for unit tests or e2e-style request tests.

## Current endpoint surface

### Auth

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | Public | Create a user with default `content_creator` role |
| `POST` | `/auth/login` | Public | Exchange email/password for JWT |
| `POST` | `/auth/logout` | JWT | Stateless logout placeholder for current foundation |
| `GET` | `/auth/me` | JWT | Return the authenticated user profile |

### Pages

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/pages/public/:pageKey` | Public | Return a published page by key |
| `GET` | `/api/pages/public/redirects` | Public | Return active public redirects |
| `GET` | `/api/pages` | JWT | List pages, optional filters: `status`, `folder`, `search` |
| `POST` | `/api/pages` | JWT | Create a page |
| `PATCH` | `/api/pages/:id` | JWT | Update a page |
| `DELETE` | `/api/pages/:id` | JWT + `admin`/`seo_manager` | Delete a page |

### Templates

| Method | Route | Auth |
| --- | --- | --- |
| `GET` | `/api/templates` | JWT |
| `POST` | `/api/templates` | JWT |
| `PATCH` | `/api/templates/:id` | JWT |
| `DELETE` | `/api/templates/:id` | JWT + `admin`/`seo_manager` |

### Media

| Method | Route | Auth |
| --- | --- | --- |
| `GET` | `/api/media` | JWT |
| `POST` | `/api/media/upload` | JWT |
| `DELETE` | `/api/media/:id` | JWT |

### Themes and fonts

| Method | Route | Auth |
| --- | --- | --- |
| `GET` | `/api/themes/page` | JWT |
| `POST` | `/api/themes/page` | JWT |
| `PATCH` | `/api/themes/page/:id` | JWT |
| `DELETE` | `/api/themes/page/:id` | JWT |
| `GET` | `/api/themes/daisy` | JWT |
| `POST` | `/api/themes/daisy` | JWT + `admin` |
| `PATCH` | `/api/themes/daisy/:id` | JWT + `admin` |
| `DELETE` | `/api/themes/daisy/:id` | JWT + `admin` |
| `GET` | `/api/fonts` | JWT |
| `POST` | `/api/fonts` | JWT |
| `DELETE` | `/api/fonts/:id` | JWT + `admin` |

### Redirects

| Method | Route | Auth |
| --- | --- | --- |
| `GET` | `/api/redirects` | JWT |
| `POST` | `/api/redirects` | JWT |
| `PATCH` | `/api/redirects/:id` | JWT |
| `DELETE` | `/api/redirects/:id` | JWT + `admin`/`seo_manager` |

### Global header/footer settings

| Method | Route | Auth |
| --- | --- | --- |
| `GET` | `/api/global-hf` | JWT |
| `POST` | `/api/global-hf` | JWT + `admin` |
| `PATCH` | `/api/global-hf/:id` | JWT + `admin` |
| `DELETE` | `/api/global-hf/:id` | JWT + `admin` |

## Notes on scope

- The schema is aligned with the migration plan sections **Architecture cible** and **Étape 3**.
- The storage abstraction is intentionally ready for later R2 usage, but local storage is the default and fully usable now.
- Refresh tokens, password reset/change flows, and data migration scripts are intentionally left for later migration steps.
- All build/test paths are designed to avoid accidental database access by mocking Prisma in tests.
