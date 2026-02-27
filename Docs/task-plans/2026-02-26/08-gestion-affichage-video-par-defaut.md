# Tâche 08 — Gestion de l’affichage vidéo (autoplay/full largeur/mute/boucle par défaut)

## Taille estimée
- **Taille**: M/L
- **Complexité**: Moyenne (plusieurs chemins de rendu vidéo)
- **Impact**: Élevé UX + cohérence preview/public

## Contexte technique observé
- Vidéo de fond rendue à plusieurs endroits (`SectionRenderer`, `BuilderPreviewPage`, `SEOPageViewer`) avec variantes de comportement.
- Certaines vues forcent `autoplay=1` pour YouTube alors que d’autres lisent `videoAutoplay`.
- `muted` et `loop` sont souvent forcés mais pas centralisés; `videoFullWidth` existe mais dépend du chemin de rendu.
- Décisions produit validées: périmètre étendu aux widgets vidéo de contenu et `full largeur` activé par défaut partout.
- Problème UX constaté: vidéos YouTube intégrées avec marges horizontales (mauvais ratio/dimensions iframe selon contexte).

## Plan d’exécution détaillé
1. **Définir un contrat unique de defaults vidéo**
   - Valeurs par défaut validées: `autoplay: true`, `muted: true`, `loop: true`, `fullWidth: true`.

2. **Créer un helper partagé de config vidéo**
   - Générer URL embed (YouTube/Vimeo) et props `<video>` de façon centralisée.
   - Éviter les paramètres codés en dur dans chaque renderer.

3. **Appliquer partout la même logique**
   - `SectionRenderer`, `BuilderPreviewPage`, `SEOPageViewer` + widgets vidéo de contenu (`videohero`, `content-video-services`, etc.).

4. **Corriger les marges latérales des embeds YouTube**
   - Uniformiser la stratégie de sizing iframe (ratio + couverture) pour éliminer les bandes latérales.
   - Vérifier le comportement responsive sur desktop/tablet/mobile.

5. **Conserver la priorité des réglages utilisateur**
   - Les defaults s’appliquent seulement en absence de valeur explicite.

6. **Validation cross-contexte**
   - Canvas éditeur, preview builder, page publique SEO.

## Critères d’acceptation
- Comportement vidéo identique sur tous les rendus.
- Defaults cohérents appliqués sans casser les réglages manuels.
- Pas de divergence YouTube vs mp4 native sur les options clés.
- Les vidéos YouTube importées n’affichent plus de marges horizontales indésirables.
