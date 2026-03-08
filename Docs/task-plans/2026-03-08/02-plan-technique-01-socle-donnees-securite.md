# Plan technique 01 — Socle données, sécurité et navigation

## Position dans l'ordre de développement
Ce plan est le **premier chantier**. Il pose le socle indispensable pour tout le reste:
- structure de données,
- routes applicatives,
- navigation,
- arborescence des dossiers,
- permissions de base,
- logs,
- point d'entrée UI du menu Rédaction.

Sans ce socle, les plans 02 et 03 seraient contraints à travailler sur des abstractions instables.

## Objectif du plan
Introduire le noyau du menu Rédaction en production interne, avec un périmètre stable et sécurisé permettant:
- de naviguer vers le menu,
- de voir une liste vide ou peuplée,
- de créer des dossiers hiérarchiques,
- de créer des documents,
- de lire tous les documents si authentifié,
- d'autoriser uniquement les propriétaires et éditeurs partagés à modifier,
- de journaliser les actions essentielles.

## Périmètre couvert par ce plan
- nouvelle vue applicative `redaction`,
- ajout navbar et dashboard,
- tables coeur des documents,
- tables dossiers hiérarchiques,
- table permissions documentaires,
- table logs d'activité,
- policies RLS associées,
- requêtes de base de consultation et de création.

## Hors périmètre de ce plan
- éditeur avancé multi-mode complet,
- UI détaillée de partage et de logs,
- conversation IA,
- configuration des clés API,
- génération JSON,
- publication automatique.

## Tables à créer ou faire évoluer

### 1. `seo_document_folders`
Rôle: stocker une arborescence de dossiers avec sous-dossiers.

Champs recommandés:
- `id uuid primary key default gen_random_uuid()`
- `name text not null`
- `parent_id uuid null references seo_document_folders(id) on delete cascade`
- `path text not null`
- `depth integer not null default 0`
- `sort_order integer not null default 0`
- `created_by uuid null references user_profiles(id) on delete set null`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`

Contraintes recommandées:
- unicité de `name` dans un même `parent_id`
- interdiction de boucle parent/enfant
- index sur `parent_id`
- index sur `path`

Décision technique recommandée:
- stocker `path` sous forme dérivée, par exemple `racine/services/plomberie`
- recalculer `path` à chaque renommage/déplacement par fonction SQL ou service applicatif

### 2. `seo_documents`
Rôle: stocker les documents rédactionnels.

Champs recommandés:
- `id uuid primary key default gen_random_uuid()`
- `name text not null`
- `editor_mode text not null check (editor_mode in ('plain', 'rich', 'structured'))`
- `plain_content text null`
- `rich_content jsonb null`
- `structured_content jsonb null`
- `status text not null default 'draft' check (status in ('draft', 'ready_for_ai', 'json_generated', 'published', 'archived'))`
- `folder_id uuid null references seo_document_folders(id) on delete set null`
- `author_user_id uuid not null references user_profiles(id) on delete restrict`
- `owner_user_id uuid not null references user_profiles(id) on delete restrict`
- `linked_template_id uuid null references page_templates(id) on delete set null`
- `linked_template_snapshot jsonb null`
- `last_generated_json jsonb null`
- `last_generated_at timestamptz null`
- `last_generated_by uuid null references user_profiles(id) on delete set null`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`
- `archived_at timestamptz null`

Contraintes recommandées:
- au moins un des contenus est cohérent avec `editor_mode`
- index sur `folder_id`
- index sur `author_user_id`
- index sur `owner_user_id`
- index sur `status`
- index de recherche sur `name`

### 3. `seo_document_permissions`
Rôle: gérer les droits d'édition documentaires.

Champs recommandés:
- `id uuid primary key default gen_random_uuid()`
- `document_id uuid not null references seo_documents(id) on delete cascade`
- `user_id uuid not null references user_profiles(id) on delete cascade`
- `permission_level text not null check (permission_level in ('reader', 'editor', 'owner'))`
- `granted_by uuid null references user_profiles(id) on delete set null`
- `created_at timestamptz default now()`

Contraintes recommandées:
- unicité `(document_id, user_id)`
- ne jamais stocker plus d'un `owner` secondaire si l'on garde `owner_user_id` comme source de vérité

Décision recommandée:
- `owner_user_id` dans `seo_documents` reste la vérité principale
- `seo_document_permissions` sert aux droits délégués

### 4. `seo_document_activity_logs`
Rôle: audit des actions.

Champs recommandés:
- `id uuid primary key default gen_random_uuid()`
- `document_id uuid not null references seo_documents(id) on delete cascade`
- `actor_user_id uuid null references user_profiles(id) on delete set null`
- `event_type text not null`
- `event_summary text not null`
- `event_payload jsonb null`
- `created_at timestamptz default now()`

Index recommandés:
- `(document_id, created_at desc)`
- `event_type`

## Fonctions SQL ou helpers à prévoir

### 1. Fonction de mise à jour `updated_at`
Réutiliser le pattern déjà présent dans le repo pour:
- `seo_document_folders`
- `seo_documents`

### 2. Fonction de recalcul de chemin dossier
Prévoir une fonction ou un service pour:
- recalculer `path` et `depth`
- empêcher qu'un dossier devienne enfant de lui-même ou d'un de ses descendants

### 3. Fonction d'écriture de log
Créer un helper central, par exemple `logDocumentActivity`, pour éviter la duplication côté client.

## Policies RLS à implémenter

### `seo_document_folders`
Objectif:
- lecture ouverte à tous les utilisateurs authentifiés,
- création réservée aux utilisateurs authentifiés,
- modification/suppression réservées aux utilisateurs authentifiés selon stratégie produit.

Recommandation V1:
- `SELECT`: tout utilisateur authentifié
- `INSERT`: tout utilisateur authentifié
- `UPDATE`: tout utilisateur authentifié
- `DELETE`: `admin` et `seo_manager` uniquement, ou suppression logique si dossiers non vides

Pourquoi cette ouverture relative:
- le dossier est une structure d'organisation collective si la lecture est globale
- fermer trop tôt l'édition des dossiers peut nuire à l'usage quotidien

### `seo_documents`
Objectif:
- lecture globale authentifiée,
- création authentifiée,
- édition restreinte,
- suppression/archivage restreints.

Policies recommandées:
- `SELECT`: `authenticated` avec `true`
- `INSERT`: `authenticated` avec `auth.uid() = author_user_id and auth.uid() = owner_user_id`
- `UPDATE`: autoriser si `auth.uid() = owner_user_id` ou présence d'un droit `editor` dans `seo_document_permissions` ou rôle `admin`/`seo_manager`
- `DELETE`: autoriser si `auth.uid() = owner_user_id` ou rôle `admin`/`seo_manager`

Point important:
- la future publication automatique ne doit pas utiliser la policy d'édition du document pour décider de créer ou mettre à jour une page

### `seo_document_permissions`
Policies recommandées:
- `SELECT`: tout utilisateur authentifié
- `INSERT`: seulement `owner_user_id` du document ou `admin`/`seo_manager`
- `UPDATE`: seulement `owner_user_id` du document ou `admin`/`seo_manager`
- `DELETE`: seulement `owner_user_id` du document ou `admin`/`seo_manager`

### `seo_document_activity_logs`
Policies recommandées:
- `SELECT`: tout utilisateur authentifié
- `INSERT`: authentifié, mais idéalement via helper ou RPC contrôlé
- `UPDATE`: interdit
- `DELETE`: interdit sauf admin de maintenance si besoin explicite

## Composants frontend à créer

### 1. Vue et shell
- `src/components/redaction/RedactionManager.tsx`
- `src/components/redaction/RedactionLayout.tsx`
- `src/components/redaction/RedactionEmptyState.tsx`

### 2. Liste et navigation dossiers
- `src/components/redaction/RedactionDocumentList.tsx`
- `src/components/redaction/RedactionFolderTree.tsx`
- `src/components/redaction/RedactionToolbar.tsx`
- `src/components/redaction/RedactionBulkActionsBar.tsx`

### 3. Modales de base
- `src/components/redaction/CreateDocumentModal.tsx`
- `src/components/redaction/CreateFolderModal.tsx`
- `src/components/redaction/RenameFolderModal.tsx`

### 4. Services et types
- `src/lib/redactionTypes.ts`
- `src/lib/redactionFolders.ts`
- `src/lib/redactionDocuments.ts`
- `src/lib/redactionPermissions.ts`
- `src/lib/redactionActivity.ts`

## Routes et intégration applicative

### `src/App.tsx`
Travaux:
- ajouter `redaction` au type `View`
- ajouter le rendu conditionnel de `RedactionManager`

### Header
Travaux:
- ajouter l'entrée `Rédaction`
- choisir une icône dédiée cohérente avec la navbar existante

### Dashboard
Travaux:
- ajouter une carte d'accès rapide vers `redaction`
- positionner cette carte près de `Pages` et `Éditeur avancé`

## Ordre de développement détaillé
1. Créer les migrations SQL des quatre tables coeur.
2. Ajouter les triggers `updated_at` et les index.
3. Mettre en place les policies RLS minimales.
4. Mettre à jour les types client dans `src/lib/supabase.ts` ou créer des types locaux dédiés.
5. Ajouter la nouvelle vue `redaction` dans `App.tsx`.
6. Ajouter l'entrée navbar et la carte dashboard.
7. Créer la page `RedactionManager` avec état vide.
8. Brancher la récupération des dossiers et documents.
9. Créer la création de document simple.
10. Créer la création de dossier et l'affichage de l'arborescence.
11. Ajouter les logs de création/renommage/déplacement minimum.

## Vérifications attendues en fin de plan
- un utilisateur authentifié voit le menu Rédaction
- il peut créer un document
- il peut créer un sous-dossier
- il peut déplacer un document dans un sous-dossier
- il peut voir les documents des autres utilisateurs
- il ne peut pas modifier un document tiers sans permission explicite
- un log d'activité apparaît sur les actions coeur

## Risques et points de vigilance
- complexité des sous-dossiers si le recalcul de chemin est fragile
- politiques RLS trop ouvertes sur les dossiers
- confusion entre lecture globale et édition globale
- dette rapide si les helpers d'activité ne sont pas centralisés

## Livrables de sortie du plan
- migrations Supabase du socle Rédaction
- types TS de base
- nouvelle vue applicative accessible
- CRUD minimal dossiers + documents
- audit minimal opérationnel
