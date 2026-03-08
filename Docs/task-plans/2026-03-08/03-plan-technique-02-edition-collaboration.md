# Plan technique 02 — Édition, collaboration et actions métier

## Position dans l'ordre de développement
Ce plan est le **deuxième chantier**. Il s'appuie sur le socle du plan 01 et transforme la section Rédaction en véritable espace de travail éditorial.

## Objectif du plan
Mettre en place:
- les trois modes d'édition demandés,
- l'édition fine des documents,
- le partage des droits d'édition,
- les logs lisibles,
- les actions unitaires et de masse,
- la robustesse fonctionnelle sur les dossiers hiérarchiques.

## Périmètre couvert par ce plan
- écran document complet,
- bascule entre mode `plain`, `rich` et `structured`,
- partage d'édition,
- consultation des logs,
- actions multi-sélection,
- corbeille logique ou archivage,
- prévention minimale des conflits d'édition.

## Hors périmètre de ce plan
- appel fournisseur IA,
- stockage des clés API,
- génération de JSON,
- publication vers `seo_metadata`.

## Évolutions de tables recommandées

### 1. `seo_documents`
Compléments recommandés:
- `last_edited_by uuid null references user_profiles(id)`
- `edit_lock_user_id uuid null references user_profiles(id)` si verrou léger retenu
- `edit_lock_at timestamptz null`
- `trashed_at timestamptz null`
- `trashed_by uuid null references user_profiles(id)`

Décision recommandée:
- préférer un **verrou léger informatif** plutôt qu'un verrou dur en V1
- conserver `archived_at` pour l'archivage métier et `trashed_at` pour la corbeille si les deux concepts sont gardés

### 2. `seo_document_permissions`
Pas de changement structurel obligatoire si le modèle `reader/editor/owner` suffit.

Évolution possible:
- champ `updated_at` si l'on souhaite tracer plus finement les modifications de permission

### 3. `seo_document_activity_logs`
Étendre les `event_type` utilisés:
- `document_created`
- `document_renamed`
- `document_content_updated`
- `document_moved`
- `document_archived`
- `document_trashed`
- `document_restored`
- `permission_granted`
- `permission_revoked`
- `editor_mode_changed`

## Modèle métier d'édition recommandé

### Mode 1. `plain`
Usage:
- texte collé brut
- workflow rapide
- aucune structure imposée

Stockage:
- `plain_content`

### Mode 2. `rich`
Usage:
- mise en forme légère
- gras, listes, intertitres, liens

Stockage:
- `rich_content` en `jsonb`

Recommandation:
- rester sur un éditeur léger et stable
- éviter un éditeur trop complexe tant que l'IA attend surtout du texte sémantique

### Mode 3. `structured`
Usage:
- capture guidée des parties SEO importantes

Structure recommandée de `structured_content`:
- `seo_title`
- `meta_description`
- `h1`
- `h2`
- `body`
- `cta_label`
- `cta_target`
- `keywords`
- `notes`

Recommandation:
- prévoir une fonction de normalisation qui transforme n'importe quel mode vers un **texte source IA unifié**

## Composants frontend à créer

### 1. Éditeur principal
- `src/components/redaction/RedactionDocumentEditor.tsx`
- `src/components/redaction/RedactionDocumentHeader.tsx`
- `src/components/redaction/RedactionEditorModeSwitcher.tsx`

### 2. Éditeurs par mode
- `src/components/redaction/editors/PlainTextEditor.tsx`
- `src/components/redaction/editors/RichTextEditor.tsx`
- `src/components/redaction/editors/StructuredSeoEditor.tsx`

### 3. Collaboration
- `src/components/redaction/RedactionPermissionsPanel.tsx`
- `src/components/redaction/ShareDocumentModal.tsx`
- `src/components/redaction/DocumentCollaboratorsList.tsx`

### 4. Logs et audit
- `src/components/redaction/RedactionActivityPanel.tsx`
- `src/components/redaction/RedactionActivityList.tsx`

### 5. Actions de masse
- `src/components/redaction/RedactionSelectionStore.ts`
- `src/components/redaction/RedactionBulkMoveModal.tsx`
- `src/components/redaction/RedactionBulkPermissionsModal.tsx`
- `src/components/redaction/RedactionBulkArchiveDialog.tsx`

## Services frontend à créer
- `src/lib/redactionEditorTransforms.ts`
- `src/lib/redactionBulkActions.ts`
- `src/lib/redactionConflictGuard.ts`
- `src/lib/redactionLogLabels.ts`

## Routes et navigation interne

### Route logique recommandée dans l'état de vue actuel
Comme l'application fonctionne encore avec un état `currentView`, recommander:
- vue `redaction` pour la bibliothèque
- vue interne locale pour le document sélectionné, gérée dans `RedactionManager`

Évolution future possible:
- passer plus tard à une vraie logique d'URL si l'application grandit

## RLS et contrôles métier à compléter

### Lecture document
Déjà couverte par le plan 01: tout utilisateur authentifié.

### Mise à jour document
Contrôle à appliquer systématiquement:
- `owner_user_id = auth.uid()`
- ou permission `editor`
- ou rôle global `admin`/`seo_manager`

### Gestion permissions
Seul:
- propriétaire
- admin
- seo_manager

### Logs
Tous les utilisateurs authentifiés peuvent lire.

Pour l'écriture:
- utiliser de préférence un helper commun ou une RPC contrôlée
- éviter les insertions dispersées directement dans les composants

## Ordre de développement détaillé
1. Créer `RedactionDocumentEditor` avec chargement d'un document.
2. Implémenter le mode `plain` de bout en bout.
3. Ajouter le mode `structured`.
4. Ajouter le mode `rich`.
5. Créer la normalisation vers un texte IA source unique.
6. Implémenter l'enregistrement avec journalisation `document_content_updated`.
7. Ajouter le panneau de permissions.
8. Ajouter les mutations de partage et retrait de droits.
9. Ajouter la consultation des logs.
10. Ajouter la multi-sélection dans la bibliothèque.
11. Ajouter les actions de masse: déplacer, archiver, supprimer logique, partager.
12. Ajouter le verrou léger ou au minimum l'indicateur de dernière modification concurrente.

## Tests fonctionnels à couvrir
- création puis édition en mode `plain`
- conversion document `plain` vers `structured`
- partage d'un document avec un autre utilisateur en `editor`
- refus de modification pour un lecteur simple
- affichage correct des logs après renommage, déplacement, édition, partage
- déplacement en masse de plusieurs documents dans un sous-dossier
- archivage multiple

## Risques et arbitrages techniques

### 1. Support de trois modes d'édition
Risque:
- divergence entre données selon le mode

Réponse recommandée:
- définir un format de normalisation unique vers texte source IA
- ne jamais laisser l'IA dépendre directement d'un mode de stockage précis

### 2. Éditeur riche
Risque:
- surcharge technique inutile

Réponse recommandée:
- limiter les fonctionnalités à un niveau léger
- privilégier robustesse et sérialisation simple

### 3. Multi-sélection avec arborescence
Risque:
- UX confuse si l'utilisateur déplace vers des noeuds invalides

Réponse recommandée:
- toujours proposer un sélecteur d'arborescence clair
- interdire les destinations invalides

## Livrables de sortie du plan
- écran document complet
- partage d'édition opérationnel
- logs lisibles
- modes `plain`, `rich`, `structured`
- actions de masse principales
- robustesse suffisante pour brancher l'IA ensuite
