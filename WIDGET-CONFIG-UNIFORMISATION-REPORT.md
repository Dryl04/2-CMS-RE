# Rapport d’uniformisation widgets — Audit exhaustif (tous types & variantes)

Date: 20/02/2026

## 1) Résumé d’exécution

- Audit technique réalisé sur l’ensemble des widgets et variantes déclarés dans la librairie.
- Corrections appliquées en priorité au niveau transversal (types + helper thème + CSS scope + panneau Design), pour couvrir toutes les variantes sans divergence.
- Vérification build effectuée après patch: OK.

## 2) Correctifs transversaux appliqués

### Agrégation des widgets

- Regroupement structuré des widgets par familles dans la bibliothèque d’insertion:
  - Header
  - Hero
  - Features
  - Process
  - Preuves sociales
- Les variantes restent intactes et créent toujours le bon `type` interne (pas de rupture de rendu).

### Uniformisation Design (tous widgets)

- Ajout d’une `Couleur Dominante` globale dans Design.
- Ajout de la personnalisation complète des boutons:
  - Couleur bouton
  - Couleur texte bouton
  - Couleur hover
  - Arrondi
  - Taille
  - Bordure (style, épaisseur, couleur)
- Ajout d’une section `Icônes`:
  - Couleur contenu
  - Couleur fond
  - Couleur contour
  - Épaisseur contour
- Ajout de la section `Images & vidéos`:
  - Arrondi médias
  - Overlay image
  - Position overlay
  - Taille overlay

### Robustesse rendu (anti-dysfonctionnements)

- Priorités typo renforcées au niveau CSS scope widget:
  - H1/H2 spécifiques > titres globaux > police widget > thème
  - Forçage prioritaire H1/H2 pour éviter les conflits inline selon variantes.
- Correctif global sur styles boutons (incluant cas `.btn` et boutons natifs sans classe `.btn`).
- Correctif global icônes (contenu + cadre) avec fallback auto sur conteneurs d’icônes.
- Correctif fond Header pour tous types contenant `header`.

## 3) Corrections spécifiques demandées

### Widget Vidéo

- Texte non tronqué (hauteur/positionnement sécurisé).
- Position texte configurable (`top`, `center`, `bottom`) avec centrage par défaut.

### Widget Image / upload réel

- L’option upload permet une sélection réelle depuis la médiathèque avec action `Utiliser`.
- Flux upload conservé (upload + stockage + URL), puis injection immédiate dans le widget.

### Widget Header

- Logo texte (`Brand`) désormais bien impacté par les réglages Design (couleur/typo).

### Bugs ciblés rappelés

- Hover + texte bouton: corrigés de manière robuste via variables & classes dédiées.
- Arrière-plan Header: corrigé côté scope CSS pour tous widgets header-like.

## 4) Fichiers clés touchés

- `src/components/PageBuilder/WidgetLibrary.tsx`
- `src/components/PageBuilder/PropertiesPanel.tsx`
- `src/lib/pageBuilderTypes.ts`
- `src/lib/widgetThemeHelper.ts`
- `src/index.css`
- `src/components/PageBuilder/SectionRenderer.tsx`
- `src/components/SEOPageViewer.tsx`
- `src/components/MediaLibrary.tsx`
- `src/components/PageBuilder/Widgets/VideoHeroWidget.tsx`
- `src/components/PageBuilder/ContentEditors2.tsx`
- `src/components/PageBuilder/Widgets/HeaderWidget.tsx`
- `GUIDE-PRIORITES-PERSONNALISATION-WIDGETS.md`

## 5) Validation

- Build production: `npm run build` => succès.
- Pas d’erreurs TypeScript détectées sur les fichiers modifiés.

## 6) Note d’architecture

- L’approche a privilégié des correctifs de socle (centralisés) pour éviter les écarts entre variantes et limiter les régressions futures.
- Les ajustements unitaires ont été faits uniquement quand nécessaire (Video/Header/Media).
