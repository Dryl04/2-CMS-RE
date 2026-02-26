# Tâche 04 — Corriger les soucis de paramétrage arrière-plan (mode Image)

## Taille estimée
- **Taille**: M
- **Complexité**: Moyenne (cause racine identifiée)
- **Impact**: Élevé visuel

## Contexte technique observé
- Les réglages `opacity`, `overlayColor`, `overlayOpacity` sont édités dans `PropertiesPanel`.
- Dans `normalizeSectionForTheme` (`widgetThemeHelper`), l’objet `safeBackground` ne conserve pas ces champs (seulement `type`, `value`, `backdrop*`).
- Résultat: ces valeurs peuvent être perdues lors de la normalisation et non reflétées correctement en rendu.

## Plan d’exécution détaillé
1. **Corriger la normalisation du background**
   - Étendre `safeBackground` pour conserver `opacity`, `overlayColor`, `overlayOpacity`, `videoAutoplay`, `videoNoBranding`, `videoFullWidth`.

2. **Centraliser le rendu des couches background**
   - Éviter la duplication de logique image/overlay/video entre `SectionRenderer`, `BuilderPreviewPage`, `SEOPageViewer`.
   - Extraire un helper partagé pour réduire les divergences.

3. **Vérifier les priorités de couches (z-index)**
   - Image de fond en base, overlay au-dessus, contenu ensuite.
   - Contrôler que l’opacité image et l’opacité overlay s’appliquent indépendamment.

4. **Validation visuelle**
   - Cas test: image seule, image + overlay, overlay opacity 0/50/100.

## Critères d’acceptation
- Les 3 paramètres image (`opacity`, `overlayColor`, `overlayOpacity`) persistent et s’appliquent correctement.
- Même rendu en canvas éditeur, preview et viewer SEO.
- Aucun reset inattendu après sauvegarde/chargement.
