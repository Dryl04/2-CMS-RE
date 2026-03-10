# Backend CMS — Documentation technique

## Architecture

Le backend est un serveur **NestJS** (TypeScript) utilisant **Prisma** comme ORM et **PostgreSQL** comme base de données.

```
backend/
├── prisma/
│   ├── schema.prisma          # Schéma de la base de données (12 modèles)
│   └── seed.ts                # Données initiales (section_types, themes, fonts)
├── scripts/
│   ├── export-supabase.sh     # Export des données depuis Supabase (read-only)
│   ├── transform-export.ts    # Transformation des données exportées
│   └── import-data.ts         # Import des données dans la nouvelle BDD
├── src/
│   ├── main.ts                # Bootstrap NestJS (port 3001, CORS, validation)
│   ├── app.module.ts          # Module racine (imports + guards globaux)
│   ├── prisma/                # Module global Prisma (PrismaService)
│   ├── auth/                  # Authentification JWT + bcrypt
│   ├── pages/                 # CRUD seo_metadata + endpoints publics
│   ├── templates/             # CRUD page_templates
│   ├── media/                 # Upload/suppression fichiers (local ou R2)
│   ├── themes/                # Page themes, DaisyUI themes, fonts, classic themes
│   ├── redirects/             # CRUD seo_redirects
│   ├── global-hf/             # Gestion header/footer globaux
│   ├── profiles/              # Profils utilisateurs
│   └── storage/               # Abstraction stockage (local / Cloudflare R2)
├── Dockerfile                 # Multi-stage build (builder + production)
├── package.json
├── tsconfig.json
└── nest-cli.json
```

## Modèles de données (Prisma)

| Modèle | Table SQL | Description |
|--------|-----------|-------------|
| `User` | `users` | Utilisateurs (email, password_hash, role) |
| `SectionType` | `section_types` | Types de sections (header, footer, hero, etc.) |
| `PageTheme` | `page_themes` | Thèmes de page avec CSS personnalisé |
| `FontsLibrary` | `fonts_library` | Bibliothèque de polices Google Fonts |
| `DaisyuiTheme` | `daisyui_themes` | Thèmes DaisyUI (32 officiels + custom) |
| `PageTemplate` | `page_templates` | Templates de pages avec sections_data |
| `SeoMetadata` | `seo_metadata` | Pages SEO (titre, description, contenu) |
| `TemplateSection` | `template_sections` | Sections liées à un template |
| `PageContentSection` | `page_content_sections` | Contenu des sections de page |
| `MediaFile` | `media_files` | Fichiers médias uploadés |
| `SeoRedirect` | `seo_redirects` | Redirections SEO |
| `GlobalHfSetting` | `global_hf_settings` | Paramètres header/footer globaux |

## Endpoints API

### Authentification (`/auth`)
| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| POST | `/auth/login` | Public | Connexion (retourne JWT + profil) |
| POST | `/auth/register` | Public | Inscription |
| GET | `/auth/me` | JWT | Profil utilisateur courant |
| POST | `/auth/change-password` | JWT | Changement de mot de passe |

### Pages (`/api/pages`)
| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/api/pages` | JWT | Liste des pages (filtres: status, folder, limit, select) |
| GET | `/api/pages/by-key?page_key=xxx` | JWT | Page par page_key |
| GET | `/api/pages/:id` | JWT | Page par ID |
| GET | `/api/pages/public/:pageKey` | Public | Page publiée (SEO) |
| GET | `/api/pages/public/redirects?source_path=xxx` | Public | Redirection publique |
| POST | `/api/pages` | JWT | Créer une page |
| POST | `/api/pages/upsert` | JWT | Upsert en masse |
| POST | `/api/pages/bulk` | JWT | Alias de upsert |
| PATCH | `/api/pages/:id` | JWT | Modifier une page |
| DELETE | `/api/pages/:id` | admin/seo_manager | Supprimer une page |

### Templates (`/api/templates`)
| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/api/templates` | JWT | Liste (filtres: folder, ids) |
| GET | `/api/templates/count` | JWT | Nombre total |
| GET | `/api/templates/:id` | JWT | Template par ID |
| POST | `/api/templates` | JWT | Créer |
| PATCH | `/api/templates/:id` | JWT | Modifier |
| DELETE | `/api/templates/:id` | admin/seo_manager | Supprimer |

### Media (`/api/media`)
| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/api/media` | JWT | Liste des fichiers |
| POST | `/api/media/upload` | JWT | Upload (multipart/form-data) |
| DELETE | `/api/media/:id` | JWT | Supprimer un fichier |

### Themes (`/api/themes`)

#### DaisyUI Themes (`/api/themes/daisy`)
| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/api/themes/daisy` | JWT | Liste de tous les thèmes |
| GET | `/api/themes/daisy/active` | JWT | Thème actif |
| PUT | `/api/themes/daisy/active` | admin | Définir le thème actif |
| GET | `/api/themes/daisy/usage/:slug` | JWT | Usage d'un thème |
| POST | `/api/themes/daisy` | admin | Créer un thème custom |
| PATCH | `/api/themes/daisy/:id` | admin | Modifier |
| DELETE | `/api/themes/daisy/:id` | admin | Supprimer |

#### Page Themes (`/api/themes/page`)
| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/api/themes/page` | JWT | Liste |
| GET | `/api/themes/page/:id` | JWT | Par ID |
| GET | `/api/themes/page/:id/is-custom` | JWT | Vérifier si custom |
| POST | `/api/themes/page` | JWT | Créer/sauvegarder |
| POST | `/api/themes/page/migrate` | JWT | Migrer depuis localStorage |
| PATCH | `/api/themes/page/:id` | JWT | Modifier |
| DELETE | `/api/themes/page/:id` | JWT | Supprimer |

#### Classic Themes (`/api/themes/classic`)
| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/api/themes/classic` | JWT | Liste |
| POST | `/api/themes/classic` | JWT | Créer |
| POST | `/api/themes/classic/initialize` | JWT | Initialiser les thèmes par défaut |
| POST | `/api/themes/classic/apply` | JWT | Appliquer à une page |
| PATCH | `/api/themes/classic/:id` | JWT | Modifier |
| DELETE | `/api/themes/classic/:id` | JWT | Supprimer |

#### Fonts (`/api/themes/fonts`)
| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/api/themes/fonts` | JWT | Liste des polices |
| POST | `/api/themes/fonts` | JWT | Importer une police |
| DELETE | `/api/themes/fonts/:id` | JWT | Supprimer |

### Redirections (`/api/redirects`)
| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/api/redirects` | JWT | Liste |
| GET | `/api/redirects/by-source?source_path=xxx` | JWT | Par chemin source |
| GET | `/api/redirects/:id` | JWT | Par ID |
| POST | `/api/redirects` | JWT | Créer |
| PATCH | `/api/redirects/:id` | JWT | Modifier |
| DELETE | `/api/redirects/:id` | admin/seo_manager | Supprimer |

### Global Header/Footer (`/api/global-hf`)
| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/api/global-hf` | JWT | Liste |
| GET | `/api/global-hf/public` | Public | Paramètre actif |
| POST | `/api/global-hf` | admin | Créer |
| POST | `/api/global-hf/:id/activate` | admin | Activer |
| PATCH | `/api/global-hf/:id` | admin | Modifier |
| DELETE | `/api/global-hf/:id` | admin | Supprimer |

### Profils (`/api/profiles`)
| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/api/profiles/:id` | JWT | Profil par ID |
| POST | `/api/profiles` | JWT | Créer un profil |
| PATCH | `/api/profiles/:id` | JWT | Modifier |

## Guards et sécurité

- **JwtAuthGuard** (global) : Vérifie le token JWT sur chaque requête sauf `@Public()`
- **RolesGuard** (global) : Vérifie le rôle utilisateur quand `@Roles()` est déclaré
- **Rôles disponibles** : `admin`, `seo_manager`, `content_creator`

## Stockage fichiers

Le module `StorageModule` est global et utilise un pattern Strategy :
- **STORAGE_TYPE=local** : Stockage sur disque (`/app/uploads/`)
- **STORAGE_TYPE=r2** : Cloudflare R2 (via SDK S3)

## Commandes importantes

```bash
# Installation
cd backend && npm install

# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma migrate deploy

# Seed (données initiales)
npx prisma db seed

# Build
npm run build   # ou: npx nest build

# Tests
npm test        # ou: npx jest

# Développement
npm run start:dev
```

## Variables d'environnement

Voir `.env.example` à la racine du projet.

## Tests

- **99 tests unitaires** couvrant tous les services et contrôleurs
- Exécution : `npx jest` depuis le dossier `backend/`
- Toutes les dépendances externes (Prisma, Storage, JWT) sont mockées

## Migration des données depuis Supabase

### Étape 1 : Export
```bash
cd backend
./scripts/export-supabase.sh "postgresql://postgres:PASSWORD@db.xxxx.supabase.co:5432/postgres"
```

### Étape 2 : Transformation
```bash
npx ts-node scripts/transform-export.ts --input ./data-export --output ./data-import
```

### Étape 3 : Import
```bash
# S'assurer que la BDD cible est prête
npx prisma migrate deploy

# Importer les données
npx ts-node scripts/import-data.ts --input ./data-import
```

### Étape 4 : Mots de passe
Les mots de passe Supabase Auth ne sont pas exportables. Après import :
- Les utilisateurs reçoivent un mot de passe temporaire (voir `data-import/temp-passwords.txt`)
- Communiquer ces mots de passe aux utilisateurs pour qu'ils les changent
