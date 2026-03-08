# Plan technique 03 — IA, publication et vérification de couverture

## Position dans l'ordre de développement
Ce plan est le **troisième chantier**. Il s'appuie sur les fondations du plan 01 et sur l'expérience d'édition du plan 02 pour fermer la boucle métier complète du menu Rédaction.

## Objectif du plan
Permettre à partir d'un document Rédaction:
- de configurer l'accès IA,
- d'utiliser une conversation dédiée,
- de choisir un modèle CMS,
- de générer un JSON conforme au contrat du repo,
- de publier une nouvelle page par défaut,
- de mettre à jour une page existante si choisi explicitement,
- de tracer toutes les opérations sensibles.

## Périmètre couvert par ce plan
- abstraction IA multi-fournisseurs,
- clés API globales et utilisateur,
- prompt système global,
- conversation IA dédiée par document,
- génération JSON,
- validation stricte du JSON,
- création ou mise à jour de page via backend contrôlé,
- logs associés,
- vérification finale de couverture des trois plans.

## Tables à créer ou faire évoluer

### 1. `seo_ai_provider_configs`
Rôle: stocker les configurations IA.

Champs recommandés:
- `id uuid primary key default gen_random_uuid()`
- `scope text not null check (scope in ('global', 'user'))`
- `user_id uuid null references user_profiles(id) on delete cascade`
- `provider_key text not null`
- `provider_label text not null`
- `api_base_url text null`
- `encrypted_api_key text not null`
- `is_active boolean not null default true`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`

Décisions techniques:
- ne jamais exposer la clé API brute au client après enregistrement
- chiffrer côté serveur ou Edge Function
- une config `global` n'a pas de `user_id`

### 2. `seo_ai_system_prompts`
Rôle: stocker la règle commune de prompt système.

Champs recommandés:
- `id uuid primary key default gen_random_uuid()`
- `name text not null`
- `prompt_text text not null`
- `is_default boolean not null default false`
- `created_by uuid null references user_profiles(id) on delete set null`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`

Décision produit:
- une seule entrée active par défaut en V1
- modifications journalisées

### 3. `seo_document_ai_conversations`
Rôle: une conversation par document.

Champs recommandés:
- `id uuid primary key default gen_random_uuid()`
- `document_id uuid unique not null references seo_documents(id) on delete cascade`
- `provider_config_id uuid null references seo_ai_provider_configs(id) on delete set null`
- `model_name text null`
- `system_prompt_id uuid null references seo_ai_system_prompts(id) on delete set null`
- `system_prompt_snapshot text not null`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`

### 4. `seo_document_ai_messages`
Rôle: stocker l'historique conversationnel opérationnel.

Champs recommandés:
- `id uuid primary key default gen_random_uuid()`
- `conversation_id uuid not null references seo_document_ai_conversations(id) on delete cascade`
- `role text not null check (role in ('system', 'user', 'assistant'))`
- `content text not null`
- `created_by uuid null references user_profiles(id) on delete set null`
- `created_at timestamptz default now()`

### 5. `seo_document_publication_runs`
Rôle: tracer les opérations de publication sans bâtir un historique complet de versions du JSON.

Champs recommandés:
- `id uuid primary key default gen_random_uuid()`
- `document_id uuid not null references seo_documents(id) on delete cascade`
- `actor_user_id uuid null references user_profiles(id) on delete set null`
- `target_mode text not null check (target_mode in ('create_page', 'update_page'))`
- `target_page_id uuid null references seo_metadata(id) on delete set null`
- `template_id uuid null references page_templates(id) on delete set null`
- `generated_json_snapshot jsonb not null`
- `status text not null check (status in ('pending', 'succeeded', 'failed'))`
- `error_message text null`
- `created_at timestamptz default now()`

## Backend et Edge Functions à créer

### 1. Edge Function `redaction-ai-chat`
Responsabilités:
- récupérer la config fournisseur applicable
- déchiffrer la clé API
- injecter le prompt système global
- injecter le contexte document + modèle cible
- appeler le fournisseur IA
- retourner la réponse assistant
- journaliser l'événement de conversation si nécessaire

### 2. Edge Function `redaction-generate-json`
Responsabilités:
- normaliser le document source en texte IA
- charger le modèle CMS cible et son snapshot/export exploitable
- exiger un format de sortie JSON compatible repo
- valider le JSON renvoyé
- mettre à jour `seo_documents.last_generated_json`
- écrire un log `json_generated`

### 3. Edge Function `redaction-publish`
Responsabilités:
- accepter un document et un mode `create_page` ou `update_page`
- revalider le JSON courant
- créer une nouvelle entrée `seo_metadata` par défaut
- ou mettre à jour une page existante si cible fournie
- écrire `seo_document_publication_runs`
- écrire un log `document_published`

Pourquoi passer par backend/Edge Functions:
- isolation des clés API
- validation serveur obligatoire
- audit centralisé
- séparation claire entre droit d'éditer un document et droit de publier une page

## RLS et contrôles de sécurité à mettre en place

### `seo_ai_provider_configs`
Policies recommandées:
- `SELECT`: globale visible seulement par admin/seo_manager, utilisateur visible par son propriétaire
- `INSERT`: globale par admin/seo_manager, utilisateur par l'utilisateur lui-même
- `UPDATE`: même règle que `INSERT`
- `DELETE`: même règle que `INSERT`

### `seo_ai_system_prompts`
Policies recommandées:
- `SELECT`: tout utilisateur authentifié
- `INSERT`: admin/seo_manager
- `UPDATE`: admin/seo_manager
- `DELETE`: admin/seo_manager

### `seo_document_ai_conversations`
Policies recommandées:
- `SELECT`: tout utilisateur authentifié
- `INSERT`: tout utilisateur authentifié si document visible
- `UPDATE`: tout utilisateur authentifié

Décision métier importante:
- même si un utilisateur n'a pas le droit d'éditer le document, il peut converser et publier selon la règle produit retenue

### `seo_document_ai_messages`
Policies recommandées:
- `SELECT`: tout utilisateur authentifié
- `INSERT`: tout utilisateur authentifié dans une conversation visible
- `UPDATE` et `DELETE`: interdits sauf maintenance admin si besoin

### `seo_document_publication_runs`
Policies recommandées:
- `SELECT`: tout utilisateur authentifié
- `INSERT`: uniquement via backend/Edge Function
- `UPDATE`: backend uniquement ou interdit
- `DELETE`: interdit

## Composants frontend à créer

### 1. Panneau IA
- `src/components/redaction/ai/RedactionAIPanel.tsx`
- `src/components/redaction/ai/RedactionConversation.tsx`
- `src/components/redaction/ai/RedactionMessageList.tsx`
- `src/components/redaction/ai/RedactionPromptInfo.tsx`

### 2. Configuration IA
- `src/components/redaction/ai/AIProviderSelector.tsx`
- `src/components/redaction/ai/AIModelSelector.tsx`
- `src/components/redaction/ai/AIConfigModal.tsx`
- `src/components/redaction/ai/SystemPromptManager.tsx`

### 3. Publication
- `src/components/redaction/publish/RedactionPublishPanel.tsx`
- `src/components/redaction/publish/PublishTargetSelector.tsx`
- `src/components/redaction/publish/PublishConfirmationDialog.tsx`
- `src/components/redaction/publish/GeneratedJsonPreview.tsx`

## Services frontend à créer
- `src/lib/redactionAiClient.ts`
- `src/lib/redactionJsonValidation.ts`
- `src/lib/redactionPublishClient.ts`
- `src/lib/redactionPromptPolicy.ts`
- `src/lib/redactionToPromptInput.ts`

## Contrat de génération JSON
Le plan doit impérativement réutiliser le contrat déjà documenté dans le repo:
- priorité à `content_overrides` quand c'est possible
- `sections_data` complet seulement si nécessaire
- conservation des règles de fidélité visuelle existantes

Entrées minimales envoyées à la génération:
- texte normalisé du document
- mode d'édition courant
- modèle CMS sélectionné
- snapshot du modèle
- prompt système global
- contraintes du contrat JSON repo

Sorties minimales attendues:
- JSON valide
- messages d'erreur exploitables si invalide
- mise à jour du dernier JSON courant du document

## Publication automatique vers `seo_metadata`

### Mode par défaut: création de page
Étapes:
1. l'utilisateur confirme la publication
2. le backend génère ou relit le JSON courant
3. si le JSON contient les champs requis, création d'une nouvelle page dans `seo_metadata`
4. liaison du document à la page créée si nécessaire
5. log de publication

### Mode optionnel: mise à jour d'une page existante
Étapes:
1. sélection explicite de la page cible
2. validation de compatibilité template/page
3. mise à jour contrôlée
4. log détaillé incluant l'identifiant de la page touchée

### Contrôle d'autorisation
Comme décidé produit:
- tout utilisateur authentifié peut exécuter la publication
- la vérification ne doit pas porter sur le droit d'édition du document
- en revanche, chaque publication doit être explicitement tracée avec l'utilisateur acteur

## Ordre de développement détaillé
1. Créer les tables IA et publication.
2. Ajouter les policies RLS.
3. Créer les helpers serveur de chiffrement et lecture de clés API.
4. Créer l'Edge Function `redaction-ai-chat`.
5. Créer l'Edge Function `redaction-generate-json`.
6. Brancher le panneau IA dans l'écran document.
7. Ajouter le sélecteur fournisseur/modèle.
8. Ajouter la gestion de la conversation dédiée par document.
9. Ajouter la validation stricte du JSON.
10. Créer l'Edge Function `redaction-publish`.
11. Ajouter l'UI de création de nouvelle page par défaut.
12. Ajouter l'option de mise à jour de page existante.
13. Ajouter les logs et `publication_runs`.

## Vérification de couverture globale
Cette section sert de recheck croisé des trois plans face à la spécification consolidée.

### Axe 1. Navigation et accès menu
Couvert par:
- plan 01

Éléments couverts:
- navbar
- dashboard
- vue `redaction`

### Axe 2. Documents rédactionnels
Couvert par:
- plan 01
- plan 02

Éléments couverts:
- création
- lecture
- édition
- archivage/suppression logique
- auteur, dates, statut

### Axe 3. Arborescence de dossiers avec sous-dossiers
Couvert par:
- plan 01
- plan 02

Éléments couverts:
- table hiérarchique
- affichage arborescent
- déplacement unitaire et de masse

### Axe 4. Permissions et droits locaux
Couvert par:
- plan 01
- plan 02

Éléments couverts:
- lecture globale authentifiée
- édition par owner/editor/admin/seo_manager
- gestion des partages

### Axe 5. Logs d'activité
Couvert par:
- plan 01
- plan 02
- plan 03

Éléments couverts:
- création
- édition
- partage
- génération IA
- publication

### Axe 6. Trois types d'éditeur
Couvert par:
- plan 02

Éléments couverts:
- plain
- rich
- structured
- normalisation vers texte IA

### Axe 7. Conversation IA par document
Couvert par:
- plan 03

Éléments couverts:
- une conversation dédiée par document
- messages persistés
- prompt système global appliqué

### Axe 8. Clés API globales et utilisateur
Couvert par:
- plan 03

Éléments couverts:
- config globale
- config utilisateur
- sécurité backend

### Axe 9. Génération JSON conforme au repo
Couvert par:
- plan 03

Éléments couverts:
- contrat existant réutilisé
- validation stricte
- stockage du JSON courant

### Axe 10. Publication automatique
Couvert par:
- plan 03

Éléments couverts:
- création de nouvelle page par défaut
- mise à jour page existante en option
- autorisation ouverte à tout utilisateur authentifié

### Axe 11. Actions unitaires et de masse
Couvert par:
- plan 02

Éléments couverts:
- déplacer
- archiver
- supprimer logique
- partage

### Axe 12. Sécurité et auditabilité
Couvert par:
- plan 01
- plan 03

Éléments couverts:
- RLS
- Edge Functions
- chiffrement des clés
- logs de publication

## Conclusion de la vérification
Les trois plans couvrent l'ensemble des axes structurants de la spécification consolidée du menu Rédaction.

Le seul point à surveiller pendant l'implémentation sera la frontière entre:
- droit d'éditer un document,
- droit de publier une page à partir d'un document tiers.

Cette frontière est volontairement inhabituelle dans le produit, donc elle devra être explicitée dans:
- les policies,
- les écrans de confirmation,
- les logs,
- les tests de non-régression.
