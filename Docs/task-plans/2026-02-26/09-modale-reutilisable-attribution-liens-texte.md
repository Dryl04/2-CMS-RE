# Tâche 09 — Modale réutilisable pour l’attribution de liens dans les paramètres texte

## Taille estimée
- **Taille**: M
- **Complexité**: Moyenne
- **Impact**: Élevé UX (remplacement d’un prompt navigateur peu robuste)

## Contexte technique observé
- Dans `PropertiesPanel`, le composant `RichTextArea` utilise actuellement `prompt('URL du lien :', 'https://')` pour insérer un lien HTML.
- Ce comportement est limité (validation minimale, UX faible, non réutilisable, non extensible).
- Le besoin produit est de créer une **modale réutilisable** avec suffisamment de paramètres pour être utilisée dans plusieurs contextes au-delà du rich text actuel.
- Contrainte UX validée: la modale doit avoir un **z-index élevé et robuste** pour ne jamais passer sous des couches UI du builder.
- Décision validée: intégration **immédiate** dans tous les cas utiles (pas seulement rich text).

## Objectif fonctionnel
- Remplacer le prompt navigateur par un composant de modale configurable.
- Permettre une insertion/édition de lien fiable dans le texte sélectionné.
- Fournir une API réutilisable et l’exploiter dès V1 pour les cas principaux (rich text, CTA, navigation, autres champs lien pertinents).

## Plan d’exécution détaillé
1. **Définir le contrat du composant réutilisable**
   - Créer un composant type `LinkEditorModal` avec props configurables:
   - `isOpen`, `title`, `initialValue`, `mode` (interne/externe), `allowAnchor`, `allowOpenInNewTab`, `allowNofollow`, `onCancel`, `onSubmit`, etc.
   - Prévoir des callbacks neutres pour ne pas coupler le composant à `RichTextArea`.
   - Ajouter des props SEO V1: `allowRelNoopener`, `allowRelNofollow`, `allowRelSponsored`, `defaultTargetBlank`, avec configuration **facultative côté utilisateur**.

2. **Implémenter la modale UI et la validation**
   - Champs minimaux: URL/lien, texte d’ancre (optionnel selon contexte), options d’ouverture.
   - Validation de base: URL interne (`/slug`) ou externe (`http/https`) selon le mode activé.
   - Ajouter les options SEO dans l’UI dès V1 (`target=_blank`, `rel=noopener`, `nofollow`, `sponsored`) avec activation optionnelle.
   - États UX: erreurs inline, bouton de confirmation désactivé si invalide.
   - Garantir l’affichage par-dessus toutes les couches de l’éditeur (stratégie de stacking context + z-index dédié modale/backdrop).

3. **Intégrer la modale dans `RichTextArea`**
   - Remplacer `prompt` par ouverture de la modale.
   - Conserver la sélection de texte active (start/end) et injecter le lien confirmé.
   - Gérer insertion si aucun texte n’est sélectionné (fallback sur URL ou texte saisi).

4. **Brancher la recherche et l’autosuggestion de liens projet (V1)**
   - Réutiliser/étendre la logique de suggestion existante (`LinkAutosuggestInput`) dans la modale.
   - Permettre la recherche parmi les liens internes **et externes** référencés à travers toutes les pages du projet.

5. **Rendre la modale réellement réutilisable**
   - Extraire le composant dans un emplacement partagé (ex: `src/components/common/LinkEditorModal.tsx`).
   - Documenter l’API (props) via types explicites.

6. **Intégrer immédiatement aux autres cas utiles (V1)**
   - Remplacer les saisies de lien pertinentes hors rich text (CTA, nav items, autres champs lien compatibles) par la même modale.
   - Éviter la duplication de logique de validation/SEO sur les différents formulaires.

7. **Validation**
   - Vérifier insertion/édition de lien dans `RichTextArea`.
   - Vérifier annulation sans effet de bord.
   - Vérifier réouverture de la modale avec valeurs initiales.
   - Vérifier que la modale reste au-dessus des panneaux, overlays et éléments sticky du builder.
   - Vérifier les options SEO en sortie HTML/attributs lien.
   - Vérifier l’autosuggestion projet (internes + externes) et la recherche.

## Critères d’acceptation
- Plus aucun usage de `prompt()` pour l’attribution de liens dans les paramètres texte ciblés.
- Le composant de modale est réutilisable et configurable par props.
- Validation des liens cohérente (interne/externe) avec messages d’erreur explicites.
- Le flux d’édition de texte conserve correctement la sélection et n’altère pas le contenu hors zone visée.
- Les options SEO V1 sont disponibles (`target`, `rel`), activables de manière facultative par l’utilisateur.
- La modale est intégrée dès V1 aux autres cas utiles (pas uniquement rich text).
- La recherche/autosuggestion couvre les liens internes et externes de l’ensemble du projet.
- La modale ne passe jamais sous les autres couches UI (z-index validé).
