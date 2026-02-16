# Guide d'Export des Modèles

## Vue d'ensemble

Les modèles de pages peuvent être exportés en **JSON** ou **CSV** avec identification automatique de tous les champs variables/modifiables.

## Champs Variables Détectés

Le système identifie automatiquement les champs variables dans chaque type de section :

### Section Hero
- **Titre principal** (`content.headline`) - Texte
- **Sous-titre** (`content.subheadline`) - Texte
- **Texte du bouton** (`content.ctaText`) - Texte
- **Lien du bouton** (`content.ctaLink`) - Texte
- **Image** (`content.image`) - URL d'image (si présente)

### Section Features
- **Titre de section** (`content.title`) - Texte
- **Sous-titre de section** (`content.subtitle`) - Texte
- **Liste des fonctionnalités** (`content.features`) - Tableau d'objets

### Section CTA (Call-to-Action)
- **Titre CTA** (`content.headline`) - Texte
- **Description CTA** (`content.description`) - Texte
- **Bouton principal** (`content.primaryCta`) - Texte
- **Lien bouton principal** (`content.primaryLink`) - Texte
- **Bouton secondaire** (`content.secondaryCta`) - Texte (si présent)
- **Lien bouton secondaire** (`content.secondaryLink`) - Texte (si présent)

## Export JSON

### Structure du fichier JSON
```json
{
  "template": {
    "id": "uuid",
    "name": "Nom du modèle",
    "description": "Description",
    "created_at": "2026-02-13..."
  },
  "sections": [...],
  "variables": [
    {
      "sectionId": "section-123",
      "sectionType": "hero",
      "fieldPath": "content.headline",
      "fieldLabel": "Titre principal",
      "fieldType": "text",
      "currentValue": "Bienvenue sur notre site"
    }
  ]
}
```

### Utilisation
1. Depuis la page **Modèles**, survolez le bouton **Télécharger** sur un modèle
2. Cliquez sur **JSON**
3. Le fichier sera téléchargé avec le nom `nom-du-modele.json`

## Export CSV

### Structure du fichier CSV
```
Section ID,Section Type,Field Path,Field Label,Field Type,Current Value
section-123,hero,content.headline,Titre principal,text,"Bienvenue sur notre site"
section-123,hero,content.subheadline,Sous-titre,text,"Découvrez nos services"
```

### Utilisation
1. Depuis la page **Modèles**, survolez le bouton **Télécharger** sur un modèle
2. Cliquez sur **CSV**
3. Le fichier sera téléchargé avec le nom `nom-du-modele.csv`

### Modification du CSV
1. Ouvrez le fichier dans Excel, Google Sheets ou un éditeur de texte
2. Modifiez les valeurs dans la colonne **Current Value**
3. Enregistrez le fichier

## Création de Pages depuis un Modèle

### Workflow
1. Allez dans **Pages** > **Créer une page**
2. À l'étape 1, choisissez un modèle
3. Les sections du modèle sont copiées dans la page
4. Configurez l'URL (domaine auto-détecté, page parente optionnelle)
5. Remplissez les métadonnées SEO
6. Sauvegardez

### Configuration de l'URL
- **Nom de domaine** : Détecté automatiquement depuis l'URL actuelle
- **Page parente** : Sélectionnez une page existante ou créez un nouveau chemin
- **Slug** : Identifiant unique de la page (ex: "a-propos", "contact")

### Exemple de hiérarchie
```
/                          (page racine)
/blog                      (page parent)
/blog/article-1            (page enfant)
/blog/article-2            (page enfant)
/produits                  (page parent)
/produits/service-web      (page enfant)
```

## Organisation Hiérarchique des Pages

Le système permet de créer une structure hiérarchique de pages :

### Sélection de Page Parente
Deux options sont disponibles :
1. **Choisir une page existante** - Dropdown avec toutes les pages disponibles
2. **Créer un nouveau chemin parent** - Saisissez un chemin personnalisé (ex: `blog/categorie`)

### Avantages
- Organisation claire du contenu
- URLs structurées et SEO-friendly
- Navigation hiérarchique facilitée
- Meilleure maintenabilité

## Cas d'Usage

### 1. Création en masse de pages similaires
1. Créez un modèle avec la structure de base
2. Exportez-le en CSV
3. Dupliquez les lignes dans le CSV pour chaque page
4. Modifiez les valeurs pour chaque variation
5. Importez les données dans l'application

### 2. Traduction de contenu
1. Exportez un modèle en CSV
2. Envoyez le CSV à un traducteur
3. Le traducteur remplit une nouvelle colonne avec les traductions
4. Créez de nouvelles pages avec le contenu traduit

### 3. Versioning et backup
1. Exportez régulièrement vos modèles en JSON
2. Conservez les versions dans un système de gestion de versions
3. Restaurez les versions précédentes si nécessaire

## Notes Techniques

- Les exports incluent uniquement les champs **variables/éditables**
- Les propriétés de design (couleurs, espacements) ne sont pas exportées
- La structure des sections (ordre, type, variant) est préservée
- Les exports sont générés côté client (pas de traitement serveur)
