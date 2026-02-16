# Guide d'Intégration des Thèmes DaisyUI

## Principe de Propagation du Thème

Le système de thèmes fonctionne selon une **hiérarchie stricte** :

1. **Thème Global DaisyUI** (via `data-theme` sur l'élément racine)
2. **Thème par Section** (via `data-theme` sur le conteneur de section)
3. **Overrides Personnalisés** (via styles inline quand explicitement définis)

## Règles Critiques pour les Widgets

### ✅ BON : Laisser DaisyUI hériter

```tsx
// Utiliser les classes DaisyUI natives
<div className="bg-primary text-primary-content">
  <h2 className="text-base-content">Titre</h2>
</div>

// Appliquer les overrides SEULEMENT si définis
const headingColor = section.design?.typography?.headingColor;
<h2 
  className="text-base-content" 
  style={headingColor ? { color: headingColor } : undefined}
>
```

### ❌ MAUVAIS : Forcer des valeurs undefined

```tsx
// ❌ Ceci écrase TOUJOURS la classe DaisyUI même si accentColor est undefined
<div style={{ backgroundColor: accentColor }}>

// ❌ Ceci force toujours un style même vide
<div style={{ color: headingColor || undefined }}>
```

### ✅ CORRECT : Condition stricte

```tsx
// ✅ Style appliqué SEULEMENT si la valeur existe
<div style={accentColor ? { backgroundColor: accentColor } : undefined}>

// ✅ Pas de || undefined nécessaire
const headingColor = section.design?.typography?.headingColor;
```

## Anatomie d'un Widget Bien Intégré

```tsx
export default function MyWidget({ section }: WidgetProps) {
  // 1. Extraction des overrides (PAS de fallback)
  const headingColor = section.design?.typography?.headingColor;
  const textColor = section.design?.typography?.textColor;
  const accentColor = section.design?.colors?.accent;

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* 2. Classes DaisyUI en priorité */}
      <h2 
        className="text-3xl font-bold text-base-content"
        style={headingColor ? { color: headingColor } : undefined}
      >
        {title}
      </h2>
      
      {/* 3. Classes sémantiques DaisyUI */}
      <p className="text-base-content/70" style={textColor ? { color: textColor } : undefined}>
        {subtitle}
      </p>
      
      {/* 4. Boutons et composants */}
      <button 
        className="btn btn-primary"
        style={accentColor ? { backgroundColor: accentColor } : undefined}
      >
        Action
      </button>
    </div>
  );
}
```

## Classes DaisyUI Essentielles

| Élément | Classe DaisyUI | Description |
|---------|---------------|-------------|
| Texte principal | `text-base-content` | Couleur de texte principale du thème |
| Texte secondaire | `text-base-content/70` | Texte atténué (70% opacité) |
| Fond principal | `bg-base-100` | Fond principal |
| Fond secondaire | `bg-base-200` | Fond légèrement différent |
| Fond tertiaire | `bg-base-300` | Fond encore plus contrasté |
| Bordures | `border-base-content/10` | Bordures subtiles |
| Primaire | `bg-primary text-primary-content` | Boutons/éléments d'action |
| Secondaire | `bg-secondary text-secondary-content` | Boutons secondaires |
| Accent | `bg-accent text-accent-content` | Éléments d'emphase |

## Propagation du Thème dans les Sections

Le composant `SectionRenderer` applique automatiquement le thème :

```tsx
<div
  data-theme={widgetTheme.dataTheme}
  style={{
    backgroundColor: section.design.background.type === 'color' ? section.design.background.value : undefined,
    paddingTop: section.design.spacing.paddingTop,
    paddingBottom: section.design.spacing.paddingBottom,
    ...widgetTheme.customStyles,
  }}
>
  <WidgetComponent section={section} />
</div>
```

## Checklist de Validation d'un Widget

- [ ] Utilise des classes DaisyUI (`text-base-content`, `bg-base-100`, etc.)
- [ ] Les overrides sont conditionnels : `style={value ? { prop: value } : undefined}`
- [ ] Pas de `|| undefined` dans les extractions de couleurs
- [ ] Pas de valeurs hardcodées (`#000000`, `white`, etc.) sauf dans les defaults de widgetLibrary
- [ ] Teste le switch de thème : tous les éléments doivent changer

## Debugging d'un Widget qui ne Réagit Pas au Thème

1. **Vérifier les styles inline** : Chercher des `style={{ color: ... }}` inconditionnels
2. **Vérifier les classes Tailwind statiques** : `bg-white`, `text-gray-900` au lieu de `bg-base-100`, `text-base-content`
3. **Inspecter le DOM** : Le `data-theme` est-il présent sur le conteneur parent ?
4. **Console du navigateur** : Vérifier les CSS custom properties (`--p`, `--bc`, etc.)

## Exemple de Correction Typique

### Avant (Problématique)
```tsx
const accentColor = section.design?.colors?.accent || undefined;
<Check className="text-primary" style={{ color: accentColor }} />
```

### Après (Corrigé)
```tsx
const accentColor = section.design?.colors?.accent;
<Check className="text-primary" style={accentColor ? { color: accentColor } : undefined} />
```

---

**Date de dernière mise à jour** : 16 février 2026
**Contexte** : Correction de la propagation des thèmes DaisyUI sur tous les widgets
