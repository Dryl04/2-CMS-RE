# Guide Complet des Widgets

## Vue d'ensemble

Le système de widgets a été completement repense pour inclure tous les elements essentiels d'une page web professionnelle avec prevention automatique des doublons pour les widgets uniques.

## Widgets Disponibles

### 1. Header (Navigation)
**Type:** `header` | **Unique:** Oui | **Categorie:** navigation

Widget de navigation principal avec logo et menu.

**Variantes:**
- **Standard**: Layout classique avec logo à gauche, navigation au centre, CTA à droite
- **Centered**: Logo et navigation centres verticalement
- **Transparent**: Header transparent (parfait pour superposer sur hero)
- **Minimal**: Version minimaliste avec bordure subtile

**Champs editables:**
- Logo (image)
- Nom de marque (texte)
- Elements de navigation (array: label, link)
- Texte CTA (texte)
- Lien CTA (texte)

**Comportement unique:**
- Une fois ajoute, le widget Header ne peut pas etre ajoute a nouveau
- Badge "Unique" visible dans la bibliotheque
- Desactive automatiquement apres ajout

---

### 2. Hero Section
**Type:** `hero` | **Unique:** Non

Section hero pour captures d'attention immediate.

**Variantes:**
- **Classic**: Image à droite, contenu à gauche
- **Centered**: Contenu centre sans image laterale
- **Split Screen**: Ecran divise avec fond sombre
- **Minimal**: Version epuree et simple

**Champs editables:**
- Titre principal (texte)
- Sous-titre (texte)
- Texte du bouton (texte)
- Lien du bouton (texte)
- Image (image)

---

### 3. Features Section
**Type:** `features` | **Unique:** Non

Presentation des fonctionnalites en grille.

**Variantes:**
- **2 Columns**: Grille 2 colonnes
- **3 Columns**: Grille 3 colonnes
- **4 Columns**: Grille 4 colonnes
- **Alternating**: Layout alterne avec images

**Champs editables:**
- Titre de section (texte)
- Sous-titre de section (texte)
- Liste des fonctionnalites (array: icon, title, description)

---

### 4. Call to Action (CTA)
**Type:** `cta` | **Unique:** Non

Section d'appel a l'action pour conversions.

**Variantes:**
- **Banner**: Banniere pleine largeur
- **Centered Box**: Boite centree avec bordure
- **Split with Image**: Divise avec image de fond

**Champs editables:**
- Titre CTA (texte)
- Description CTA (texte)
- Bouton principal (texte)
- Lien bouton principal (texte)
- Bouton secondaire (texte, optionnel)
- Lien bouton secondaire (texte, optionnel)

---

### 5. Testimonials
**Type:** `testimonials` | **Unique:** Non

Affichage de temoignages clients.

**Variantes:**
- **Grid**: Grille de temoignages
- **Carousel**: Un temoignage mis en avant
- **Minimal**: Version minimaliste avec bordure laterale

**Champs editables:**
- Titre (texte)
- Sous-titre (texte)
- Temoignages (array: quote, name, title, avatar, rating)

**Caracteristiques:**
- Systeme d'etoiles pour les notes
- Support des avatars
- Layout responsive

---

### 6. Contact Section
**Type:** `contact` | **Unique:** Non

Section de contact avec informations et formulaire.

**Variantes:**
- **Split Layout**: Informations à gauche, formulaire à droite
- **Centered**: Tout centre avec formulaire en bas
- **Minimal**: Version epuree sans formulaire elabore

**Champs editables:**
- Titre (texte)
- Sous-titre (texte)
- Email (texte)
- Telephone (texte)
- Adresse (texte)
- Afficher formulaire (boolean)

**Caracteristiques:**
- Icones pour chaque type d'information
- Formulaire de contact integre
- Liens cliquables (mailto:, tel:)

---

### 7. Footer
**Type:** `footer` | **Unique:** Oui | **Categorie:** navigation

Pied de page avec liens et informations.

**Variantes:**
- **Standard**: Footer complet avec colonnes
- **Minimal**: Version simplifiee horizontale
- **Centered**: Tout centre verticalement

**Champs editables:**
- Logo (image)
- Nom de marque (texte)
- Description (texte)
- Colonnes de liens (array: title, links[])
- Liens sociaux (array: platform, url)
- Copyright (texte)

**Comportement unique:**
- Une fois ajoute, le widget Footer ne peut pas etre ajoute a nouveau
- Badge "Unique" visible dans la bibliotheque
- Desactive automatiquement apres ajout

**Plateformes sociales supportees:**
- Facebook
- Twitter
- Instagram
- LinkedIn
- YouTube

---

## Systeme de Prevention des Doublons

### Widgets Uniques
Les widgets marques comme "unique" (Header, Footer) ne peuvent etre ajoutes qu'une seule fois par page ou modele.

**Indicateurs visuels:**
- Badge bleu "Unique" sur le widget
- Opacite reduite (50%) quand deja ajoute
- Curseur "not-allowed"
- Message "Deja ajoute a la page"
- Icone "+" cachee

**Logique technique:**
```typescript
const existingTypes = new Set(existingSections.map(s => s.type));
const isWidgetDisabled = (widget) => {
  return widget.unique && existingTypes.has(widget.type);
};
```

### Avantages
1. **Coherence structurelle**: Une seule navigation, un seul footer
2. **UX amelioree**: Pas de confusion avec plusieurs headers
3. **SEO**: Structure de page claire et unique
4. **Performance**: Moins de widgets dupliques inutiles

---

## Workflow de Creation de Page

### 1. Choisir un Modele (Optionnel)
- Acces a la bibliotheque de modeles
- Preview des sections incluses
- Application instantanee

### 2. Ajouter des Widgets
- Parcourir la bibliotheque de widgets
- Les widgets uniques sont automatiquement desactives si deja presents
- Choisir une variante
- Le widget est ajoute au canvas

### 3. Personnaliser le Contenu
- Cliquer sur une section pour la selectionner
- Panneau de proprietes s'ouvre a droite
- Modifier le contenu, design, et options avancees

### 4. Organiser les Sections
- Drag & drop pour reordonner
- Dupliquer les sections non-uniques
- Supprimer les sections

### 5. Preview Multi-Appareils
- Toggle entre Desktop, Tablet, Mobile
- Preview en temps reel

### 6. Sauvegarder
- Sauvegarde dans la base de donnees
- Export possible en JSON/CSV

---

## Export de Modeles

Tous les widgets supportent l'export complet avec identification des champs variables.

### Champs Exportes par Widget

**Header:**
- Nom de marque, Elements de navigation, Logo, Texte/Lien CTA

**Hero:**
- Titre, Sous-titre, Texte/Lien bouton, Image

**Features:**
- Titre, Sous-titre, Liste des fonctionnalites

**CTA:**
- Titre, Description, Boutons primaire/secondaire avec liens

**Testimonials:**
- Titre, Sous-titre, Temoignages complets

**Contact:**
- Titre, Sous-titre, Email, Telephone, Adresse

**Footer:**
- Nom de marque, Description, Colonnes, Liens sociaux, Copyright, Logo

---

## Best Practices

### Structure de Page Recommandee
```
1. Header (unique)
2. Hero
3. Features
4. Testimonials (optionnel)
5. CTA
6. Contact (optionnel)
7. Footer (unique)
```

### Conseils d'Utilisation

**Header:**
- Utiliser "transparent" pour superposer sur hero avec fond
- Limiter les elements de navigation a 5-7 items
- Ajouter un CTA clair

**Hero:**
- Utiliser "centered" pour landing pages
- Utiliser "split" pour pages avec visuels forts
- Titre court et impactant (< 60 caracteres)

**Features:**
- 3 colonnes = optimal pour la plupart des cas
- Icons coherents entre features
- Descriptions concises (< 100 caracteres)

**Testimonials:**
- 3-6 temoignages ideal
- Inclure photos et titres pour credibilite
- Notes 5 etoiles uniquement pour authenticite

**Footer:**
- Grouper les liens par categories logiques
- Inclure liens legaux (Privacy, Terms)
- Copyright auto-genere si vide

---

## Architecture Technique

### Fichiers des Widgets
```
src/components/PageBuilder/Widgets/
├── HeaderWidget.tsx
├── HeroWidget.tsx
├── FeaturesWidget.tsx
├── CTAWidget.tsx
├── TestimonialsWidget.tsx
├── ContactWidget.tsx
└── FooterWidget.tsx
```

### Configuration des Widgets
`src/lib/widgetLibrary.ts` - Definition de tous les widgets avec contenu par defaut

### Rendu des Widgets
- `SectionRenderer.tsx` - Rendu dans le builder avec controles
- `SEOPageViewer.tsx` - Rendu public final sans controles

### Types
`src/lib/pageBuilderTypes.ts` - Types TypeScript pour tous les widgets

---

## Troubleshooting

**Q: Le widget Header n'apparait pas dans la liste**
R: Verifiez si un Header existe deja. Les widgets uniques sont caches s'ils sont deja presents.

**Q: Comment supprimer un Header pour en ajouter un different?**
R: Selectionnez le Header existant et cliquez sur l'icone Supprimer.

**Q: Les variantes ne s'affichent pas correctement**
R: Assurez-vous que la propriete `variant` est bien definie et correspond aux valeurs supportees.

**Q: L'export CSV ne contient pas tous les champs**
R: Seuls les champs variables sont exportes. Les proprietes de design ne sont pas incluses par defaut.
