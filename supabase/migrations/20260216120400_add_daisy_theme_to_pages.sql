/*
  # Add DaisyUI theme support to pages and templates
  
  1. Changes
    - Add `daisy_theme_slug` column to `seo_metadata` table
    - Add `daisy_theme_slug` column to `page_templates` table
    - These columns store the slug of the active DaisyUI theme for each page/template
    - NULL means inherit from global theme
    - Special value 'none' means no theme applied
*/

-- Add daisy_theme_slug to seo_metadata
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'seo_metadata' AND column_name = 'daisy_theme_slug'
  ) THEN
    ALTER TABLE seo_metadata ADD COLUMN daisy_theme_slug text DEFAULT NULL;
  END IF;
END $$;

-- Add daisy_theme_slug to page_templates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'page_templates' AND column_name = 'daisy_theme_slug'
  ) THEN
    ALTER TABLE page_templates ADD COLUMN daisy_theme_slug text DEFAULT NULL;
  END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN seo_metadata.daisy_theme_slug IS 'DaisyUI theme slug for this page. NULL = inherit global, "none" = no theme';
COMMENT ON COLUMN page_templates.daisy_theme_slug IS 'DaisyUI theme slug for this template. NULL = inherit global, "none" = no theme';
