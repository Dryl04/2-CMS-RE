# Tâche 06 — Correction des doublons de paramètres de textes (contenu)

## Taille estimée
- **Taille**: M
- **Complexité**: Moyenne
- **Impact**: Élevé sur la clarté de l’éditeur

## Contexte technique observé
- `renderUniformQuickEdit` affiche titres/paragraphes standards (`headline`, `title`, `subtitle`, `description`, etc.).
- Plusieurs éditeurs spécifiques réaffichent ces mêmes champs.
- Les utilisateurs peuvent modifier la même donnée à deux endroits différents.

## Plan d’exécution détaillé
1. **Cartographier les champs texte par widget**
   - Identifier les recouvrements entre quick edit et éditeurs spécifiques.

2. **Appliquer une règle anti-doublon unifiée**
   - Même principe que pour les boutons: un champ texte = un seul emplacement d’édition.

3. **Conserver les champs spécifiques métier**
   - Ne retirer des éditeurs spécifiques que les champs réellement standards.
   - Garder les structures avancées (tableaux, blocs complexes, trust badges, etc.).

4. **Harmoniser labels + ordre de lecture**
   - Alignement avec le glossaire canonique (tâche 02).

5. **Validation fonctionnelle**
   - Vérifier que toute donnée texte reste éditable au moins une fois.

## Critères d’acceptation
- Plus de doublons visuels pour les champs texte standards.
- Les champs avancés restent disponibles.
- Aucune perte de donnée lors de l’édition/sauvegarde.
