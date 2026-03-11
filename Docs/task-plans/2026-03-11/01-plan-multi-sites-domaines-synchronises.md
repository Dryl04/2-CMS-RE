# Plan détaillé — Architecture multi-sites avec domaines synchronisés

## Taille estimée

- **Taille**: XXL
- **Complexité**: Très élevée
- **Impact**: Structurant pour tout le produit (modèle métier, front, back, SEO, publication)

## 1. Problématique rencontrée

Le CMS est aujourd’hui utilisé depuis un domaine d’administration unique, par exemple `https://seomanager.ebizdev.fr/`, alors que les pages gérées doivent être publiées sur plusieurs domaines métier appartenant au même propriétaire, par exemple :

- `https://scanetwork.com/`
- `https://www.scanetwork.com/`
- `https://scanetwork.fr/`
- `https://www.scanetwork.fr/`
- `https://clikeasy.com/`
- etc.

### Constats actuels

1. **La création manuelle de page dérive le domaine depuis l’URL du backoffice**.
   - Le champ domaine reflète le domaine courant du CMS, pas le domaine cible du site publié.

2. **Le modèle métier ne distingue pas encore les sites**.
   - Une page est essentiellement identifiée par `page_key` au niveau global.
   - Il n’existe pas encore de table `Site` ni de clé `siteId` sur les pages.

3. **La résolution publique d’une page ne tient pas compte du host**.
   - Le runtime cherche une page à partir du chemin seul, sans différencier `scanetwork.com/contact` de `clikeasy.com/contact`.

4. **Les redirections, le sitemap et les outils SEO restent conceptuellement mono-site**.
   - Or, en contexte multi-domaines, la même route `/contact` peut exister sur plusieurs sites distincts.

5. **Le besoin réel n’est pas seulement multi-domaine, mais multi-domaines synchronisés**.
   - Exemple attendu : `scanetwork.com`, `www.scanetwork.com`, `scanetwork.fr`, `www.scanetwork.fr` doivent être gérés comme un ensemble synchronisé.
   - Une création, modification, suppression ou publication de page sur l’un doit s’appliquer aux autres.

## 2. Solution cible à implémenter

L’architecture à mettre en place doit introduire une notion métier explicite de **site logique**, distincte des **domaines techniques**.

### Principe directeur

Le système ne doit **pas** dupliquer artificiellement les pages par domaine quand plusieurs domaines doivent rester synchronisés.

La bonne modélisation est :

- **1 site logique** = 1 espace éditorial cohérent
- **N domaines rattachés** à ce site logique = domaines synchronisés automatiquement

### Conséquence métier importante

Dans l’exemple suivant :

- `scanetwork.com`
- `www.scanetwork.com`
- `scanetwork.fr`
- `www.scanetwork.fr`

ces 4 domaines ne doivent pas être traités comme 4 sites différents si le contenu doit être identique. Ils doivent être rattachés à **un seul site logique**.

Ainsi :

- une page est créée **une seule fois** dans le backoffice,
- elle est publiable sur tous les domaines rattachés,
- la résolution publique fonctionne selon le host reçu,
- le sitemap peut être émis par domaine,
- les URLs canoniques et les redirections restent cohérentes.

### Résultat attendu

La solution cible repose sur les briques suivantes :

1. **Table `Site`** : représente un site logique / groupe éditorial.
2. **Table `SiteDomain`** : représente chaque domaine ou sous-domaine rattaché à un site.
3. **`siteId` sur les pages** : chaque page appartient à un site logique.
4. **`siteId` sur les redirections** : les redirections sont scellées au périmètre du site.
5. **Choix du site dans le backoffice** : chaque action éditoriale se fait dans un contexte de site.
6. **Domaine canonique par défaut porté par le site**.
7. **Résolution publique par `host + path`**.
8. **Sitemap par domaine**.
9. **Groupes synchronisés gérés nativement via plusieurs domaines pour un même site**.

## 3. Décision d’architecture recommandée

## 3.1 Modèle recommandé

### Entité `Site`

Représente l’espace éditorial commun.

Exemples de champs :

- `id`
- `name` — nom métier interne, ex. `ScaNetwork`
- `code` — identifiant stable, ex. `scanetwork`
- `defaultLocale`
- `canonicalDomainId` — domaine principal pour générer les URLs canoniques par défaut
- `isActive`
- `createdAt`
- `updatedAt`

### Entité `SiteDomain`

Représente chaque host rattaché au site.

Exemples de champs :

- `id`
- `siteId`
- `host` — ex. `scanetwork.com`, `www.scanetwork.com`
- `scheme` — `https`
- `isPrimary`
- `isCanonical`
- `locale` — ex. `fr`, `en`, optionnel selon stratégie
- `isActive`
- `redirectToPrimary` — booléen si certains domaines doivent rediriger vers le principal
- `createdAt`
- `updatedAt`

### Entité `SeoMetadata`

Évolution recommandée :

- ajout de `siteId`
- remplacement de l’unicité globale `pageKey` par une unicité composite **(`siteId`, `pageKey`)**

### Entité `SeoRedirect`

Évolution recommandée :

- ajout de `siteId`
- index composite sur **(`siteId`, `sourcePath`, `isActive`)**

## 3.2 Pourquoi il ne faut pas dupliquer les pages par domaine synchronisé

Le besoin exprimé dit : « une page créée sur un domaine doit être créée sur les autres ». Techniquement, il y a deux manières de l’interpréter :

### Mauvaise interprétation

Créer 4 lignes de page si 4 domaines sont synchronisés.

#### Problèmes induits

- duplication massive des données
- risques d’écart entre copies
- complexité de propagation create/update/delete
- collisions fonctionnelles sur les redirections
- maintenance SEO difficile
- logique de publication fragile

### Bonne interprétation

Créer **1 page logique** attachée à **1 site logique**, puis rendre cette page accessible depuis tous les domaines du site.

#### Avantages

- synchronisation implicite, donc robuste
- zéro duplication métier
- création/modification/suppression naturellement propagées
- SEO mieux maîtrisé
- bien plus simple à maintenir à moyen terme

## 3.3 Quand prévoir un niveau supplémentaire de regroupement

Si, à terme, plusieurs sites doivent partager certains contenus sans être strictement identiques, il sera possible d’ajouter plus tard une notion de :

- `SiteCluster`
- ou `ContentGroup`

Mais **ce n’est pas nécessaire dans la première version**.

Pour le besoin actuel, la règle simple doit être :

- **1 groupe synchronisé = 1 `Site` + plusieurs `SiteDomain`**

## 4. Objectifs fonctionnels détaillés

L’implémentation doit permettre de :

1. créer un site logique depuis le backoffice
2. rattacher plusieurs domaines et sous-domaines à ce site
3. désigner un domaine canonique principal
4. créer des pages dans le contexte d’un site
5. autoriser le même `page_key` sur deux sites différents
6. résoudre publiquement une page via **host + path**
7. générer des canonicals cohérentes à partir du domaine canonique du site
8. générer un sitemap distinct pour chaque domaine ou, au minimum, pour chaque site avec stratégie multi-domaines explicite
9. appliquer les redirections au bon périmètre de site
10. conserver une UX simple côté backoffice

## 5. Plan d’implémentation détaillé

## Phase 0 — Cadrage métier et arbitrages SEO

Avant toute modification technique, figer les décisions suivantes :

1. **Un groupe synchronisé correspond-il à un seul site logique ?**
   - Recommandation : oui.

2. **Parmi les domaines d’un site, lequel est canonique ?**
   - Exemple : `https://scanetwork.com`.

3. **Les autres domaines doivent-ils servir le contenu directement ou rediriger vers le canonique ?**
   - Deux stratégies possibles :
     - **multi-hébergement strictement synchronisé** : chaque domaine sert le contenu
     - **hébergement + redirection** : certains domaines servent uniquement de points d’entrée puis redirigent

4. **Le domaine canonique est-il unique pour tout le site ou variable selon la langue/pays ?**
   - Version simple recommandée : un canonique principal par site.

5. **Les templates, global headers/footers et thèmes sont-ils partagés au niveau site ?**
   - Recommandation initiale : oui, les rattacher au site si leur comportement doit être contextualisé.

## Phase 1 — Refonte du modèle de données

### 1.1 Ajouter les nouvelles tables

Créer au minimum :

- `sites`
- `site_domains`

### 1.2 Schéma fonctionnel recommandé

#### `sites`

- `id`
- `name`
- `code`
- `default_locale`
- `canonical_domain_id`
- `is_active`
- `created_at`
- `updated_at`

#### `site_domains`

- `id`
- `site_id`
- `host`
- `scheme`
- `is_primary`
- `is_canonical`
- `locale`
- `is_active`
- `redirect_to_primary`
- `created_at`
- `updated_at`

### 1.3 Faire évoluer les tables existantes

Ajouter `site_id` à :

- `seo_metadata` — obligatoire à terme
- `seo_redirects` — obligatoire à terme

Ajouter `site_id` aussi à étudier sur :

- `page_templates`
- `global_hf_settings`
- `page_themes`
- `daisyui_themes`
- `fonts_library`

#### Recommandation pragmatique

Pour une V1 fonctionnelle :

- `seo_metadata.site_id` : obligatoire
- `seo_redirects.site_id` : obligatoire
- `page_templates.site_id` : fortement recommandé
- `global_hf_settings.site_id` : fortement recommandé

Les thèmes et fonts peuvent rester globaux temporairement si cela simplifie la livraison.

### 1.4 Contraintes et index

Mettre en place :

- unicité sur `sites.code`
- unicité sur `site_domains.host`
- unicité composite sur `seo_metadata(site_id, page_key)`
- index sur `seo_metadata(site_id, status, updated_at)`
- index composite sur `seo_redirects(site_id, source_path, is_active)`

### 1.5 Migration des données existantes

Créer une migration de transition :

1. créer un site par défaut, par exemple `default-site`
2. créer un domaine par défaut correspondant au domaine historiquement utilisé ou au domaine métier choisi
3. rattacher toutes les pages existantes à ce site par défaut
4. rattacher toutes les redirections existantes à ce site par défaut
5. supprimer l’unicité globale sur `page_key`
6. créer la nouvelle unicité composite

### 1.6 Stratégie Prisma

Respecter une migration versionnée et réversible autant que possible :

1. migration `create_sites_and_site_domains`
2. migration `add_site_id_to_pages_and_redirects`
3. migration `backfill_default_site`
4. migration `replace_page_key_unique_with_site_page_key_unique`

## Phase 2 — Couche backend NestJS

## 2.1 Créer le module `sites`

Créer un module dédié :

- `SitesModule`
- `SitesController`
- `SitesService`

Responsabilités :

- CRUD des sites
- CRUD des domaines rattachés
- désignation du domaine canonique
- activation/désactivation d’un domaine

## 2.2 Introduire le contexte de site dans les pages

Faire évoluer les DTO et services de pages :

- `CreatePageDto`
- `UpdatePageDto`
- `PagesService`
- `PagesController`

Le backend doit :

1. exiger ou déduire le `siteId` à la création
2. filtrer les listes par site
3. créer et mettre à jour les pages au sein du bon site
4. générer/redéfinir la canonique à partir du site si non fournie explicitement

## 2.3 Résolution publique par host + path

Créer une logique de résolution publique qui :

1. lit le host réel de la requête
2. retrouve le `SiteDomain`
3. retrouve le `siteId`
4. cherche la page avec `(siteId, pageKey)`
5. si absente, cherche une redirection avec `(siteId, sourcePath)`

### Variante d’API recommandée

Deux possibilités :

#### Option backend A — déduction du host côté serveur

Le contrôleur lit `req.headers.host`.

#### Option backend B — host explicitement transmis

Le front transmet un header explicite comme `X-Site-Host`.

#### Recommandation

Supporter d’abord la lecture du host réel côté backend, avec possibilité de surcharger pour les previews/tests.

## 2.4 Canonical URL côté backend

Le backend doit devenir la source de vérité pour la canonique par défaut.

Règles proposées :

1. si le payload fournit une `canonicalUrl` explicite, la valider
2. sinon, la construire à partir du domaine canonique du site + `pageKey`
3. si le domaine canonique change, prévoir un job de recalcul ou un recalcul à la volée selon stratégie retenue

## 2.5 Redirections par site

Toutes les redirections doivent être scoped par `siteId`.

Lors d’un changement de slug :

- créer ou mettre à jour la redirection **dans le site courant uniquement**
- ne jamais créer une redirection globale cross-site

## 2.6 Templates et global header/footer

### Pages templates

Décision recommandée : rattacher les templates à `siteId`.

Raison :

- un groupe de domaines synchronisés partage souvent ses templates
- un autre site logique doit pouvoir avoir ses propres templates

### Global header/footer

Décision recommandée : rattacher les `global_hf_settings` à `siteId`.

Raison :

- un header/footer global a rarement vocation à être partagé entre deux marques distinctes

## 2.7 Sitemaps multi-domaines

Le sitemap actuel doit être repensé.

Objectif :

- générer un sitemap cohérent pour chaque domaine rattaché ou pour chaque site selon la stratégie SEO retenue

### Recommandation simple

Créer un endpoint backend du type :

- `/sitemap.xml` → résolu par host

Le backend :

1. lit le host
2. retrouve le site
3. récupère les pages publiées du site
4. génère les URLs avec le host correspondant ou le domaine canonique, selon stratégie décidée

## Phase 3 — Frontend backoffice

## 3.1 Introduire le concept de site courant

Le backoffice doit permettre de choisir un **site courant**.

UX recommandée :

- un sélecteur global de site dans le header ou la navigation principale
- le choix reste mémorisé en session locale
- toutes les vues se recalculent dans ce contexte

## 3.2 Création et édition de page

Le formulaire de page doit évoluer :

1. le domaine ne doit plus être déduit du domaine du CMS
2. le domaine affiché doit venir du site courant
3. le champ peut être :
   - affiché en lecture seule si le site impose un domaine canonique unique
   - ou sélectionnable parmi les domaines rattachés si besoin métier

### Recommandation UX V1

Le formulaire doit afficher :

- le **site courant**
- le **domaine canonique du site**
- le `page_key` calculé
- l’URL finale prévisualisée

## 3.3 Import JSON

L’import doit évoluer pour accepter :

- soit un `site_code` / `site_id` global au payload
- soit un contexte de site imposé dans l’écran d’import

### Recommandation V1

L’import se fait **dans un site courant sélectionné**.

Cela évite de mélanger plusieurs sites dans un même import et simplifie fortement la validation.

## 3.4 Listing des pages

L’écran de gestion des pages doit :

- lister les pages du site courant uniquement par défaut
- permettre éventuellement une vue transverse multi-sites réservée aux admins

## 3.5 Gestion des redirections

L’écran des liens/redirections doit fonctionner dans le périmètre du site courant.

Important :

- les outils de classification de liens ne doivent plus considérer le host du backoffice comme référence métier
- ils doivent utiliser le domaine principal du site courant

## 3.6 Gestion des sites et domaines

Ajouter une nouvelle interface d’administration :

- création d’un site
- ajout/suppression d’un domaine
- définition du domaine primaire/canonique
- activation/désactivation
- éventuellement politique de redirection vers le domaine principal

## Phase 4 — Gestion des domaines synchronisés

## 4.1 Règle métier recommandée

Un ensemble de domaines synchronisés doit être représenté par :

- **1 `Site`**
- **plusieurs `SiteDomain`**

Exemple :

### Site logique

- `ScaNetwork`

### Domaines rattachés

- `scanetwork.com`
- `www.scanetwork.com`
- `scanetwork.fr`
- `www.scanetwork.fr`

## 4.2 Effet sur les opérations métier

### Création de page

Créer une page dans `ScaNetwork` la rend disponible sur tous les domaines rattachés.

### Modification de page

Modifier la page modifie l’unique enregistrement du site, donc le résultat est visible sur tous les domaines rattachés.

### Suppression de page

Supprimer la page la supprime pour tout le groupe synchronisé.

### Publication / dépublication

L’état s’applique à tout le groupe synchronisé.

### Redirections

Les redirections sont partagées au niveau du site logique.

## 4.3 Cas où une vraie duplication serait malgré tout nécessaire

À éviter en V1.

Ne prévoir une duplication physique que si un même groupe doit un jour partager la structure tout en divergent fortement par domaine. Dans ce cas, il faudra un niveau supplémentaire de variante locale. Ce besoin ne doit pas polluer la première implémentation.

## Phase 5 — Publication publique et SEO

## 5.1 Résolution des pages

Le runtime public doit répondre selon :

- **host**
- **path**

et non plus selon `path` seul.

## 5.2 Canonicals

Il faut définir une politique claire :

### Politique A — canonique unique pour le site

Toutes les pages ont pour canonique le domaine principal du site.

#### Avantages

- simple
- SEO clair

#### Inconvénients

- les domaines secondaires sont considérés comme miroirs

### Politique B — canonique par domaine servi

Chaque domaine sert sa propre canonique.

#### Avantages

- chaque domaine existe comme entité SEO propre

#### Inconvénients

- plus complexe
- risque de duplication de contenu si mal piloté

### Recommandation

Pour des domaines synchronisés, partir sur **Politique A** tant qu’aucune stratégie SEO plus fine n’est formalisée.

## 5.3 Sitemaps

Deux choix :

### Choix 1 — sitemap basé sur le domaine canonique

Tous les URLs du sitemap utilisent le domaine canonique du site.

### Choix 2 — sitemap par domaine servi

Chaque domaine expose un sitemap construit avec son propre host.

### Recommandation

Si certains domaines ne sont que des miroirs, privilégier le sitemap canonique.
Si chaque domaine doit rester publiquement servi sans redirection, formaliser une stratégie par domaine.

## Phase 6 — Migration applicative

## 6.1 Stratégie de migration recommandée

Livrer en plusieurs étapes pour limiter le risque :

### Étape 1

Créer `Site` et `SiteDomain`, backfill par défaut, sans casser l’existant.

### Étape 2

Ajouter `siteId` aux pages et redirections, alimenter les données existantes.

### Étape 3

Faire évoluer les endpoints backend pour exiger le contexte site.

### Étape 4

Faire évoluer le front pour choisir un site courant.

### Étape 5

Basculer la résolution publique sur `host + path`.

### Étape 6

Refondre le sitemap.

### Étape 7

Étendre la portée aux templates et global HF.

## 6.2 Compatibilité temporaire

Pendant la transition :

- utiliser un site par défaut pour toutes les données historiques
- autoriser les endpoints à déduire le site par défaut quand le contexte n’est pas encore envoyé
- retirer cette compatibilité une fois le front migré

## Phase 7 — Tests à prévoir

## 7.1 Tests base de données

- création de deux sites
- même `page_key` autorisé sur deux sites différents
- même `page_key` interdit deux fois dans le même site
- redirection scellée par site

## 7.2 Tests backend

- création de page avec `siteId`
- refus de création sans site valide
- récupération publique correcte selon host
- redirection correcte selon host
- génération canonique correcte
- sitemap correct selon stratégie choisie

## 7.3 Tests frontend

- changement de site courant
- création de page dans le bon site
- import JSON dans le bon site
- listing filtré par site
- affichage de l’URL finale correcte

## 7.4 Tests e2e métier

Cas à valider :

1. `scanetwork.com/contact` et `clikeasy.com/contact` coexistent
2. modifier `scanetwork.com/contact` n’affecte pas `clikeasy.com/contact`
3. `scanetwork.com/contact`, `www.scanetwork.com/contact`, `scanetwork.fr/contact`, `www.scanetwork.fr/contact` servent le même contenu si ces hosts appartiennent au même site logique
4. les redirections du site `ScaNetwork` n’interfèrent pas avec celles de `ClikEasy`

## 8. Risques et points de vigilance

1. **Erreur de modélisation** si l’on confond site logique et domaine technique.
2. **Duplication de données** si l’on choisit de recopier les pages par domaine au lieu de les rattacher à un site.
3. **SEO incohérent** si la stratégie canonique n’est pas tranchée dès le départ.
4. **Migration sensible** à cause de la contrainte actuelle d’unicité globale sur `page_key`.
5. **Effets collatéraux** sur les outils de liens, de redirections et de sitemap.
6. **Complexité UX** si le choix du site n’est pas visible et explicite partout.

## 9. Recommandations produit et techniques

## 9.1 Recommandation principale

Mettre en place **un modèle “site logique + domaines rattachés”**, pas un modèle “une copie de page par domaine”.

## 9.2 Recommandation de simplicité pour la V1

Pour limiter la charge de livraison :

- introduire `Site` + `SiteDomain`
- rattacher obligatoirement les pages et redirections au site
- rattacher aussi templates et global HF si possible dans le même chantier
- laisser thèmes/fonts globaux temporairement si besoin
- imposer un **site courant** dans le backoffice
- définir un **domaine canonique unique par site** dans un premier temps

## 9.3 Recommandation SEO

Pour les domaines synchronisés, partir sur une stratégie explicite de canonique principal, par exemple :

- domaine canonique : `scanetwork.com`
- domaines secondaires : `www.scanetwork.com`, `scanetwork.fr`, `www.scanetwork.fr`

Ensuite, selon arbitrage métier :

- soit ils servent le même contenu avec canonique principal,
- soit ils redirigent vers le domaine principal.

## 10. Critères d’acceptation finaux

La tâche sera considérée comme réussie si :

1. le backoffice permet de gérer plusieurs sites logiques
2. chaque site peut avoir plusieurs domaines rattachés
3. un groupe de domaines synchronisés est géré sans duplication physique des pages
4. la création d’une page se fait dans un site courant clairement identifié
5. deux sites différents peuvent avoir le même `page_key`
6. la résolution publique d’une page se fait par `host + path`
7. les redirections sont correctement isolées par site
8. la canonique est cohérente avec le domaine canonique du site
9. le sitemap est correct selon la stratégie multi-domaines retenue
10. les actions create/update/delete/publish sont automatiquement “synchronisées” pour tous les domaines d’un même site logique

## 11. Proposition de séquençage opérationnel

### Lot 1 — Fondation base de données

- tables `Site` et `SiteDomain`
- `siteId` sur pages et redirections
- migrations + backfill

### Lot 2 — Backend métier

- module `sites`
- pages + redirections scellées par site
- résolution publique `host + path`

### Lot 3 — Backoffice

- sélecteur de site courant
- formulaires pages/import adaptés
- écran d’administration des sites/domaines

### Lot 4 — SEO runtime

- canonicals
- sitemap
- stratégie domaines secondaires / primaires

### Lot 5 — Extension de périmètre

- templates par site
- global HF par site
- éventuellement thèmes par site si besoin confirmé

## 12. Conclusion

La bonne implémentation du multi-domaine synchronisé ne consiste pas à copier les pages entre domaines, mais à introduire une **notion de site logique** supportant **plusieurs domaines rattachés**.

Cette approche répond à la fois aux besoins suivants :

- simplicité de gestion dans un backoffice unique
- cohérence SEO
- support naturel des mêmes slugs sur plusieurs marques/sites
- synchronisation automatique des domaines d’un même groupe
- meilleure maintenabilité à long terme

Le chantier est structurant, mais c’est la bonne base pour faire évoluer proprement le CMS vers un vrai mode multi-sites professionnel.
