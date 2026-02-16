# Hero Section - Fonctionnalités Avancées

## Résumé des Améliorations

Le Hero Section dispose maintenant d'options de design avancées pour créer des sections d'accueil spectaculaires et professionnelles.

## Nouvelles Fonctionnalités

### 🎨 Superposition (Overlay)
- Couleur personnalisable
- Opacité réglable (0-100%)
- 3 types : Couleur unie, Gradient linéaire, Gradient radial
- 8 directions de gradient disponibles

### 🖼️ Filtres d'Image
- **Flou** (0-20px) - Effet de profondeur
- **Luminosité** (0-200%) - Éclaircir ou assombrir
- **Contraste** (0-200%) - Couleurs vives ou douces
- **Saturation** (0-200%) - Couleurs vibrantes ou désaturées
- **Niveaux de gris** (0-100%) - Effet noir et blanc
- **Sépia** (0-100%) - Effet vintage
- **Rotation de teinte** (0-360°) - Changer les couleurs

### ✨ Effets Dynamiques
- **Parallaxe** - Effet de profondeur 3D au scroll
- **6 animations d'entrée** :
  - Apparition progressive
  - Glissement (haut, bas, gauche, droite)
  - Zoom avant

### 📐 Mise en Page Avancée
- Position du contenu (gauche, centre, droite)
- Alignement vertical (haut, centre, bas)
- Hauteur minimale personnalisable
- Largeur maximale (11 options de sm à full)

### 🎭 Nouvelle Variante
- **Full Background** - Image plein écran avec texte superposé
  - Parfait pour les overlays et effets dramatiques
  - Hauteur personnalisable (px, vh, etc.)
  - Idéal pour les pages d'accueil impactantes

## Accès aux Options

1. Ajoutez un **Hero Section** à votre page
2. Sélectionnez-le dans le canvas
3. Allez dans l'onglet **Design** du panneau de propriétés
4. Toutes les options avancées sont organisées en sections :
   - 🔵 Superposition (Overlay)
   - 🟣 Filtres d'Image
   - 🟢 Effets & Animation
   - 🟠 Mise en Page

## Guide Rapide

### Créer un Hero Cinématique
```
1. Choisir la variante "Full Background"
2. Ajouter une image de qualité
3. Activer overlay noir avec 50% d'opacité
4. Type : Gradient linéaire vers le bas
5. Luminosité : 80%, Contraste : 120%
6. Animation : Fade-in
7. Hauteur : 100vh
```

### Créer un Hero Vintage
```
1. Choisir la variante "Split Screen"
2. Sépia : 60%
3. Contraste : 90%
4. Saturation : 85%
5. Animation : Slide-up
```

### Créer un Hero Moderne
```
1. Choisir la variante "Full Background"
2. Overlay bleu (#0066CC) avec 35% d'opacité
3. Type : Gradient radial
4. Contraste : 115%, Saturation : 110%
5. Parallaxe : Activé
6. Animation : Zoom-in
```

## Variantes Disponibles

1. **Classic** - Layout 2 colonnes (texte + image)
2. **Centered** - Tout centré
3. **Split Screen** - Écran divisé
4. **Minimal** - Design épuré
5. **Full Background** ⭐ NOUVEAU - Image plein écran

## Bonnes Pratiques

✅ **À FAIRE**
- Tester sur mobile et desktop
- Assurer un bon contraste texte/fond
- Utiliser des images haute qualité (min 1920x1080)
- Combiner 2-3 effets maximum
- Optimiser les images (compression)

❌ **À ÉVITER**
- Trop d'effets simultanés
- Overlay trop opaque (masque l'image)
- Flou excessif (> 10px)
- Texte illisible sur fond complexe
- Parallaxe sur mobile sans test

## Performances

- **Animations** : Légères, optimisées (0.8s)
- **Filtres** : Utilise CSS natif (performant)
- **Parallaxe** : Peut impacter mobile (tester)
- **Images** : Toujours compresser (TinyPNG, ImageOptim)

## Accessibilité

- ✓ Contraste minimum respecté
- ✓ Animations désactivables (prefers-reduced-motion)
- ✓ Texte lisible sur tous les fonds
- ✓ Structure sémantique (h1, h2)

## Exemples d'Usage

### E-commerce
- Full Background avec overlay gradient
- Produit en haute définition
- CTA bien visible

### Portfolio / Agence
- Split Screen moderne
- Parallaxe subtil
- Animation slide-up

### Blog / Contenu
- Minimal ou Centered
- Filtres légers (sépia, noir et blanc)
- Focus sur le texte

### Application SaaS
- Classic avec animation
- Couleurs vives (saturation +10%)
- CTA proéminent

## Documentation Complète

Consultez **HERO-ADVANCED-GUIDE.md** pour :
- Explications détaillées de chaque option
- Recettes de design complètes
- Combinaisons recommandées
- Guide de dépannage
- Conseils d'optimisation

## Fichiers Modifiés

### Composants
- `HeroWidget.tsx` - Widget principal avec toute la logique
- `HeroAdvancedEditor.tsx` - Panneau d'édition avancé
- `PropertiesPanel.tsx` - Intégration de l'éditeur

### Configuration
- `widgetLibrary.ts` - Ajout variante "Full Background"
- `index.css` - Animations CSS

### Animations CSS Ajoutées
```css
- fadeIn
- slideUp
- slideDown
- slideLeft
- slideRight
- zoomIn
```

## Support

Toutes les options fonctionnent avec :
- Tous les navigateurs modernes
- Responsive design (mobile, tablette, desktop)
- Mode clair et sombre

---

**Astuce Finale** : Commencez simple et ajoutez progressivement des effets. Un bon Hero Section ne nécessite pas tous les effets, juste les bons !
