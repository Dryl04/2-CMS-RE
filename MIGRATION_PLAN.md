# Plan de migration : Supabase → PostgreSQL direct

> **Statut : FINALISÉ — prêt pour implémentation**
> Basé sur les réponses aux questions cruciales du 2026-03-10.

---

## Choix techniques retenus

| Sujet                | Choix                                                                                  |
| -------------------- | -------------------------------------------------------------------------------------- |
| Infrastructure       | VPS IONOS + Dokploy (gestion des conteneurs Docker)                                    |
| Stockage fichiers    | Local (`/uploads`) dans un premier temps, abstraction pour basculer vers Cloudflare R2 |
| Framework backend    | **NestJS** (TypeScript natif, architecture modules/controllers/services)               |
| ORM                  | **Prisma** (migrations, client type-safe, seed)                                        |
| Données Supabase     | Export `pg_dump` en lecture seule — aucune modification de la base Supabase existante  |
| Pages publiques      | SPA maintenue, endpoints GET publics (sans JWT)                                        |
| Env de développement | GitHub Codespace + Docker Compose (PostgreSQL en conteneur)                            |

---

## ⚠️ Avertissements critiques avant de commencer

### 1. Mots de passe utilisateurs non exportables

Les mots de passe sont gérés par Supabase Auth dans le schéma `auth` (non accessible via `pg_dump` du schéma `public`). La migration des données utilisateurs exporte leurs profils (`user_profiles`) mais **pas leurs mots de passe**. Après migration, chaque utilisateur devra réinitialiser son mot de passe via un flow "mot de passe oublié" ou se voir attribuer un mot de passe temporaire.

### 2. Intégrité des données Supabase garantie

La procédure d'export utilise uniquement `pg_dump` en lecture seule sur la connexion directe Supabase. Aucune écriture, aucun `DROP`, aucune modification ne sera effectuée sur la base Supabase.

### 3. La table `themes` dans `ThemeContext.tsx` est du code mort

`src/contexts/ThemeContext.tsx` référence une table `themes` qui n'existe dans aucune migration Supabase. Ce code sera supprimé lors de la migration.

---

## Architecture cible

```
┌─────────────────────────────────────────────────────────────────┐
│  VPS IONOS — géré par Dokploy                                   │
│                                                                  │
│  ┌─────────────────┐    ┌──────────────────────────────────┐    │
│  │  React SPA      │    │  NestJS API (backend/)           │    │
│  │  (Vite, nginx)  │───▶│                                  │    │
│  │                 │    │  ├── AuthModule (JWT + bcrypt)    │    │
│  │  fetch() vers   │    │  ├── PagesModule                  │    │
│  │  /api/*         │    │  ├── TemplatesModule              │    │
│  └─────────────────┘    │  ├── MediaModule                  │    │
│                         │  ├── ThemesModule                 │    │
│                         │  ├── RedirectsModule              │    │
│                         │  ├── GlobalHFModule               │    │
│                         │  └── StorageModule (local → R2)  │    │
│                         │            │             │         │    │
│                         │      Prisma Client       │         │    │
│                         └────────────┼─────────────┘         │    │
│                                      │                        │    │
│  ┌───────────────────┐  ┌────────────▼────────────┐          │    │
│  │  /uploads volume  │  │  PostgreSQL 16           │          │    │
│  │  (fichiers médias)│  │  (données CMS)           │          │    │
│  └───────────────────┘  └──────────────────────────┘          │    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Analyse des migrations Supabase

### ✅ Migrations réutilisables (DDL PostgreSQL standard)

Ces fichiers ne contiennent que des `CREATE TABLE`, `ALTER TABLE`, `INSERT` (seeds) valides en PostgreSQL standard. Leur contenu sera transposé dans le schéma Prisma.

| Fichier                                                     | Contenu utile                                                                                                              |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `20260207101206_create_seo_metadata_table.sql`              | DDL `seo_metadata` — garder sans les policies RLS                                                                          |
| `20260207104624_add_content_column_to_seo_metadata.sql`     | `ALTER TABLE` colonne `content`                                                                                            |
| `20260213085718_create_page_templates_and_sections.sql`     | DDL `section_types`, `page_templates`, `template_sections`, `page_content_sections`, `media_files` + seeds `section_types` |
| `20260213110831_add_sections_data_jsonb_columns.sql`        | `ALTER TABLE` colonnes `sections_data jsonb`                                                                               |
| `20260213133805_add_seo_headings_to_templates.sql`          | `ALTER TABLE` colonnes `seo_h1`, `seo_h2` sur `page_templates`                                                             |
| `20260213133813_add_seo_headings_to_seo_metadata.sql`       | `ALTER TABLE` colonnes `seo_h1`, `seo_h2` sur `seo_metadata`                                                               |
| `20260216080708_create_page_themes_table.sql`               | DDL `page_themes` + seeds 6 thèmes typographiques                                                                          |
| `20260216083928_create_fonts_library.sql`                   | DDL `fonts_library` + seeds 8 Google Fonts                                                                                 |
| `20260216084347_update_page_themes_with_new_colors.sql`     | `UPDATE` seeds `page_themes` (nouvelles couleurs)                                                                          |
| `20260216093247_create_daisyui_themes_table.sql`            | DDL `daisyui_themes` + seeds 32 thèmes DaisyUI                                                                             |
| `20260216104010_add_font_config_to_daisyui_themes.sql`      | `ALTER TABLE` colonne `font_config jsonb`                                                                                  |
| `20260216120400_add_daisy_theme_to_pages.sql`               | `ALTER TABLE` colonne `daisy_theme_slug` sur `seo_metadata` et `page_templates`                                            |
| `20260217113000_add_daisy_theme_slug_to_page_templates.sql` | `ALTER TABLE` `daisy_theme_slug` sur `page_templates` — vérifier doublon avec précédent                                    |
| `20260218090100_add_folder_columns.sql`                     | `ALTER TABLE` colonne `folder` + index sur `seo_metadata` et `page_templates`                                              |
| `20260226112000_create_seo_redirects_table.sql`             | DDL `seo_redirects` — garder sans policies                                                                                 |
| `20260302162921_create_global_header_footer_settings.sql`   | DDL `global_hf_settings` — garder sans policies                                                                            |
| `20260302171936_add_page_ids_to_global_hf_settings.sql`     | `ALTER TABLE` colonne `target_page_ids uuid[]`                                                                             |

### ❌ Migrations à ignorer complètement (RLS/Storage Supabase uniquement)

| Fichier                                                               | Raison                                                                                |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `20260207104305_update_seo_metadata_rls_policies.sql`                 | Uniquement des `CREATE POLICY` Supabase                                               |
| `20260213090200_setup_storage_for_media_fixed.sql`                    | Supabase Storage (`storage.buckets`, `storage.objects`) — remplacé par stockage local |
| `20260213101218_add_delete_policy_for_page_templates.sql`             | Uniquement une `CREATE POLICY`                                                        |
| `20260213103543_add_missing_delete_policy_seo_metadata.sql`           | Uniquement une `CREATE POLICY`                                                        |
| `20260213103621_add_insert_policy_user_profiles.sql`                  | Uniquement une `CREATE POLICY`                                                        |
| `20260213103633_add_delete_policy_page_content_sections.sql`          | Uniquement une `CREATE POLICY`                                                        |
| `20260216101148_fix_daisyui_themes_rls_policies.sql`                  | Uniquement des `CREATE POLICY`                                                        |
| `20260218090000_fix_rls_insert_update_seo_metadata.sql`               | Uniquement des `CREATE POLICY`                                                        |
| `20260302165048_add_content_creator_access_to_global_hf_settings.sql` | Uniquement une `CREATE POLICY`                                                        |
| `20260305184750_add_anon_select_policy_global_hf_settings.sql`        | Uniquement une `CREATE POLICY`                                                        |

### ⚠️ Migrations à adapter

| Fichier                                                   | Problème                                                                             | Action                                                                             |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| `20260213085639_create_user_profiles_and_roles.sql`       | FK `REFERENCES auth.users(id)` + trigger sur `auth.users`                            | Réécrire : `user_profiles` fusionné en table `users` autonome avec `password_hash` |
| `20260213101650_fix_user_profiles_infinite_recursion.sql` | Fonctions `is_admin()` / `is_admin_or_manager()` créées pour contourner RLS récursif | Ces fonctions deviennent des guards NestJS (`RolesGuard`) — ignorer le SQL         |
| `20260213101717_add_role_check_functions.sql`             | Fonctions SQL + policies RLS                                                         | Idem — logique portée en guards NestJS                                             |
| `20260213103531_fix_rls_policies_and_user_role_v2.sql`    | Nettoyage policies + renommage `contributor` → `content_creator`                     | Garder uniquement la normalisation du rôle dans le seed ou la migration Prisma     |
| `20260217124500_fix_signup_role_default_and_trigger.sql`  | Trigger `handle_new_user` sur `auth.users`                                           | Logique portée dans `AuthService.register()` NestJS                                |

---

## Plan d'implémentation — 8 étapes

---

### Étape 1 — Fichier `.env.example` (à créer à la racine)

Créer `/workspaces/2-CMS-RE/.env.example` :

```dotenv
# =============================================================
# .env.example — CMS RE
# Copier ce fichier en .env et remplir les valeurs
# =============================================================

# === Base de données PostgreSQL ===
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE_NAME

# === NestJS Backend ===
PORT=3001
NODE_ENV=development

# === JWT Auth ===
# Générer avec : openssl rand -base64 64
JWT_SECRET=your-very-long-random-secret-minimum-32-characters
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=another-different-random-secret-for-refresh-tokens
JWT_REFRESH_EXPIRES_IN=30d

# === CORS — URL du frontend React ===
CORS_ORIGIN=http://localhost:5173

# === Stockage fichiers ===
# Valeurs possibles : "local" | "r2"
STORAGE_TYPE=local

# --- Stockage local (utilisé quand STORAGE_TYPE=local) ---
UPLOADS_DIR=./uploads
UPLOADS_PUBLIC_PATH=/uploads

# --- Cloudflare R2 (décommenter quand STORAGE_TYPE=r2) ---
# R2_ACCOUNT_ID=your-cloudflare-account-id
# R2_ACCESS_KEY_ID=your-r2-access-key-id
# R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
# R2_BUCKET_NAME=media
# R2_PUBLIC_URL=https://your-custom-domain-or-pub-r2-url.com

# =============================================================
# Variables FRONTEND (Vite) — préfixe VITE_ obligatoire
# =============================================================
VITE_API_URL=http://localhost:3001
```

**Variables Supabase à supprimer du `.env` courant :**

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL` → remplacée par `DATABASE_URL`

---

### Étape 2 — Docker Compose (dev Codespace + prod Dokploy)

#### 2a. `docker-compose.yml` (développement Codespace)

Créer `/workspaces/2-CMS-RE/docker-compose.yml` :

```yaml
version: "3.9"
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: cms_user
      POSTGRES_PASSWORD: cms_password
      POSTGRES_DB: cms_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U cms_user -d cms_db"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

La variable `DATABASE_URL` en dev sera :

```
DATABASE_URL=postgresql://cms_user:cms_password@localhost:5432/cms_db
```

#### 2b. `backend/Dockerfile` (production Dokploy)

Créer `backend/Dockerfile` :

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma

# Dossier pour uploads locaux (monté en volume dans Dokploy)
RUN mkdir -p /app/uploads

EXPOSE 3001
CMD ["node", "dist/main.js"]
```

> **Dans Dokploy** : configurer un volume persistant monté sur `/app/uploads` pour conserver les fichiers entre les redéployments.

---

### Étape 3 — Schéma Prisma (`backend/prisma/schema.prisma`)

Prisma remplace entièrement les migrations SQL Supabase. Créer `backend/prisma/schema.prisma` :

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// === USERS (fusion auth.users + user_profiles) ===
model User {
  id           String   @id @default(uuid()) @db.Uuid
  email        String   @unique
  passwordHash String   @map("password_hash")
  fullName     String?  @map("full_name")
  role         Role     @default(content_creator)
  avatarUrl    String?  @map("avatar_url")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  // Relations
  pageTemplates      PageTemplate[]
  seoMetadata        SeoMetadata[]
  mediaFiles         MediaFile[]
  pageThemes         PageTheme[]
  fontsLibrary       FontsLibrary[]
  daisyuiThemes      DaisyuiTheme[]
  seoRedirects       SeoRedirect[]
  globalHfSettings   GlobalHfSetting[]

  @@map("users")
}

enum Role {
  admin
  seo_manager
  content_creator

  @@map("role")
}

// === SECTION TYPES ===
model SectionType {
  id           String   @id @default(uuid()) @db.Uuid
  name         String   @unique
  label        String
  description  String?
  icon         String?
  schema       Json?
  previewImage String?  @map("preview_image")
  isSystem     Boolean  @default(false) @map("is_system")
  createdAt    DateTime @default(now()) @map("created_at")

  templateSections     TemplateSection[]
  pageContentSections  PageContentSection[]

  @@map("section_types")
}

// === PAGE THEMES (typographie) ===
model PageTheme {
  id          String   @id @default(uuid()) @db.Uuid
  name        String
  description String?
  css         Json?
  userId      String?  @map("user_id") @db.Uuid
  isDefault   Boolean  @default(false) @map("is_default")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  user          User?          @relation(fields: [userId], references: [id], onDelete: SetNull)
  pageTemplates PageTemplate[]

  @@map("page_themes")
}

// === FONTS LIBRARY ===
model FontsLibrary {
  id           String   @id @default(uuid()) @db.Uuid
  fontName     String   @unique @map("font_name")
  fontFamily   String   @map("font_family")
  fontUrl      String?  @map("font_url")
  fontWeights  String[] @map("font_weights")
  isGoogleFont Boolean  @default(false) @map("is_google_font")
  importedBy   String?  @map("imported_by") @db.Uuid
  isSystem     Boolean  @default(false) @map("is_system")
  createdAt    DateTime @default(now()) @map("created_at")

  user User? @relation(fields: [importedBy], references: [id], onDelete: SetNull)

  @@map("fonts_library")
}

// === DAISYUI THEMES ===
model DaisyuiTheme {
  id        String   @id @default(uuid()) @db.Uuid
  name      String
  slug      String   @unique
  source    ThemeSource @default(daisyui)
  tokens    Json
  fontConfig Json?   @map("font_config")
  isActive  Boolean  @default(true) @map("is_active")
  userId    String?  @map("user_id") @db.Uuid
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@map("daisyui_themes")
}

enum ThemeSource {
  daisyui
  custom

  @@map("theme_source")
}

// === PAGE TEMPLATES ===
model PageTemplate {
  id           String   @id @default(uuid()) @db.Uuid
  name         String
  description  String?
  thumbnail    String?
  sectionsData Json?    @map("sections_data")
  seoH1        String?  @map("seo_h1")
  seoH2        String?  @map("seo_h2")
  daisyThemeSlug String? @map("daisy_theme_slug")
  folder       String?
  isPublic     Boolean  @default(false) @map("is_public")
  isSystem     Boolean  @default(false) @map("is_system")
  createdBy    String?  @map("created_by") @db.Uuid
  pageThemeId  String?  @map("page_theme_id") @db.Uuid
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  user             User?             @relation(fields: [createdBy], references: [id], onDelete: SetNull)
  pageTheme        PageTheme?        @relation(fields: [pageThemeId], references: [id], onDelete: SetNull)
  templateSections TemplateSection[]
  seoMetadata      SeoMetadata[]

  @@map("page_templates")
}

// === SEO METADATA ===
model SeoMetadata {
  id             String       @id @default(uuid()) @db.Uuid
  pageKey        String       @unique @map("page_key")
  title          String?
  description    String?
  keywords       String[]
  ogTitle        String?      @map("og_title")
  ogDescription  String?      @map("og_description")
  ogImage        String?      @map("og_image")
  canonicalUrl   String?      @map("canonical_url")
  language       String       @default("fr")
  status         PageStatus   @default(draft)
  content        String?
  sectionsData   Json?        @map("sections_data")
  seoH1          String?      @map("seo_h1")
  seoH2          String?      @map("seo_h2")
  importedAt     DateTime?    @map("imported_at")
  createdBy      String?      @map("created_by")
  userId         String?      @map("user_id") @db.Uuid
  templateId     String?      @map("template_id") @db.Uuid
  daisyThemeSlug String?      @map("daisy_theme_slug")
  folder         String?
  createdAt      DateTime     @default(now()) @map("created_at")
  updatedAt      DateTime     @updatedAt @map("updated_at")

  user                User?                @relation(fields: [userId], references: [id], onDelete: SetNull)
  template            PageTemplate?        @relation(fields: [templateId], references: [id], onDelete: SetNull)
  pageContentSections PageContentSection[]
  sourceRedirects     SeoRedirect[]        @relation("SourceRedirects")
  targetRedirects     SeoRedirect[]        @relation("TargetRedirects")

  @@index([folder])
  @@map("seo_metadata")
}

enum PageStatus {
  draft
  published
  archived

  @@map("page_status")
}

// === TEMPLATE SECTIONS ===
model TemplateSection {
  id              String   @id @default(uuid()) @db.Uuid
  templateId      String   @map("template_id") @db.Uuid
  sectionTypeId   String   @map("section_type_id") @db.Uuid
  orderIndex      Int      @map("order_index")
  label           String?
  minWords        Int?     @map("min_words")
  maxWords        Int?     @map("max_words")
  required        Boolean  @default(false)
  settings        Json?
  createdAt       DateTime @default(now()) @map("created_at")

  template            PageTemplate         @relation(fields: [templateId], references: [id], onDelete: Cascade)
  sectionType         SectionType          @relation(fields: [sectionTypeId], references: [id], onDelete: Restrict)
  pageContentSections PageContentSection[]

  @@map("template_sections")
}

// === PAGE CONTENT SECTIONS ===
model PageContentSection {
  id                String   @id @default(uuid()) @db.Uuid
  pageId            String   @map("page_id") @db.Uuid
  templateSectionId String?  @map("template_section_id") @db.Uuid
  sectionTypeId     String?  @map("section_type_id") @db.Uuid
  orderIndex        Int      @map("order_index")
  content           Json?
  backgroundImage   String?  @map("background_image")
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")

  page            SeoMetadata      @relation(fields: [pageId], references: [id], onDelete: Cascade)
  templateSection TemplateSection? @relation(fields: [templateSectionId], references: [id], onDelete: SetNull)
  sectionType     SectionType?     @relation(fields: [sectionTypeId], references: [id], onDelete: SetNull)

  @@map("page_content_sections")
}

// === MEDIA FILES ===
model MediaFile {
  id               String   @id @default(uuid()) @db.Uuid
  filename         String
  originalFilename String   @map("original_filename")
  filePath         String   @map("file_path")
  fileSize         BigInt   @map("file_size")
  mimeType         String   @map("mime_type")
  width            Int?
  height           Int?
  altText          String?  @map("alt_text")
  uploadedBy       String?  @map("uploaded_by") @db.Uuid
  createdAt        DateTime @default(now()) @map("created_at")

  user User? @relation(fields: [uploadedBy], references: [id], onDelete: SetNull)

  @@map("media_files")
}

// === SEO REDIRECTS ===
model SeoRedirect {
  id           String   @id @default(uuid()) @db.Uuid
  sourcePath   String   @map("source_path")
  targetPath   String   @map("target_path")
  sourcePageId String?  @map("source_page_id") @db.Uuid
  targetPageId String?  @map("target_page_id") @db.Uuid
  reason       String?
  isActive     Boolean  @default(true) @map("is_active")
  createdBy    String?  @map("created_by") @db.Uuid
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  sourcePage SeoMetadata? @relation("SourceRedirects", fields: [sourcePageId], references: [id], onDelete: SetNull)
  targetPage SeoMetadata? @relation("TargetRedirects", fields: [targetPageId], references: [id], onDelete: SetNull)
  creator    User?        @relation(fields: [createdBy], references: [id], onDelete: SetNull)

  @@map("seo_redirects")
}

// === GLOBAL HEADER/FOOTER SETTINGS ===
model GlobalHfSetting {
  id            String   @id @default(uuid()) @db.Uuid
  label         String
  headerSection Json?    @map("header_section")
  footerSection Json?    @map("footer_section")
  applyOnImport Boolean  @default(false) @map("apply_on_import")
  applyOnCreate Boolean  @default(false) @map("apply_on_create")
  isActive      Boolean  @default(false) @map("is_active")
  targetPageIds String[] @map("target_page_ids") @db.Uuid
  createdBy     String?  @map("created_by") @db.Uuid
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  user User? @relation(fields: [createdBy], references: [id], onDelete: SetNull)

  @@map("global_hf_settings")
}
```

**Seeds** (`backend/prisma/seed.ts`) : extraire tous les `INSERT INTO` des migrations pour `section_types`, `page_themes`, `fonts_library`, `daisyui_themes` et les réécrire avec `prisma.createMany()`.

---

### Étape 4 — Structure NestJS

Créer le répertoire `backend/` avec l'architecture suivante :

```
backend/
├── prisma/
│   ├── schema.prisma          # Schéma Prisma (voir Étape 3)
│   ├── migrations/            # Généré par prisma migrate dev
│   └── seed.ts                # Seeds (section_types, themes, fonts, daisyui)
│
├── src/
│   ├── main.ts                # Bootstrap NestJS, CORS, port
│   ├── app.module.ts          # Imports de tous les modules
│   │
│   ├── prisma/
│   │   ├── prisma.module.ts   # Module global Prisma
│   │   └── prisma.service.ts  # PrismaClient (extends, onModuleInit)
│   │
│   ├── auth/                  # JWT + bcrypt
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts # POST /auth/login, /register, /logout, GET /auth/me
│   │   ├── auth.service.ts    # signIn, register, validateToken
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts      # Passport JWT strategy
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts    # Protège les routes privées
│   │   │   └── roles.guard.ts       # Vérifie admin/seo_manager/content_creator
│   │   ├── decorators/
│   │   │   ├── public.decorator.ts  # @Public() pour routes non-auth
│   │   │   └── roles.decorator.ts   # @Roles('admin') etc.
│   │   └── dto/
│   │       ├── login.dto.ts
│   │       └── register.dto.ts
│   │
│   ├── pages/                 # seo_metadata
│   │   ├── pages.module.ts
│   │   ├── pages.controller.ts
│   │   ├── pages.service.ts
│   │   └── dto/
│   │       ├── create-page.dto.ts
│   │       └── update-page.dto.ts
│   │
│   ├── templates/             # page_templates
│   │   ├── templates.module.ts
│   │   ├── templates.controller.ts
│   │   ├── templates.service.ts
│   │   └── dto/
│   │
│   ├── media/                 # media_files + upload
│   │   ├── media.module.ts
│   │   ├── media.controller.ts
│   │   ├── media.service.ts
│   │   └── dto/
│   │
│   ├── themes/                # page_themes + daisyui_themes + fonts_library
│   │   ├── themes.module.ts
│   │   ├── themes.controller.ts
│   │   ├── themes.service.ts
│   │   └── dto/
│   │
│   ├── redirects/             # seo_redirects
│   │   ├── redirects.module.ts
│   │   ├── redirects.controller.ts
│   │   ├── redirects.service.ts
│   │   └── dto/
│   │
│   ├── global-hf/             # global_hf_settings
│   │   ├── global-hf.module.ts
│   │   ├── global-hf.controller.ts
│   │   ├── global-hf.service.ts
│   │   └── dto/
│   │
│   └── storage/               # Abstraction stockage (local → R2)
│       ├── storage.module.ts
│       ├── storage.service.ts         # Interface + factory selon STORAGE_TYPE
│       ├── providers/
│       │   ├── local-storage.provider.ts    # multer + express.static
│       │   └── r2-storage.provider.ts       # @aws-sdk/client-s3 (compatible R2)
│       └── interceptors/
│           └── file-upload.interceptor.ts
│
├── uploads/                   # Gitignored, monté en volume dans Dokploy
├── Dockerfile
├── package.json
├── tsconfig.json
└── nest-cli.json
```

#### Dépendances backend (`backend/package.json`)

```json
{
  "dependencies": {
    "@nestjs/common": "^10",
    "@nestjs/core": "^10",
    "@nestjs/platform-express": "^10",
    "@nestjs/jwt": "^10",
    "@nestjs/passport": "^10",
    "@nestjs/config": "^3",
    "@nestjs/serve-static": "^4",
    "passport": "^0.7",
    "passport-jwt": "^4",
    "@prisma/client": "^5",
    "bcrypt": "^5",
    "class-validator": "^0.14",
    "class-transformer": "^0.5",
    "multer": "^1",
    "@aws-sdk/client-s3": "^3",
    "@aws-sdk/s3-request-presigner": "^3",
    "reflect-metadata": "^0.2",
    "rxjs": "^7"
  },
  "devDependencies": {
    "@nestjs/cli": "^10",
    "@nestjs/testing": "^10",
    "prisma": "^5",
    "typescript": "^5",
    "ts-node": "^10",
    "@types/bcrypt": "^5",
    "@types/multer": "^1",
    "@types/passport-jwt": "^4"
  }
}
```

#### Endpoints API (mapping Supabase → NestJS)

| Méthode | Route                         | Auth                | Remplace                                                         |
| ------- | ----------------------------- | ------------------- | ---------------------------------------------------------------- |
| POST    | `/auth/login`                 | Public              | `supabase.auth.signInWithPassword()`                             |
| POST    | `/auth/register`              | Public              | `supabase.auth.signUp()`                                         |
| POST    | `/auth/logout`                | JWT                 | `supabase.auth.signOut()`                                        |
| GET     | `/auth/me`                    | JWT                 | `supabase.auth.getUser()`                                        |
| GET     | `/api/pages/public/:pageKey`  | Public              | `supabase.from('seo_metadata').select` (rendu public)            |
| GET     | `/api/pages/public/redirects` | Public              | `supabase.from('seo_redirects').select` (redirections publiques) |
| GET     | `/api/pages`                  | JWT                 | `supabase.from('seo_metadata').select`                           |
| POST    | `/api/pages`                  | JWT                 | `supabase.from('seo_metadata').insert`                           |
| PATCH   | `/api/pages/:id`              | JWT                 | `supabase.from('seo_metadata').update`                           |
| DELETE  | `/api/pages/:id`              | JWT + Admin/Manager | `supabase.from('seo_metadata').delete`                           |
| GET     | `/api/templates`              | JWT                 | `supabase.from('page_templates').select`                         |
| POST    | `/api/templates`              | JWT                 | `supabase.from('page_templates').insert`                         |
| PATCH   | `/api/templates/:id`          | JWT                 | `supabase.from('page_templates').update`                         |
| DELETE  | `/api/templates/:id`          | JWT + Admin/Manager | `supabase.from('page_templates').delete`                         |
| GET     | `/api/media`                  | JWT                 | `supabase.from('media_files').select`                            |
| POST    | `/api/media/upload`           | JWT                 | `supabase.storage.from('media').upload()`                        |
| DELETE  | `/api/media/:id`              | JWT                 | `supabase.storage.remove()` + `.from('media_files').delete`      |
| GET     | `/api/themes/page`            | JWT                 | `supabase.from('page_themes').select`                            |
| POST    | `/api/themes/page`            | JWT                 | `supabase.from('page_themes').insert`                            |
| PATCH   | `/api/themes/page/:id`        | JWT                 | `supabase.from('page_themes').update`                            |
| DELETE  | `/api/themes/page/:id`        | JWT                 | `supabase.from('page_themes').delete`                            |
| GET     | `/api/themes/daisy`           | JWT                 | `supabase.from('daisyui_themes').select`                         |
| POST    | `/api/themes/daisy`           | JWT + Admin         | `supabase.from('daisyui_themes').insert`                         |
| PATCH   | `/api/themes/daisy/:id`       | JWT + Admin         | `supabase.from('daisyui_themes').update`                         |
| DELETE  | `/api/themes/daisy/:id`       | JWT + Admin         | `supabase.from('daisyui_themes').delete`                         |
| GET     | `/api/fonts`                  | JWT                 | `supabase.from('fonts_library').select`                          |
| POST    | `/api/fonts`                  | JWT                 | `supabase.from('fonts_library').insert`                          |
| DELETE  | `/api/fonts/:id`              | JWT + Admin         | `supabase.from('fonts_library').delete`                          |
| GET     | `/api/redirects`              | JWT                 | `supabase.from('seo_redirects').select`                          |
| POST    | `/api/redirects`              | JWT                 | `supabase.from('seo_redirects').insert`                          |
| PATCH   | `/api/redirects/:id`          | JWT                 | `supabase.from('seo_redirects').update`                          |
| DELETE  | `/api/redirects/:id`          | JWT + Admin/Manager | `supabase.from('seo_redirects').delete`                          |
| GET     | `/api/global-hf`              | JWT                 | `supabase.from('global_hf_settings').select`                     |
| POST    | `/api/global-hf`              | JWT + Admin         | `supabase.from('global_hf_settings').insert`                     |
| PATCH   | `/api/global-hf/:id`          | JWT + Admin         | `supabase.from('global_hf_settings').update`                     |

---

### Étape 5 — Client API frontend (`src/lib/api.ts`)

Remplacer `src/lib/supabase.ts` par un client HTTP qui préserve la même interface de surface pour minimiser les modifications dans les composants.

**Logique du client :**

- Token JWT stocké dans `localStorage`
- `Authorization: Bearer <token>` injecté automatiquement
- Réponses normalisées `{ data, error }` comme la bibliothèque Supabase

```typescript
// src/lib/api.ts
const BASE_URL = import.meta.env.VITE_API_URL;

function getToken() {
  return localStorage.getItem("cms_token");
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<{ data: T | null; error: string | null }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    return { data: null, error: err.message ?? "Erreur inconnue" };
  }

  const data = res.status === 204 ? null : await res.json();
  return { data, error: null };
}

export const api = {
  auth: {
    signIn: (email: string, password: string) =>
      request<{ access_token: string; user: unknown }>("POST", "/auth/login", {
        email,
        password,
      }),
    signUp: (email: string, password: string, fullName?: string) =>
      request<{ access_token: string; user: unknown }>(
        "POST",
        "/auth/register",
        { email, password, fullName },
      ),
    signOut: () => {
      localStorage.removeItem("cms_token");
      return Promise.resolve({ data: null, error: null });
    },
    getUser: () =>
      request<{ id: string; email: string; role: string }>("GET", "/auth/me"),
    setToken: (token: string) => localStorage.setItem("cms_token", token),
  },
  // CRUD générique par resource
  pages: {
    getAll: (params?: Record<string, string>) =>
      request("GET", `/api/pages?${new URLSearchParams(params)}`),
    getPublic: (pageKey: string) =>
      request("GET", `/api/pages/public/${pageKey}`),
    create: (data: unknown) => request("POST", "/api/pages", data),
    update: (id: string, data: unknown) =>
      request("PATCH", `/api/pages/${id}`, data),
    delete: (id: string) => request("DELETE", `/api/pages/${id}`),
  },
  // ... idem pour templates, media, themes, fonts, redirects, globalHf
  storage: {
    upload: async (
      file: File,
      userId: string,
    ): Promise<{
      data: { path: string; publicUrl: string } | null;
      error: string | null;
    }> => {
      const formData = new FormData();
      formData.append("file", file);
      const token = getToken();
      const res = await fetch(`${BASE_URL}/api/media/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) return { data: null, error: res.statusText };
      return { data: await res.json(), error: null };
    },
    remove: (mediaId: string) => request("DELETE", `/api/media/${mediaId}`),
  },
};
```

---

### Étape 6 — Refactorisation des fichiers frontend

**Note :** Grâce au client `api.ts` conçu pour préserver l'interface de surface, la plupart des modifications sont des remplacements mécaniques `supabase` → `api`.

#### Priorité 1 — Auth (bloque tout le reste)

**`src/contexts/AuthContext.tsx`**

- `supabase.auth.signInWithPassword()` → `api.auth.signIn()`
- `supabase.auth.signUp()` → `api.auth.signUp()`
- `supabase.auth.signOut()` → `api.auth.signOut()`
- `supabase.auth.getSession()` / `onAuthStateChange()` → `api.auth.getUser()` au montage + listener sur `localStorage`
- `supabase.from('user_profiles').select/insert` → `api.auth.getUser()` (tout est dans le JWT)

#### Priorité 2 — Accès public (SPA)

**`src/App.tsx`**

- `supabase.from('seo_metadata')...` → `api.pages.getPublic(pageKey)`
- `supabase.from('seo_redirects')...` → endpoint public `/api/pages/public/redirects`

**`src/components/seo/SEOPageViewer.tsx`** + `src/components/SEOPageViewer.tsx`

- Idem, requêtes publiques sans token

#### Priorité 3 — CRUD pages, templates, dashboard

- `src/components/seo/SEOManager.tsx` → `api.pages.*`
- `src/components/seo/SEOForm.tsx` → `api.pages.*` + `api.templates.*`
- `src/components/seo/SEOImporter.tsx` → `api.pages.*` (upsert bulk → POST /api/pages/bulk)
- `src/components/seo/LinkManager.tsx` → `api.pages.*` + `api.redirects.*`
- `src/components/PageBuilder/PageBuilder.tsx` → `api.templates.*` + `api.pages.*`
- `src/components/Dashboard.tsx` → `api.pages.*` + `api.templates.*`
- `src/components/Analytics.tsx` → `api.pages.*`
- `src/components/GlobalHFManager.tsx` → `api.globalHf.*`
- `src/components/VisualPageBuilder.tsx` → `api.templates.*` + `api.pages.*`

#### Priorité 4 — Thèmes et polices

- `src/lib/daisyThemes.ts` → `api.themes.daisy.*`
- `src/lib/globalHFSettings.ts` → `api.globalHf.*`
- `src/lib/pageThemesStorage.ts` → `api.themes.page.*`
- `src/contexts/ThemeContext.tsx` → supprimer entièrement la référence à table `themes` (dead code), remplacer par `api.themes.daisy.*`
- Composants `theme/` → `api.themes.*` + `api.fonts.*`

#### Priorité 5 — Médias (plus impacté)

**`src/components/MediaLibrary.tsx`**

- Upload : `supabase.storage.from('media').upload()` → `api.storage.upload(file, userId)`
- URL publique : construire l'URL depuis `VITE_API_URL + /uploads/` (local) ou R2 URL
- Suppression : `supabase.storage.from('media').remove()` + `.from('media_files').delete()` → `api.storage.remove(mediaId)` (le backend fait les deux)
- `supabase.from('media_files').select/insert/delete` → `api.media.*`

#### Priorité 6 — Composants legacy (doublons)

Les composants à la racine de `/src/components/` (`SEOManager.tsx`, `SEOImporter.tsx`, etc.) sont des doublons des versions dans `/src/components/seo/` et `/src/components/theme/`. Vérifier lesquels sont encore importés dans `App.tsx` et supprimer les non utilisés.

---

### Étape 7 — Migration des données depuis Supabase

> **Principe absolu : lecture seule sur Supabase. Zéro écriture.**

#### 7a. Export depuis Supabase (script `scripts/export-supabase.sh`)

```bash
#!/bin/bash
# Export données schéma public uniquement (lecture seule)
export SUPABASE_DB_POOLER_URL='postgresql://postgres.PROJECT_REF:YOUR_DB_PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres?sslmode=require'

pg_dump \
  --dbname="$SUPABASE_DB_POOLER_URL" \
  --port=5432 \
  --schema=public \
  --data-only \
  --no-owner \
  --no-privileges \
  --exclude-table=schema_migrations \
  --file=./scripts/supabase_export.sql

echo "Export terminé : scripts/supabase_export.sql"
```

La connexion directe `db.<project-ref>.supabase.co` est IPv6-only par défaut. Sur un réseau IPv4, utiliser le **Session pooler** Supabase, qui reste en lecture seule avec `pg_dump`.

Si le Session pooler IPv4 n'est pas disponible, une alternative sûre consiste à exporter les tables publiques via l'API REST Supabase en HTTPS avec la `service_role key`. Cette méthode est également en lecture seule.

#### 7b. Transformation des données (script `scripts/transform-export.ts`)

Ce script Node.js lit `supabase_export.sql` et :

1. Remplace les INSERT dans `user_profiles` par des INSERT dans `users` en ajoutant un `password_hash` temporaire (bcrypt de `"ChangeMe123!"`)
2. Supprime toute référence au schéma `auth`
3. Adapte les UUID des FK `created_by` / `user_id` / `uploaded_by` pour pointer vers `users.id`
4. Génère `scripts/postgres_import.sql`

#### 7c. Import dans la nouvelle base

```bash
psql $DATABASE_URL < scripts/postgres_import.sql
```

#### 7d. Cas des mots de passe

⚠️ Les mots de passe Supabase Auth sont inaccessibles via `pg_dump`. Après migration :

- Tous les utilisateurs auront le mot de passe temporaire `ChangeMe123!`
- Implémenter un endpoint `POST /auth/change-password` en NestJS
- Prévenir les utilisateurs de changer leur mot de passe à la première connexion

#### 7e. Fichiers médias

Les fichiers dans Supabase Storage (bucket `media`) ont leurs URLs stockées dans `media_files.file_path`. Deux options :

- **Option A** : télécharger tous les fichiers depuis les URLs Supabase Storage et les stocker dans `/uploads/`
- **Option B** : laisser les URLs Supabase dans `media_files.file_path` temporairement (les fichiers resteront accessibles tant que le projet Supabase est actif)

---

### Étape 8 — Nettoyage et déploiement

#### 8a. Frontend — suppression de Supabase

```bash
npm uninstall @supabase/supabase-js
```

Supprimer `src/lib/supabase.ts` après que tous les composants utilisent `src/lib/api.ts`.

#### 8b. Réorganisation du répertoire `supabase/`

| Action    | Cible                                                                         |
| --------- | ----------------------------------------------------------------------------- |
| Renommer  | `supabase/migrations/` → `db/migrations-reference/` (archives pour référence) |
| Supprimer | `supabase/all-migrations.sql`, `supabase/all-migrations-idempotent.sql`       |
| Supprimer | `supabase/functions/` (Edge Functions non utilisées)                          |
| Supprimer | `scripts/supabase-db-push-smart.sh`                                           |
| Supprimer | `scripts/build-migrations-bundle.sh`                                          |

#### 8c. Déploiement Dokploy sur VPS IONOS

Dokploy gère le déploiement via Docker. Configuration :

1. **Service `backend`** : Docker image buildée depuis `backend/Dockerfile`
   - Variables d'env : `DATABASE_URL`, `JWT_SECRET`, `PORT=3001`, `STORAGE_TYPE=local`, etc.
   - Volume persistant : `/app/uploads` → `/data/cms/uploads` sur le VPS

2. **Service `postgres`** : image `postgres:16-alpine`
   - Volume persistant : `/var/lib/postgresql/data` → `/data/postgres` sur le VPS
   - Network interne uniquement (pas de port exposé publiquement)

3. **Service `frontend`** : image `nginx:alpine` servant le build Vite
   - Variable de build : `VITE_API_URL=https://api.votredomaine.com`
   - Build React : `npm run build` → `nginx` sert `dist/`

4. **Reverse proxy** : Dokploy configure automatiquement Traefik pour SSL + routing.

---

## Fichiers à créer (récapitulatif final)

| Fichier                                                    | Étape |
| ---------------------------------------------------------- | ----- |
| `.env.example`                                             | 1     |
| `docker-compose.yml`                                       | 2     |
| `backend/Dockerfile`                                       | 2     |
| `backend/prisma/schema.prisma`                             | 3     |
| `backend/prisma/seed.ts`                                   | 3     |
| `backend/src/main.ts`                                      | 4     |
| `backend/src/app.module.ts`                                | 4     |
| `backend/src/prisma/prisma.service.ts`                     | 4     |
| `backend/src/auth/**`                                      | 4     |
| `backend/src/pages/**`                                     | 4     |
| `backend/src/templates/**`                                 | 4     |
| `backend/src/media/**`                                     | 4     |
| `backend/src/themes/**`                                    | 4     |
| `backend/src/redirects/**`                                 | 4     |
| `backend/src/global-hf/**`                                 | 4     |
| `backend/src/storage/**`                                   | 4     |
| `backend/package.json` + `tsconfig.json` + `nest-cli.json` | 4     |
| `src/lib/api.ts`                                           | 5     |
| `scripts/export-supabase.sh`                               | 7     |
| `scripts/transform-export.ts`                              | 7     |

## Fichiers à modifier (récapitulatif final)

| Fichier                         | Changement                                                                         |
| ------------------------------- | ---------------------------------------------------------------------------------- |
| `src/contexts/AuthContext.tsx`  | Remplacer tout `supabase.auth.*` + `supabase.from('user_profiles')`                |
| `src/App.tsx`                   | Requêtes publiques → `api.pages.getPublic()`                                       |
| `src/lib/daisyThemes.ts`        | `api.themes.daisy.*`                                                               |
| `src/lib/globalHFSettings.ts`   | `api.globalHf.*`                                                                   |
| `src/lib/pageThemesStorage.ts`  | `api.themes.page.*`                                                                |
| `src/contexts/ThemeContext.tsx` | Supprimer réf. table `themes` dead code + `api.themes.daisy.*`                     |
| `src/components/**/*.tsx` (×28) | Remplacer toutes requêtes Supabase → `api.*`                                       |
| `package.json` (racine)         | Supprimer `@supabase/supabase-js`, ajouter `.env.example` à `.gitignore` exception |

## Fichiers à supprimer (récapitulatif final)

| Fichier                                  | Raison                                      |
| ---------------------------------------- | ------------------------------------------- |
| `src/lib/supabase.ts`                    | Remplacé par `src/lib/api.ts`               |
| `supabase/all-migrations.sql`            | Remplacé par `backend/prisma/schema.prisma` |
| `supabase/all-migrations-idempotent.sql` | Idem                                        |
| `supabase/functions/`                    | Edge Functions non utilisées                |
| `scripts/supabase-db-push-smart.sh`      | Spécifique Supabase CLI                     |
| `scripts/build-migrations-bundle.sh`     | Plus pertinent                              |

---

_Plan finalisé le 2026-03-10 — toutes les questions ont été répondues._
