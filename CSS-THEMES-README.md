# Thèmes avec CSS Personnalisé

## Nouvelle Fonctionnalité Ajoutée

Le système de thèmes prend maintenant en charge le **CSS personnalisé**, permettant une personnalisation complète de l'apparence de vos pages.

## Qu'est-ce qui a été ajouté ?

### 1. Colonne `custom_css` dans la base de données
- Champ texte dans la table `themes` pour stocker le CSS personnalisé
- Mise à jour automatique via le script SQL

### 2. Éditeur CSS Intégré
- Interface visuelle pour écrire du CSS
- Éditeur de code avec coloration syntaxique
- Exemples de code fournis
- Conseils et bonnes pratiques affichés

### 3. Injection Automatique du CSS
- Composant `ThemeStyleInjector` qui injecte le CSS dans la page
- Application automatique quand un thème est sélectionné
- Mise à jour en temps réel lors du changement de thème

### 4. Interface Utilisateur
- Bouton "Edit CSS" sur les thèmes personnalisés (icône `</>`)
- Uniquement disponible pour les thèmes non-système
- Modal d'édition avec zone de texte large

## Comment Utiliser

### Configuration Initiale

Si vous n'avez pas encore configuré les thèmes, suivez d'abord `SETUP-COMPLETE.md`.

Si la table `themes` existe déjà, ajoutez la colonne `custom_css` :

```sql
-- Dans Supabase SQL Editor
ALTER TABLE themes ADD COLUMN IF NOT EXISTS custom_css text DEFAULT '';
```

Ou utilisez simplement le bouton dans l'interface qui copiera le SQL mis à jour.

### Utilisation Quotidienne

1. **Créer un thème personnalisé** :
   - Allez dans **Thèmes visuels**
   - Dupliquez un thème existant
   - Nommez votre nouveau thème

2. **Ajouter du CSS** :
   - Cliquez sur l'icône **</>** (Edit CSS) sur votre thème
   - Écrivez votre CSS dans l'éditeur
   - Cliquez sur **Enregistrer**

3. **Appliquer le thème** :
   - Dans le Page Builder, sélectionnez votre thème
   - Le CSS sera automatiquement appliqué

## Structure des Fichiers

### Nouveaux Fichiers
- `src/components/ThemeStyleInjector.tsx` - Injecte le CSS dans la page
- `src/components/ThemeCSSEditor.tsx` - Éditeur CSS modal
- `CUSTOM-CSS-GUIDE.md` - Guide détaillé avec exemples

### Fichiers Modifiés
- `create_themes_system.sql` - Ajout de la colonne `custom_css`
- `src/lib/themeTypes.ts` - Ajout du champ dans l'interface Theme
- `src/lib/defaultThemes.ts` - Ajout de `custom_css: null` aux thèmes par défaut
- `src/lib/setupThemes.ts` - Mise à jour du script SQL
- `src/components/ThemeManager.tsx` - Ajout du bouton Edit CSS
- `src/App.tsx` - Intégration du ThemeStyleInjector

## Exemples de CSS

### Personnaliser les Boutons
```css
.btn, button {
  border-radius: 12px;
  transition: transform 0.3s ease;
}

.btn:hover {
  transform: translateY(-2px);
}
```

### Ajouter des Animations
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.section {
  animation: fadeIn 0.5s ease-out;
}
```

### Effet Glassmorphism
```css
.card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

Consultez `CUSTOM-CSS-GUIDE.md` pour des exemples plus avancés.

## Limitations

- Uniquement disponible pour les thèmes personnalisés (pas les thèmes système)
- Le CSS doit être valide (pas de validation automatique)
- S'applique globalement à toutes les pages utilisant le thème
- Pas de support pour les préprocesseurs (SASS, LESS)

## Avantages

- **Contrôle Total** : Écrivez n'importe quel CSS valide
- **Flexibilité** : Animations, transitions, media queries, etc.
- **Isolation** : Chaque thème a son propre CSS
- **Temps Réel** : Changements appliqués immédiatement
- **Sécurisé** : Les thèmes système restent protégés

## Migration

Si vous avez déjà des thèmes créés :

1. Exécutez la migration SQL pour ajouter la colonne
2. Vos thèmes existants auront `custom_css` vide par défaut
3. Aucune autre action nécessaire

## Documentation

- `CUSTOM-CSS-GUIDE.md` - Guide complet avec exemples détaillés
- `THEMES-GUIDE.md` - Guide général du système de thèmes
- `SETUP-COMPLETE.md` - Instructions de configuration initiale

## Support CSS

Le CSS personnalisé supporte :
- Toutes les propriétés CSS modernes
- Animations et keyframes
- Media queries
- Pseudo-classes et pseudo-éléments
- Variables CSS (`:root`)
- Imports de polices Google Fonts
- Flexbox et Grid
- Transitions

## Prochaines Étapes

Après avoir configuré le CSS :

1. Testez vos styles sur différentes pages
2. Utilisez les DevTools pour déboguer
3. Créez plusieurs variations de thèmes
4. Partagez vos thèmes avec votre équipe

Pour plus d'informations, consultez le guide complet `CUSTOM-CSS-GUIDE.md`.
