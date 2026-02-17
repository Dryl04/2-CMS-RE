/*
  # Add daisy_theme_slug to page_templates

  This migration aligns DB schema with the frontend model/template builder.
  It safely adds the column only if missing.
*/

ALTER TABLE page_templates
ADD COLUMN IF NOT EXISTS daisy_theme_slug text;

CREATE INDEX IF NOT EXISTS idx_page_templates_daisy_theme_slug
  ON page_templates(daisy_theme_slug);
