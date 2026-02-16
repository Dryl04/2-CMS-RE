# Guide du CSS Personnalisé dans les Thèmes

## Vue d'ensemble

Le système de thèmes prend maintenant en charge le **CSS personnalisé**, vous permettant d'ajouter vos propres styles CSS à n'importe quel thème personnalisé. Cette fonctionnalité vous offre un contrôle total sur l'apparence de vos pages.

## Fonctionnalités

- Éditeur CSS intégré dans le Theme Manager
- Injection automatique du CSS dans toutes les pages utilisant le thème
- Syntaxe CSS complète avec support des animations, media queries, etc.
- Prévisualisation en temps réel
- Exemples de code CSS fournis

## Utilisation

### 1. Créer un Thème Personnalisé

Avant d'ajouter du CSS personnalisé, vous devez créer votre propre thème :

1. Allez dans **Thèmes visuels**
2. Trouvez un thème système qui vous plaît
3. Cliquez sur l'icône **Copy** (dupliquer)
4. Donnez un nom à votre nouveau thème
5. Cliquez sur **Create Theme**

### 2. Éditer le CSS

Une fois votre thème créé :

1. Trouvez votre thème personnalisé dans la liste
2. Cliquez sur l'icône **</> Code** (Edit CSS)
3. L'éditeur CSS s'ouvre

### 3. Écrire du CSS

Dans l'éditeur, vous pouvez écrire n'importe quel CSS valide :

```css
/* Exemple : Personnaliser tous les boutons */
.btn, button {
  border-radius: 12px;
  transition: all 0.3s ease;
  font-weight: 600;
}

/* Ajouter des effets au survol */
.btn:hover, button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

/* Créer une animation personnalisée */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animated-card {
  animation: slideIn 0.6s ease-out;
}

/* Styles responsives */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
}

/* Personnaliser les widgets spécifiques */
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 80px 20px;
}

.features-grid {
  gap: 2rem;
}

/* Modifier les cartes */
.card {
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.card:hover {
  transform: scale(1.02);
}
```

### 4. Enregistrer et Tester

1. Cliquez sur **Enregistrer**
2. Le CSS est appliqué immédiatement
3. Prévisualisez en cliquant sur **Preview** sur votre thème
4. Testez sur différentes pages pour vérifier l'apparence

## Exemples de Cas d'Usage

### Thème Glassmorphism

```css
/* Effet de verre moderne */
.card, .widget {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
}

.header {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
}
```

### Animations Subtiles

```css
/* Animation d'apparition au scroll */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section {
  animation: fadeInUp 0.8s ease-out;
}

/* Effet de brillance sur les boutons */
@keyframes shine {
  to {
    background-position: 200% center;
  }
}

.btn-primary {
  background: linear-gradient(
    90deg,
    #667eea 0%,
    #764ba2 50%,
    #667eea 100%
  );
  background-size: 200% auto;
  animation: shine 3s linear infinite;
}
```

### Thème Néomorphism

```css
/* Style néomorphique */
.card {
  background: #e0e5ec;
  border-radius: 20px;
  box-shadow: 9px 9px 16px rgba(163, 177, 198, 0.6),
              -9px -9px 16px rgba(255, 255, 255, 0.5);
}

.btn {
  background: #e0e5ec;
  box-shadow: 5px 5px 10px rgba(163, 177, 198, 0.6),
              -5px -5px 10px rgba(255, 255, 255, 0.5);
}

.btn:active {
  box-shadow: inset 5px 5px 10px rgba(163, 177, 198, 0.6),
              inset -5px -5px 10px rgba(255, 255, 255, 0.5);
}
```

### Typographie Avancée

```css
/* Importer une police Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap');

/* Appliquer la police */
h1, h2, h3 {
  font-family: 'Playfair Display', serif;
  letter-spacing: -0.02em;
}

/* Effet de dégradé sur le texte */
.gradient-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Ombre portée élégante */
.hero-title {
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
```

## Bonnes Pratiques

### 1. Sélecteurs Spécifiques
Utilisez des sélecteurs spécifiques pour éviter les conflits :

```css
/* Bien */
.my-theme .card { }
.page-hero .title { }

/* À éviter */
div { }
* { }
```

### 2. Préfixes pour les Animations
Utilisez des noms uniques pour vos animations :

```css
@keyframes myTheme-slideIn { }
@keyframes myTheme-fadeOut { }
```

### 3. Variables CSS
Utilisez les variables CSS pour une meilleure maintenance :

```css
:root {
  --my-primary: #667eea;
  --my-spacing: 2rem;
  --my-radius: 12px;
}

.card {
  border-radius: var(--my-radius);
  padding: var(--my-spacing);
}
```

### 4. Media Queries
Assurez-vous que vos styles sont responsives :

```css
/* Mobile first */
.hero {
  padding: 2rem 1rem;
}

@media (min-width: 768px) {
  .hero {
    padding: 4rem 2rem;
  }
}

@media (min-width: 1024px) {
  .hero {
    padding: 6rem 3rem;
  }
}
```

### 5. Performance
Évitez les sélecteurs trop complexes :

```css
/* Bien */
.widget-card { }

/* À éviter */
div > div > div > div .card { }
```

## Restrictions et Limitations

### Ce qui est supporté :
- Toutes les propriétés CSS standard
- Animations et transitions
- Media queries
- Pseudo-classes et pseudo-éléments
- Variables CSS
- Imports de polices externes
- Flexbox et Grid

### Limitations :
- Le CSS est appliqué globalement à toutes les pages utilisant le thème
- Pas de préprocesseurs (SASS, LESS) - uniquement du CSS pur
- Les thèmes système ne peuvent pas être modifiés (vous devez les dupliquer)
- Le CSS n'est pas validé automatiquement - testez toujours vos modifications

## Débogage

### Utiliser les Outils de Développement

1. Ouvrez les DevTools (F12)
2. Allez dans l'onglet Elements/Inspecteur
3. Cherchez `<style id="theme-custom-css">` dans le `<head>`
4. Vérifiez que votre CSS y est bien présent

### Vérifier l'Application du CSS

Si votre CSS ne s'applique pas :

1. **Vérifiez la spécificité** : Votre sélecteur doit être assez spécifique
2. **Inspectez l'élément** : Vérifiez si d'autres styles le surchargent
3. **Testez la syntaxe** : Assurez-vous qu'il n'y a pas d'erreurs de syntaxe
4. **Rechargez la page** : Le CSS est injecté au chargement

## Exemples Avancés

### Thème avec Mode Sombre Automatique

```css
/* Adaptation automatique au mode sombre du système */
@media (prefers-color-scheme: dark) {
  .card {
    background: #1a1a1a;
    color: #ffffff;
  }

  .header {
    background: #0a0a0a;
  }
}
```

### Transitions Fluides

```css
/* Transitions globales fluides */
* {
  transition: background-color 0.3s ease,
              color 0.3s ease,
              border-color 0.3s ease;
}

/* Désactiver les transitions pendant le chargement */
.loading * {
  transition: none !important;
}
```

### Effet Parallaxe Simple

```css
.parallax-section {
  background-attachment: fixed;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}
```

## Support

Si vous rencontrez des problèmes :
1. Vérifiez la console du navigateur pour les erreurs CSS
2. Testez votre CSS dans l'inspecteur d'abord
3. Assurez-vous que le thème est bien appliqué à la page
4. Vérifiez que vous avez enregistré vos modifications

Le CSS personnalisé vous donne un contrôle total sur l'apparence de vos pages tout en conservant la structure du thème de base.
