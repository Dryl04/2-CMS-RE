# Patch de configuration widgets — Uniformisation (impact minimal)

## 1) Patch/code + bref changelog

### Objectif atteint
- Uniformisation de la configuration par sous-sections (Titres, Paragraphes, Boutons & liens) via une édition rapide commune.
- Ajout des contrôles manquants pour les boutons sur les widgets hero-like (couleur bouton, texte, hover).
- Amélioration de l’intuitivité pour la couleur du menu/navigation.
- Correction de normalisation automatique des slugs (espaces -> tirets, nettoyage URL-safe).
- Renforcement des contrôles d’espacement (padding + marges haut/bas) dans le panneau design.

### Fichiers modifiés
- src/components/PageBuilder/PropertiesPanel.tsx
  - Ajout d’un bloc “Édition rapide uniforme” (Titres / Paragraphes / Boutons & liens).
  - Conservation des éditeurs spécifiques existants (pas de refonte complète).
  - Ajout des couleurs de bouton dans la branche design des widgets hero-like.
  - Renommage du libellé de couleur de liens pour clarifier le cas menu/navigation.
  - Ajout des champs “Marge haute” et “Marge basse” dans la section Espacement.

- src/components/PageBuilder/Widgets/HeaderWidget.tsx
  - Application explicite de typography.linkColor sur les liens/menu pour un comportement plus évident côté utilisateur.

- src/components/PageBuilder/Widgets/HeaderClickFunnel.tsx
  - Application explicite de typography.linkColor sur les liens de navigation.

- src/components/SEOForm.tsx
  - Ajout d’une normalisation de slug (minuscules, suppression accents/caractères invalides, espaces -> tirets, collapse des tirets).
  - Application de cette normalisation en saisie, en édition existante et en génération page_key/canonical_url.

## 2) Checklist de tests manuels (courte)

- [ ] Ouvrir plusieurs widgets différents et vérifier l’apparition de “Édition rapide uniforme” avec sections:
  - [ ] Titres
  - [ ] Paragraphes
  - [ ] Boutons & liens
- [ ] Sur un Hero: modifier couleur bouton / texte bouton / hover dans Design et vérifier rendu immédiat en canvas + aperçu.
- [ ] Sur un Header/Header ClickFunnel: modifier “Couleur liens / menu navigation” et vérifier desktop + menu mobile.
- [ ] Modifier Padding haut/bas + Marge haute/basse et vérifier effet sur le widget courant.
- [ ] Créer une page SEO avec slug contenant des espaces/accents (ex: “Mon Offre Été 2026”) et vérifier slug auto: “mon-offre-ete-2026”.
- [ ] Enregistrer puis rouvrir une page/widget pour vérifier persistance des réglages.

## 3) Note de suivi — champs renommés (ancien -> nouveau)

> Remarque: pas de renommage de clés de données persistées (DB/JSON). Renommages effectués au niveau des libellés UI pour lisibilité.

- Couleur liens -> Couleur liens / menu navigation
- (Nouveau groupe UI) Édition rapide uniforme -> Titres / Paragraphes / Boutons & liens
- (Nouveaux champs UI) Espacement -> Marge haute, Marge basse

## Portée / contrainte respectée

- Impact minimal: modifications ciblées sur la configuration widgets et UI associée uniquement.
- Pas de refactorisation complète de l’architecture des widgets.
