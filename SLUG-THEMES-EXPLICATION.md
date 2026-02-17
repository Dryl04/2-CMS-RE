# Utilité du slug pour les thèmes

Le `slug` d’un thème n’est pas un simple champ “cosmétique”.
Dans ce projet, il sert d’identifiant technique stable entre la base de données, le rendu CSS, et l’application des thèmes sur les pages/widgets.

## Pourquoi garder le slug

- **Identifiant stable** : le nom d’un thème peut changer (UX), le slug reste la clé technique.
- **Référence côté rendu** : les thèmes sont appliqués via `data-theme="<slug>"`.
- **Couche CSS générée** : les règles custom sont générées avec des sélecteurs `[data-theme="slug"]`.
- **Liaison DB fiable** : les pages/templates stockent une référence de thème qui doit rester prédictible.
- **Gestion des conflits** : un contrôle d’unicité évite d’avoir deux thèmes avec la même clé technique.

## Ce que casserait la suppression du slug

Supprimer le slug imposerait de basculer toute la logique vers un autre identifiant (souvent l’`id` UUID), ce qui implique :

- adaptation des sélecteurs CSS générés,
- migration des données référencées,
- réécriture des validations d’unicité,
- risque de casser la rétrocompatibilité des thèmes existants.

## Différence nom vs slug

- **Nom** : orienté humain (ex. “Corporate Navy 2026”).
- **Slug** : orienté système (ex. `corporate-navy-2026`).

Le nom peut évoluer souvent; le slug doit rester stable autant que possible.

## Recommandations pratiques

- Conserver l’auto-génération du slug à la création.
- Autoriser l’édition manuelle uniquement si nécessaire.
- Éviter de changer le slug d’un thème déjà utilisé en production.
- En cas de renommage visuel, préférer modifier le **nom** et conserver le **slug**.

## Conclusion

Le slug est utile et pertinent dans l’architecture actuelle. Il doit être conservé pour garantir une application robuste des thèmes et la stabilité des références entre UI, CSS et base de données.
