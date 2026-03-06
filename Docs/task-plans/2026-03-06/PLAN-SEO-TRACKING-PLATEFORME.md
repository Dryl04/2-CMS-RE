# Plan complet SEO + tracking pour la plateforme et les pages generees

## 1. Objectif

Ce plan a pour but de faire evoluer la plateforme afin que chaque site et chaque page generee puissent:

- embarquer proprement les scripts de suivi et de conversion utiles;
- exposer un socle SEO technique complet et coherent;
- rester simples a configurer pour les utilisateurs du CMS;
- etre verifiables avant publication et auditables apres mise en ligne.

Le plan tient compte de l'etat actuel du projet:

- application React + Vite + TypeScript;
- CMS connecte a Supabase;
- pages SEO stockees dans `seo_metadata`;
- affichage public via `SEOPageViewer`;
- sitemap deja present via `supabase/functions/sitemap/index.ts`;
- systeme de header/footer global deja present;
- pas de couche dediee a l'injection de scripts de tracking;
- pas de rendu HTML SEO complet au niveau du `head` pour les pages publiques;
- pas de `robots.txt` dedie ni de gestion complete des icones et images sociales.

## 2. Constat cle a traiter en premier

Le point le plus important est architectural:

- aujourd'hui, les donnees SEO sont bien stockees en base;
- en revanche, l'application publique reste une SPA Vite avec un `index.html` statique;
- cela signifie que les moteurs, link preview crawlers et outils sociaux ne recuperent pas de maniere fiable les metas, canonicals, Open Graph, Twitter Cards, favicons et donnees structurees de chaque page.

Conclusion:

- une simple saisie de champs SEO dans le back office ne suffit pas;
- il faut une vraie couche de rendu public capable de produire un HTML exploitable par les crawlers.

## 3. Objectifs fonctionnels cibles

### 3.1 Tracking et scripts

Pour chaque site cree:

- definir des scripts globaux de site;
- choisir ou injecter ces scripts dans les zones adaptees: `head`, debut de `body`, fin de `body`;
- activer des integrations standards sans imposer du code libre a chaque fois;
- gerer un override ou un ajout par page si necessaire;
- poser les bases du consentement cookies et du declenchement conditionnel;
- permettre des tests simples avant publication.

Pour chaque page creee:

- pouvoir ajouter des scripts ou pixels specifiques a la page;
- definir des events ou identifiants publicitaires specifiques si necessaire;
- voir clairement quels scripts sont herites du site et quels scripts sont propres a la page.

### 3.2 SEO technique

Pour chaque site cree:

- generer un `sitemap.xml` valide;
- generer un `robots.txt` configurable;
- definir les favicons, apple-touch-icons, manifest et image de partage par defaut;
- definir les metas globales de marque et les validations de verification Search Console/Bing;
- garantir une coherence SEO globale.

Pour chaque page creee:

- titre, meta description, canonical, OG, Twitter, image de partage, langue, directives robots;
- donnees structurees adaptees au type de page;
- apercu de partage et controles de qualite avant publication;
- verification automatique des champs critiques et de la coherence technique.

## 4. Principes produit a respecter

- Ne pas forcer les utilisateurs a manipuler du code pour les cas standards.
- Garder une separation claire entre configuration globale du site et surcharge page par page.
- Rendre visible l'heritage: ce qui vient du site, ce qui vient de la page, ce qui est desactive.
- Bloquer les publications incompletes quand un minimum SEO critique n'est pas rempli.
- Offrir des presets et assistants plutot qu'un formulaire brut.
- Eviter que l'injection de scripts devienne un trou de securite ou une source d'erreurs de rendu.

## 5. Strategie recommandee

### 5.1 Recommandation d'architecture

Je recommande une approche en deux temps:

1. Corriger rapidement le minimum technique visible dans le front actuel.
2. Mettre en place une vraie couche de rendu public SEO-friendly pour les pages publiees.

La trajectoire la plus efficace pour ce projet est:

- conserver le CMS React actuel pour l'administration;
- conserver Supabase comme source de verite;
- ajouter un pipeline de rendu public pour les pages publiees, capable de servir un HTML complet avec `title`, `meta`, `link`, `script type="application/ld+json"`, favicons et scripts places au bon endroit.

### 5.2 Options possibles

#### Option A - Injection client uniquement

Avantages:

- rapide a faire.

Limites:

- insuffisant pour une ambition SEO forte;
- peu fiable pour les robots sociaux et certains crawlers;
- ne regle pas proprement le partage mobile ni la lecture immediate des metas.

Verdict:

- acceptable seulement comme patch court terme.

#### Option B - Rendu public via Edge Function ou pre-render HTML

Avantages:

- compatible avec l'architecture actuelle;
- bon compromis cout / impact;
- permet de sortir un vrai HTML par page publiee sans refaire tout le CMS.

Verdict:

- option recommandee.

#### Option C - Migration de la couche publique vers un framework SSR/SSG

Avantages:

- tres bon pour le SEO a long terme.

Limites:

- plus long et plus structurant.

Verdict:

- pertinent plus tard, mais pas necessaire pour lancer rapidement un socle fiable.

## 6. Plan de mise en oeuvre par phases

## Phase 0 - Cadrage technique et definition du modele cible

### But

Valider l'architecture retenue pour le rendu public, le modele de donnees SEO globales et la gestion des scripts.

### Actions

- Lister les routes publiques reelles et leur mode de resolution actuel.
- Valider comment sera servi le HTML public: Edge Function, middleware Vercel ou generation HTML a la publication.
- Definir le modele d'heritage `site -> page` pour SEO et tracking.
- Definir les niveaux de permissions pour l'edition des scripts.
- Fixer une politique de securite sur le code injecte.

### Livrables

- schema de flux de rendu public;
- decision d'architecture ecrite;
- matrice des champs globaux vs champs de page;
- liste des providers de tracking supportes en natif.

### Criteres de validation

- le mode de rendu public est decide;
- les champs obligatoires et optionnels sont figes;
- l'equipe sait ou vivront les donnees et comment elles seront servies.

## Phase 1 - Socle de configuration globale du site

### But

Introduire une couche de configuration globale applicable a tous les sites et toutes les pages.

### Evolutions de donnees recommandees

Creer une table de type `site_settings` ou equivalent avec au minimum:

- `site_name`
- `base_url`
- `default_locale`
- `default_title_suffix`
- `default_meta_description`
- `default_og_image`
- `default_twitter_card`
- `default_robots`
- `favicon_url`
- `apple_touch_icon_url`
- `site_webmanifest_url`
- `organization_name`
- `organization_logo_url`
- `organization_same_as` ou tableau de liens sociaux
- `google_site_verification`
- `bing_site_verification`
- `default_schema_type`
- `robots_txt_overrides`

### UX a mettre en place

Ajouter un ecran `Parametres SEO du site` avec sections simples:

- identite du site;
- indexation et domaine canonique;
- image sociale par defaut;
- favicons et icones mobiles;
- verification moteurs;
- donnees structurees d'organisation;
- robots et sitemap.

### Points d'attention UX

- pre-remplir les exemples;
- afficher un apercu de l'URL canonique;
- afficher un etat de completion du site;
- distinguer `par defaut`, `herite`, `surcharge`.

### Criteres de validation

- un site peut etre configure sans toucher au code;
- tous les defaults SEO critiques sont stockes dans un seul endroit;
- les donnees de marque sont reutilisables automatiquement sur les pages.

## Phase 2 - Systeme de tracking global et page par page

### But

Permettre une integration propre, securisee et lisible des scripts de suivi.

### Modele fonctionnel recommande

Creer un systeme dedie, distinct des widgets visuels.

#### Niveau site

Supporter au minimum:

- Google Tag Manager;
- Google Analytics 4;
- Google Ads;
- Meta Pixel;
- LinkedIn Insight Tag;
- TikTok Pixel;
- Pinterest Tag;
- scripts personnalises controles.

#### Niveau page

Permettre:

- activation d'un provider uniquement pour certaines pages;
- surcharge d'identifiant ou d'event;
- ajout d'un script specifique a une page;
- desactivation explicite de l'heritage pour une page.

### Modele de donnees recommande

Creer une table `tracking_integrations` avec par exemple:

- `scope`: `site` ou `page`
- `page_id` nullable
- `provider`
- `label`
- `placement`: `head`, `body_start`, `body_end`
- `mode`: `preset` ou `custom`
- `config_json`
- `custom_code`
- `requires_consent`
- `consent_category`
- `is_active`
- `load_strategy`: `immediate`, `after_consent`, `lazy`, `route_change`

### UX a mettre en place

Dans l'admin:

- un ecran `Tracking du site` avec cartes par provider;
- un ecran `Tracking de la page` dans `SEOForm` ou dans le builder;
- un resume visuel `herite du site` / `ajoute sur cette page` / `desactive`;
- des presets guides plutot qu'un textarea brut par defaut.

### Securite et gouvernance

- reserver le code libre aux roles avances;
- valider le `placement`;
- journaliser qui ajoute ou modifie un script;
- bloquer certains patterns dangereux si code libre autorise;
- afficher un avertissement sur l'impact performance et legal.

### Consentement

Ajouter un chantier associe minimal:

- banner cookies configurable;
- categories `necessary`, `analytics`, `ads`, `social`;
- chargement conditionnel des scripts soumis au consentement;
- memorisation du choix utilisateur.

### Criteres de validation

- un utilisateur peut installer GTM, GA4 ou Meta Pixel sans coller du code HTML brut;
- une page peut ajouter ou retirer un script specifique;
- les scripts sont injectes dans les bons emplacements;
- aucun script soumis au consentement n'est charge avant acceptation.

## Phase 3 - Rendu public SEO-compatible

### But

Faire en sorte que chaque page publiee produise un HTML utilisable par Google, Bing, Facebook, X, LinkedIn et les outils SEO.

### Travaux a realiser

- Implementer une couche de rendu public serveur ou edge pour les pages publiees.
- Produire un `head` complet a partir des donnees de page et des defaults du site.
- Injecter `title`, `meta description`, `canonical`, `robots`, Open Graph, Twitter, hreflang si besoin, favicons, manifest, verification tokens, JSON-LD.
- Prevoir un fallback propre si une valeur de page est absente.

### Resultat cible du head

Chaque page publiee doit pouvoir fournir:

- `title`
- `meta name="description"`
- `link rel="canonical"`
- `meta name="robots"`
- `meta property="og:title"`
- `meta property="og:description"`
- `meta property="og:image"`
- `meta property="og:url"`
- `meta property="og:type"`
- `meta property="og:locale"`
- `meta name="twitter:card"`
- `meta name="twitter:title"`
- `meta name="twitter:description"`
- `meta name="twitter:image"`
- `link rel="icon"`
- `link rel="apple-touch-icon"`
- `link rel="manifest"`
- `script type="application/ld+json"`

### Recommandation technique

Traiter les pages publiees comme un rendu public distinct du back office.

Concretement:

- garder l'app React pour le CMS et la previsualisation interne;
- servir les pages publiques via un endpoint ou un pipeline qui compose l'HTML avec les bonnes donnees;
- reutiliser `sections_data` pour le corps de page mais ne plus dependre d'un `index.html` statique pour le SEO.

### Criteres de validation

- le code source HTML de la page publiee contient les metas avant execution JS;
- un debugger Open Graph remonte les bonnes valeurs;
- le partage mobile affiche la bonne image et le bon titre.

## Phase 4 - Enrichissement du modele SEO de la page

### But

Completer les donnees de page pour couvrir les vrais besoins SEO et sociaux.

### Evolutions recommandees sur `seo_metadata`

Ajouter ou fiabiliser les champs suivants:

- `meta_robots`
- `og_type`
- `twitter_title`
- `twitter_description`
- `twitter_image`
- `social_image_alt`
- `schema_type`
- `schema_jsonld`
- `noindex`
- `nofollow`
- `exclude_from_sitemap`
- `primary_keyword`
- `secondary_keywords`
- `breadcrumb_title`
- `published_at`
- `last_reviewed_at`

### UX dans le formulaire page

Structurer le formulaire en onglets:

- `General`
- `SEO de base`
- `Social sharing`
- `Indexation`
- `Donnees structurees`
- `Tracking`
- `Apercu et validation`

### Validations utiles

- longueur titre;
- longueur description;
- presence image sociale;
- format URL canonique;
- coherence slug / canonical / page_key;
- prevention des titres dupliques;
- alerte si `published` sans image de partage;
- alerte si `published` sans canonical exploitable.

### Criteres de validation

- chaque page publiee possede un jeu SEO complet ou herite proprement des defaults du site;
- l'utilisateur sait instantanement ce qui manque avant publication.

## Phase 5 - Sitemaps, robots et indexation

### But

Rendre l'indexation propre, complete et gouvernable.

### Travaux a realiser

- Conserver la fonction sitemap existante et l'etendre.
- Generer un `robots.txt` dynamique ou semi-dynamique.
- Ajouter la reference au sitemap dans `robots.txt`.
- Exclure du sitemap les pages `draft`, `archived`, `noindex` ou `exclude_from_sitemap`.
- Ajouter a terme, si necessaire, image sitemap ou sitemap index.

### Evolution du sitemap

Faire evoluer `supabase/functions/sitemap/index.ts` pour:

- ignorer les pages non indexables;
- utiliser les canonicals si necessaire;
- gerer plusieurs domaines ou sous-sites si le produit va dans ce sens;
- preparer un `sitemap_index.xml` si le volume grossit.

### Evolution `robots.txt`

Le fichier ou endpoint doit permettre:

- `User-agent: *`
- `Allow` / `Disallow` configurables;
- declaration du sitemap;
- blocage des routes d'admin, preview et outils internes;
- eventuel environnement `staging` en `Disallow: /`.

### Criteres de validation

- `robots.txt` existe et pointe vers le bon sitemap;
- le sitemap ne contient que des URLs publiables et indexables;
- les zones back office ne sont pas indexees.

## Phase 6 - Favicons, navicones, image de partage et coherences visuelles

### But

Garantir une presentation propre dans les navigateurs, sur mobile et dans les partages sociaux.

### Travaux a realiser

- Remplacer le favicon actuel par une configuration de site reelle.
- Supporter au minimum:
  - favicon `.ico`
  - favicon SVG si utile
  - `apple-touch-icon`
  - `manifest.webmanifest`
  - image OG par defaut
- Ajouter un validateur simple sur les dimensions recommandees.

### UX a mettre en place

- un bloc `Brand assets` dans les parametres site;
- preview des icones;
- preview carte sociale mobile/desktop;
- fallback automatique sur l'image de partage du site si la page n'en a pas.

### Criteres de validation

- l'icone du site est correcte sur navigateur et mobile;
- le partage social remonte une image exploitable;
- aucune page publiee ne sort sans fallback social.

## Phase 7 - Donnees structurees et types de page

### But

Ameliorer l'eligibilite aux resultats enrichis et la comprehension semantique des pages.

### Strategie

Commencer simple avec des schemas cibles selon le type de page.

### Types prioritaires

- `Organization` ou `LocalBusiness` au niveau site;
- `WebSite` avec potentielle `SearchAction` si pertinent;
- `WebPage` par defaut;
- `Article` pour contenus editoriaux;
- `FAQPage` si bloc FAQ reel;
- `Product` ou `Service` selon les landings;
- `BreadcrumbList` si arborescence exploitee.

### UX a mettre en place

- selection de type de schema dans la page;
- configuration assistee par type;
- zone avancee JSON-LD libre reservee aux cas experts;
- validation de JSON-LD avant publication.

### Criteres de validation

- le Rich Results Test ne remonte pas d'erreur bloquante;
- les schemas affiches correspondent au contenu reel de la page.

## Phase 8 - Preview, validation et assurance qualite SEO

### But

Donner aux utilisateurs une vision claire de la qualite SEO avant mise en ligne.

### UX a mettre en place

Ajouter un panneau `Controle SEO` avec:

- score de completion;
- warnings bloquants et non bloquants;
- apercu SERP desktop/mobile;
- apercu carte Open Graph;
- apercu Twitter Card;
- verification des images;
- verification canonique et robots;
- verification des scripts actifs sur la page.

### Outils a integrer dans le workflow de test

- Lighthouse;
- Google Rich Results Test;
- Google Search Console;
- Bing Webmaster Tools;
- Facebook Sharing Debugger;
- LinkedIn Post Inspector;
- un validateur interne de `robots.txt` et `sitemap.xml`.

### Criteres de validation

- la publication affiche une checklist claire;
- les erreurs critiques bloquent ou alertent fortement;
- l'utilisateur comprend quoi corriger sans expertise technique avancee.

## Phase 9 - Redirections, coherence des slugs et hygiene SEO

### But

Eviter les pertes SEO lors des changements de slugs, duplications ou suppressions.

### Travaux a realiser

- Renforcer la table `seo_redirects` deja presente.
- Ajouter la prevention de boucles.
- Ajouter verification des collisions de canonicals.
- Ajouter alertes sur les slugs trop proches ou deja reserves.
- Garantir une redirection 301 propre lors du renommage d'une page publiee.

### Criteres de validation

- aucun changement de slug ne casse une URL publiee;
- les redirects ne forment pas de boucle;
- les pages archivees ou deplacees restent coherentes pour le SEO.

## Phase 10 - Performance et experience utilisateur

### But

Ne pas sacrifier l'UX ni la performance en cherchant a tout injecter.

### Travaux a realiser

- Charger les scripts tiers avec une strategie explicite.
- Retarder les pixels non critiques.
- Minimiser les scripts en double.
- Ajouter un budget de poids ou de nombre de scripts.
- Surveiller les Core Web Vitals.

### Garde-fous UX

- bannir la multiplication des presets si le site n'en a pas besoin;
- preferer des assistants de configuration a des formulaires bruts;
- garder le `quick publish` pour les utilisateurs simples avec defaults intelligents;
- reserver les reglages avances a une section dediee.

### Criteres de validation

- les pages restent rapides malgre les integrations marketing;
- les champs avances n'encombrent pas le parcours standard.

## 7. Priorisation concrete

### Priorite 1 - A faire en premier

- decision d'architecture de rendu public;
- creation des parametres SEO globaux du site;
- systeme de tracking global avec presets;
- systeme de tracking de page avec heritage;
- rendu `head` SEO complet pour les pages publiees;
- `robots.txt` exploitable;
- favicons et image de partage par defaut.

### Priorite 2 - A faire juste apres

- enrichissement de `seo_metadata`;
- preview SERP/social;
- validation avant publication;
- donnees structurees par type;
- prevention de boucles de redirects.

### Priorite 3 - A industrialiser ensuite

- consentement fin par categorie;
- reporting plus avance;
- support multi-site plus fort si le produit l'exige;
- sitemap index et variantes avancees;
- monitoring SEO continu.

## 8. Proposition de sequencing de delivery

## Sprint 1

- Phase 0
- Phase 1
- design du modele tracking

### Resultat attendu

- architecture validee;
- schema global du site en place;
- UX de base du parametrage site definie.

## Sprint 2

- Phase 2
- debut Phase 3

### Resultat attendu

- tracking global et tracking page disponibles;
- premiers presets actifs;
- debut du rendu public SEO-compatible.

## Sprint 3

- fin Phase 3
- Phase 4
- Phase 5
- Phase 6

### Resultat attendu

- pages publiques avec vrai `head` SEO;
- `robots.txt` et sitemap coherents;
- favicons et assets sociaux propres.

## Sprint 4

- Phase 7
- Phase 8
- Phase 9
- Phase 10

### Resultat attendu

- controle qualite SEO mature;
- donnees structurees exploitees;
- hygiene des redirects;
- budget performance et experience utilisateur sous controle.

## 9. Fichiers du projet a cibler en priorite

Les evolutions toucheront probablement en premier:

- `src/components/seo/SEOForm.tsx`
- `src/components/seo/SEOPageViewer.tsx`
- `src/App.tsx`
- `src/lib/supabase.ts`
- `src/components/GlobalHFManager.tsx`
- `supabase/functions/sitemap/index.ts`
- `index.html`
- `public/_redirects`
- nouvelles migrations Supabase pour les tables et colonnes SEO / tracking

Il sera aussi pertinent d'ajouter:

- une couche `site settings`;
- une couche `tracking` dediee;
- une couche `seo validation`;
- une couche `head rendering` ou `public rendering`.

## 10. Risques a anticiper

- Rester sur une SPA pure pour les pages publiques degradra fortement le resultat SEO reel.
- Laisser du code script libre sans gouvernance peut creer des risques de securite et de performance.
- Ajouter trop de champs d'un coup sans systeme d'heritage rendra l'UX confuse.
- Sans consentement, certaines integrations ads/analytics poseront rapidement un probleme legal.
- Sans fallback global bien pense, les utilisateurs publieront des pages incompletes.

## 11. Definition of done

Le chantier pourra etre considere comme reussi quand:

- chaque site possede un socle SEO global centralise;
- chaque page publiee genere un HTML avec un `head` complet et lisible sans JS;
- chaque page peut heriter ou surcharger proprement ses regles SEO et tracking;
- le site expose `sitemap.xml`, `robots.txt`, favicons, image sociale et canonicals coherents;
- l'utilisateur dispose d'un apercu SEO/social avant publication;
- les principaux outils de validation ne remontent plus d'erreurs critiques;
- l'edition reste simple pour un utilisateur non technique.

## 12. Recommandation finale

Si l'objectif est de maximiser reellement le SEO des pages generees, il ne faut pas traiter ce chantier comme une simple extension de formulaire.

La meilleure approche est:

- de construire un vrai socle de configuration globale du site;
- de separer clairement tracking, SEO technique et contenu visuel;
- et surtout de mettre en place un rendu public HTML SEO-compatible pour les pages publiees.

Sans cette couche de rendu public, vous aurez un back office SEO riche, mais des gains reels limites sur les moteurs et les partages sociaux.