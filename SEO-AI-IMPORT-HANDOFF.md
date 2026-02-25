# SEO AI Agent Handoff – JSON Contract for Import

## Goal

Produce a **valid JSON file** that can be pasted into the SEO importer to create/update pages in bulk.

The expected workflow is:

1. Export a page template from the builder (`JSON` export).
2. Give that export + this document to the SEO AI agent.
3. Agent returns one JSON payload.
4. Paste/import that payload in the SEO Import UI.

---

## Understanding the Exported Template

When you export a template from the builder, you receive a JSON with this structure:

```json
{
  "export_version": 4,
  "export_mode": "maximum-compact",
  "template": {
    "id": "uuid",
    "daisy_theme_slug": "light",
    "exported_at": "2026-02-20T..."
  },
  "editable_sections": [
    {
      "id": "section-hero-xxxx",
      "type": "hero",
      "variant": "default",
      "order": 0,
      "fields": [
        ["content.headline", "text"],
        ["content.subheadline", "text"]
      ],
      "content_shape": {
        "headline": "",
        "subheadline": ""
      }
    }
  ],
  "array_cardinality": {
    "section-features-xxxx": {
      "content.features": 6
    }
  },
  "stats": {
    "section_count": 6,
    "variable_count": 42
  ]
}
```

The export is now generated in **maximum-compact mode** (single-line minified JSON + grouped editable fields + compressed content shape) to keep files as small as possible.

`editable_sections` gives section order/type plus editable field paths and a lightweight content shape. Arrays are compressed (`__count` + `__item` sample) to avoid huge payloads. `array_cardinality` gives exact array sizes per field path.

When creating your import payload, prefer `content_overrides` (see Format C) to avoid repeating full `sections_data`.

**Important:** Do NOT modify `design`, `variant`, `themeConfig`, or `advanced` properties unless explicitly asked — they control styling and must stay intact for visual fidelity.

---

## Accepted Output Formats

### Format A (recommended — pages with sections)

```json
{
  "pages": [
    {
      "page_key": "my-page-slug",
      "title": "SEO title",
      "description": "Meta description",
      "keywords": ["kw1", "kw2"],
      "status": "published",
      "template_id": "uuid",
      "daisy_theme_slug": "light",
      "sections_data": [ ... sections with modified content ... ]
    }
  ]
}
```

### Format B (combined template + pages)

```json
{
  "template": {
    "id": "uuid",
    "daisy_theme_slug": "light"
  },
  "sections": [ ... template sections ... ],
  "pages": [
    {
      "page_key": "my-page-slug",
      "title": "SEO title",
      "description": "Meta description",
      "keywords": ["kw1", "kw2"],
      "status": "published"
    }
  ]
}
```

With **Format B**, importer auto-fallbacks:

- `template.id` -> `page.template_id` (if missing)
- `template.daisy_theme_slug` -> `page.daisy_theme_slug` (if missing)
- `sections` -> `page.sections_data` (if missing/empty on a given page)

**Note:** Both `sections` and `sections_data` are accepted as key names at both root level and per-page level. The importer handles both transparently.

### Format C (recommended — maximum-compact payload)

```json
{
  "template": {
    "id": "uuid",
    "daisy_theme_slug": "light"
  },
  "pages": [
    {
      "page_key": "my-page-slug",
      "title": "SEO title",
      "description": "Meta description",
      "status": "published",
      "template_id": "uuid",
      "content_overrides": {
        "section-hero-xxxx": {
          "content.headline": "New headline",
          "content.subheadline": "New subheadline",
          "content.description": "New supporting SEO copy"
        }
      }
    }
  ]
}
```

With **Format C**, the importer reconstructs full `sections_data` from `template_id` and applies only your content overrides. This gives the smallest possible JSON while preserving visual quality.

---

## Page-Level Rules

### Required fields

- `page_key` (string)
- `title` (string)

### Optional fields

- `description` (string, max 160 chars recommended; validator enforces 160 max when provided)
- `keywords` (array of strings, or comma string accepted then split)
- `og_title` (string)
- `og_description` (string)
- `og_image` (string URL)
- `canonical_url` (string URL)
- `language` (string, default `fr`)
- `status` (`draft` | `published` | `archived`)
- `content` (string)
- `seo_h1` (string)
- `seo_h2` (string)
- `template_id` (string)
- `daisy_theme_slug` (string or null)
- `sections_data` (array)
- `content_overrides` (object: `{ [sectionId]: { [fieldPath]: value } }`)

### `page_key` format (strict)

Must match:

- lowercase letters
- digits
- dashes
- no spaces, no accents, no underscore

Valid examples:

- `plombier-paris-15`
- `home`
- `landing-b2b-lyon`

Invalid examples:

- `Plombier Paris`
- `café-lyon`
- `landing_page`

---

## sections_data Contract

If `sections_data` is provided, each section must contain at least:

- `id` (string, unique per section)
- `type` (string, e.g. `"hero"`, `"features"`, `"cta"`)
- `variant` (string, e.g. `"default"` — **validated, recommended**)
- `content` (object — the editable text/image data)
- `design` (object — styling, background, spacing, typography, colors, media)

### Section Structure Example

```json
{
  "id": "section-hero-abc123",
  "type": "hero",
  "variant": "default",
  "order": 0,
  "content": {
    "headline": "Votre Titre SEO Ici",
    "subheadline": "Sous-titre optimisé",
    "ctaText": "Contactez-nous",
    "ctaLink": "/contact"
  },
  "design": {
    "background": { "type": "color", "value": "" },
    "spacing": {
      "paddingTop": "0px",
      "paddingBottom": "0px",
      "marginTop": "0px",
      "marginBottom": "0px"
    },
    "typography": {},
    "colors": {},
    "media": {}
  },
  "advanced": {
    "visibility": { "desktop": true, "tablet": true, "mobile": true }
  },
  "themeConfig": {
    "themeMode": "named",
    "themeRef": "light"
  }
}
```

### Fidelity Rules

> **⛔ CRITICAL — ABSOLUTE PROHIBITIONS (violation = broken page):**
>
> 1. **NEVER modify the `design` block** (or any `design.*` sub-field) of any section — not `design.background`, not `design.colors`, not `design.typography`, not `design.spacing`. Copy it verbatim from the template.
> 2. **NEVER modify image/media URLs** — this includes top-level fields (`image`, `avatar`, `logo`, `backgroundImage`, etc.) AND fields inside array items (`testimonials[].avatar`, `features[].thumbnailUrl`, `members[].avatar`, `items[].image`, `steps[].image`, etc.).
> 3. **NEVER modify icon identifiers** — this includes `icon`, `features[].icon`, `services[].icon`, `steps[].icon`, `stats[].icon`, `plans[].icon`, `socialLinks[].icon` and any `*.icon` inside array items.

- Keep `id`, `type`, `order`, `variant`, `design`, `advanced`, `themeConfig` **exactly as in exported template**.
- Do not edit media URLs (`image`, `backgroundImage`, `thumbnail`, `avatar`, `logo`) unless explicitly requested.
- Keep same number/order of sections as template.
- **Image/media URLs must be plain URLs** — never wrap them in markdown link syntax. See "Image & Media URLs" section below.
- The `design.typography` object supports: `fontFamily`, `headingFontFamily`, `headingFontWeight`, `headingFontSize`, `h1FontFamily`, `h1FontWeight`, `h1FontSize`, `h2FontFamily`, `h2FontWeight`, `h2FontSize`, `textFontSize`, `buttonFontSize`, `buttonFontFamily`, `headingColor`, `h1Color`, `h2Color`, `textColor`, `linkColor`, `subtitleColor`.
- The `design.colors` object supports: `buttonBackground`, `buttonText`, `buttonBackgroundHover`, `buttonRadius`, `buttonSize`, `buttonBorderWidth`, `buttonBorderStyle`, `buttonBorderColor`, `buttonShadow`, `iconBackground`, `iconColor`, `iconBorderColor`, `iconBorderWidth`, `iconRadius`, `accent`, `primary`, `secondary`.

---

## SEO Editorial Scope — Per-Widget Field Guide

This section defines **exactly** which fields the SEO agent **MUST modify** to adapt content to the target project/keyword, and which fields are **FROZEN** (must be kept as-is from the template).

### General Principles

1. **EDITABLE fields** (marked ✏️): The agent **MUST** rewrite these fields to produce SEO-optimized copy adapted to the target project. If the template text is generic/placeholder, the agent should replace it entirely with project-relevant text. If it already contains relevant text structure, adapt it while keeping the tone aligned.
2. **CONDITIONALLY EDITABLE fields** (marked 🔄): The agent SHOULD adapt these if the current template content is not relevant to the target project. For example, FAQ questions/answers about a completely different industry should be rewritten for the target project.
3. **FROZEN fields** (marked 🔒): Never modify these unless the user explicitly requests it. These include: buttons, CTA text, links, navigation, images, icons, contact info, form labels, config values. This applies to ALL occurrences — both top-level fields AND fields inside array items (e.g., `testimonials[].avatar`, `features[].icon`).
4. **DESIGN BLOCK IS ALWAYS FROZEN**: The entire `design` block of every section must be copied verbatim from the template. Do not change any `design.*` field under any circumstances, even if you believe it would improve the visual result.
5. **Array cardinality**: Keep the same number of items in arrays by default. Exception: in `FAQ_EXTENDED` mode (only when explicitly requested), `content.faqs` may exceed template capacity.

### Field Classification Reference

| Category               | Fields                                                                                                                                                                                                                                                                                                                                             | Rule   |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| ⛔ Design block        | `design`, `design.background`, `design.spacing`, `design.typography`, `design.colors`, `design.media` — **ALL sub-fields included**                                                                                                                                                                                                                | FROZEN |
| 🔒 Button/CTA text     | `ctaText`, `primaryCta`, `secondaryCta`, `buttonText`, `primaryText`, `secondaryText`, `submitLabel`, `headerCta`, `topCtaText`, `cardCtaText`                                                                                                                                                                                                     | FROZEN |
| 🔒 Links/URLs          | `ctaLink`, `primaryLink`, `secondaryLink`, `link`, `linkText`, `topCtaLink`, `cardCtaLink`, `searchLink`, `cartLink`, `accountLink`                                                                                                                                                                                                                | FROZEN |
| 🔒 Navigation          | `navItems[].label`, `navItems[].link`, `content.logoText`, `content.brand`                                                                                                                                                                                                                                                                         | FROZEN |
| 🔒 Media               | `image`, `backgroundImage`, `thumbnail`, `avatar`, `logo`, `signature`, `cardImage`, `leftCardImage`, `rightCardImage`, `items[].image`, `steps[].image`, `cards[].image`, `services[].image`, `events[].image`, `features[].thumbnailUrl`, `members[].avatar`, `testimonials[].avatar`, `logos[].url`, `integrations[].logo`, `providers[].image` | FROZEN |
| 🔒 Icons               | `icon`, `features[].icon`, `services[].icon`, `steps[].icon`, `stats[].icon`, `plans[].icon`, `socialLinks[].icon`                                                                                                                                                                                                                                 | FROZEN |
| 🔒 Contact/Operational | `email`, `phone`, `address`, `openHours`, `openHoursTitle`                                                                                                                                                                                                                                                                                         | FROZEN |
| 🔒 Form/Input          | `placeholder`, `inputPlaceholder`, `privacyNote`, `note`                                                                                                                                                                                                                                                                                           | FROZEN |
| 🔒 Config/Layout       | `autoplay`, `textPosition`, `videoOverlayColor`, `videoOverlayOpacity`, `showDots`, `showForm`, `showSearch`, `showCart`, `divider`, `popular`, `featured`, `tall`, `wide`, `size`, `height`, `expandable`, `rating`                                                                                                                               | FROZEN |
| 🔒 Social              | `socials[].platform`, `socials[].url`, `socialLinks[].url`, `social.linkedin`, `social.twitter`, `social.email`                                                                                                                                                                                                                                    | FROZEN |

---

### Per-Widget Editable Fields

> **⛔ REMINDER — applies to EVERY widget below:**
>
> - The `design` block is **NEVER listed** in per-widget tables because it is **ALWAYS FROZEN** for every section. Copy it verbatim from the template without any modification.
> - Images and icons inside array items (e.g. `testimonials[].avatar`, `features[].icon`) are **ALWAYS FROZEN** even when the array item itself is editable.

#### `hero`

| Field         | Status | Notes                                                                 |
| ------------- | ------ | --------------------------------------------------------------------- |
| `headline`    | ✏️     | Main H1 — primary SEO target. Must match `seo_h1`.                    |
| `subheadline` | ✏️     | Supporting text for the hero. Optimize for the target keyword/intent. |
| `ctaText`     | 🔒     |                                                                       |
| `ctaLink`     | 🔒     |                                                                       |
| `image`       | 🔒     |                                                                       |

#### `clickfunnels-hero`

| Field                      | Status | Notes             |
| -------------------------- | ------ | ----------------- |
| `headline`                 | ✏️     | Main H1           |
| `subheadline`              | ✏️     | Supporting copy   |
| `description`              | ✏️     | Longer text block |
| `ctaText`, `secondaryCta`  | 🔒     |                   |
| `ctaLink`, `secondaryLink` | 🔒     |                   |
| `image`                    | 🔒     |                   |

#### `clickfunnel-center-card`

| Field                                | Status | Notes                                |
| ------------------------------------ | ------ | ------------------------------------ |
| `title`                              | ✏️     |                                      |
| `subtitle`                           | ✏️     |                                      |
| `description`                        | ✏️     |                                      |
| `cards[].title`                      | 🔄     | Adapt if not relevant to the project |
| `cards[].description`                | 🔄     |                                      |
| `cards[].image`, `cards[].mediaType` | 🔒     |                                      |

#### `clickfunnel-features`

| Field                     | Status | Notes                                              |
| ------------------------- | ------ | -------------------------------------------------- |
| `title`                   | ✏️     |                                                    |
| `subtitle`                | ✏️     |                                                    |
| `features[].quote`        | 🔄     | Testimonial-like quotes — adapt to project context |
| `features[].author`       | 🔄     | Author/source — adapt if placeholder               |
| `features[].thumbnailUrl` | 🔒     |                                                    |

#### `click-funnel-testimonials`

| Field                   | Status | Notes                                |
| ----------------------- | ------ | ------------------------------------ |
| `title`                 | ✏️     |                                      |
| `testimonials[].quote`  | 🔄     | Adapt testimonial quotes to project  |
| `testimonials[].name`   | 🔄     | Adapt if placeholder                 |
| `testimonials[].title`  | 🔄     | Role/position — adapt if placeholder |
| `testimonials[].avatar` | 🔒     |                                      |

#### `features`

| Field                    | Status | Notes                                         |
| ------------------------ | ------ | --------------------------------------------- |
| `title`                  | ✏️     | Section heading                               |
| `subtitle`               | ✏️     | Section subheading                            |
| `features[].title`       | 🔄     | Adapt feature name if not relevant to project |
| `features[].description` | 🔄     | Adapt feature description if not relevant     |
| `features[].icon`        | 🔒     |                                               |

#### `cta`

| Field           | Status | Notes               |
| --------------- | ------ | ------------------- |
| `headline`      | ✏️     | CTA section heading |
| `description`   | ✏️     | CTA supporting text |
| `primaryCta`    | 🔒     |                     |
| `primaryLink`   | 🔒     |                     |
| `secondaryCta`  | 🔒     |                     |
| `secondaryLink` | 🔒     |                     |
| `image`         | 🔒     |                     |

#### `testimonials`

| Field                   | Status | Notes                                                                    |
| ----------------------- | ------ | ------------------------------------------------------------------------ |
| `title`                 | ✏️     | Section heading                                                          |
| `subtitle`              | ✏️     | Section subheading                                                       |
| `testimonials[].quote`  | 🔄     | Adapt testimonial to project/industry. Write realistic, relevant quotes. |
| `testimonials[].name`   | 🔄     | Change if current names are clearly placeholder                          |
| `testimonials[].title`  | 🔄     | Role/company — adapt if placeholder                                      |
| `testimonials[].rating` | 🔒     |                                                                          |
| `testimonials[].avatar` | 🔒     |                                                                          |

#### `faq` / `faq-two-columns`

| Field             | Status | Notes                                                                                          |
| ----------------- | ------ | ---------------------------------------------------------------------------------------------- |
| `title`           | ✏️     | Section heading                                                                                |
| `subtitle`        | ✏️     | Section subheading                                                                             |
| `faqs[].question` | ✏️     | **MUST** be rewritten for the target project/keyword. Write relevant, SEO-optimized questions. |
| `faqs[].answer`   | ✏️     | **MUST** be rewritten with accurate, helpful answers for the target project.                   |

> **FAQ Special Rule:** FAQ content is always fully editable because it directly targets search intent. The agent should write questions that real users would ask about the service/product + location. Answers should be detailed, informative, and naturally include relevant keywords.

#### `image-stats-faq`

| Field              | Status | Notes                                              |
| ------------------ | ------ | -------------------------------------------------- |
| `title`            | ✏️     |                                                    |
| `subtitle`         | ✏️     |                                                    |
| `badge`            | 🔄     | Rotating badge text — adapt if not relevant        |
| `stats[].value`    | 🔄     | Adapt stat numbers if they don't match the project |
| `stats[].label`    | 🔄     | Adapt stat labels                                  |
| `stats[].subtitle` | 🔄     |                                                    |
| `faqs[].question`  | ✏️     | Same as FAQ rule                                   |
| `faqs[].answer`    | ✏️     | Same as FAQ rule                                   |
| `faqs[].prefix`    | 🔒     |                                                    |
| `image`            | 🔒     |                                                    |

#### `process` / `process-alternating` / `process-steps-cards`

| Field                 | Status | Notes                                                                        |
| --------------------- | ------ | ---------------------------------------------------------------------------- |
| `title`               | ✏️     | Section heading                                                              |
| `subtitle`            | ✏️     | Section subheading                                                           |
| `headerDescription`   | ✏️     | (process-alternating only)                                                   |
| `steps[].title`       | 🔄     | Adapt step titles if not relevant to project. Keep the logical process flow. |
| `steps[].description` | 🔄     | Adapt step descriptions to describe the project's actual process.            |
| `steps[].number`      | 🔒     |                                                                              |
| `steps[].icon`        | 🔒     |                                                                              |
| `steps[].image`       | 🔒     |                                                                              |
| `steps[].ctaText`     | 🔒     |                                                                              |
| `steps[].ctaLink`     | 🔒     |                                                                              |
| `headerCta`           | 🔒     |                                                                              |

#### `team`

| Field                | Status | Notes                                                |
| -------------------- | ------ | ---------------------------------------------------- |
| `title`              | ✏️     | Section heading                                      |
| `subtitle`           | ✏️     | Section subheading                                   |
| `members[].name`     | 🔄     | Keep if realistic; adapt only if clearly placeholder |
| `members[].role`     | 🔄     | Adapt job titles to project context                  |
| `members[].bio`      | 🔄     | Adapt bios to be relevant to the project/industry    |
| `members[].avatar`   | 🔒     |                                                      |
| `members[].social.*` | 🔒     |                                                      |

#### `pricing` / `membership-pricing`

| Field                          | Status | Notes                                               |
| ------------------------------ | ------ | --------------------------------------------------- |
| `title`                        | ✏️     | Section heading                                     |
| `subtitle`                     | ✏️     |                                                     |
| `description`                  | ✏️     | (membership-pricing only)                           |
| `plans[].name`                 | 🔄     | Adapt plan names if not relevant                    |
| `plans[].subtitle`             | 🔄     |                                                     |
| `plans[].price`                | 🔒     | **Never change pricing**                            |
| `plans[].period`               | 🔒     |                                                     |
| `plans[].features[]`           | 🔄     | Adapt feature list items if not relevant to project |
| `plans[].guarantee`            | 🔄     |                                                     |
| `plans[].popular` / `featured` | 🔒     |                                                     |
| `plans[].ctaText`              | 🔒     |                                                     |
| `plans[].icon`                 | 🔒     |                                                     |

#### `stats`

| Field            | Status | Notes                                    |
| ---------------- | ------ | ---------------------------------------- |
| `title`          | ✏️     |                                          |
| `subtitle`       | ✏️     |                                          |
| `stats[].number` | 🔄     | Adapt numbers if not relevant to project |
| `stats[].label`  | 🔄     | Adapt labels to match project metrics    |
| `stats[].suffix` | 🔄     |                                          |
| `stats[].icon`   | 🔒     |                                          |

#### `services-grid` / `services-cards` / `services-carousel`

| Field                    | Status | Notes                                          |
| ------------------------ | ------ | ---------------------------------------------- |
| `title`                  | ✏️     |                                                |
| `subtitle`               | ✏️     |                                                |
| `description`            | ✏️     |                                                |
| `services[].title`       | 🔄     | Adapt service names to match project offerings |
| `services[].description` | 🔄     | Adapt descriptions to project services         |
| `services[].icon`        | 🔒     |                                                |
| `services[].image`       | 🔒     |                                                |
| `services[].link`        | 🔒     |                                                |
| `services[].linkText`    | 🔒     |                                                |
| `ctaText`                | 🔒     |                                                |

#### `content-showcase`

| Field                              | Status | Notes                                |
| ---------------------------------- | ------ | ------------------------------------ |
| `subtitle`                         | ✏️     |                                      |
| `headline` / `title`               | ✏️     |                                      |
| `text` / `column1` / `description` | ✏️     | Main content text — adapt to project |
| `column2`, `column3`               | ✏️     | Additional columns                   |
| `image`                            | 🔒     |                                      |

#### `image-text-split`

| Field        | Status | Notes |
| ------------ | ------ | ----- |
| `subtitle`   | ✏️     |       |
| `headline`   | ✏️     |       |
| `paragraph1` | ✏️     |       |
| `paragraph2` | ✏️     |       |
| `paragraph3` | ✏️     |       |
| `ctaText`    | 🔒     |       |
| `ctaLink`    | 🔒     |       |
| `image`      | 🔒     |       |

#### `centered-content`

| Field         | Status | Notes |
| ------------- | ------ | ----- |
| `subtitle`    | ✏️     |       |
| `headline`    | ✏️     |       |
| `description` | ✏️     |       |
| `ctaText`     | 🔒     |       |
| `ctaLink`     | 🔒     |       |
| `image`       | 🔒     |       |

#### `text-columns`

| Field                    | Status | Notes                              |
| ------------------------ | ------ | ---------------------------------- |
| `introduction` / `title` | ✏️     | Main intro text                    |
| `column1`                | ✏️     |                                    |
| `column2`                | ✏️     |                                    |
| `column3`                | ✏️     |                                    |
| `columns[]`              | ✏️     | Legacy format — adapt text content |
| `ctaText`                | 🔒     |                                    |
| `ctaLink`                | 🔒     |                                    |

#### `timeline` / `timeline-grid`

| Field                      | Status | Notes                                           |
| -------------------------- | ------ | ----------------------------------------------- |
| `title`                    | ✏️     |                                                 |
| `subtitle`                 | ✏️     |                                                 |
| `events[].title`           | 🔄     | Adapt if milestones don't match project history |
| `events[].description`     | 🔄     | Adapt descriptions                              |
| `events[].date` / `period` | 🔄     | Adapt dates/periods if needed                   |
| `events[].image`           | 🔒     |                                                 |

#### `contact` / `contact-split`

| Field             | Status | Notes |
| ----------------- | ------ | ----- |
| `title`           | ✏️     |       |
| `subtitle`        | ✏️     |       |
| `description`     | ✏️     |       |
| `formTitle`       | ✏️     |       |
| `formDescription` | ✏️     |       |
| `email`           | 🔒     |       |
| `phone`           | 🔒     |       |
| `address`         | 🔒     |       |

#### `feedback-contact`

| Field             | Status | Notes |
| ----------------- | ------ | ----- |
| `title`           | ✏️     |       |
| `subtitle`        | ✏️     |       |
| `description`     | ✏️     |       |
| `formTitle`       | ✏️     |       |
| `formDescription` | ✏️     |       |
| `ctaText`         | 🔒     |       |
| `buttonText`      | 🔒     |       |

#### `newsletter` / `newsletter-signup`

| Field                  | Status | Notes               |
| ---------------------- | ------ | ------------------- |
| `title`                | ✏️     |                     |
| `subtitle`             | ✏️     |                     |
| `description`          | ✏️     | (newsletter-signup) |
| `placeholder`          | 🔒     |                     |
| `buttonText`           | 🔒     |                     |
| `privacyNote` / `note` | 🔒     |                     |
| `image`                | 🔒     |                     |

#### `videohero`

| Field       | Status | Notes |
| ----------- | ------ | ----- |
| `title`     | ✏️     |       |
| `subtitle`  | ✏️     |       |
| `ctaText`   | 🔒     |       |
| `ctaLink`   | 🔒     |       |
| `videoUrl`  | 🔒     |       |
| `thumbnail` | 🔒     |       |

#### `gallery`

| Field              | Status | Notes                 |
| ------------------ | ------ | --------------------- |
| `title`            | ✏️     |                       |
| `subtitle`         | ✏️     |                       |
| `items[].title`    | 🔄     | Adapt if not relevant |
| `items[].category` | 🔄     |                       |
| `items[].image`    | 🔒     |                       |
| `items[].link`     | 🔒     |                       |

#### `logocloud`

| Field          | Status | Notes                       |
| -------------- | ------ | --------------------------- |
| `title`        | ✏️     |                             |
| `subtitle`     | ✏️     |                             |
| `logos[].name` | 🔒     | Brand names — do not change |
| `logos[].url`  | 🔒     |                             |

#### `bento-features`

| Field                       | Status | Notes |
| --------------------------- | ------ | ----- |
| `title`                     | ✏️     |       |
| `subtitle`                  | ✏️     |       |
| `features[].label`          | 🔄     |       |
| `features[].title`          | 🔄     |       |
| `features[].description`    | 🔄     |       |
| `features[].size`, `height` | 🔒     |       |

#### `features-carousel`

| Field                    | Status | Notes |
| ------------------------ | ------ | ----- |
| `features[].title`       | 🔄     |       |
| `features[].description` | 🔄     |       |
| `features[].icon`        | 🔒     |       |
| `features[].ctaText`     | 🔒     |       |
| `features[].featured`    | 🔒     |       |

#### `content-with-services`

| Field                    | Status | Notes |
| ------------------------ | ------ | ----- |
| `title`                  | ✏️     |       |
| `subtitle`               | ✏️     |       |
| `description`            | ✏️     |       |
| `additionalText`         | ✏️     |       |
| `imageLabel`             | 🔄     |       |
| `services[].title`       | 🔄     |       |
| `services[].description` | 🔄     |       |
| `services[].icon`        | 🔒     |       |
| `ctaText`                | 🔒     |       |
| `image`                  | 🔒     |       |

#### `split-content-checklist`

| Field         | Status | Notes                                            |
| ------------- | ------ | ------------------------------------------------ |
| `title`       | ✏️     |                                                  |
| `description` | ✏️     |                                                  |
| `checklist[]` | 🔄     | Adapt checklist items if not relevant to project |
| `image`       | 🔒     |                                                  |

#### `dropcap-services`

| Field                      | Status | Notes                    |
| -------------------------- | ------ | ------------------------ |
| `title`                    | ✏️     |                          |
| `subtitle`                 | ✏️     |                          |
| `introText`                | ✏️     |                          |
| `additionalText`           | ✏️     |                          |
| `dropCap`                  | 🔒     | Single decorative letter |
| `signature`                | 🔒     |                          |
| `serviceColumns[].title`   | 🔄     |                          |
| `serviceColumns[].items[]` | 🔄     | Adapt service list items |
| `serviceColumns[].ctaText` | 🔒     |                          |
| `serviceColumns[].ctaLink` | 🔒     |                          |

#### `centered-testimonial`

| Field          | Status | Notes                                    |
| -------------- | ------ | ---------------------------------------- |
| `title`        | ✏️     |                                          |
| `subtitle`     | ✏️     |                                          |
| `textBlocks[]` | ✏️     | Main content paragraphs — fully editable |
| `signature`    | 🔒     |                                          |

#### `content-video-services`

| Field                    | Status | Notes |
| ------------------------ | ------ | ----- |
| `title`                  | ✏️     |       |
| `subtitle`               | ✏️     |       |
| `description`            | ✏️     |       |
| `additionalText`         | ✏️     |       |
| `services[].title`       | 🔄     |       |
| `services[].description` | 🔄     |       |
| `services[].icon`        | 🔒     |       |
| `ctaText`                | 🔒     |       |
| `videoUrl`               | 🔒     |       |
| `thumbnail`              | 🔒     |       |

#### `hero-with-services`

| Field                    | Status | Notes |
| ------------------------ | ------ | ----- |
| `title`                  | ✏️     |       |
| `subtitle`               | ✏️     |       |
| `description`            | ✏️     |       |
| `services[].title`       | 🔄     |       |
| `services[].description` | 🔄     |       |
| `services[].icon`        | 🔒     |       |
| `ctaText`                | 🔒     |       |
| `phone`                  | 🔒     |       |

#### `hero-with-testimonials`

| Field                   | Status | Notes                   |
| ----------------------- | ------ | ----------------------- |
| `title`                 | ✏️     |                         |
| `subtitle`              | ✏️     |                         |
| `description`           | ✏️     |                         |
| `testimonials[].text`   | 🔄     | Adapt quotes to project |
| `testimonials[].name`   | 🔄     |                         |
| `testimonials[].avatar` | 🔒     |                         |
| `ctaText`               | 🔒     |                         |

#### `integrations-grid`

| Field                        | Status | Notes |
| ---------------------------- | ------ | ----- |
| `title`                      | ✏️     |       |
| `subtitle`                   | ✏️     |       |
| `description`                | ✏️     |       |
| `integrations[].name`        | 🔄     |       |
| `integrations[].description` | 🔄     |       |
| `integrations[].logo`        | 🔒     |       |
| `integrations[].link`        | 🔒     |       |
| `integrations[].linkText`    | 🔒     |       |

#### `social-follow`

| Field       | Status | Notes                         |
| ----------- | ------ | ----------------------------- |
| `title`     | ✏️     |                               |
| `ctaText`   | 🔒     |                               |
| `socials[]` | 🔒     | Platform + URL — never change |

#### `brand-identity-hero`

| Field           | Status | Notes              |
| --------------- | ------ | ------------------ |
| `title1`        | ✏️     |                    |
| `title2`        | ✏️     |                    |
| `accent`        | ✏️     | Accent word/phrase |
| `badge1`        | 🔄     |                    |
| `badge2`        | 🔄     |                    |
| `circleText`    | 🔄     |                    |
| `ctaLinks[]`    | 🔒     |                    |
| `socialLinks[]` | 🔒     |                    |

#### `simple-centered-hero`

| Field      | Status | Notes |
| ---------- | ------ | ----- |
| `title`    | ✏️     |       |
| `subtitle` | ✏️     |       |

#### `creative-network-hero`

| Field                                        | Status | Notes       |
| -------------------------------------------- | ------ | ----------- |
| `eyebrow`                                    | ✏️     |             |
| `title`                                      | ✏️     |             |
| `subtitle`                                   | ✏️     |             |
| `leftCardLabel`                              | 🔄     |             |
| `rightCardLabel`                             | 🔄     |             |
| `logos[]`                                    | 🔒     | Brand names |
| `brand`                                      | 🔒     |             |
| `navItems[]`                                 | 🔒     |             |
| `primaryText`, `secondaryText`, `topCtaText` | 🔒     |             |
| `primaryLink`, `secondaryLink`, `topCtaLink` | 🔒     |             |
| `leftCardImage`, `rightCardImage`            | 🔒     |             |

#### `immersive-split-showcase`

| Field                          | Status | Notes                            |
| ------------------------------ | ------ | -------------------------------- |
| `eyebrow`                      | ✏️     |                                  |
| `title`                        | ✏️     |                                  |
| `leftLines[]`                  | ✏️     | Content lines — adapt to project |
| `cardTitle`                    | ✏️     |                                  |
| `cardDescription`              | ✏️     |                                  |
| `backgroundImage`, `cardImage` | 🔒     |                                  |
| `cardCtaText`                  | 🔒     |                                  |
| `cardCtaLink`                  | 🔒     |                                  |

#### `provider-masonry`

| Field                      | Status | Notes |
| -------------------------- | ------ | ----- |
| `title`                    | ✏️     |       |
| `subtitle`                 | ✏️     |       |
| `providers[].name`         | 🔄     |       |
| `providers[].tag`          | 🔄     |       |
| `providers[].meta`         | 🔄     |       |
| `providers[].image`        | 🔒     |       |
| `providers[].tall`, `wide` | 🔒     |       |
| `ctaText`                  | 🔒     |       |
| `ctaLink`                  | 🔒     |       |

#### `editorial-cards-row`

| Field                 | Status | Notes |
| --------------------- | ------ | ----- |
| `title`               | ✏️     |       |
| `subtitle`            | ✏️     |       |
| `cards[].title`       | 🔄     |       |
| `cards[].description` | 🔄     |       |
| `cards[].meta`        | 🔄     |       |
| `cards[].image`       | 🔒     |       |
| `ctaText`             | 🔒     |       |
| `ctaLink`             | 🔒     |       |

#### `minimal-final-cta`

| Field           | Status | Notes |
| --------------- | ------ | ----- |
| `title`         | ✏️     |       |
| `primaryText`   | 🔒     |       |
| `primaryLink`   | 🔒     |       |
| `secondaryText` | 🔒     |       |
| `secondaryLink` | 🔒     |       |

#### `cinematic-footer` / `footer` / `clickfunnel-footer`

All footer fields are **🔒 FROZEN**. Do not modify any footer content — it contains brand, legal, navigation, and contact information.

#### Header widgets (`header`, `header-top-info`, `header-with-icons`, `header-account-bar`, `header-full-contact`, `header-clickfunnel`, `simple-header-divider`)

All header fields are **🔒 FROZEN**. Do not modify any header content — it contains branding, navigation, and UI elements.

---

### Understanding ✏️ vs 🔄

- **✏️ EDITABLE (always rewrite):** These are the primary SEO targets. Section headings (`title`, `subtitle`), hero headlines, main descriptive paragraphs, FAQ questions/answers. The agent **must** adapt these to produce relevant, optimized copy.

- **🔄 CONDITIONALLY EDITABLE (adapt when needed):** These are secondary content items, typically inside arrays (feature titles, testimonial quotes, step descriptions, etc.). The agent should evaluate whether the current template content is relevant to the target project:
  - If the template describes "web development services" but the project is about "plumbing in Paris", the agent **must** rewrite these fields.
  - If the template fields already align with the project topic, the agent may keep them as-is or refine them.
  - When adapting array items, maintain the same structure and tone as the template.

### Decision Flowchart for ✏️ / 🔄 Fields

```
Is the field a primary heading/title/subtitle of a section?
  → YES: Always rewrite (✏️)
Is the field a FAQ question or answer?
  → YES: Always rewrite (✏️)
Is the field inside an array (features, services, steps, testimonials, etc.)?
  → Does the current text relate to the target project?
    → NO: Rewrite to match project (🔄)
    → YES: Refine for SEO optimization or keep as-is (🔄)
```

---

## Image & Media URLs

**CRITICAL:** All image and media URLs must be **plain HTTP(S) URLs**. Do NOT use markdown link syntax.

### Correct format

```json
{
  "content": {
    "image": "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg",
    "avatar": "https://images.unsplash.com/photo-1234567890",
    "thumbnail": "https://example.com/video-thumb.jpg"
  }
}
```

### Incorrect format (will be auto-sanitized but should be avoided)

```json
{
  "content": {
    "image": "[https://images.pexels.com/...](https://images.pexels.com/...)",
    "avatar": "[Photo](https://images.unsplash.com/photo-1234567890)"
  }
}
```

### Image-related content fields

The following fields are used across widgets and must contain plain URLs:

| Field                     | Used by                                                                            |
| ------------------------- | ---------------------------------------------------------------------------------- |
| `content.image`           | hero, image-text-split, content-showcase, image-stats-faq, split-content-checklist |
| `content.backgroundImage` | immersive-split-showcase, cinematic-footer                                         |
| `content.thumbnail`       | videohero, content-video-services                                                  |
| `content.logo`            | header-clickfunnel                                                                 |
| `testimonials[].avatar`   | testimonials, click-funnel-testimonials, hero-with-testimonials                    |
| `members[].avatar`        | team                                                                               |
| `items[].image`           | gallery, provider-masonry                                                          |
| `steps[].image`           | process-steps-cards, process-alternating                                           |
| `cards[].image`           | editorial-cards-row                                                                |
| `services[].image`        | services-cards                                                                     |
| `events[].image`          | timeline                                                                           |
| `features[].thumbnailUrl` | clickfunnel-features                                                               |

> **Note:** The importer includes automatic sanitization that strips markdown link syntax from URLs. However, providing clean URLs avoids potential edge cases and ensures maximum compatibility.

---

## SEO Content Quality Rules

- `title`: <= 60 chars
- `description`: <= 160 chars
- `seo_h1` should be aligned with hero main headline
- Use human, local-intent language (service + city/intent where relevant)
- CTA/button text is frozen by default; only if explicitly requested, keep text/action coherent with links (`tel:`, `mailto:`, anchors, URLs)

## Text Formatting Rules (Critical)

- Never use markdown emphasis syntax in JSON values: `**word**`, `*word*`, `__word__`.
- Markdown emphasis is not rendered by the importer and must be treated as invalid output.
- Inline HTML emphasis is exceptionally allowed only in SEO writing fields (never in navigation/buttons/links).
- Allowed inline tags in that case: `<strong>`, `<em>`, `<u>`.
- Do not nest tags and do not introduce any other HTML tags.

---

## Hard Validation Checklist

Before returning JSON, ensure:

- Root is valid JSON (no comments, no trailing commas).
- Root is one of accepted formats.
- `pages` is a non-empty array.
- Every page has unique `page_key` in payload.
- Every page has non-empty `title`.
- Any `sections_data` provided is an array of valid section objects.
- All ✏️ fields have been adapted to the target project — do not leave template placeholder text.
- All 🔄 fields have been evaluated: rewritten if irrelevant to the project, refined or kept if relevant.
- All 🔒 fields are strictly unchanged from the template.
- Header and footer sections are completely untouched.
- Media URLs are unchanged unless explicitly requested.
- Contact/operational fields (`email`, `phone`, `address`, `openHours*`, `logoText`) are unchanged.
- FAQ questions and answers are fully rewritten for the target project.
- Array cardinality is preserved (same number of items); exception: `FAQ_EXTENDED` mode when explicitly requested.
- No markdown emphasis markers appear inside JSON string values.
- No new sections or fields have been created.

---

## Important Output Instruction for AI Agent

Return **JSON only**.
Do **not** wrap in markdown.
Do **not** add explanations before/after JSON.
