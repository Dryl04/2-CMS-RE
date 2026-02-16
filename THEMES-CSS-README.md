# Gestionnaire de Thèmes CSS

Ce système permet de créer et gérer des thèmes typographiques personnalisés pour vos pages, avec stockage local (localStorage).

## Fonctionnalités

Chaque thème CSS permet de personnaliser:
- **Polices**: police du texte et des titres (Google Fonts)
- **Couleurs**: couleur du texte et des titres (sélecteur de couleur)
- **Tailles**: taille du texte (sm, base, lg) et des titres (h1-h4)
- **Poids**: font-weight pour le texte et les titres (300 à 900)

## Utilisation dans le Page Builder

1. Ouvrez l'**Éditeur Avancé** (Page Builder)
2. Dans la barre d'outils supérieure, vous verrez deux sélecteurs de thème:
   - Le premier (gris) est pour les thèmes de la base de données
   - Le second (bleu) 🎨 est pour les **thèmes CSS typographiques**
3. À côté du sélecteur bleu, un bouton ⚙️ permet d'ouvrir le **Gestionnaire de Thèmes**
4. Sélectionnez un thème dans le menu déroulant bleu
5. Le thème s'applique immédiatement à votre page en prévisualisation et dans l'éditeur

## Gestionnaire de Thèmes

Le gestionnaire de thèmes vous permet de créer et personnaliser vos propres thèmes typographiques.

### Créer un nouveau thème

1. Cliquez sur le bouton ⚙️ à côté du sélecteur de thème (bleu)
2. Dans le gestionnaire, cliquez sur **"Nouveau thème"**
3. Remplissez les informations:
   - **Nom**: nom de votre thème
   - **Description**: courte description
   - **Polices**: choisissez parmi les Google Fonts disponibles
   - **Couleurs**: utilisez les sélecteurs de couleur ou entrez des codes hex
   - **Tailles**: définissez les tailles pour le texte et les titres
   - **Épaisseur**: choisissez le poids de la police (300 à 900)
4. Prévisualisez en temps réel dans la section "Aperçu"
5. Cliquez sur **"Enregistrer"**

### Modifier un thème existant

1. Ouvrez le gestionnaire de thèmes
2. Dans la liste des **Thèmes personnalisés**, cliquez sur le thème à modifier
3. Modifiez les paramètres souhaités
4. Cliquez sur **"Enregistrer"**

### Dupliquer un thème

Vous pouvez dupliquer n'importe quel thème (par défaut ou personnalisé) pour l'utiliser comme base:

1. Dans le gestionnaire, trouvez le thème à dupliquer
2. Cliquez sur l'icône 📄 (Dupliquer)
3. Le thème dupliqué s'ouvre dans l'éditeur avec "(copie)" dans le nom
4. Modifiez et enregistrez

### Supprimer un thème

1. Dans le gestionnaire, trouvez le thème dans **Thèmes personnalisés**
2. Cliquez sur l'icône 🗑️ (Supprimer)
3. Confirmez la suppression

**Note**: Les thèmes par défaut ne peuvent pas être supprimés, seulement dupliqués.

## Thèmes disponibles

### Par défaut
Typographie moderne avec Inter
- Police: Inter
- Style: neutre et professionnel

### Élégant
Typographie élégante avec Playfair Display
- Police titres: Playfair Display (serif)
- Police texte: Georgia (serif)
- Style: classique et raffiné

### Moderne
Design moderne avec Poppins
- Police: Poppins
- Style: contemporain et épuré

### Audacieux
Typographie forte et audacieuse
- Police titres: Montserrat (poids 800)
- Police texte: Roboto
- Style: impactant et dynamique

### Minimaliste
Design épuré et minimaliste
- Police: Work Sans (poids léger)
- Style: simple et aéré

### Classique
Typographie classique avec serif
- Police titres: Merriweather
- Police texte: Lora
- Style: traditionnel et lisible

## Comment ça fonctionne

Le système utilise des variables CSS (custom properties) qui sont injectées dynamiquement dans la page:

```css
:root {
  --page-body-font: ...
  --page-heading-font: ...
  --page-text-color: ...
  --page-heading-color: ...
  /* etc. */
}
```

Tous les éléments avec la classe `.page-themed` héritent automatiquement de ces styles.

## Paramètres disponibles

### Polices
Les polices disponibles dans le sélecteur:
- Inter, Roboto, Open Sans, Lato
- Montserrat, Poppins, Work Sans
- Playfair Display, Merriweather, Lora
- Georgia, Times New Roman, Arial, Helvetica

**Note pour les développeurs**: Pour ajouter de nouvelles polices, modifiez le tableau `GOOGLE_FONTS` dans `src/components/PageThemeEditor.tsx` et ajoutez-les dans `src/components/PageThemeInjector.tsx`.

### Couleurs
- Format hex (#000000) ou nom de couleur CSS
- Sélecteur de couleur visuel intégré
- Prévisualisation en temps réel

### Tailles
Toutes les tailles acceptent les unités CSS: px, rem, em, etc.
- Texte petit (textSm): 13-14px recommandé
- Texte normal (textBase): 15-18px recommandé
- Texte grand (textLg): 17-20px recommandé
- H1: 40-56px recommandé
- H2: 32-40px recommandé
- H3: 26-32px recommandé
- H4: 20-26px recommandé

### Épaisseur (Font Weight)
- 300: Léger
- 400: Normal
- 500: Moyen
- 600: Semi-gras
- 700: Gras
- 800: Extra-gras
- 900: Ultra-gras

## Avantages

- ✅ **Aucune base de données requise**: stockage en localStorage
- ✅ **Interface graphique complète**: créez et modifiez sans coder
- ✅ **Changement instantané**: le thème s'applique en temps réel
- ✅ **Prévisualisation en direct**: voyez les changements immédiatement
- ✅ **Performance optimale**: utilise les variables CSS natives
- ✅ **Compatible avec tous les widgets**: fonctionne avec tous les composants existants
- ✅ **Import/Export facile**: duplication de thèmes en un clic
- ✅ **Sélecteur de couleurs visuel**: pas besoin de connaître les codes hex

## Stockage

Les thèmes personnalisés sont stockés dans le **localStorage** du navigateur:
- Clé: `custom_page_themes`
- Format: JSON
- Persistant entre les sessions
- Pas de limite de nombre de thèmes

**Important**: Les thèmes personnalisés sont liés au navigateur. Pour les partager entre appareils, vous devrez les recréer ou exporter/importer manuellement.

## Architecture technique

### Fichiers

- `src/lib/pageThemes.ts` - Définitions des thèmes par défaut
- `src/lib/pageThemesStorage.ts` - Gestion du localStorage
- `src/components/PageThemeEditor.tsx` - Interface de gestion
- `src/components/PageThemeInjector.tsx` - Injection CSS et fonts
- `src/components/PageBuilder/PageBuilder.tsx` - Intégration dans l'éditeur
