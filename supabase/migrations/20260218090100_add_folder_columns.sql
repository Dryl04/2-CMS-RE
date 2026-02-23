/*
  # Add folder column to seo_metadata and page_templates

  Allows users to organize pages and templates into folders.
  Folder is a simple text column (nullable) representing the folder name.
*/

-- Add folder column to seo_metadata
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'seo_metadata' AND column_name = 'folder'
  ) THEN
    ALTER TABLE seo_metadata ADD COLUMN folder text DEFAULT NULL;
  END IF;
END $$;

-- Add folder column to page_templates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'page_templates' AND column_name = 'folder'
  ) THEN
    ALTER TABLE page_templates ADD COLUMN folder text DEFAULT NULL;
  END IF;
END $$;

-- Indexes for folder filtering
CREATE INDEX IF NOT EXISTS idx_seo_metadata_folder ON seo_metadata(folder);
CREATE INDEX IF NOT EXISTS idx_page_templates_folder ON page_templates(folder);
