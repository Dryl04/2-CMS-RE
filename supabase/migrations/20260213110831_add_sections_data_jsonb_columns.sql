/*
  # Add sections_data JSONB columns

  1. Modified Tables
    - `page_templates`
      - Added `sections_data` (jsonb) - stores the visual builder sections as JSON array
    - `seo_metadata`
      - Added `sections_data` (jsonb) - stores the page's visual sections for rendering

  2. Notes
    - sections_data stores an array of PageBuilderSection objects
    - This enables rendering pages with the visual widget system
    - Backwards compatible: existing pages without sections_data still work via content HTML
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'page_templates' AND column_name = 'sections_data'
  ) THEN
    ALTER TABLE page_templates ADD COLUMN sections_data jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'seo_metadata' AND column_name = 'sections_data'
  ) THEN
    ALTER TABLE seo_metadata ADD COLUMN sections_data jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;
