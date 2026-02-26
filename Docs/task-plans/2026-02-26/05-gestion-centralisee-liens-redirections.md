# Tâche 05 — Gestion centralisée des liens et redirections automatiques

## Taille estimée
- **Taille**: XL
- **Complexité**: Élevée (données + stratégie de migration + impacts SEO)
- **Impact**: Très élevé (cohérence navigation + SEO)

## Contexte technique observé
- Les liens sont saisis librement dans les contenus (`ctaLink`, `primaryLink`, `navItems[].link`, etc.).
- `LinkAutosuggestInput` aide la saisie, mais il n’existe pas encore de gestion centralisée des références de pages.
- Lors d’un changement de slug, les liens existants ne semblent pas être remappés automatiquement.
- Besoin produit validé: une section dédiée de gestion des liens accessible depuis le dashboard/la navigation.
- Besoin produit validé: recherche + modification manuelle des liens à plusieurs granularités (section, page, toutes les pages).

## Plan d’exécution détaillé
1. **Définir le modèle de lien interne canonique**
   - Standardiser les liens internes au format path (`/slug`) et distinguer internes vs externes.

2. **Créer un service central des liens**
   - Module dédié (ex: `linkRegistry`) pour:
     - normalisation,
     - validation,
     - résolution des redirections.

3. **Créer l’interface “Gestion des liens” (niveau projet)**
   - Ajouter un écran dédié accessible via dashboard ou barre de navigation.
   - Fonctions: recherche, filtres, édition ciblée par section de page, page entière, ou ensemble du projet.

4. **Propager immédiatement les changements de slug (choix A validé)**
   - À la modification d’une page: réécrire immédiatement les liens internes référencés dans les contenus.
   - Ajouter une transaction logique pour minimiser les états partiellement mis à jour.

5. **Mettre en place les redirections automatiques SEO**
   - Politique par défaut validée: redirection permanente 301 pour anciens chemins.
   - Objectif prioritaire: éviter les 404 sur URLs historiques.

6. **Intégrer le traitement des liens externes dans la console de gestion**
   - Les liens externes restent éditables/recherchables dans l’interface de gestion.
   - Le périmètre “redirection automatique 301” reste centré sur les URLs internes renommées.

7. **Appliquer la résolution de lien au runtime**
   - Au rendu: résoudre d’abord la cible canonique.
   - En export/preview: conserver la même logique.

8. **Validation SEO & navigation**
   - Vérifier absence de liens cassés + redirections valides (301/302 selon stratégie).

## Critères d’acceptation
- Changer un slug ne casse pas la navigation interne.
- Les anciens liens internes sont redirigés automatiquement en 301.
- Les contenus existants restent compatibles sans migration destructive immédiate.
- Une interface projet permet recherche/édition des liens par section, page, ou toutes les pages.
