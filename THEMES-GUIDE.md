# Guide du Système de Thèmes

Ce guide explique comment utiliser le système de gestion de thèmes centralisé pour vos pages.

## Vue d'ensemble

Le système de thèmes vous permet de :
- Gérer visuellement des thèmes modernes prédéfinis
- Créer vos propres thèmes personnalisés
- Appliquer des thèmes à vos pages et modèles
- Prévisualiser les thèmes en temps réel

## Installation de la Base de Données

Avant d'utiliser le système de thèmes, vous devez exécuter le script SQL pour créer la table `themes` :

1. Ouvrez votre projet Supabase Dashboard
2. Allez dans **SQL Editor**
3. Créez une nouvelle query
4. Copiez et collez le contenu du fichier `create_themes_system.sql`
5. Exécutez le script

Ce script créera :
- La table `themes` avec toutes les configurations
- Les politiques RLS (Row Level Security)
- 5 thèmes modernes prédéfinis

## Thèmes Prédéfinis

### 1. Modern Professional
Un design propre et professionnel avec des tons neutres. Parfait pour les sites d'entreprise et les portfolios professionnels.

**Couleurs principales :**
- Primary: Bleu (#2563eb)
- Background: Blanc
- Typography: System fonts

### 2. Bold & Dynamic
Un design énergique avec des couleurs vibrantes et un contraste fort. Idéal pour les startups et les marques dynamiques.

**Couleurs principales :**
- Primary: Rouge (#dc2626)
- Secondary: Cyan (#0891b2)
- Accent: Orange (#f59e0b)

### 3. Minimalist Elegance
Un design raffiné et minimaliste avec des accents subtils. Parfait pour les marques de luxe et les portfolios créatifs.

**Couleurs principales :**
- Primary: Noir (#18181b)
- Accent: Violet (#a855f7)
- Typography: Serif fonts

### 4. Dark Mode Premium
Un thème sombre sophistiqué avec une sensation premium. Excellent pour les applications tech et les sites modernes.

**Couleurs principales :**
- Background: Noir profond (#0a0a0a)
- Primary: Bleu (#3b82f6)
- Text: Blanc

### 5. Ocean Breeze
Un design calme et rafraîchissant inspiré des couleurs de l'océan. Idéal pour les sites de bien-être et de voyage.

**Couleurs principales :**
- Primary: Cyan (#0891b2)
- Background: Menthe clair (#f0fdfa)
- Accent: Turquoise (#14b8a6)

## Utilisation du Gestionnaire de Thèmes

### Accès
1. Connectez-vous à votre application
2. Depuis le tableau de bord, cliquez sur **"Thèmes visuels"**
3. Vous verrez tous les thèmes disponibles

### Actions Disponibles

#### Prévisualiser un Thème
- Cliquez sur le bouton **"Preview"** sur n'importe quel thème
- Le thème sera défini comme thème actuel pour la prévisualisation

#### Dupliquer un Thème
- Cliquez sur l'icône **"Copy"** sur n'importe quel thème
- Donnez un nom et une description à votre nouveau thème
- Le thème sera créé comme une copie que vous pourrez personnaliser plus tard

#### Supprimer un Thème Personnalisé
- Seuls les thèmes que vous avez créés peuvent être supprimés
- Les thèmes système sont protégés et ne peuvent pas être supprimés
- Cliquez sur l'icône **"Trash"** pour supprimer un thème personnalisé

## Appliquer un Thème à une Page

### Dans le Page Builder
1. Ouvrez le Page Builder (Modèles de pages)
2. Créez un nouveau modèle ou éditez-en un existant
3. Dans la barre d'outils supérieure, vous verrez un sélecteur de thème avec l'icône palette
4. Sélectionnez le thème désiré dans le menu déroulant
5. Enregistrez votre modèle

Le thème sera automatiquement appliqué à toutes les pages créées avec ce modèle.

## Structure d'un Thème

Chaque thème contient :

### Couleurs (`colors`)
```json
{
  "primary": "#2563eb",
  "secondary": "#64748b",
  "accent": "#0ea5e9",
  "background": "#ffffff",
  "surface": "#f8fafc",
  "text": "#0f172a",
  "textSecondary": "#475569",
  "border": "#e2e8f0",
  "success": "#10b981",
  "warning": "#f59e0b",
  "error": "#ef4444"
}
```

### Typographie (`typography`)
```json
{
  "fontFamily": "system-ui, -apple-system, sans-serif",
  "fontSize": {
    "xs": "0.75rem",
    "sm": "0.875rem",
    "base": "1rem",
    "lg": "1.125rem",
    "xl": "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem"
  },
  "fontWeight": {
    "normal": "400",
    "medium": "500",
    "semibold": "600",
    "bold": "700"
  },
  "lineHeight": {
    "tight": "1.2",
    "normal": "1.5",
    "relaxed": "1.75"
  }
}
```

### Espacement (`spacing`)
```json
{
  "scale": [
    "0",
    "0.25rem",
    "0.5rem",
    "0.75rem",
    "1rem",
    "1.5rem",
    "2rem",
    "3rem",
    "4rem",
    "6rem",
    "8rem"
  ]
}
```

### Composants (`components`)
```json
{
  "borderRadius": {
    "sm": "0.25rem",
    "md": "0.5rem",
    "lg": "0.75rem",
    "xl": "1rem"
  },
  "shadow": {
    "sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    "md": "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    "lg": "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    "xl": "0 20px 25px -5px rgb(0 0 0 / 0.1)"
  }
}
```

## Personnalisation Avancée

### Créer un Thème Personnalisé

Pour créer un thème complètement personnalisé, vous devrez :

1. Dupliquer un thème existant comme point de départ
2. Modifier directement les valeurs dans la base de données via Supabase Dashboard
3. Ou étendre le composant ThemeManager pour ajouter un éditeur de thème visuel

### Modifier les Valeurs d'un Thème

Vous pouvez modifier les valeurs d'un thème personnalisé en :
1. Accédant à Supabase Dashboard
2. Ouvrant la table `themes`
3. Éditant les colonnes JSON (colors, typography, spacing, components)

**Note :** Seuls les thèmes que vous avez créés peuvent être modifiés. Les thèmes système (`is_default = true` et `user_id = null`) sont en lecture seule.

## Sécurité (RLS)

Le système de thèmes utilise Row Level Security pour garantir :
- Tous les utilisateurs authentifiés peuvent voir tous les thèmes
- Seuls les utilisateurs peuvent créer leurs propres thèmes
- Les utilisateurs ne peuvent modifier/supprimer que leurs propres thèmes
- Les thèmes système sont protégés et ne peuvent être modifiés par personne

## Intégration Programmatique

### Utiliser le Hook useTheme

```typescript
import { useTheme } from '../contexts/ThemeContext';

function MyComponent() {
  const {
    currentTheme,
    themes,
    setCurrentTheme,
    createTheme,
    updateTheme,
    deleteTheme,
    applyThemeToPage
  } = useTheme();

  // Utiliser le thème actuel
  const primaryColor = currentTheme?.colors.primary;

  // Changer de thème
  const handleThemeChange = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme) setCurrentTheme(theme);
  };

  return (
    <div style={{ backgroundColor: primaryColor }}>
      {/* Votre contenu */}
    </div>
  );
}
```

### Appliquer un Thème à une Page

```typescript
import { useTheme } from '../contexts/ThemeContext';

function PageEditor({ pageId }: { pageId: string }) {
  const { applyThemeToPage } = useTheme();

  const handleApplyTheme = async (themeId: string) => {
    try {
      await applyThemeToPage(pageId, themeId);
      console.log('Theme applied successfully');
    } catch (error) {
      console.error('Error applying theme:', error);
    }
  };

  return (
    // Your component
  );
}
```

## Support

Pour toute question ou problème avec le système de thèmes :
1. Vérifiez que le script SQL a été exécuté correctement
2. Assurez-vous que les thèmes prédéfinis sont présents dans la base de données
3. Vérifiez les politiques RLS dans Supabase Dashboard
4. Consultez les logs du navigateur pour les erreurs éventuelles
