# Tâche 02 — Meilleure nomination des paramètres widgets

## Taille estimée
- **Taille**: L
- **Complexité**: Moyenne à élevée (dette historique de clés hétérogènes)
- **Impact**: Élevé (lisibilité, maintenabilité, onboarding)

## Contexte technique observé
- Les clés content sont hétérogènes selon widgets: `headline`, `title`, `subheadline`, `subtitle`, `ctaText`, `buttonText`, `primaryCta`, etc.
- Une normalisation partielle existe déjà via `UNIFORM_FIELD_LABELS` dans `PropertiesPanel`, mais elle ne couvre pas toute l’UX.
- Renommer les clés métier en base peut casser la compatibilité; la priorité est d’abord l’uniformisation d’affichage.

## Plan d’exécution détaillé
1. **Construire un glossaire canonique des paramètres**
   - Définir des concepts UI stables: `Titre principal`, `Sous-titre`, `Texte bouton principal`, `Lien bouton principal`, etc.
   - Mapper les clés existantes vers ces concepts.

2. **Centraliser les labels dans un registre unique**
   - Créer un module dédié (ex: `src/lib/widgetFieldLabels.ts`) pour éviter la duplication locale.
   - Réutiliser ce registre dans `PropertiesPanel` + éditeurs de contenu.

3. **Standardiser les libellés dans les éditeurs**
   - Remplacer les libellés divergents par les labels canoniques.
   - Conserver les clés existantes en stockage (pas de migration immédiate).

4. **Préparer une phase 2 optionnelle de normalisation des clés**
   - Si souhaité: ajouter une couche d’adaptation (`legacy key aliases`) au chargement/sauvegarde.
   - Ne pas migrer la data tant que la stratégie n’est pas validée.

5. **Validation**
   - Parcourir les widgets majeurs et vérifier cohérence terminologique complète.

## Critères d’acceptation
- Un même concept a le même nom partout dans l’éditeur.
- Aucun changement de format de données en base dans cette phase.
- Régression zéro sur le rendu des widgets existants.
