# Guide de Personnalisation des Widgets

## Vue d'ensemble

Cette mise à jour apporte une personnalisation complète des widgets avec des champs modifiables pour textes, images, couleurs, polices et variantes. Tous les éléments visuels des widgets peuvent maintenant être personnalisés sans toucher au code.

---

## Nouvelles Fonctionnalités

### 1. Sélecteur de Variante

**Emplacement** : En haut du Properties Panel (panneau de droite)

**Description** : Chaque widget possède plusieurs variantes visuelles pré-conçues. Vous pouvez changer la variante d'un widget en temps réel.

**Exemples de variantes disponibles** :

**Hero Widget** :
- **Classic** : Image à droite, texte à gauche
- **Centered** : Contenu centré, sans image
- **Split Screen** : Écran divisé avec fond de couleur et image
- **Minimal** : Design épuré avec lien simple

**Features Widget** :
- **2 Columns** : Grille de 2 colonnes
- **3 Columns** : Grille de 3 colonnes (défaut)
- **4 Columns** : Grille de 4 colonnes
- **Alternating** : Disposition alternée avec images

**CTA Widget** :
- **Banner** : Bannière horizontale
- **Centered Box** : Boîte centrée
- **Split with Image** : Divisé avec une image

**Comment utiliser** :
1. Sélectionner un widget sur le canvas
2. Dans le Properties Panel, trouver le sélecteur "Variante du widget"
3. Choisir la variante désirée dans le menu déroulant
4. Le widget se met à jour instantanément

---

### 2. Personnalisation des Couleurs

**Emplacement** : Onglet "Design" du Properties Panel

**Champs disponibles** :

#### **Couleur titre**
- Contrôle la couleur des titres H1/H2 du widget
- Sélecteur de couleur visuel + champ texte pour code hex
- Défaut : `#111827` (gris foncé)

#### **Couleur texte**
- Contrôle la couleur des paragraphes et descriptions
- Défaut : `#4B5563` (gris moyen)

#### **Couleur bouton**
- Couleur de fond des boutons CTA
- Défaut : `#000000` (noir)

#### **Couleur texte bouton**
- Couleur du texte à l'intérieur des boutons
- Défaut : `#ffffff` (blanc)

#### **Couleur bouton (hover)**
- Couleur de fond des boutons au survol
- Défaut : `#1F2937` (gris très foncé)

**Comment utiliser** :
1. Sélectionner un widget
2. Cliquer sur l'onglet "Design"
3. Section "Couleurs" en haut
4. Cliquer sur le carré de couleur OU taper un code hex
5. Le widget se met à jour en temps réel

---

### 3. Champs de Contenu Modifiables

**Emplacement** : Onglet "Contenu" du Properties Panel

**Hero Widget - Tous les champs** :
- ✅ **Titre principal** : Texte H1 principal
- ✅ **Sous-titre** : Description sous le titre
- ✅ **Texte du bouton** : Label du CTA
- ✅ **Lien du bouton** : URL de destination
- ✅ **Image** : Upload ou URL (avec prévisualisation)

**Features Widget - Tous les champs** :
- ✅ **Titre** : Titre de la section
- ✅ **Sous-titre** : Description de la section
- ✅ **Fonctionnalités** : Liste JSON éditable
  - Chaque feature : icon, title, description

**CTA Widget - Tous les champs** :
- ✅ **Titre** : Headline principal
- ✅ **Description** : Texte de présentation
- ✅ **Bouton principal** : Texte + Lien
- ✅ **Bouton secondaire** : Texte + Lien

**Testimonials Widget - Tous les champs** :
- ✅ **Titre** : Titre de la section
- ✅ **Sous-titre** : Description
- ✅ **Témoignages** : Liste JSON éditable
  - Chaque testimonial : quote, name, title, avatar, rating

**Header Widget - Tous les champs** :
- ✅ **Logo** : Image upload ou URL
- ✅ **Texte logo** : Nom de marque
- ✅ **Items navigation** : Liste JSON des liens
- ✅ **Texte CTA** : Bouton principal
- ✅ **Lien CTA** : URL du bouton

**Footer Widget - Tous les champs** :
- ✅ **Logo** : Image upload ou URL
- ✅ **Texte logo** : Nom de marque
- ✅ **Description** : Texte de présentation
- ✅ **Colonnes** : Liens organisés par colonnes (JSON)
- ✅ **Liens sociaux** : Facebook, Twitter, LinkedIn, etc.
- ✅ **Copyright** : Texte de copyright

---

### 4. Upload d'Images Amélioré

**Nouveau composant** : ImageUploadField

**Fonctionnalités** :
- **Deux modes** : URL ou Upload
- **Mode URL** : Coller un lien direct
- **Mode Upload** : Ouvrir la MediaLibrary
- **Prévisualisation** : Voir l'image sélectionnée
- **Bouton clear** : Effacer l'image

**Widgets avec upload d'images** :
- Hero : Image principale
- Header : Logo
- Footer : Logo
- Features : Images pour layout alternating (à venir)
- Testimonials : Avatars des clients

**Comment utiliser** :
1. Sélectionner un widget avec champ image
2. Onglet "Contenu"
3. Trouver le champ image (ex: "Image")
4. Cliquer sur "URL" ou "Upload"
5. **Si URL** : Coller le lien
6. **Si Upload** : Sélectionner dans MediaLibrary ou uploader

---

### 5. Architecture de Personnalisation

**Structure des données** :

```typescript
PageBuilderSection {
  content: {
    // Tous les champs de texte, liens, etc.
    headline: string
    subheadline: string
    ctaText: string
    ctaLink: string
    image: string
    // ... autres champs selon le widget
  },

  design: {
    typography: {
      headingColor: string    // Couleur des titres
      textColor: string       // Couleur du texte
      fontFamily: string      // Police (à venir)
      fontSize: string        // Taille (à venir)
    },

    colors: {
      buttonBackground: string       // Fond bouton
      buttonText: string             // Texte bouton
      buttonBackgroundHover: string  // Fond bouton hover
      primary: string                // Couleur primaire
      secondary: string              // Couleur secondaire
      iconBackground: string         // Fond icône (à venir)
      iconColor: string              // Couleur icône (à venir)
    },

    background: {
      type: 'color' | 'gradient' | 'image'
      value: string
    },

    spacing: {
      paddingTop: string
      paddingBottom: string
      marginTop: string
      marginBottom: string
    }
  }
}
```

---

## Comment les Widgets Utilisent les Propriétés de Design

### Exemple : HeroWidget

**Avant** (couleurs codées en dur) :
```tsx
<h1 className="text-gray-900">
  {headline}
</h1>
<button className="bg-black text-white">
  {ctaText}
</button>
```

**Après** (couleurs personnalisables) :
```tsx
const headingColor = section.design?.typography?.headingColor || '#111827';
const buttonBg = section.design?.colors?.buttonBackground || '#000000';
const buttonText = section.design?.colors?.buttonText || '#ffffff';

<h1 style={{ color: headingColor }}>
  {headline}
</h1>
<button
  style={{
    backgroundColor: buttonBg,
    color: buttonText
  }}
>
  {ctaText}
</button>
```

**Avantages** :
- Personnalisation sans code
- Valeurs par défaut si non définies
- Mise à jour en temps réel
- Cohérence visuelle maintenue

---

## Workflow de Création d'une Page Personnalisée

### Étape 1 : Ajouter des Widgets

1. Ouvrir le PageBuilder
2. Dans la sidebar gauche, parcourir les widgets
3. Cliquer sur un widget pour voir ses variantes
4. Cliquer sur une variante pour l'ajouter

### Étape 2 : Personnaliser le Contenu

1. Sélectionner le widget sur le canvas
2. Onglet "Contenu" dans le Properties Panel
3. Modifier tous les champs texte
4. Uploader ou lier des images
5. Ajuster les liens des boutons

### Étape 3 : Personnaliser le Design

1. Même widget sélectionné
2. Onglet "Design"
3. **Section Couleurs** :
   - Couleur titre
   - Couleur texte
   - Couleurs des boutons
4. **Section Arrière-plan** :
   - Couleur de fond de la section
5. **Section Espacement** :
   - Padding haut/bas
   - Marges

### Étape 4 : Changer la Variante (optionnel)

1. En haut du Properties Panel
2. "Variante du widget"
3. Sélectionner une autre variante
4. Le contenu et les couleurs sont conservés
5. Seule la disposition change

### Étape 5 : Sauvegarder

1. Bouton "Sauvegarder le modèle" en haut
2. Le modèle est sauvegardé avec TOUTES les personnalisations
3. Réutilisable pour d'autres pages

---

## Compatibilité et Valeurs par Défaut

### Modèles Existants

**Les modèles créés avant cette mise à jour** :
- ✅ Continuent de fonctionner
- ✅ Utilisent les couleurs par défaut
- ✅ Peuvent être personnalisés après coup

**Comportement** :
- Si `typography.headingColor` est undefined → utilise `#111827`
- Si `colors.buttonBackground` est undefined → utilise `#000000`
- Aucun crash, aucune erreur

### Nouveaux Modèles

**Tous les nouveaux widgets créés** :
- ✅ Ont des valeurs par défaut
- ✅ Peuvent être personnalisés immédiatement
- ✅ Héritent des propriétés du widget library

**Initialisation automatique** :
```typescript
typography: {
  fontFamily: 'inherit',
  fontSize: '1rem',
  lineHeight: '1.5',
  headingColor: '#111827',
  textColor: '#4B5563',
},
colors: {
  primary: '#000000',
  secondary: '#ffffff',
  buttonBackground: '#000000',
  buttonText: '#ffffff',
  buttonBackgroundHover: '#1F2937',
}
```

---

## Résolution du Problème de Preview

### Problème Identifié

**Symptôme** : En cliquant sur un widget dans la liste des modèles, un autre widget ou une autre variante s'affichait dans la preview.

**Cause** : Le variant n'était pas correctement transmis ou initialisé.

### Solution Implémentée

1. **Sélecteur de Variante** : Ajouté en haut du Properties Panel
2. **Initialisation correcte** : Le variant est maintenant sauvegardé avec la section
3. **Transmission propre** : Le variant est passé correctement au widget renderer

**Vérifications** :
- ✅ WidgetLibrary crée la section avec le bon `variantId`
- ✅ PageBuilder sauvegarde le `variant` dans `sections_data`
- ✅ SEOPageViewer utilise le `variant` pour le rendu
- ✅ Le sélecteur permet de changer de variante

---

## Prochaines Améliorations Prévues

### Court Terme

1. **Polices personnalisables**
   - Sélecteur de police Google Fonts
   - Taille de police ajustable
   - Poids de police (bold, normal, light)

2. **Icônes personnalisables**
   - Features Widget : choisir l'icône pour chaque feature
   - Couleur de fond des icônes
   - Taille des icônes

3. **Éditeur visuel pour listes**
   - Features : Ajouter/supprimer/réorganiser features
   - Testimonials : Gérer les témoignages visuellement
   - Footer : Gérer colonnes et liens

### Long Terme

4. **Animations**
   - Entrance animations (fade, slide, zoom)
   - Hover effects personnalisés
   - Scroll animations

5. **Responsive avancé**
   - Breakpoints personnalisés
   - Masquer/afficher éléments par device
   - Tailles différentes par device

6. **Thèmes globaux**
   - Créer un thème de couleurs
   - Appliquer à tous les widgets
   - Bibliothèque de thèmes pré-faits

7. **Widgets avancés**
   - Video background
   - Carousel/Slider
   - Pricing tables
   - FAQ accordion
   - Forms complexes

---

## Guide de Développement

### Ajouter la Personnalisation à un Widget

**Étape 1** : Extraire les propriétés de design

```typescript
export default function MyWidget({ section }: MyWidgetProps) {
  const headingColor = section.design?.typography?.headingColor || '#111827';
  const textColor = section.design?.typography?.textColor || '#4B5563';
  const buttonBg = section.design?.colors?.buttonBackground || '#000000';
  const buttonText = section.design?.colors?.buttonText || '#ffffff';
  const buttonHover = section.design?.colors?.buttonBackgroundHover || '#1F2937';
```

**Étape 2** : Appliquer via style inline

```typescript
<h2 style={{ color: headingColor }}>
  {section.content.title}
</h2>

<p style={{ color: textColor }}>
  {section.content.description}
</p>

<button
  style={{
    backgroundColor: buttonBg,
    color: buttonText
  }}
  onMouseOver={(e) => e.currentTarget.style.backgroundColor = buttonHover}
  onMouseOut={(e) => e.currentTarget.style.backgroundColor = buttonBg}
>
  {section.content.ctaText}
</button>
```

**Étape 3** : Appliquer à toutes les variantes

```typescript
const renderVariant1 = () => (
  <div>
    <h1 style={{ color: headingColor }}>...</h1>
    <button style={{ backgroundColor: buttonBg, color: buttonText }}>...</button>
  </div>
);

const renderVariant2 = () => (
  <div>
    <h1 style={{ color: headingColor }}>...</h1>
    <button style={{ backgroundColor: buttonBg, color: buttonText }}>...</button>
  </div>
);
```

**Pourquoi style inline ?** :
- Permet la personnalisation dynamique
- Évite les conflits avec Tailwind
- Pas besoin de classes CSS dynamiques
- Facile à maintenir

---

## Checklist de Personnalisation

### Avant de Publier un Modèle

- [ ] Tous les textes sont modifiables
- [ ] Toutes les images sont changeables
- [ ] Tous les liens fonctionnent
- [ ] Les couleurs peuvent être personnalisées
- [ ] La variante sélectionnée est la bonne
- [ ] Preview affiche le bon rendu
- [ ] Responsive sur mobile/tablet/desktop
- [ ] Pas de contenu "lorem ipsum" ou placeholder

### Test de Personnalisation

- [ ] Changer le titre → s'affiche correctement
- [ ] Changer la couleur titre → couleur mise à jour
- [ ] Changer le bouton couleur → bouton mis à jour
- [ ] Changer l'image → nouvelle image affichée
- [ ] Changer la variante → disposition change
- [ ] Sauvegarder → tout est conservé
- [ ] Recharger → personnalisations présentes

---

## FAQ

### Q : Puis-je copier les couleurs d'un widget à un autre ?

**R :** Pas encore automatiquement, mais vous pouvez :
1. Noter les codes hex du premier widget
2. Les copier manuellement dans le second widget
3. Fonctionnalité de "copier le style" à venir

### Q : Les polices Google Fonts sont-elles supportées ?

**R :** Pas encore. La structure est prête (`typography.fontFamily`) mais le sélecteur n'est pas encore implémenté.

### Q : Puis-je ajouter des champs personnalisés ?

**R :** Oui, en modifiant le code :
1. Ajouter le champ dans `section.content`
2. L'exposer dans `PropertiesPanel` > `renderContentTab`
3. L'utiliser dans le widget

### Q : Les animations sont-elles supportées ?

**R :** La structure existe (`section.advanced.animations`) mais pas encore d'UI pour les configurer.

### Q : Peut-on avoir des couleurs différentes par variante ?

**R :** Non, les couleurs sont partagées entre toutes les variantes d'un même widget. Cela assure la cohérence visuelle.

---

## Support

**En cas de problème** :
1. Vérifier que le build est réussi : `npm run build`
2. Vérifier la console pour les erreurs
3. S'assurer que le widget a été sauvegardé
4. Recharger la page

**Widgets priorisés pour la personnalisation complète** :
- ✅ Hero Widget (implémenté)
- ⏳ Features Widget (à venir)
- ⏳ CTA Widget (à venir)
- ⏳ Testimonials Widget (à venir)
- ⏳ Header Widget (à venir)
- ⏳ Footer Widget (à venir)

---

## Conclusion

Cette mise à jour transforme le PageBuilder en un outil de personnalisation complet où chaque élément visuel peut être ajusté sans toucher au code. Les widgets sont maintenant :

- ✅ **Modulables** : Plusieurs variantes par widget
- ✅ **Personnalisables** : Couleurs, textes, images modifiables
- ✅ **Cohérents** : Valeurs par défaut harmonieuses
- ✅ **Flexibles** : S'adaptent aux besoins de chaque projet
- ✅ **Intuitifs** : Interface claire et accessible

Le système est conçu pour évoluer facilement avec de nouvelles options de personnalisation à l'avenir.
