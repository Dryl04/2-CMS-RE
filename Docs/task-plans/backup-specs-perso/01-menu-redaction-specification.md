# Tâche 01 — Menu Rédaction

## Taille estimée
- **Taille**: XL
- **Complexité**: Très élevée
- **Impact**: Très élevé

## Contexte projet observé
- Le projet est un CMS interne React + Vite + TypeScript avec Supabase comme backend principal.
- L'application possède déjà une navigation centrale via la navbar et le dashboard, avec des écrans dédiés pour Pages, Modèles, Médias, Liens, Stats, Thèmes et Header/Footer global.
- La donnée métier principale côté SEO repose aujourd'hui surtout sur la table `seo_metadata`, enrichie par des `page_templates`, des `sections_data`, des dossiers simples et un système de rôles utilisateur basique.
- Les rôles existants sont aujourd'hui globaux et limités à `admin`, `seo_manager`, `content_creator`.
- Les dossiers existent déjà sous forme de champ texte simple sur les pages et les modèles. Il n'existe pas encore de vraie hiérarchie de dossiers ni de permissions fines par document.
- Une base documentaire existe déjà pour l'import SEO, y compris un contrat JSON pensé pour de la génération assistée par IA afin d'alimenter le système d'import.

## Reformulation claire de l'objectif
Créer un nouveau menu applicatif nommé **Rédaction** permettant aux rédacteurs de produire, organiser, partager et exploiter des textes SEO indépendamment des pages finales, puis de les transformer avec une IA en JSON compatible avec les modèles/pages du CMS.

Autrement dit, ce menu doit devenir un espace de travail éditorial intermédiaire entre:
- la production du texte SEO,
- la collaboration entre rédacteurs,
- la génération assistée par IA d'un payload JSON compatible avec les modèles existants,
- puis la publication ou la copie de ce payload dans le flux actuel du produit.

## Positionnement produit
Le menu Rédaction ne doit pas être pensé comme une simple variante de Gestion des pages.

Il doit couvrir un besoin distinct:
- **Pages** = objet final publiable dans le CMS.
- **Rédaction** = brouillon éditorial structuré, collaboratif, réutilisable et transformable vers un format de page.

Cette distinction est importante pour éviter:
- de mélanger texte source et page finale,
- de donner trop tôt accès à la publication,
- de casser les responsabilités entre rédacteur, relecteur et gestionnaire SEO.

## Objectifs métier
1. Permettre à un rédacteur de créer ou coller un texte SEO dans la plateforme.
2. Organiser ces textes dans des dossiers, avec des actions unitaires et multi-sélection.
3. Identifier clairement chaque texte via son nom, son auteur, ses dates de création et modification.
4. Gérer des droits de lecture et d'édition au niveau du document.
5. Journaliser les actions importantes sur chaque texte.
6. Connecter chaque texte à une expérience IA compatible multi-fournisseurs et multi-modèles.
7. Générer un JSON prêt à intégrer dans l'écosystème existant du CMS.
8. Laisser à l'utilisateur le choix entre publication automatique et simple copie du JSON.

## Résultat attendu côté utilisateur
Un rédacteur doit pouvoir suivre le parcours suivant:
1. Ouvrir le menu Rédaction depuis la navbar ou le dashboard.
2. Créer un texte SEO ou coller un texte existant.
3. Le ranger dans un dossier.
4. Partager l'édition avec des collaborateurs ciblés.
5. Revenir plus tard, voir l'historique des actions et poursuivre le travail.
6. Choisir un modèle de page existant du CMS.
7. Ouvrir une conversation IA persistante avec un prompt système configurable.
8. Demander à l'IA de transformer le texte en JSON compatible avec le modèle choisi.
9. Vérifier le résultat.
10. Soit publier automatiquement, soit copier le JSON.

## Périmètre fonctionnel recommandé

### 1. Entrées de navigation
- Ajouter l'entrée **Rédaction** dans la navbar principale.
- Ajouter une carte d'accès rapide dans le dashboard.
- Prévoir un état vide clair si aucun texte n'existe.

### 2. Espace liste principal
Le menu Rédaction doit proposer un écran principal de type bibliothèque documentaire avec:
- recherche textuelle,
- filtrage par dossier,
- filtrage par auteur,
- filtrage par date,
- filtrage par droits,
- tri par nom, création, modification, auteur,
- vue liste au minimum,
- multi-sélection.

### 3. Objet métier principal
L'entité principale à introduire doit être un **document rédactionnel SEO**.

Propriétés minimales recommandées:
- identifiant technique,
- nom du document,
- contenu texte brut ou riche léger,
- auteur créateur,
- date de création,
- date de dernière modification,
- statut éditorial,
- dossier parent,
- visibilité,
- liste des utilisateurs autorisés à éditer,
- métadonnées de conversation IA associées,
- dernier JSON généré,
- cible de modèle éventuellement liée.

### 4. Statuts éditoriaux recommandés
L'objectif initial ne mentionne pas de statuts, mais ils seront utiles pour le pilotage. Minimum recommandé:
- `draft`: rédaction en cours,
- `ready_for_ai`: texte prêt à transformer,
- `json_generated`: JSON généré,
- `published`: payload effectivement publié dans le CMS,
- `archived`: document retiré de la production active.

### 5. Dossiers
Le besoin mentionne des dossiers. Il faut préciser le niveau de sophistication.

Recommandation pragmatique:
- **Phase 1**: dossiers simples nommés, non hiérarchiques, cohérents avec l'existant du repo.
- **Phase 2**: sous-dossiers / arborescence si le volume le justifie.

Pourquoi ce choix:
- le produit a déjà un pattern de dossiers simples sur `seo_metadata` et `page_templates`,
- une vraie arborescence ajoute vite de la complexité sur UI, permissions et déplacements massifs,
- il vaut mieux aligner le premier jet sur les conventions déjà en place.

### 6. Actions unitaires et actions de masse
Le besoin de sélection unique ou multiple doit être traité explicitement.

Actions unitaires minimales:
- ouvrir,
- renommer,
- déplacer dans un dossier,
- dupliquer,
- archiver,
- supprimer,
- gérer les droits,
- consulter les logs,
- lancer la conversation IA,
- publier,
- copier le JSON.

Actions multi-sélection minimales:
- déplacer plusieurs documents,
- archiver plusieurs documents,
- supprimer plusieurs documents,
- attribuer des droits d'édition en masse,
- changer un statut en masse.

Actions multi-sélection à ne pas faire en phase 1:
- lancer une seule conversation IA sur plusieurs documents en même temps,
- publier automatiquement plusieurs documents en lot sans validation individuelle.

## Modèle de permissions recommandé
Le besoin exprimé est plus fin que les rôles actuels du projet. Il faut donc distinguer:
- les **rôles globaux applicatifs**,
- les **droits locaux par document**.

### Règles métier demandées
- Tout le monde a le droit de lecture par défaut.
- Le droit d'édition appartient d'abord au créateur.
- Le créateur peut accorder le droit d'édition à un ou plusieurs utilisateurs.

### Recommandation détaillée
Définir trois niveaux au niveau document:
- `reader`: lecture seule,
- `editor`: modification du document,
- `owner`: créateur et responsable des partages.

### Règles de sécurité proposées
- Le créateur devient automatiquement `owner`.
- Tous les utilisateurs authentifiés peuvent lire les documents si la règle produit "lecture par défaut" est conservée.
- Seuls `owner`, `admin` et éventuellement `seo_manager` peuvent modifier les permissions.
- Seuls `owner`, `admin` et éventuellement `seo_manager` peuvent supprimer ou archiver.
- Un `editor` peut modifier le contenu mais ne peut pas partager le document sauf décision contraire.

### Point d'attention important
La phrase "tout le monde a le droit de lecture" doit être clarifiée.

Deux interprétations possibles:
1. Tous les utilisateurs authentifiés de l'application peuvent lire tous les documents.
2. Tous les membres explicitement liés à un périmètre d'équipe peuvent lire.

Pour une première version, l'option 1 est la plus simple à implémenter dans la continuité de l'existant. En revanche, elle peut être trop permissive selon la sensibilité des contenus.

## Gestion des logs d'activité
Ce besoin doit être traité comme une brique native et non comme un bonus.

### Événements à journaliser au minimum
- création du document,
- modification du contenu,
- renommage,
- déplacement de dossier,
- partage de droit,
- retrait de droit,
- changement de statut,
- lancement d'une conversation IA,
- modification du prompt système,
- génération de JSON,
- copie du JSON,
- publication automatique,
- suppression,
- restauration si corbeille.

### Structure recommandée d'un log
- identifiant,
- document concerné,
- type d'événement,
- utilisateur à l'origine,
- date/heure,
- résumé lisible,
- détails structurés JSON si nécessaire.

### Recommandation produit
- afficher un historique lisible dans le document,
- conserver une version technique détaillée en base,
- rendre les logs non modifiables par les utilisateurs standards.

## IA multi-fournisseurs et multi-modèles
Le besoin est correct mais nécessite une formulation plus précise pour éviter une implémentation fragile.

### Objectif IA reformulé
Permettre à l'utilisateur de sélectionner:
- un document rédactionnel SEO,
- un fournisseur IA,
- un modèle IA,
- un modèle de page du CMS,

afin d'obtenir un JSON compatible avec le format attendu par le système d'import ou de publication interne.

### Contraintes structurantes à intégrer
- le système doit être **provider-agnostic**,
- il doit accepter une **clé API configurable**,
- le prompt système doit être **persistant par conversation**,
- ce prompt système doit être **modifiable par l'utilisateur autorisé**,
- le résultat attendu doit être **strictement du JSON exploitable**, pas seulement une réponse textuelle.

### Recommandation d'architecture IA
Créer une couche d'abstraction unique, par exemple:
- `ai_providers`
- `ai_models`
- `ai_conversations`
- `ai_messages`
- `ai_prompt_profiles`
- `ai_generation_runs`

Le menu Rédaction ne doit jamais dépendre directement d'un fournisseur unique.

### Prompt système persistant
Le besoin dit que le prompt système doit être persistant à chaque conversation mais modifiable.

Recommandation:
- définir un **prompt système par défaut au niveau workspace/app**,
- autoriser une **copie locale par conversation**,
- conserver l'historique du prompt réellement utilisé pour chaque génération.

Pourquoi:
- si le prompt global change, il faut quand même pouvoir auditer les anciens résultats,
- le JSON généré doit être traçable à la version de prompt utilisée.

## Alignement avec l'existant du repo
Le repo contient déjà un cadrage fort sur l'IA pour l'import SEO:
- contrat JSON accepté,
- `template_id`, `sections_data`, `content_overrides`,
- règles de fidélité visuelle,
- séparation entre contenu éditable et structure/design.

Le menu Rédaction doit donc réutiliser ce contrat, pas en inventer un nouveau.

### Conséquence forte
La conversation IA ne doit pas produire un "JSON libre".

Elle doit produire un JSON conforme au contrat déjà documenté dans le repo, idéalement en privilégiant:
- `content_overrides` pour les cas simples,
- `sections_data` complet uniquement si nécessaire.

## Intégration avec les modèles du CMS
Le besoin parle de "sélectionner le texte SEO à intégrer et le modèle sur lequel l'intégrer". Cela suppose un lien fort avec `page_templates`.

### Flux recommandé
1. L'utilisateur choisit un document de Rédaction.
2. Il choisit un modèle existant du CMS.
3. Le système charge le contrat exploitable du modèle.
4. L'IA reçoit:
   - le texte SEO source,
   - le prompt système,
   - les contraintes du modèle,
   - le format JSON attendu.
5. L'IA renvoie un JSON validable.
6. L'utilisateur peut:
   - prévisualiser,
   - copier,
   - publier.

### Point critique souvent oublié
Le modèle choisi doit être versionné ou figé au moment de la génération.

Sinon, si le modèle est modifié entre la génération et la publication:
- le JSON peut devenir incohérent,
- certains champs ou sections peuvent ne plus correspondre.

Recommandation:
- stocker l'identifiant du modèle,
- stocker sa date de version ou un hash/export snapshot,
- lier la génération IA à cette version figée.

## Publication automatique
Le besoin prévoit deux sorties:
- publication automatique du JSON,
- ou copie manuelle.

### Recommandation produit
Prévoir trois niveaux de sortie:
1. **Copier le JSON**.
2. **Envoyer vers l'importeur / créer une page brouillon**.
3. **Publier directement** si l'utilisateur y est autorisé.

Pourquoi ajouter le niveau intermédiaire:
- cela limite les erreurs de publication directe,
- cela colle mieux au workflow qualité d'un CMS,
- cela facilite la séparation entre rédacteur et responsable SEO.

### Règle d'autorisation recommandée
- un `content_creator` ne devrait pas forcément publier directement,
- un `seo_manager` ou `admin` peut publier,
- un paramètre produit peut autoriser la publication directe par le propriétaire si nécessaire.

## Parcours UX recommandé

### A. Bibliothèque Rédaction
- liste des documents,
- actions de masse,
- filtres,
- création d'un document.

### B. Éditeur de document
- nom,
- dossier,
- contenu,
- méta-informations,
- droits,
- logs,
- statut.

### C. Panneau IA
- choix du fournisseur,
- choix du modèle IA,
- choix du modèle de page CMS,
- affichage du prompt système,
- historique conversationnel,
- bouton de génération JSON,
- validation du JSON,
- sortie copier / brouillon / publier.

### D. Historique et audit
- dernier résultat généré,
- dernier utilisateur ayant généré,
- date de génération,
- version de prompt,
- version du modèle cible.

## Proposition de modèle de données

### Tables principales recommandées
- `seo_documents`
- `seo_document_permissions`
- `seo_document_activity_logs`
- `seo_document_folders` ou dossier simple textuel en phase 1
- `seo_document_ai_conversations`
- `seo_document_ai_messages`
- `seo_document_ai_generations`

### Table `seo_documents`
Champs recommandés:
- `id`
- `name`
- `content`
- `author_user_id`
- `owner_user_id`
- `status`
- `folder`
- `created_at`
- `updated_at`
- `last_generated_json`
- `last_generated_at`
- `last_generated_by`
- `linked_template_id`
- `linked_template_snapshot`
- `published_page_id` éventuel

### Table `seo_document_permissions`
Champs recommandés:
- `id`
- `document_id`
- `user_id`
- `permission_level`
- `granted_by`
- `created_at`

### Table `seo_document_activity_logs`
Champs recommandés:
- `id`
- `document_id`
- `actor_user_id`
- `event_type`
- `event_summary`
- `event_payload`
- `created_at`

### Tables IA
Minimum recommandé:
- conversation,
- messages,
- runs de génération,
- configuration fournisseur/modèle utilisée,
- prompt système exact utilisé,
- résultat brut,
- JSON normalisé validé,
- statut de validation.

## Cas d'usage importants à ajouter
Voici les cas d'usage majeurs qui ne sont pas explicitement couverts dans l'objectif initial mais qui doivent être anticipés.

### Cas 1. Deux éditeurs modifient le même document
À prévoir:
- détection de conflit,
- message d'avertissement,
- stratégie de dernière sauvegarde ou verrou léger.

### Cas 2. Le créateur du document quitte l'équipe
À prévoir:
- transfert de propriété par admin,
- conservation des droits historiques,
- continuité d'accès.

### Cas 3. Un document est supprimé par erreur
À prévoir:
- corbeille logique ou archive avant suppression définitive,
- log conservé.

### Cas 4. Le JSON IA est invalide
À prévoir:
- validation automatique avant publication,
- affichage des erreurs de structure,
- option de régénération.

### Cas 5. Le fournisseur IA échoue ou time out
À prévoir:
- statut d'échec lisible,
- possibilité de relancer,
- conservation du contexte.

### Cas 6. La clé API est absente, invalide ou expirée
À prévoir:
- message clair,
- absence de blocage pour la partie rédactionnelle hors IA.

### Cas 7. Le modèle CMS cible est modifié après sélection
À prévoir:
- invalidation ou avertissement de compatibilité,
- régénération nécessaire si le snapshot ne correspond plus.

### Cas 8. L'utilisateur veut repartir d'un ancien JSON généré
À prévoir:
- historique des générations,
- restauration d'une version antérieure.

### Cas 9. L'utilisateur veut dupliquer un document pour une nouvelle localité ou un nouveau client
À prévoir:
- duplication complète avec ou sans permissions,
- duplication du lien au modèle cible optionnelle.

### Cas 10. Le document est lisible par tous mais contient des contenus confidentiels
À prévoir:
- vérifier si la lecture globale doit vraiment être universelle,
- sinon introduire une visibilité `public_interne` vs `restreint`.

### Cas 11. L'utilisateur sélectionne plusieurs documents
À prévoir:
- bannière d'actions de masse cohérente,
- impossibilité claire pour les actions non compatibles avec le multi-select.

### Cas 12. L'utilisateur publie un JSON sur la mauvaise page
À prévoir:
- écran de confirmation avec récapitulatif:
  - document source,
  - modèle cible,
  - page créée ou modifiée,
  - statut final.

## Contraintes techniques et sécurité

### Données sensibles
- Les clés API ne doivent jamais être stockées ou exposées côté client en clair si plusieurs utilisateurs sont concernés.
- Les appels IA devraient idéalement transiter par une couche serveur ou Edge Function.

### Validation impérative
- valider le JSON côté client pour l'UX,
- revalider côté backend avant toute publication automatique.

### RLS Supabase
Le repo utilise déjà des policies RLS. Le menu Rédaction devra conserver cette logique et l'étendre proprement avec:
- lecture,
- édition par propriétaire/partagés,
- gestion des permissions,
- lecture des logs,
- écriture des logs.

### Auditabilité
Toute publication automatique doit laisser une trace explicite liant:
- document source,
- génération IA,
- utilisateur,
- modèle cible,
- page finale créée ou mise à jour.

## Découpage recommandé par phases

### Phase 1 — MVP solide
- nouveau menu Rédaction dans navbar + dashboard,
- création/édition/suppression/archivage de documents,
- dossiers simples,
- lecture globale + édition par owner/partagés,
- logs essentiels,
- sélection d'un document + d'un modèle CMS,
- génération IA d'un JSON,
- copie du JSON,
- envoi vers création de page brouillon.

### Phase 2 — Collaboration et robustesse
- actions de masse complètes,
- historique des générations,
- gestion fine des prompts,
- publication automatique contrôlée,
- corbeille,
- transfert de propriété,
- prévention de conflits d'édition.

### Phase 3 — Industrialisation
- dossiers hiérarchiques,
- comparateur de versions,
- suggestions IA contextuelles,
- statistiques d'usage de la rédaction,
- modèles de prompts par type de page.

## Critères d'acceptation fonctionnels
1. Le menu Rédaction est accessible depuis la navbar et le dashboard.
2. Un utilisateur peut créer un document rédactionnel avec nom, contenu, auteur et dates.
3. Les documents peuvent être rangés dans des dossiers.
4. Les actions unitaires et les actions de masse essentielles sont disponibles.
5. La lecture est ouverte selon la règle produit retenue, et l'édition est restreinte au créateur et aux utilisateurs explicitement partagés.
6. Un journal d'activité existe pour chaque document.
7. Un utilisateur peut lier un document à un modèle du CMS.
8. Une conversation IA peut produire un JSON conforme au contrat attendu par le repo.
9. Le prompt système est persistant, visible et modifiable selon les droits.
10. Le JSON produit peut être copié ou envoyé dans un flux de publication contrôlé.

## Risques principaux
- confusion produit entre document rédactionnel et page SEO finale,
- permissions trop simplifiées ou trop permissives,
- publication automatique sans validation suffisante,
- dépendance forte à un fournisseur IA si l'abstraction est mal pensée,
- dérive du format JSON par rapport au contrat déjà présent dans le repo,
- dette UX si les actions de masse sont ajoutées tard sans architecture prévue.

## Décisions produit recommandées
1. Distinguer clairement document rédactionnel et page finale.
2. Commencer avec des dossiers simples non hiérarchiques.
3. Introduire des permissions locales par document en plus des rôles globaux.
4. Réutiliser le contrat JSON IA déjà documenté dans le repo.
5. Ajouter un niveau intermédiaire "créer une page brouillon" entre copie et publication directe.
6. Journaliser nativement toutes les actions critiques.

## Questions cruciales à trancher
Répondre directement sous chaque question dans ce fichier pour permettre une itération rapide.

### Q1. Lecture par défaut
Souhaites-tu vraiment que **tous les utilisateurs authentifiés** puissent lire tous les documents de Rédaction, même s'ils appartiennent à d'autres rédacteurs ?

**Réponse: Oui, la lecture devrait être permise à tout les utilisateurs authentifiés**

### Q2. Publication directe
Un rédacteur `content_creator` peut-il publier automatiquement une page, ou cette action doit-elle être réservée à `seo_manager` et `admin` ?

**Réponse: Tout le monde doit pouvoir publier automatiquement une page à partir d'un texte SEO, même si ce texte ne lui appartient pas. Seuls les opérations sensibles comme la modification, la supression ou gestion de droits doivent êtres encadrées**

### Q3. Dossiers
Veux-tu démarrer avec des **dossiers simples** comme dans le reste du produit, ou exiger dès la V1 une **arborescence avec sous-dossiers** ?

**Réponse: Arborescence avec sous-dossiers**

### Q4. Type d'éditeur
Le contenu du document doit-il être un **texte brut long**, un **éditeur riche léger**, ou un système plus structuré avec champs distincts comme titre SEO, H1, H2, corps, CTA ?

**Réponse: Le contenu du document doit supporter ces trois types**

### Q5. Conversation IA
Souhaites-tu une conversation IA:
- propre à chaque document,
- ou plusieurs conversations par document,
- ou une conversation globale réutilisable ?

**Réponse: une conversation propre à chaque document, mais toutes les conversations suivoront la même règle du prompt système défini**

### Q6. Clé API
La clé API IA doit-elle être:
- configurée globalement pour toute l'application,
- configurée par utilisateur,
- ou les deux ?

**Réponse: Les deux**

### Q7. Cible de publication
La sortie "publier automatiquement" doit-elle:
- créer une nouvelle page,
- mettre à jour une page existante,
- ou proposer les deux ?

**Réponse: Par défaut créer une nouvelle page, mais l'option de mise à jour doit être disponible**

### Q8. Historique
Veux-tu conserver seulement les logs d'actions, ou aussi un **historique des versions du contenu** et des **JSON générés** ?

**Réponse: Seulement les logs d'actions**

## Conclusion
L'objectif initial est pertinent, mais il décrit en réalité un **mini-système éditorial collaboratif avec IA**, pas seulement un nouveau menu. Pour réussir l'implémentation, il faut structurer le besoin autour de quatre axes distincts:
- document éditorial,
- organisation et permissions,
- génération IA normalisée,
- publication contrôlée vers le CMS existant.

La recommandation la plus solide pour la suite est de construire une **V1 pragmatique** alignée sur l'architecture actuelle du repo, en réutilisant:
- les patterns de navigation existants,
- la logique Supabase + RLS,
- les dossiers simples déjà présents,
- et surtout le contrat JSON IA/import déjà documenté.
