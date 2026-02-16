/*
  # Add SEO Headings to Templates

  1. Changes
    - Add `seo_h1` column to page_templates table for main SEO heading
    - Add `seo_h2` column to page_templates table for secondary SEO heading
    
  2. Notes
    - H1 is critical for SEO and should be unique per page
    - H2 provides additional context and semantic structure
    - Both fields are optional to maintain backward compatibility
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'page_templates' AND column_name = 'seo_h1'
  ) THEN
    ALTER TABLE page_templates ADD COLUMN seo_h1 text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'page_templates' AND column_name = 'seo_h2'
  ) THEN
    ALTER TABLE page_templates ADD COLUMN seo_h2 text;
  END IF;
END $$;