# Décisions validées par tâche

## Tâche 03 — Paramètres non concernés
1. Les paramètres non applicables doivent être **masqués complètement**.
2. Les paramètres déjà enregistrés mais non applicables doivent être **conservés silencieusement** (pas de purge automatique).
3. Le mapping des paramètres applicables doit être établi via **scan exhaustif widget par widget**.

## Tâche 05 — Liens centralisés & redirections
1. Ajouter une **section dédiée de gestion des liens** accessible depuis dashboard ou navigation.
2. Inclure recherche + modification manuelle des liens par:
   - section précise d’une page,
   - page entière,
   - toutes les pages du projet.
3. Redirections automatiques après changement de slug: **301 permanent**.
4. Stratégie validée: **réécriture immédiate des liens internes existants**.
5. Les liens externes entrent dans le périmètre de **recherche/édition** dans la console de gestion.

## Tâche 07 — Superposition d’image
1. Comportement cible: **les deux modes** (section + média) avec **switch explicite**.
2. Les filtres doivent être disponibles et fonctionnels pour les images de superposition.

## Tâche 08 — Affichage vidéo par défaut
1. Le périmètre inclut aussi les **widgets vidéo de contenu** (pas seulement les backgrounds de section).
2. `full largeur` est activé par défaut **partout**.
3. Les vidéos YouTube intégrées doivent être corrigées pour supprimer les marges latérales observées.

## Tâche 09 — Modale réutilisable d’attribution de liens
1. La modale doit être intégrée **immédiatement** à tous les cas utiles (pas uniquement rich text).
2. Les options SEO sont requises dès V1 (`target=_blank`, `rel=noopener`, `nofollow`, `sponsored`) mais leur activation reste **facultative** pour l’utilisateur.
3. L’autosuggestion est requise dès V1, avec recherche sur les liens internes et externes de l’ensemble du projet.
4. La modale doit avoir un **z-index robuste** pour ne jamais être masquée par des couches de l’éditeur.