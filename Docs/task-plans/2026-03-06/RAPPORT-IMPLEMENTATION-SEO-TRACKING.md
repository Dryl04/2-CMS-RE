# Rapport d'implementation SEO et tracking

## 1. Resume

Une premiere implementation fonctionnelle du plan SEO/tracking a ete ajoutee dans le projet.

Le chantier couvre maintenant:

- une configuration SEO globale du site;
- un systeme de tracking global et par page avec presets;
- une couche d'injection des metas SEO dans le `head` des pages publiques cote client;
- un bandeau de consentement simple avec categories;
- des endpoints pour `robots.txt` et `sitemap.xml` sur Vercel;
- un enrichissement important du modele SEO des pages;
- un controle SEO de base dans le formulaire page.

## 2. Ce qui a ete implemente

### 2.1 Parametres SEO globaux du site

Un nouvel ecran de parametres remplace l'ancien placeholder.

Fonctionnalites ajoutees:

- nom du site;
- URL de base;
- locale par defaut;
- suffixe de titre;
- meta description globale;
- image Open Graph globale;
- Twitter Card par defaut;
- robots par defaut;
- favicon;
- apple touch icon;
- manifest;
- verification Google et Bing;
- donnees d'organisation;
- override de `robots.txt`;
- activation et texte du bandeau de consentement.

Fichier principal:

- [src/components/settings/SiteSettingsManager.tsx](src/components/settings/SiteSettingsManager.tsx)

Couche de donnees associee:

- [src/lib/siteSettings.ts](src/lib/siteSettings.ts)
- [src/lib/supabase.ts](src/lib/supabase.ts)
- [supabase/migrations/20260306110000_add_site_settings_and_tracking.sql](supabase/migrations/20260306110000_add_site_settings_and_tracking.sql)

### 2.2 Tracking global du site et tracking specifique a la page

Un systeme dedie aux integrations marketing a ete ajoute.

Providers supportes dans l'UI:

- Google Tag Manager;
- Google Analytics 4;
- Google Ads;
- Meta Pixel;
- LinkedIn Insight Tag;
- TikTok Pixel;
- Pinterest Tag;
- script personnalise.

Capacites implementees:

- scope `site` ou `page`;
- placement `head`, `body_start`, `body_end`;
- mode `preset` ou `custom`;
- categorie de consentement;
- activation/desactivation;
- strategie de chargement;
- desactivation de l'heritage d'un provider global au niveau page.

Fichiers principaux:

- [src/components/settings/TrackingIntegrationsPanel.tsx](src/components/settings/TrackingIntegrationsPanel.tsx)
- [src/lib/trackingIntegrations.ts](src/lib/trackingIntegrations.ts)
- [src/components/public/PageTrackingRuntime.tsx](src/components/public/PageTrackingRuntime.tsx)

### 2.3 Consentement cookies

Un bandeau de consentement simple a ete ajoute sur les pages publiques.

Fonctionnalites:

- acceptation globale;
- essentiels uniquement;
- personnalisation par categories `analytics`, `ads`, `social`;
- memorisation dans le navigateur;
- chargement conditionnel des scripts soumis au consentement.

Fichier principal:

- [src/components/public/CookieConsentBanner.tsx](src/components/public/CookieConsentBanner.tsx)

### 2.4 Enrichissement SEO des pages

Le formulaire page a ete etendu avec des champs supplementaires.

Nouveaux champs principaux:

- `meta_robots`;
- `og_type`;
- `twitter_title`;
- `twitter_description`;
- `twitter_image`;
- `social_image_alt`;
- `schema_type`;
- `schema_jsonld`;
- `noindex`;
- `nofollow`;
- `exclude_from_sitemap`;
- `primary_keyword`;
- `secondary_keywords`;
- `breadcrumb_title`;
- `published_at`;
- `last_reviewed_at`.

Le formulaire affiche aussi un panneau `Controle SEO` avec erreurs et avertissements de base.

Fichiers principaux:

- [src/components/seo/SEOForm.tsx](src/components/seo/SEOForm.tsx)
- [src/lib/seoRuntime.ts](src/lib/seoRuntime.ts)
- [src/lib/supabase.ts](src/lib/supabase.ts)

### 2.5 Injection SEO dans le head des pages publiques

Une couche d'injection a ete ajoutee au viewer public.

Elements injectes:

- `title`;
- `meta description`;
- `meta robots`;
- `canonical`;
- Open Graph complet;
- Twitter Card;
- verification Google/Bing;
- favicon, apple icon, manifest;
- JSON-LD.

Fichiers principaux:

- [src/components/public/SEOHeadManager.tsx](src/components/public/SEOHeadManager.tsx)
- [src/components/seo/SEOPageViewer.tsx](src/components/seo/SEOPageViewer.tsx)
- [src/lib/seoRuntime.ts](src/lib/seoRuntime.ts)

### 2.6 Sitemap et robots

Deux couches ont ete alignees:

- endpoint Vercel `robots.txt`;
- endpoint Vercel `sitemap.xml`;
- fonction sitemap Supabase mise a jour avec exclusion des pages `noindex` et `exclude_from_sitemap`.

Fichiers principaux:

- [api/robots.ts](api/robots.ts)
- [api/sitemap.ts](api/sitemap.ts)
- [vercel.json](vercel.json)
- [public/robots.txt](public/robots.txt)
- [supabase/functions/sitemap/index.ts](supabase/functions/sitemap/index.ts)

### 2.7 Assets SEO de base

Des assets par defaut ont ete ajoutes ou relies:

- favicon SVG;
- manifest;
- image sociale par defaut reliee aux assets publics existants;
- metas globales de base dans le shell HTML.

Fichiers principaux:

- [public/favicon.svg](public/favicon.svg)
- [public/site.webmanifest](public/site.webmanifest)
- [index.html](index.html)

## 3. Navigation et acces

### Acces a la configuration globale du site

Dans l'application:

1. Ouvrir le tableau de bord.
2. Cliquer sur `Parametres`.
3. Renseigner les champs du site.
4. Enregistrer.

Vue branchee depuis:

- [src/App.tsx](src/App.tsx)

### Acces au tracking global du site

Dans l'application:

1. Aller dans `Parametres`.
2. Descendre jusqu'au bloc `Tracking global du site`.
3. Ajouter une integration.
4. Choisir le provider, son identifiant, le placement et la categorie de consentement.

### Acces au tracking specifique d'une page

Dans l'application:

1. Aller dans `Pages`.
2. Modifier une page existante.
3. Descendre jusqu'au bloc `Tracking specifique a la page`.
4. Ajouter ou surcharger une integration.

Note:

- pour une nouvelle page, il faut d'abord l'enregistrer afin qu'un `page_id` existe.

### Acces aux nouveaux champs SEO de page

Dans l'application:

1. Aller dans `Pages`.
2. Creer ou modifier une page.
3. Ouvrir `Options avancees`.
4. Renseigner les champs sociaux, robots, schema et indexation.
5. Verifier le bloc `Controle SEO`.

## 4. Prerequis avant test complet

### Base de donnees

Il faut appliquer la migration suivante sur Supabase:

- [supabase/migrations/20260306110000_add_site_settings_and_tracking.sql](supabase/migrations/20260306110000_add_site_settings_and_tracking.sql)

Sans cette migration:

- les nouveaux ecrans de parametres et tracking ne pourront pas persister les donnees;
- les nouveaux champs SEO de page n'existeront pas;
- les endpoints sitemap/robots ne pourront pas exploiter les nouvelles tables/colonnes.

### Environnement Vercel

Pour les endpoints Vercel, verifier la presence des variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Build

Le build frontend a ete verifie avec succes via:

- `npm run build`

## 5. Procedure de test recommandee

### Test 1 - Parametres globaux du site

1. Ouvrir `Parametres`.
2. Renseigner `Nom du site`, `URL de base`, `Image OG`, `Favicon`.
3. Enregistrer.
4. Revenir dans `Parametres`.
5. Verifier que les valeurs sont rechargees correctement.

### Test 2 - Tracking global

1. Ouvrir `Parametres`.
2. Dans `Tracking global du site`, ajouter un provider simple, par exemple GA4.
3. Saisir un identifiant de test.
4. Choisir `head` et `after_consent`.
5. Enregistrer.
6. Ouvrir une page publique.
7. Refuser tous les cookies non essentiels.
8. Verifier que le script ne se charge pas.
9. Accepter les cookies analytiques.
10. Verifier que le script apparait dans le DOM.

### Test 3 - Tracking specifique a une page

1. Ouvrir une page existante dans `Pages`.
2. Aller dans `Tracking specifique a la page`.
3. Ajouter un Meta Pixel de test.
4. Recharger la page publique correspondante.
5. Verifier que ce tracking supplementaire est injecte uniquement sur cette page.

### Test 4 - Champs SEO avances

1. Modifier une page.
2. Renseigner:
   - `og_title`
   - `twitter_title`
   - `meta_robots`
   - `schema_type`
   - `schema_jsonld`
3. Sauvegarder.
4. Ouvrir la page publique.
5. Inspecter le `head` dans les outils developpeur.
6. Verifier la presence des metas attendues.

### Test 5 - Controle SEO dans le formulaire

1. Ouvrir une page en edition.
2. Vider la description ou l'image sociale.
3. Observer le bloc `Controle SEO`.
4. Verifier que les avertissements s'affichent.
5. Remettre les valeurs.
6. Verifier que les alertes disparaissent.

### Test 6 - Sitemap et robots

1. Deployer la branche sur Vercel.
2. Ouvrir `/robots.txt`.
3. Verifier la presence du `Sitemap:`.
4. Ouvrir `/sitemap.xml`.
5. Verifier que:
   - les pages publiees apparaissent;
   - les pages `noindex` n'apparaissent pas;
   - les pages `exclude_from_sitemap` n'apparaissent pas.

### Test 7 - Consentement

1. Ouvrir une page publique dans un navigateur sans stockage local existant.
2. Verifier l'affichage du bandeau.
3. Choisir `Essentiels uniquement`.
4. Recharger la page.
5. Verifier que le bandeau ne revient pas et que les scripts optionnels ne se chargent pas.
6. Reinitialiser le localStorage.
7. Refaire le test avec `Tout accepter`.

## 6. Fichiers principaux ajoutes ou modifies

### Nouveaux fichiers

- [src/components/settings/SiteSettingsManager.tsx](src/components/settings/SiteSettingsManager.tsx)
- [src/components/settings/TrackingIntegrationsPanel.tsx](src/components/settings/TrackingIntegrationsPanel.tsx)
- [src/components/public/SEOHeadManager.tsx](src/components/public/SEOHeadManager.tsx)
- [src/components/public/PageTrackingRuntime.tsx](src/components/public/PageTrackingRuntime.tsx)
- [src/components/public/CookieConsentBanner.tsx](src/components/public/CookieConsentBanner.tsx)
- [src/lib/siteSettings.ts](src/lib/siteSettings.ts)
- [src/lib/trackingIntegrations.ts](src/lib/trackingIntegrations.ts)
- [src/lib/seoRuntime.ts](src/lib/seoRuntime.ts)
- [api/robots.ts](api/robots.ts)
- [api/sitemap.ts](api/sitemap.ts)
- [public/favicon.svg](public/favicon.svg)
- [public/site.webmanifest](public/site.webmanifest)
- [public/robots.txt](public/robots.txt)
- [supabase/migrations/20260306110000_add_site_settings_and_tracking.sql](supabase/migrations/20260306110000_add_site_settings_and_tracking.sql)

### Fichiers modifies

- [src/App.tsx](src/App.tsx)
- [src/components/seo/SEOForm.tsx](src/components/seo/SEOForm.tsx)
- [src/components/seo/SEOPageViewer.tsx](src/components/seo/SEOPageViewer.tsx)
- [src/lib/supabase.ts](src/lib/supabase.ts)
- [src/lib/siteSettings.ts](src/lib/siteSettings.ts)
- [supabase/functions/sitemap/index.ts](supabase/functions/sitemap/index.ts)
- [index.html](index.html)
- [vercel.json](vercel.json)

## 7. Limites actuelles

Le chantier avance fortement l'etat du produit, mais un point important reste vrai:

- les metas de page sont injectees cote client dans le `head` du navigateur;
- cela ameliore nettement l'experience, les apercus internes et le comportement SPA;
- en revanche, cela ne remplace pas encore un vrai rendu HTML server-side par page pour les crawlers les plus stricts.

Ce qui est en place aujourd'hui:

- endpoints SEO publics coherents pour `robots.txt` et `sitemap.xml`;
- donnees SEO enrichies;
- head runtime coherent dans l'application;
- base propre pour aller vers un rendu public serveur ou edge.

Ce qui reste recommande a moyen terme:

- servir un HTML public precompose par page publiee, avec metas presentes avant execution JS.

## 8. Etat de validation

Validation effectuee:

- build frontend execute avec succes via `npm run build`.

Point non execute ici:

- application reelle de la migration sur Supabase;
- verification des endpoints Vercel en environnement deploye;
- tests end-to-end navigateur avec trackers reels.

## 9. Conclusion

Cette implementation fournit maintenant un socle operationnel et coherent pour:

- la gouvernance SEO globale du site;
- la gestion de scripts marketing par site et par page;
- l'indexation de base via robots/sitemap;
- le consentement minimal;
- l'enrichissement des metas sociales et structurees.

La prochaine etape la plus structurante pour maximiser encore davantage le SEO reel est la mise en place d'un rendu public HTML par page cote serveur ou edge.