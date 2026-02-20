# Guide d'utilisation — Priorités de personnalisation Widgets

Ce guide décrit l’ordre de priorité appliqué dans les widgets, pour éviter les incohérences de rendu.

## 1) Priorité des polices

Ordre appliqué (du plus prioritaire au moins prioritaire) :

1. Réglage spécifique H1/H2 du widget (`H1/H2`)
2. Réglage global des titres du widget (`Titres`)
3. Police globale du widget (`Police globale`)
4. Police du thème de page / thème Daisy actif

Concrètement :

- si `H2` est défini, il prime sur `Titres` et `Police globale`.
- si `H2` n’est pas défini, `Titres` est utilisé.
- si `Titres` n’est pas défini, `Police globale` est utilisée.

## 2) Priorité des couleurs

Ordre appliqué :

1. Couleur spécifique élément (`H1`, `H2`, boutons, icônes)
2. Couleur de groupe (`Couleur titres`, `Couleur texte`)
3. Couleur dominante (`Couleur Dominante`)
4. Thème actif (hérité)

## 3) Boutons (uniformisés)

Les contrôles de boutons sont communs à tous les widgets :

- Couleur bouton
- Couleur texte bouton
- Couleur bouton hover
- Rayon (arrondi)
- Taille
- Bordure (type, épaisseur, couleur)

Si un widget contient plusieurs boutons, le design s’applique à tous les boutons du widget.

## 4) Icônes (uniformisées)

Section dédiée `Icônes` :

- Couleur contenu icône
- Couleur fond icône
- Couleur contour icône
- Épaisseur contour

## 5) Images & vidéos

Section dédiée `Images & vidéos` :

- Arrondi des médias
- Overlay image (ex: logo)
- Position overlay
- Taille overlay

## 6) Arrière-plan Header

Pour les widgets de type Header, la couleur de fond définie dans `Design > Arrière-plan` est prioritaire sur le fond interne du composant.

## 7) Bonnes pratiques

- Commencer par le thème (global), puis affiner au niveau widget.
- Utiliser les réglages spécifiques (`H1`, `H2`) uniquement si nécessaire.
- Garder `Couleur Dominante` cohérente entre widgets d’une même page.
- Utiliser `Tout réinitialiser` pour revenir à l’héritage du thème en cas de conflits visuels.
