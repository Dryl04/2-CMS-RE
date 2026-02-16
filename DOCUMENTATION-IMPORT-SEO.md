# Documentation Import SEO - Guide pour IA / Redacteur Web

## Objectif

Vous recevez un **modele de page** (template JSON) contenant la structure visuelle d'une page web. Votre mission est de generer un JSON contenant **une ou plusieurs pages** avec du contenu optimise SEO et marketing, en respectant strictement la structure du modele.

Le JSON que vous produisez sera importe directement dans le systeme et publie automatiquement. Toute erreur de format empechera l'import.

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

---

## Structure d'une page

Chaque page du tableau doit contenir exactement les champs suivants :

### Champs SEO obligatoires

| Champ | Type | Obligatoire | Contraintes | Description |
|-------|------|-------------|-------------|-------------|
| `page_key` | string | OUI | Unique, slug URL (minuscules, tirets, pas d'espaces ni accents) | Identifiant unique = URL de la page. Ex: `"plombier-paris-15"` |
| `title` | string | OUI | **60 caracteres maximum** | Titre SEO affiche dans Google. Inclure le mot-cle principal + localisation + marque |
| `description` | string | OUI | **160 caracteres maximum** | Meta description Google. Doit donner envie de cliquer, inclure un appel a l'action |
| `keywords` | string[] | OUI | Tableau de 3 a 8 mots-cles | Mots-cles SEO. Inclure : mot-cle principal, variations, longue traine, localisation |
| `status` | string | OUI | `"published"` ou `"draft"` | Mettre `"published"` pour publication automatique |
| `language` | string | OUI | Code ISO | `"fr"` pour le francais |

### Champs SEO optionnels (fortement recommandes)

| Champ | Type | Contraintes | Description |
|-------|------|-------------|-------------|
| `og_title` | string | 60 caracteres max | Titre pour les reseaux sociaux (Facebook, LinkedIn). Peut etre plus accrocheur que le title SEO |
| `og_description` | string | 160 caracteres max | Description pour les reseaux sociaux |
| `og_image` | string | URL valide, image 1200x630px | Image d'apercu pour les reseaux sociaux |
| `canonical_url` | string | URL complete | URL canonique de la page |
| `seo_h1` | string | Libre | Balise H1 de la page. Doit contenir le mot-cle principal |
| `seo_h2` | string | Libre | Balise H2 de la page. Doit contenir un mot-cle secondaire |

### Champ de liaison au modele

| Champ | Type | Description |
|-------|------|-------------|
| `template_id` | string | L'ID du modele utilise (fourni dans le JSON du modele sous `template.id`). Recopier tel quel. |

### Champ de contenu visuel

| Champ | Type | Description |
|-------|------|-------------|
| `sections_data` | array | Le tableau des sections du modele avec le contenu remplace. Voir ci-dessous. |

---

## Comment remplir `sections_data`

Le `sections_data` est le coeur du travail. C'est le tableau des sections visuelles de la page.

### Regle fondamentale

**Vous devez reprendre EXACTEMENT la structure du modele** et ne modifier que les champs `content` de chaque section. Les champs `design`, `variant`, `advanced` et les `id` doivent rester IDENTIQUES au modele.

### Ce que vous DEVEZ modifier

- `content.*` : Tout le contenu textuel et les liens

### Ce que vous NE DEVEZ PAS modifier

- `id` : Garder les memes identifiants de section
- `type` : Ne pas changer le type de widget
- `order` : Conserver l'ordre (mais corriger la numerotation: 0, 1, 2, 3, 4...)
- `design` : Ne pas toucher au design (couleurs, espacement, typographie, fond)
- `variant` : Ne pas changer la variante d'affichage
- `advanced` : Ne pas toucher aux parametres avances

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
- `logoText` : Nom de l'entreprise / marque
- `ctaText` : Appel a l'action clair (ex: "Devis gratuit", "Reserver", "Nous contacter")
- `ctaLink` : Lien vers l'action (tel:, mailto:, #ancre, ou URL)
- `navItems` : 3 a 6 elements de navigation. Les labels doivent etre courts (1-2 mots). Les links doivent etre des ancres (#) correspondant aux sections de la page
- `logo` : Laisser vide (`""`)

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
- `ctaText` : Verbe d'action + benefice (ex: "Obtenez votre devis gratuit")
- `image` : URL d'une image Pexels pertinente au format paysage (w=1260&h=750). Ne pas inventer d'URL, utiliser uniquement des URLs Pexels valides
- `ctaLink` : Lien coherent avec l'action (telephone, formulaire, page)

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
- `primaryCta` : Verbe d'action + benefice
- Les champs `secondaryCta` et `secondaryLink` sont optionnels

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
- Utiliser des coordonnees fictives mais realistes
- Le format telephone doit etre francais (01/02/03/04/05 XX XX XX XX)

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
        "links": [
          { "url": "#ancre", "label": "Texte du lien" }
        ]
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
- `logoText` : Meme nom de marque que dans le header
- `columns` : Garder le meme nombre de colonnes que dans le modele
- `links` dans chaque colonne : Adapter les labels au contexte de l'entreprise
- `socialLinks` : Garder les memes plateformes que dans le modele, adapter les URLs
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
- [ ] Les champs `design`, `variant`, `advanced` sont identiques au modele
- [ ] Seuls les champs `content` ont ete modifies
- [ ] Le nombre d'elements dans les tableaux (features, testimonials, navItems, columns) est identique au modele
- [ ] Les URLs d'images sont des URLs Pexels valides
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
6. **Title trop long** : 60 caracteres maximum, pas un de plus
7. **Description trop longue** : 160 caracteres maximum
8. **page_key avec espaces/accents** : Uniquement minuscules, chiffres et tirets
9. **Oublier template_id** : Toujours inclure l'ID du modele
10. **Status incorrect** : `"published"` pour publication auto, `"draft"` pour brouillon

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
