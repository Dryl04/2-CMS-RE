# Documentation Import SEO - Guide pour IA / Redacteur Web

## Objectif

Vous recevez un **modele de page** (template JSON) contenant la structure visuelle d'une page web. Votre mission est de generer un JSON contenant **une ou plusieurs pages** avec du contenu optimise SEO et marketing, en respectant strictement la structure du modele.

Le JSON que vous produisez sera importe directement dans le systeme et publie automatiquement. Toute erreur de format empechera l'import.

---

## Comprendre le modele exporte

Quand vous recevez un export de template, il a cette structure :

```json
{
  "export_version": 4,
  "export_mode": "maximum-compact",
  "template": {
    "id": "uuid-du-modele",
    "daisy_theme_slug": "light",
    "exported_at": "2026-02-20T..."
  },
  "editable_sections": [ ... sections + champs editables groupes ... ],
  "array_cardinality": { ... tailles exactes des tableaux ... },
  "stats": {
    "section_count": 6,
    "variable_count": 42
  }
}
```

L'export est maintenant en **mode maximum-compact** (JSON minifie + champs editables groupes + shape compressee des contenus) pour diminuer au maximum la taille du fichier sans perte de rendu final.

`editable_sections` donne la structure par section (id/type/variant/order), les champs editables (`fieldPath`) et une shape de contenu legere. Les tableaux y sont compresses avec `__count` et `__item`.

`array_cardinality` donne la cardinalite exacte des champs de type tableau (ex: `content.features`, `content.testimonials`).

Pour les FAQ (`content.faqs`), cette cardinalite est une limite stricte de slots disponibles dans le template.

Pour minimiser le JSON de retour, utilisez `content_overrides` (recommande) plutot que recopier tout `sections_data`.

**Important :** Ne modifiez PAS `design`, `variant`, `themeConfig`, ni `advanced` sauf si on vous le demande explicitement — ces proprietes controlent le style visuel et doivent rester intactes.

---

## Format du JSON a produire

Le JSON final doit etre un objet avec une cle `"pages"` contenant un tableau de pages :

```json
{
  "pages": [
    { ... page 1 ... },
    { ... page 2 ... },
    { ... page N ... }
  ]
}
```

### Format maximum-compact recommande

```json
{
  "template": { "id": "uuid-du-modele", "daisy_theme_slug": "light" },
  "pages": [
    {
      "page_key": "plombier-paris-15",
      "title": "Plombier Paris 15 - Depannage rapide 24/7",
      "description": "Intervention rapide de plombiers certifies a Paris 15. Devis gratuit et prix transparents.",
      "status": "published",
      "template_id": "uuid-du-modele",
      "content_overrides": {
        "section-hero-xxx": {
          "content.headline": "Plombier Paris 15 : intervention en 30 min",
          "content.subheadline": "Depannage urgent 24/7, artisans certifies, devis gratuit.",
          "content.description": "Intervention rapide, tarif transparent, artisans verifies."
        }
      }
    }
  ]
}
```

Dans ce format, l'importeur reconstruit automatiquement `sections_data` depuis `template_id`, puis applique les remplacements `content_overrides`.

---

## Structure d'une page

Chaque page du tableau doit contenir exactement les champs suivants :

### Champs SEO obligatoires

| Champ         | Type     | Obligatoire | Contraintes                                                     | Description                                                                         |
| ------------- | -------- | ----------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `page_key`    | string   | OUI         | Unique, slug URL (minuscules, tirets, pas d'espaces ni accents) | Identifiant unique = URL de la page. Ex: `"plombier-paris-15"`                      |
| `title`       | string   | OUI         | **60 caracteres maximum**                                       | Titre SEO affiche dans Google. Inclure le mot-cle principal + localisation + marque |
| `description` | string   | OUI         | **160 caracteres maximum**                                      | Meta description Google. Doit donner envie de cliquer, inclure un appel a l'action  |
| `keywords`    | string[] | OUI         | Tableau de 3 a 8 mots-cles                                      | Mots-cles SEO. Inclure : mot-cle principal, variations, longue traine, localisation |
| `status`      | string   | OUI         | `"published"` ou `"draft"`                                      | Mettre `"published"` pour publication automatique                                   |
| `language`    | string   | OUI         | Code ISO                                                        | `"fr"` pour le francais                                                             |

### Champs SEO optionnels (fortement recommandes)

| Champ            | Type   | Contraintes                  | Description                                                                                     |
| ---------------- | ------ | ---------------------------- | ----------------------------------------------------------------------------------------------- |
| `og_title`       | string | 60 caracteres max            | Titre pour les reseaux sociaux (Facebook, LinkedIn). Peut etre plus accrocheur que le title SEO |
| `og_description` | string | 160 caracteres max           | Description pour les reseaux sociaux                                                            |
| `og_image`       | string | URL valide, image 1200x630px | Image d'apercu pour les reseaux sociaux                                                         |
| `canonical_url`  | string | URL complete                 | URL canonique de la page                                                                        |
| `seo_h1`         | string | Libre                        | Balise H1 de la page. Doit contenir le mot-cle principal                                        |
| `seo_h2`         | string | Libre                        | Balise H2 de la page. Doit contenir un mot-cle secondaire                                       |

### Champ de liaison au modele

| Champ              | Type           | Description                                                                                   |
| ------------------ | -------------- | --------------------------------------------------------------------------------------------- |
| `template_id`      | string         | L'ID du modele utilise (fourni dans le JSON du modele sous `template.id`). Recopier tel quel. |
| `daisy_theme_slug` | string ou null | Le slug du theme DaisyUI (fourni dans `template.daisy_theme_slug`). Recopier tel quel.        |

### Champ de contenu visuel

| Champ               | Type   | Description                                                                                                                  |
| ------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `sections_data`     | array  | Le tableau des sections du modele avec le contenu remplace. Accepte aussi la cle `sections`. Voir ci-dessous.                |
| `content_overrides` | object | Format compact recommande: `{ [sectionId]: { [fieldPath]: value } }`. Necessite `template_id` si `sections_data` est absent. |

---

## Comment remplir `sections_data`

Le `sections_data` est le coeur du travail. C'est le tableau des sections visuelles de la page.

Si vous utilisez `content_overrides`, vous pouvez ignorer cette section: l'importeur reconstruit automatiquement `sections_data` a partir du `template_id`.

### Regle fondamentale

**Vous devez reprendre EXACTEMENT la structure du modele** et ne modifier que les champs `content` de chaque section. Les champs `design`, `variant`, `advanced` et les `id` doivent rester IDENTIQUES au modele.

### Cloisonnement strict du Gems (zone d'action)

Le Gems agit uniquement sur la **redaction SEO**.

- Par defaut, vous ne modifiez que les champs textuels de redaction SEO : `headline`, `subheadline`, `title` (hors navigation), `subtitle`, `description`, `quote`, `seo_h1`, `seo_h2`, `content`.
- Vous ne modifiez jamais les elements d'interface et de structure: navigation, boutons, ancres, liens, URLs de medias, ordre, variante, design.
- Si une consigne metier demande explicitement une exception (ex: changer un CTA), cette exception doit etre explicite et ciblee champ par champ.

### Ce que vous DEVEZ modifier

- Uniquement les champs de texte de redaction SEO (titre, sous-titre, descriptions, paragraphes, citations)

### Ce que vous NE DEVEZ PAS modifier

- `id` : Garder les memes identifiants de section
- `type` : Ne pas changer le type de widget
- `order` : Conserver l'ordre (mais corriger la numerotation: 0, 1, 2, 3, 4...)
- `design` : Ne pas toucher au design (couleurs, espacement, typographie, fond, medias)
- `variant` : Ne pas changer la variante d'affichage (obligatoire pour le rendu correct)
- `advanced` : Ne pas toucher aux parametres avances (visibilite)
- `themeConfig` : Ne pas toucher a la configuration de theme (themeMode, themeRef, customTokens)
- `content` de navigation et action : ne pas modifier `navItems[*].label`, `navItems[*].link`, `ctaText`, `ctaLink`, `primaryCta`, `primaryLink`, `secondaryCta`, `secondaryLink`, `columns[*].links[*].label`, `columns[*].links[*].url`, `socialLinks[*].url`, `socialLinks[*].platform`
- `content` de boutons/actions (gel strict) : ne pas modifier `buttonText`, `primaryText`, `secondaryText`, `headerCta`, `formCta`, `submitLabel`, `inputPlaceholder`, `placeholder`, `note`, ni aucun texte associe a une action
- Coordonnees et donnees non SEO : ne pas modifier `email`, `phone`, `address`, `openHours`, `openHoursTitle`, `logoText`, `logo`, sauf consigne explicite
- URLs de medias : ne pas modifier `image`, `backgroundImage`, `thumbnail`, `avatar`, `logo` sauf consigne explicite

---

## Detail des sections et de leur contenu

### Section `header` (Navigation)

```json
{
  "content": {
    "logo": "",
    "ctaLink": "#contact",
    "ctaText": "Texte du bouton d'action",
    "logoText": "Nom de la marque",
    "navItems": [
      { "link": "#ancre", "label": "Texte du lien" },
      { "link": "#ancre2", "label": "Texte du lien 2" },
      { "link": "#ancre3", "label": "Texte du lien 3" },
      { "link": "#ancre4", "label": "Texte du lien 4" }
    ]
  }
}
```

**Regles :**

- Section **gelee par defaut** pour le Gems
- Conserver `logoText`, `ctaText`, `ctaLink` et `navItems` exactement comme dans le modele
- Ne modifier ces champs que si la consigne utilisateur le demande explicitement

### Section `hero` (Banniere principale)

```json
{
  "content": {
    "image": "https://images.pexels.com/photos/XXXXX/pexels-photo-XXXXX.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750",
    "ctaLink": "#contact",
    "ctaText": "Bouton d'action principal",
    "headline": "Titre H1 principal de la page",
    "subheadline": "Sous-titre descriptif avec proposition de valeur"
  }
}
```

**Regles :**

- `headline` : Doit etre identique ou tres proche du `seo_h1`. Inclure le mot-cle principal
- `subheadline` : 1-2 phrases. Proposition de valeur + elements de confiance (anciennete, nombre clients, certification)
- `ctaText` : Conserver le texte du modele (champ d'interface)
- `image` : Conserver l'URL du modele sauf demande explicite
- `ctaLink` : Conserver le lien du modele sauf demande explicite

### Section `features` (Fonctionnalites / Services)

```json
{
  "content": {
    "title": "Titre de la section services",
    "subtitle": "Sous-titre expliquant la valeur ajoutee",
    "features": [
      {
        "icon": "zap",
        "title": "Titre du service 1",
        "description": "Description detaillee du service (1-2 phrases)"
      },
      {
        "icon": "shield",
        "title": "Titre du service 2",
        "description": "Description detaillee du service (1-2 phrases)"
      },
      {
        "icon": "heart",
        "title": "Titre du service 3",
        "description": "Description detaillee du service (1-2 phrases)"
      }
    ]
  }
}
```

**Regles :**

- `title` : Inclure un mot-cle SEO + la localisation si pertinent
- `features` : Garder exactement le meme nombre de features que dans le modele
- `icon` : Garder les icones du modele (`"zap"`, `"shield"`, `"heart"`, etc.). Valeurs possibles : `zap`, `shield`, `heart`, `star`, `check`, `award`, `target`, `users`, `clock`, `globe`
- Chaque `description` de feature : 15-30 mots, specifique et concret, pas de generalites

### Section `testimonials` (Temoignages)

```json
{
  "content": {
    "title": "Titre de la section avis",
    "subtitle": "Sous-titre avec element de preuve sociale",
    "testimonials": [
      {
        "name": "Prenom Nom",
        "quote": "Texte du temoignage authentique et detaille",
        "title": "Role/Localisation du temoin",
        "avatar": "https://images.pexels.com/photos/XXXXX/...",
        "rating": 5
      }
    ]
  }
}
```

**Regles :**

- `title` : Inclure un element de preuve sociale (nombre de clients, note moyenne)
- `testimonials` : Garder exactement le meme nombre que dans le modele
- `quote` : 20-40 mots. Doit sembler authentique, mentionner un detail concret, inclure un benefice
- `name` : Noms realistes francais
- `title` : Role professionnel ou localisation (ex: "Proprietaire, rue de Rivoli")
- `avatar` : Garder les memes URLs d'avatar que dans le modele
- `rating` : Toujours `5`

### Section `cta` (Appel a l'action)

```json
{
  "content": {
    "headline": "Titre accrocheur avec urgence",
    "description": "Texte persuasif avec benefice",
    "primaryCta": "Texte bouton principal",
    "primaryLink": "#contact",
    "secondaryCta": "Texte bouton secondaire",
    "secondaryLink": "#info"
  }
}
```

**Regles :**

- `headline` : Creer un sentiment d'urgence ou de benefice immediat
- `primaryCta`, `primaryLink`, `secondaryCta`, `secondaryLink` : Conserver les valeurs du modele (champs d'interface)

### Section `contact` (Contact)

```json
{
  "content": {
    "title": "Titre de la section contact",
    "subtitle": "Sous-titre invitant a l'action",
    "email": "contact@entreprise.com",
    "phone": "01 23 45 67 89",
    "address": "123 rue Example, 75015 Paris"
  }
}
```

**Regles :**

- Section gelee par defaut pour le Gems
- Conserver `email`, `phone` et `address` exactement comme dans le modele
- Ne modifier ces champs que si la consigne utilisateur l'exige explicitement

### Section `footer` (Pied de page)

```json
{
  "content": {
    "logo": "",
    "logoText": "Nom de la marque",
    "description": "Description courte de l'entreprise (1 phrase)",
    "columns": [
      {
        "title": "Titre colonne",
        "links": [{ "url": "#ancre", "label": "Texte du lien" }]
      }
    ],
    "socialLinks": [
      { "url": "https://facebook.com/...", "platform": "facebook" },
      { "url": "https://twitter.com/...", "platform": "twitter" },
      { "url": "https://linkedin.com/...", "platform": "linkedin" }
    ],
    "copyright": "2024 Nom Entreprise - Tous droits reserves - SIRET XXX XXX XXX XXXXX"
  }
}
```

**Regles :**

- `logoText` : Conserver la valeur du modele
- `columns` : Garder le meme nombre de colonnes que dans le modele
- `links` dans chaque colonne : Conserver labels et URLs du modele
- `socialLinks` : Conserver plateformes et URLs du modele
- `copyright` : Inclure l'annee, le nom de l'entreprise, et un numero SIRET fictif
- `logo` : Laisser vide (`""`)

---

## Regles SEO a respecter imperativement

### Titre SEO (`title`)

- **60 caracteres maximum**
- Format : `Mot-cle principal - Benefice | Marque` ou `Marque - Mot-cle | Localisation`
- Inclure le mot-cle principal au debut

### Meta description (`description`)

- **160 caracteres maximum**
- Inclure le mot-cle principal
- Terminer par un appel a l'action
- Donner envie de cliquer

### Mots-cles (`keywords`)

- 3 a 8 mots-cles par page
- Inclure : mot-cle principal, variations, longue traine, localisation
- Pas de doublons entre pages similaires

### Balise H1 (`seo_h1` et `hero.headline`)

- Un seul H1 par page
- Doit contenir le mot-cle principal
- Doit etre identique ou tres similaire entre `seo_h1` et `sections_data[hero].content.headline`

### Contenu general

- Ton professionnel et convaincant
- Adapte au secteur d'activite
- Inclure des elements de confiance : chiffres, certifications, anciennete
- Pas de fautes d'orthographe
- **Pas d'accents dans le contenu** (contrainte technique du systeme)

### Regles de formatage du texte SEO

- N'utilisez jamais la syntaxe markdown `**mot**`, `*mot*` ou `__mot__` dans les valeurs JSON
- Cette syntaxe n'est pas interpretee visuellement par l'importeur et doit etre consideree comme invalide
- Les balises HTML inline ne sont autorisees qu'exceptionnellement dans des champs de redaction SEO (pas dans navigation/boutons/liens)
- Balises autorisees dans ce cadre: `<strong>`, `<em>`, `<u>`
- Ne pas imbriquer ces balises, ne pas ajouter d'autres balises HTML

### Regle FAQ (mode standard + exception controlee)

- Mode standard: pour chaque section contenant `content.faqs`, respecter la cardinalite du template (`array_cardinality` ou `editable_sections.content_shape.__count`).
- Exception autorisee uniquement sur demande explicite: mode `FAQ_ETENDUE`.
- En mode `FAQ_ETENDUE`, vous pouvez ajouter des Q/R dans `content.faqs` au-dela de la cardinalite initiale du template, sans modifier `id/type/variant/design/advanced/themeConfig`.
- Cette exception ne s'applique qu'aux FAQ. Tous les autres tableaux (`features`, `services`, `steps`, `navItems`, `columns`, etc.) restent verrouilles en cardinalite.
- Interdiction de creer de nouveaux champs ou de nouvelles sections pour contourner cette regle.

---

## URLs des images et medias

**IMPORTANT :** Toutes les URLs d'images et de medias doivent etre des **URLs brutes** (commencant par `https://`). Ne JAMAIS utiliser le format lien markdown `[texte](url)`.

### Format correct

```json
"image": "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750"
```

### Format INCORRECT (a ne pas utiliser)

```json
"image": "[https://images.pexels.com/photos/3184291/...](https://images.pexels.com/photos/3184291/...)"
```

### Champs concernes

Les champs suivants contiennent des URLs d'images dans les sections :

- `content.image` — hero, image-text-split, content-showcase, image-stats-faq
- `content.backgroundImage` — immersive-split-showcase, cinematic-footer
- `content.thumbnail` — videohero, content-video-services
- `content.logo` — header-clickfunnel
- `testimonials[].avatar` — testimonials, hero-with-testimonials
- `members[].avatar` — team
- `items[].image` — gallery, provider-masonry
- `steps[].image` — process-steps-cards, process-alternating
- `cards[].image` — editorial-cards-row
- `services[].image` — services-cards
- `events[].image` — timeline

> **Note :** L'importateur inclut un nettoyage automatique qui corrige les URLs en format markdown. Cependant, fournir des URLs propres des le depart evite les cas limites et garantit une compatibilite maximale.

---

## Checklist avant soumission

Avant de soumettre votre JSON, verifiez :

- [ ] Le JSON est valide (pas d'erreurs de syntaxe)
- [ ] L'objet racine contient bien la cle `"pages"` avec un tableau
- [ ] Chaque page a un `page_key` unique (slug URL valide)
- [ ] Chaque `title` fait 60 caracteres ou moins
- [ ] Chaque `description` fait 160 caracteres ou moins
- [ ] Le `template_id` correspond a l'ID du modele fourni
- [ ] Les `sections_data` contiennent toutes les sections du modele
- [ ] Les `id` de section sont identiques au modele
- [ ] Les `type` de section sont identiques au modele
- [ ] Les `variant` de section sont identiques au modele (champ obligatoire)
- [ ] Les champs `design`, `variant`, `advanced`, `themeConfig` sont identiques au modele
- [ ] Seuls les champs `content` ont ete modifies
- [ ] Les champs d'interface (navigation, boutons, liens) sont restes identiques au modele
- [ ] Les champs de boutons/actions (`cta*`, `button*`, `primary*`, `secondary*`, `*Placeholder`, `submit*`) sont restes identiques au modele
- [ ] Les URLs de medias (images/avatars/logos/thumbnails) sont restees identiques au modele sauf demande explicite
- [ ] Les champs non SEO de coordination (`email`, `phone`, `address`, `openHours*`) sont restes identiques au modele
- [ ] Le nombre d'elements dans les tableaux (features, testimonials, navItems, columns, services, steps) est identique au modele
- [ ] FAQ: par defaut, cardinalite identique au modele; si mode `FAQ_ETENDUE` explicitement demande, `content.faqs` peut etre etendu sans autre changement structurel
- [ ] Les URLs d'images sont des URLs Pexels valides (format brut `https://...`, pas de markdown)
- [ ] Les URLs d'images dans les sous-objets (testimonials, features, items) sont aussi en format brut
- [ ] Le `status` est bien `"published"` pour une publication automatique
- [ ] Le `seo_h1` correspond au `headline` de la section hero
- [ ] Les ancres (`#`) dans les liens sont coherentes entre header, footer et sections

---

## Erreurs frequentes a eviter

1. **Modifier le design** : Ne changez JAMAIS les couleurs, espacements, polices
2. **Changer les IDs** : Les `id` de section doivent rester identiques
3. **Ajouter/supprimer des sections** : Gardez exactement les memes sections
4. **Changer le nombre de features/testimonials** : Gardez exactement le meme nombre
5. **URLs d'images inventees** : N'utilisez que des URLs Pexels verifiees
6. **URLs en format markdown** : Les URLs d'images doivent etre brutes (`https://...`), pas au format `[texte](url)` — meme si l'importateur corrige automatiquement, evitez ce format
7. **Title trop long** : 60 caracteres maximum, pas un de plus
8. **Description trop longue** : 160 caracteres maximum
9. **page_key avec espaces/accents** : Uniquement minuscules, chiffres et tirets
10. **Oublier template_id** : Toujours inclure l'ID du modele
11. **Status incorrect** : `"published"` pour publication auto, `"draft"` pour brouillon
12. **Modifier la navigation/les boutons** : Interdit sans demande explicite
13. **Utiliser la syntaxe markdown de mise en forme dans le JSON** (`**mot**`, `*mot*`, `__mot__`) : Interdit, utiliser eventuellement `<strong>`, `<em>`, `<u>` uniquement dans le texte SEO

---

## Exemple de page_key valides

- `plombier-paris-15` (bon)
- `restaurant-italien-lyon-2` (bon)
- `coach-sportif-bordeaux` (bon)
- `Plombier Paris 15` (INVALIDE - majuscules et espaces)
- `restaurant_italien` (INVALIDE - underscores)
- `café-lyon` (INVALIDE - accent)

---

## Workflow de production en masse

Pour generer N pages a partir d'un modele :

1. Vous recevez le JSON du modele (structure complete avec sections)
2. Vous recevez une liste de N entreprises/sujets a traiter
3. Pour chaque entreprise/sujet, vous produisez un objet page complet
4. Vous regroupez toutes les pages dans le tableau `"pages"`
5. Le JSON est importe et les pages avec `status: "published"` sont publiees automatiquement

**Il n'y a pas de limite au nombre de pages dans un import.**
