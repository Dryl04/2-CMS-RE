# Guide de combinaison des widgets — Landing FLORA (mode Éditeur avancé)

Ce guide décrit l’enchaînement recommandé des widgets pour reproduire le rendu de la landing envoyée, avec les réglages essentiels.

---

## 1) Ordre de construction (canvas)

1. `header` — variante **creative-premium**
2. `creative-network-hero`
3. `immersive-split-showcase`
4. `provider-masonry`
5. `process-steps-cards`
6. `editorial-cards-row` (Case studies)
7. `editorial-cards-row` (Press / About)
8. `minimal-final-cta`
9. `cinematic-footer`

---

## 2) Paramétrage recommandé par widget

## A. Header (correspondant demandé)
Widget : `header`  
Variante : `creative-premium`

### Propriétés de contenu à renseigner
- `logo` ou `logoText`
- `navItems[]` (3 à 6 liens max)
- `accountText`, `accountLink` (ex: Log in)
- `showSearch` = `true`
- `showCart` = `false` (ou `true` selon ton besoin)
- `searchLink`, `cartLink`
- `secondaryCtaText`, `secondaryCtaLink`
- `ctaText`, `ctaLink`

### Propriétés design recommandées
- `background.value`: sombre (`#0B0B0C` / `#111827`)
- `typography.headingColor`: clair
- `typography.textColor`: gris clair
- `spacing`: `paddingTop: 0px`, `paddingBottom: 0px`

---

## B. Hero principal
Widget : `creative-network-hero`

### Propriétés clés
- `brand`
- `navItems[]` (si tu veux une cohérence visuelle locale au hero)
- `eyebrow`, `title`, `subtitle`
- `primaryText`, `primaryLink`
- `secondaryText`, `secondaryLink`
- `leftCardImage`, `leftCardLabel`
- `rightCardImage`, `rightCardLabel`
- `logos[]` (marques partenaires)

---

## C. Bloc immersif milieu
Widget : `immersive-split-showcase`

### Propriétés clés
- `backgroundImage` (image large de fond)
- `eyebrow`, `title`
- `leftLines[]` (liste verticale des disciplines)
- `cardImage`, `cardTitle`, `cardDescription`
- `cardCtaText`, `cardCtaLink`

### Astuce
- Mets une image de fond très contrastée + overlay sombre pour obtenir l’effet premium du screenshot.

---

## D. Mosaïque providers/modèles
Widget : `provider-masonry`

### Propriétés clés
- `title`, `subtitle`
- `ctaText`, `ctaLink`
- `providers[]` avec pour chaque item :
  - `name`, `tag`, `meta`, `image`
  - `wide` et/ou `tall` pour casser la grille uniformisée

### Bon ratio
- 8 à 14 cards pour un rendu dense proche de la capture.

---

## E. Étapes visuelles (01/02/03)
Widget : `process-steps-cards`

### Propriétés clés
- `title`, `subtitle`
- `steps[]` (idéalement 3) :
  - `number`
  - `title`
  - `description`
  - `image`

---

## F. Rangées éditoriales (Case studies + Press)
Widget : `editorial-cards-row`

### Combinaison recommandée
- 1er bloc : Case studies
- 2e bloc : Read about us / Press

### Propriétés clés
- `title`, `subtitle`
- `ctaText`, `ctaLink`
- `cards[]` : `title`, `description`, `meta`, `image`
- Variante `three-columns` ou `four-columns` selon densité souhaitée

---

## G. CTA final
Widget : `minimal-final-cta`

### Propriétés clés
- `title`
- `primaryText`, `primaryLink`
- `secondaryText`, `secondaryLink`

---

## H. Footer dense cinématique
Widget : `cinematic-footer`

### Propriétés clés
- `backgroundImage`
- `brand`, `copyright`
- `socials[]` (platform + url)
- `columns[]` (title + links[])

### Recommandation
- 4 colonnes : Company / Product / Resources / Legal.

---

## 3) Réglages globaux pour coller au rendu

- Palette majoritairement sombre (`bg` quasi noir, textes clairs)
- Espacements verticaux généreux (40–70px selon section)
- Cartes arrondies (`rounded-2xl` / `rounded-3xl`)
- Alternance de sections texturées et sections "air" pour le rythme
- CTA principaux en `btn-primary`, secondaires en `btn-outline`

---

## 4) Check-list rapide avant livraison

- Header : nav + actions à droite alignées
- Hero : 2 cartes latérales + logo cloud
- Bloc immersif : image fond + colonne disciplines + carte focus
- Mosaïque : densité suffisante + tailles variées (`wide`/`tall`)
- Steps : exactement 3 cartes lisibles
- Deux rangées éditoriales distinctes
- CTA final court et visible
- Footer avec colonnes complètes et liens légaux

---

## 5) Ce qui est déjà couvert techniquement

- Header correspondant implémenté via variante `creative-premium` du widget `header`
- Widgets structurels spécifiques landing FLORA déjà créés et disponibles en bibliothèque
- Toutes les propriétés critiques (textes, CTA, listes, cards, liens, médias) sont éditables

Tu peux maintenant construire la landing uniquement avec ces widgets, en injectant tes propres médias.