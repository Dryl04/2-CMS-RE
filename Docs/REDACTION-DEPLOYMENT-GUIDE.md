# Module Rédaction — Guide de mise en production

> **Dernière mise à jour** : 8 mars 2026  
> **Branche** : `feature/redactors_panel`  
> **Statut** : Prêt pour production — build ✅ / 157 tests ✅

---

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture technique](#architecture-technique)
3. [Prérequis](#prérequis)
4. [Étapes de déploiement](#étapes-de-déploiement)
5. [Variables d'environnement](#variables-denvironnement)
6. [Migrations base de données](#migrations-base-de-données)
7. [Edge Functions Supabase](#edge-functions-supabase)
8. [Configuration IA](#configuration-ia)
9. [Vérification post-déploiement](#vérification-post-déploiement)
10. [Arborescence des fichiers](#arborescence-des-fichiers)
11. [Tests](#tests)
12. [Dépannage](#dépannage)

---

## Vue d'ensemble

Le module **Rédaction** permet de :

- Créer et organiser des documents rédactionnels dans une arborescence de dossiers
- Éditer du contenu en 3 modes : texte libre, éditeur riche, éditeur SEO structuré
- Lier un document à un template CMS existant
- Converser avec une IA (OpenAI, Anthropic, Mistral) pour transformer le contenu en JSON SEO
- Valider le JSON généré contre le contrat d'import du CMS (format `content_overrides`)
- Publier le JSON en créant ou mettant à jour des pages dans `seo_metadata`
- Tracer toutes les actions (édition, génération, publication) dans un journal d'activité
- Collaborer avec verrouillage optimiste et gestion des permissions

---

## Architecture technique

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React/Vite)                 │
│                                                         │
│  Header.tsx ─── NAV_ITEMS["redaction"] ──► RedactionManager.tsx
│                                                         │
│  RedactionManager ──► RedactionDocumentEditor            │
│    ├── Éditeurs (Plain / Rich / Structured)              │
│    ├── Panel IA (RedactionAIPanel)                       │
│    │     └── RedactionConversation ──► callAIProvider()  │
│    └── Panel Publication (RedactionPublishPanel)         │
│          └── publishNewPage / publishUpdatePage          │
│                                                         │
│  Services (src/lib/) :                                   │
│    redactionAiClient.ts   → proxy vers Edge Functions    │
│    redactionPublishClient.ts → CRUD seo_metadata         │
│    redactionJsonValidation.ts → validation JSON          │
│    redactionPromptPolicy.ts → construction de prompts    │
│    redactionDocuments.ts   → CRUD documents              │
│    redactionFolders.ts     → CRUD dossiers               │
│    redactionConflictGuard.ts → verrouillage              │
│    redactionPermissions.ts → permissions partagées       │
│    redactionActivity.ts    → journal d'activité          │
└────────────────┬────────────────────────────────────────┘
                 │ HTTPS (Bearer token)
                 ▼
┌─────────────────────────────────────────────────────────┐
│              Edge Functions (Deno / Supabase)            │
│                                                         │
│  redaction-ai-chat       → chat IA (proxy sécurisé)     │
│  redaction-generate-json → génération JSON côté serveur  │
│  redaction-publish       → publication sécurisée         │
│                                                         │
│  ⚠ Les clés API IA ne transitent JAMAIS par le client.  │
│  Le proxy récupère la config serveur-side via            │
│  SUPABASE_SERVICE_ROLE_KEY.                              │
└────────────────┬────────────────────────────────────────┘
                 │ Service Role Key
                 ▼
┌─────────────────────────────────────────────────────────┐
│              Supabase PostgreSQL                         │
│                                                         │
│  9 tables (RLS activé sur toutes) :                      │
│    Plan 01 : seo_document_folders                        │
│              seo_documents                               │
│              seo_document_permissions                    │
│              seo_document_activity_logs                  │
│    Plan 02 : + colonnes collaboration sur seo_documents  │
│    Plan 03 : seo_ai_provider_configs                     │
│              seo_ai_system_prompts                       │
│              seo_document_ai_conversations               │
│              seo_document_ai_messages                    │
│              seo_document_publication_runs               │
└─────────────────────────────────────────────────────────┘
```

---

## Prérequis

| Outil | Version minimum | Usage |
|-------|----------------|-------|
| Node.js | 18+ | Build frontend |
| npm | 9+ | Gestionnaire de paquets |
| Supabase CLI | 1.100+ | Déploiement Edge Functions + migrations |
| Projet Supabase | — | Backend (BDD + Auth + Edge Functions) |
| Vercel (ou autre) | — | Hébergement frontend |

---

## Étapes de déploiement

### 1. Appliquer les migrations base de données

Les 3 migrations doivent être appliquées **dans l'ordre** sur le projet Supabase :

```bash
# Option A : via Supabase CLI (recommandé)
npm run db:push

# Option B : via le bundle SQL complet
npm run db:bundle
# Puis exécuter supabase/all-migrations.sql dans le SQL Editor Supabase
```

Les migrations sont **idempotentes** (`IF NOT EXISTS` partout). Elles peuvent être réexécutées sans risque.

**Migrations Rédaction** (appliquées après les migrations existantes) :

| Fichier | Contenu |
|---------|---------|
| `20260308100000_create_redaction_tables.sql` | 4 tables (documents, dossiers, permissions, logs) + RLS + fonctions helper |
| `20260308120000_redaction_edition_collaboration.sql` | Colonnes verrouillage/collaboration sur `seo_documents` |
| `20260308140000_redaction_ia_publication.sql` | 5 tables (configs IA, prompts, conversations, messages, runs) + prompt par défaut |

### 2. Déployer les Edge Functions

```bash
# Depuis la racine du projet, avec Supabase CLI connecté :

supabase functions deploy redaction-ai-chat
supabase functions deploy redaction-generate-json
supabase functions deploy redaction-publish
```

Les fonctions nécessitent les secrets suivants (déjà disponibles par défaut dans Supabase) :
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 3. Vérifier les variables d'environnement frontend

Le fichier `.env` (ou `env`) doit contenir :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

### 4. Builder et déployer le frontend

```bash
# Build de production
npm run build

# Le dossier dist/ est prêt pour déploiement sur Vercel
# Le vercel.json gère déjà le routing SPA
```

### 5. Vérification CI avant déploiement

```bash
# Linting + build (utilisé en CI)
npm run ci-check

# Tests unitaires
npx vitest run

# Vérification TypeScript stricte
npm run typecheck
```

---

## Variables d'environnement

### Frontend (Vite)

| Variable | Description | Requis |
|----------|-------------|--------|
| `VITE_SUPABASE_URL` | URL du projet Supabase | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Clé anonyme Supabase (publique) | ✅ |

### Edge Functions (Supabase — automatique)

| Variable | Description | Source |
|----------|-------------|--------|
| `SUPABASE_URL` | URL du projet | Auto (Supabase) |
| `SUPABASE_ANON_KEY` | Clé anonyme | Auto (Supabase) |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service (serveur uniquement) | Auto (Supabase) |

> **Important** : Les clés API des fournisseurs IA (OpenAI, Anthropic, Mistral) sont stockées dans la table `seo_ai_provider_configs` et ne transitent **jamais** par le navigateur. Elles sont récupérées côté serveur par les Edge Functions via `SUPABASE_SERVICE_ROLE_KEY`.

---

## Migrations base de données

### Schéma des tables

```
seo_document_folders
  ├── id (PK)
  ├── name
  ├── parent_id (FK → self)
  ├── path (auto-calculé par trigger)
  ├── depth
  └── sort_order

seo_documents
  ├── id (PK)
  ├── name, editor_mode (plain|rich|structured)
  ├── plain_content, rich_content, structured_content
  ├── folder_id (FK → seo_document_folders)
  ├── linked_template_id (FK → page_templates)
  ├── linked_template_snapshot
  ├── last_generated_json, last_generated_at, last_generated_by
  ├── published_page_id (FK → seo_metadata)
  ├── status (draft|in_progress|json_generated|published|archived|trashed)
  ├── edit_lock_user_id, edit_lock_at
  └── owner_user_id, created_by

seo_document_permissions
  ├── document_id (FK)
  ├── user_id (FK)
  └── permission_level (viewer|editor)

seo_document_activity_logs
  ├── document_id (FK)
  ├── actor_user_id (FK)
  ├── event_type (22 types)
  └── event_payload (jsonb)

seo_ai_provider_configs
  ├── scope (global|user)
  ├── provider_key (openai|anthropic|mistral|...)
  ├── encrypted_api_key
  └── default_model

seo_ai_system_prompts
  ├── name, prompt_text
  └── is_default

seo_document_ai_conversations
  ├── document_id (FK, UNIQUE)
  ├── provider_config_id (FK)
  └── system_prompt_snapshot

seo_document_ai_messages
  ├── conversation_id (FK)
  ├── role (system|user|assistant)
  └── content

seo_document_publication_runs
  ├── document_id (FK)
  ├── target_mode (create_page|update_page)
  ├── generated_json_snapshot (jsonb)
  └── status (pending|succeeded|failed)
```

### Politique RLS

Toutes les tables ont RLS activé. Résumé :

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `seo_documents` | Propriétaire ou permission | Auth | Propriétaire ou editor | Admin |
| `seo_document_folders` | Auth | Auth | Auth | Admin |
| `seo_ai_provider_configs` | Global→admin, User→propriétaire | Même | Même | Admin |
| `seo_ai_system_prompts` | Auth | Admin/Manager | Admin/Manager | Admin |
| `seo_document_ai_conversations` | Auth | Auth | Auth | — |
| `seo_document_ai_messages` | Auth | Auth | — | — |
| `seo_document_publication_runs` | Auth | Auth | Auth | — |

---

## Edge Functions Supabase

### `redaction-ai-chat`

**Endpoint** : `POST /functions/v1/redaction-ai-chat`

Chat IA proxy sécurisé. Récupère la config fournisseur côté serveur, injecte la clé API, appelle le provider, et sauvegarde le message assistant.

```json
{
  "conversation_id": "uuid",
  "messages": [{ "role": "user", "content": "..." }],
  "provider_config_id": "uuid (optionnel)",
  "model": "gpt-4o (optionnel)"
}
```

### `redaction-generate-json`

**Endpoint** : `POST /functions/v1/redaction-generate-json`

Génère un JSON SEO à partir d'un document via l'IA. Valide le résultat, le stocke dans `seo_documents.last_generated_json`, et log l'activité.

```json
{
  "document_id": "uuid",
  "provider_config_id": "uuid (optionnel)",
  "model": "gpt-4o (optionnel)"
}
```

### `redaction-publish`

**Endpoint** : `POST /functions/v1/redaction-publish`

Publie le JSON généré vers `seo_metadata`. Revalide le JSON côté serveur, crée/met à jour la page, trace le run et log l'activité.

```json
{
  "document_id": "uuid",
  "mode": "create_page | update_page",
  "target_page_id": "uuid (requis si update_page)"
}
```

### Sécurité des Edge Functions

- **Authentification** : Chaque requête doit inclure un `Authorization: Bearer <access_token>` valide
- **Pas d'accès anonyme** : `getUser()` est vérifié avant toute opération
- **Clés API IA** : Récupérées serveur-side, jamais envoyées au client
- **Validation** : Le JSON est revalidé côté serveur avant publication
- **Audit** : Chaque opération est tracée dans `seo_document_activity_logs`

---

## Configuration IA

### Première configuration (via l'interface)

1. Ouvrir un document dans le module Rédaction
2. Cliquer sur le bouton **IA** (icône baguette) dans l'en-tête du document
3. Cliquer sur l'icône **⚙️** dans le panneau IA
4. Dans l'onglet **Fournisseurs**, ajouter une configuration :
   - **Scope** : Global (partagé) ou Personnel
   - **Fournisseur** : OpenAI, Anthropic ou Mistral
   - **Clé API** : Votre clé d'API du fournisseur
   - **Modèle par défaut** : Ex. `gpt-4o`, `claude-sonnet-4-20250514`, `mistral-large-latest`

5. (Optionnel) Dans l'onglet **Prompt système**, personnaliser le prompt qui guide la génération

### Fournisseurs supportés

| Fournisseur | Clé | Modèles recommandés | API Base URL |
|-------------|-----|---------------------|-------------|
| OpenAI | `openai` | `gpt-4o`, `gpt-4o-mini` | `https://api.openai.com/v1` |
| Anthropic | `anthropic` | `claude-sonnet-4-20250514`, `claude-3-haiku-20240307` | `https://api.anthropic.com` |
| Mistral | `mistral` | `mistral-large-latest`, `mistral-medium-latest` | `https://api.mistral.ai/v1` |

---

## Vérification post-déploiement

### Checklist

- [ ] Les 3 migrations SQL sont appliquées (`seo_documents`, `seo_ai_provider_configs`, etc.)
- [ ] Les 3 Edge Functions sont déployées et actives
- [ ] Le menu "Rédaction" apparaît dans la navigation principale
- [ ] Créer un dossier + un document fonctionne
- [ ] Les 3 modes éditeur (texte, riche, structuré) fonctionnent
- [ ] La configuration d'un fournisseur IA (via ⚙️) fonctionne
- [ ] L'envoi d'un message dans le chat IA retourne une réponse
- [ ] Le bouton "Générer le JSON" produit un JSON valide
- [ ] La publication d'un document crée une page dans `seo_metadata`
- [ ] Le journal d'activité affiche les événements

### Commandes de vérification

```bash
# Vérifier que les tables existent
# Dans le SQL Editor Supabase :
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'seo_document%' OR table_name LIKE 'seo_ai%';

# Vérifier les Edge Functions
# Dans le Dashboard Supabase > Edge Functions :
# - redaction-ai-chat : Active
# - redaction-generate-json : Active
# - redaction-publish : Active

# Tester une Edge Function (depuis un terminal) :
curl -X POST "https://votre-projet.supabase.co/functions/v1/redaction-ai-chat" \
  -H "Authorization: Bearer <access_token>" \
  -H "Apikey: <anon_key>" \
  -H "Content-Type: application/json" \
  -d '{"conversation_id": null, "messages": [{"role": "user", "content": "test"}]}'
```

---

## Arborescence des fichiers

```
src/
├── components/redaction/
│   ├── RedactionManager.tsx          # Vue principale (bibliothèque)
│   ├── RedactionDocumentEditor.tsx   # Éditeur de document
│   ├── RedactionDocumentHeader.tsx   # En-tête avec actions
│   ├── RedactionDocumentList.tsx     # Liste des documents
│   ├── RedactionFolderTree.tsx       # Arborescence des dossiers
│   ├── RedactionToolbar.tsx          # Barre de recherche/filtres
│   ├── RedactionEmptyState.tsx       # État vide
│   ├── RedactionBulkActionsBar.tsx   # Actions de masse
│   ├── RedactionActivityPanel.tsx    # Journal d'activité
│   ├── RedactionEditorModeSwitcher.tsx # Switcher de mode éditeur
│   ├── CreateDocumentModal.tsx       # Modal création document
│   ├── CreateFolderModal.tsx         # Modal création dossier
│   ├── RenameFolderModal.tsx         # Modal renommage dossier
│   ├── ShareDocumentModal.tsx        # Modal partage/permissions
│   ├── DocumentDetailPanel.tsx       # Panneau détail document
│   ├── ai/
│   │   ├── RedactionAIPanel.tsx      # Sidebar IA principale
│   │   ├── RedactionConversation.tsx # Conversation IA (chat)
│   │   ├── RedactionMessageList.tsx  # Affichage messages
│   │   ├── AIConfigModal.tsx         # Configuration fournisseurs + prompts
│   │   ├── AIProviderSelector.tsx    # Sélecteur de fournisseur
│   │   └── AIModelSelector.tsx       # Sélecteur de modèle
│   ├── editors/
│   │   ├── PlainTextEditor.tsx       # Éditeur texte libre
│   │   ├── RichTextEditor.tsx        # Éditeur riche (WYSIWYG)
│   │   └── StructuredSeoEditor.tsx   # Éditeur SEO structuré
│   ├── publish/
│   │   ├── RedactionPublishPanel.tsx     # Panel publication principal
│   │   ├── GeneratedJsonPreview.tsx      # Aperçu JSON + validation
│   │   ├── PublishTargetSelector.tsx     # Sélection mode/cible
│   │   └── PublishConfirmationDialog.tsx # Confirmation publication
│   └── __tests__/                    # 5 fichiers de tests composants
│
├── lib/
│   ├── redactionTypes.ts             # Types TypeScript + constantes
│   ├── redactionDocuments.ts         # CRUD documents
│   ├── redactionFolders.ts           # CRUD dossiers
│   ├── redactionAiClient.ts          # Client IA (proxy Edge Functions)
│   ├── redactionJsonValidation.ts    # Validation JSON
│   ├── redactionPublishClient.ts     # Client publication
│   ├── redactionPromptPolicy.ts      # Construction de prompts
│   ├── redactionActivity.ts          # Journal d'activité
│   ├── redactionConflictGuard.ts     # Verrouillage optimiste
│   ├── redactionPermissions.ts       # Gestion permissions
│   ├── redactionEditorTransforms.ts  # Conversions inter-modes
│   ├── redactionLogLabels.ts         # Labels événements
│   └── __tests__/                    # 12 fichiers de tests services
│
supabase/
├── functions/
│   ├── deno.json                     # Config Deno pour Edge Functions
│   ├── redaction-ai-chat/index.ts    # Proxy IA sécurisé
│   ├── redaction-generate-json/index.ts # Génération JSON serveur
│   └── redaction-publish/index.ts    # Publication sécurisée
└── migrations/
    ├── 20260308100000_create_redaction_tables.sql     # Plan 01 : socle
    ├── 20260308120000_redaction_edition_collaboration.sql # Plan 02 : collab
    └── 20260308140000_redaction_ia_publication.sql    # Plan 03 : IA + publish
```

---

## Tests

### Exécution

```bash
# Tous les tests
npx vitest run

# Tests en mode watch (développement)
npx vitest

# Tests d'un fichier spécifique
npx vitest run src/lib/__tests__/redactionJsonValidation.test.ts
```

### Couverture

| Catégorie | Tests | Fichiers |
|-----------|-------|----------|
| Migrations SQL (structure) | 53 | 3 fichiers |
| Types + constantes | 14 | 2 fichiers |
| Services métier | 62 | 7 fichiers |
| Composants UI | 22 | 5 fichiers |
| **Total** | **157** | **17 fichiers** |

---

## Dépannage

### « Le module Rédaction n'apparaît pas dans le menu »

- Vérifier que `Header.tsx` contient l'entrée `redaction` dans `NAV_ITEMS`
- Vérifier que `App.tsx` rend `<RedactionManager />` quand `currentView === 'redaction'`

### « Erreur lors de l'appel IA »

1. Vérifier que l'Edge Function `redaction-ai-chat` est déployée
2. Vérifier qu'une configuration fournisseur IA existe (icône ⚙️ dans le panneau IA)
3. Vérifier que la clé API stockée est valide
4. Consulter les logs de l'Edge Function dans le Dashboard Supabase

### « Le JSON généré est invalide »

Le validateur vérifie :
- Structure `{ pages: [...] }` avec au moins une page
- Chaque page a `page_key` (format `a-z0-9-`) et `title` (string)
- `status` doit être `draft`, `published` ou `archived`

### « Erreur de publication »

1. Vérifier que le JSON est valide (panneau publication → indicateur vert)
2. Pour `update_page` : vérifier que la page cible existe dans `seo_metadata`
3. Consulter le journal d'activité pour les détails d'erreur
4. Vérifier les logs de l'Edge Function `redaction-publish`

### « Table not found / permission denied »

- Les 3 migrations doivent être appliquées dans l'ordre
- Vérifier que l'utilisateur a le rôle approprié (`admin`, `seo_manager`, ou propriétaire du document)
- Vérifier que RLS est activé sur toutes les tables

### « VS Code affiche des erreurs Deno dans les Edge Functions »

C'est normal si l'extension Deno n'est pas installée. Les Edge Functions utilisent le runtime Deno de Supabase, pas Node.js. Pour supprimer ces avertissements :

1. Installer l'extension VS Code `denoland.vscode-deno`
2. La configuration `.vscode/settings.json` active Deno uniquement pour `supabase/functions/`

Les Edge Functions ne sont **pas** compilées par Vite — elles sont déployées séparément via `supabase functions deploy`.
