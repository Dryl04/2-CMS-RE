# Tâche 07 — Correction des soucis de superposition d’image (section / image)

## Taille estimée
- **Taille**: M
- **Complexité**: Moyenne
- **Impact**: Élevé visuel

## Contexte technique observé
- Le CSS gère deux niveaux de superposition:
  - sur `data-widget-media-frame`,
  - sur `.widget-design-scope`.
- Le rendu applique `data-widget-overlay` aussi au wrapper de section, alors que certains widgets l’appliquent déjà à leur frame média.
- Risque: duplication de l’overlay (sur section + sur image) ou position inattendue.
- Décision produit validée: supporter explicitement les 2 modes (section et média) avec sélecteur clair.
- Décision produit validée: filtres visuels disponibles et fonctionnels sur les images de superposition.

## Plan d’exécution détaillé
1. **Introduire un mode explicite de ciblage de superposition**
   - Ajouter un paramètre `overlayTarget` avec valeurs `section` ou `media`.
   - Garder la compatibilité ascendante des données existantes (fallback intelligent).

2. **Éviter le double rendu CSS non contrôlé**
   - Activer l’overlay uniquement sur la cible choisie (`section` ou `media`) pour un widget donné.
   - Nettoyer l’attribution de `data-widget-overlay` et des data-attributes associés côté renderers.

3. **Ajouter les filtres de superposition image**
   - Introduire des paramètres de filtres (opacité, luminosité, contraste, saturate, blur si retenu).
   - Appliquer ces filtres de manière cohérente sur la cible active.

4. **Standardiser z-index et clipping**
   - Vérifier `overflow`, `border-radius`, `z-index` pour éviter superposition coupée ou cachée.

5. **Valider sur widgets sensibles**
   - `videohero`, `content-video-services`, `clickfunnel-center-card`, sections avec background image.

## Critères d’acceptation
- Le mode de superposition est sélectionnable explicitement (section ou média).
- Une seule superposition est visible sur la cible active, sans duplication involontaire.
- Position et taille overlay respectées de manière prévisible.
- Les filtres de superposition sont disponibles et appliqués correctement.
- Pas de régression sur les widgets n’utilisant pas d’overlay.
