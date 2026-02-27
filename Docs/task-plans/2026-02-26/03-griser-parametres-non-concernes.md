# Tâche 03 — Masquer les paramètres non concernés par le widget

## Taille estimée
- **Taille**: M/L
- **Complexité**: Moyenne (nécessite une matrice de capacités fiable)
- **Impact**: Élevé UX (moins d’erreurs de configuration)

## Contexte technique observé
- Les sections design (`Typographie`, `Boutons`, `Icônes`, `Images & vidéos`, `Arrière-plan`) sont largement affichées de façon générique.
- Certains widgets n’utilisent pas certaines options mais ces options restent éditables.

## Plan d’exécution détaillé
1. **Scanner exhaustivement chaque widget**
   - Parcourir tous les widgets de la librairie et lister précisément les champs réellement supportés (content + design).
   - Produire une matrice complète `widgetType -> paramètres autorisés` (pas d’approximation par famille uniquement).

2. **Introduire une matrice de capacités par widget**
   - Ajouter une configuration `widgetCapabilities` (ou enrichir `widgetLibrary`) issue du scan exhaustif.
   - Exemples: `supportsH1`, `supportsH2`, `supportsButtonStyle`, `supportsMediaOverlayOnSection`, `supportsMediaOverlayOnFrame`, `supportsBackgroundVideo`, etc.

3. **Brancher `PropertiesPanel` sur la matrice avec masquage total**
   - Pour chaque contrôle non applicable: ne pas le rendre du tout.
   - Conserver uniquement les contrôles effectivement pertinents pour le widget sélectionné.

4. **Conserver silencieusement les anciennes valeurs non applicables**
   - Ne pas purger les champs historiques déjà enregistrés.
   - Ajouter des garde-fous UI pour éviter de modifier ces champs tant qu’ils sont hors périmètre.

5. **Validation widget par widget**
   - Vérification systématique par widget (et non uniquement par familles globales).
   - Cas explicitement contrôlés: paramètres H1/H2 sur widgets textuels, paramètres image sur widgets sans média, etc.

## Critères d’acceptation
- Les paramètres non applicables sont totalement masqués.
- Les valeurs historiques non applicables restent conservées en base/JSON sans purge.
- Aucune écriture de champs hors périmètre du widget depuis l’UI.
- Le mapping est validé widget par widget.
