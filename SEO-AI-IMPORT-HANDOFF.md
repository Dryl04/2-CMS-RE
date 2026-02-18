# SEO AI Agent Handoff – JSON Contract for Import

## Goal

Produce a **valid JSON file** that can be pasted into the SEO importer to create/update pages in bulk.

The expected workflow is:

1. Export a page template from the builder (`JSON` export).
2. Give that export + this document to the SEO AI agent.
3. Agent returns one JSON payload.
4. Paste/import that payload in the SEO Import UI.

---

## Accepted Output Formats

### Format A (recommended)

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
      "sections_data": []
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
- `sections` -> `page.sections_data` (if missing/empty)

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

- `id`
- `type`
- `content` (object)
- `design` (object)

Strong recommendation for fidelity:

- Keep `id`, `type`, `order`, `variant`, `design`, `advanced` exactly as in exported template.
- Modify only `content` values.
- Keep same number/order of sections as template.
- Keep same cardinality in arrays (features, testimonials, nav items, columns) unless explicitly requested.

---

## SEO Content Quality Rules

- `title`: <= 60 chars
- `description`: <= 160 chars
- `seo_h1` should be aligned with hero main headline
- Use human, local-intent language (service + city/intent where relevant)
- Keep CTA text/action coherent with links (`tel:`, `mailto:`, anchors, URLs)

---

## Hard Validation Checklist

Before returning JSON, ensure:

- Root is valid JSON (no comments, no trailing commas).
- Root is one of accepted formats.
- `pages` is a non-empty array.
- Every page has unique `page_key` in payload.
- Every page has non-empty `title`.
- Any `sections_data` provided is an array of valid section objects.

---

## Important Output Instruction for AI Agent

Return **JSON only**.
Do **not** wrap in markdown.
Do **not** add explanations before/after JSON.
