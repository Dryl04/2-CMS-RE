# Tâche 01 — Correction des doublons de paramètres boutons

## Taille estimée
- **Taille**: M
- **Complexité**: Moyenne (logique UI dispersée dans plusieurs éditeurs)
- **Impact**: Élevé sur l’ergonomie (réduction de confusion)

## Contexte technique observé
- Dans `PropertiesPanel`, l’édition rapide uniforme affiche déjà des champs bouton (`ctaText`, `buttonText`, `primaryCta`, `secondaryCta`, `ctaLink`, `primaryLink`, etc.).
- Plusieurs `ContentEditor` réaffichent les mêmes champs, ce qui crée des doublons visuels et de saisie pour une même valeur.
- Les labels ne sont pas toujours homogènes entre éditeurs (ex: “Texte du bouton”, “Bouton principal”, “Lien”).

## Plan d’exécution détaillé
1. **Inventorier les champs bouton par widget**
   - Extraire la liste des clés bouton réellement utilisées dans `ContentEditors.tsx` et `ContentEditors2.tsx`.
   - Produire une matrice: `widgetType -> boutonText[] / boutonLink[]`.

2. **Définir une source unique d’affichage des boutons**
   - Règle cible: soit édition rapide uniforme, soit éditeur spécifique, mais pas les deux pour les mêmes clés.
   - Préférer l’édition rapide pour les champs standards et conserver l’éditeur spécifique pour les champs avancés.

3. **Introduire un filtrage anti-doublons dans `PropertiesPanel`**
   - Ajouter une logique qui retire de l’édition rapide les clés déjà explicitement affichées dans l’éditeur spécifique du widget.
   - Garantir qu’une clé n’est rendue qu’une seule fois dans l’onglet contenu.

4. **Uniformiser les labels bouton**
   - Centraliser les labels dans un dictionnaire partagé (existant ou nouveau module léger).
   - Appliquer le même libellé pour une même clé partout.

5. **Valider manuellement les widgets prioritaires**
   - `hero`, `cta`, `header`, `videohero`, `clickfunnels-hero`, `minimal-final-cta`.
   - Vérifier qu’aucun champ bouton n’apparaît en doublon.

## Critères d’acceptation
- Un même paramètre bouton n’est visible qu’une seule fois par widget.
- Les labels de champs bouton sont cohérents entre widgets.
- Aucun changement fonctionnel de rendu côté front (seulement UX édition).
