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
          "content.ctaText": "Contact us"
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

- Keep `id`, `type`, `order`, `variant`, `design`, `advanced`, `themeConfig` **exactly as in exported template**.
- Apply a strict scope lock: only edit SEO writing fields (headline, subheadline, section title/subtitle/description, quotes, `seo_h1`, `seo_h2`, long-form `content`).
- Do not edit UI/navigation/action fields unless explicitly requested: nav labels/links, button labels/links, anchors, social links.
- Do not edit media URLs (`image`, `backgroundImage`, `thumbnail`, `avatar`, `logo`) unless explicitly requested.
- Keep same number/order of sections as template.
- Keep same cardinality in arrays (features, testimonials, nav items, columns) unless explicitly requested.
- Treat FAQ capacity as strict: for every `content.faqs`, generate exactly the available slot count from `array_cardinality`/`content_shape.__count`.
- Never draft more FAQ items than template capacity; overflow would be dropped at import.
- If source brief contains more questions than slots, prioritize highest SEO intent questions and merge overlaps.
- **Image/media URLs must be plain URLs** — never wrap them in markdown link syntax. See "Image & Media URLs" section below.
- The `design.typography` object supports: `fontFamily`, `headingFontFamily`, `headingFontWeight`, `headingFontSize`, `h1FontFamily`, `h1FontWeight`, `h1FontSize`, `h2FontFamily`, `h2FontWeight`, `h2FontSize`, `textFontSize`, `buttonFontSize`, `buttonFontFamily`, `headingColor`, `h1Color`, `h2Color`, `textColor`, `linkColor`, `subtitleColor`.
- The `design.colors` object supports: `buttonBackground`, `buttonText`, `buttonBackgroundHover`, `buttonRadius`, `buttonSize`, `buttonBorderWidth`, `buttonBorderStyle`, `buttonBorderColor`, `buttonShadow`, `iconBackground`, `iconColor`, `iconBorderColor`, `iconBorderWidth`, `iconRadius`, `accent`, `primary`, `secondary`.

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
- Keep CTA text/action coherent with links (`tel:`, `mailto:`, anchors, URLs) when CTA edits are explicitly requested

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
- UI/navigation/action fields are unchanged unless explicitly requested.
- Media URLs are unchanged unless explicitly requested.
- For each `content.faqs`, produced item count exactly matches template capacity (no hidden or discarded drafted FAQs).
- No markdown emphasis markers appear inside JSON string values.

---

## Important Output Instruction for AI Agent

Return **JSON only**.
Do **not** wrap in markdown.
Do **not** add explanations before/after JSON.
