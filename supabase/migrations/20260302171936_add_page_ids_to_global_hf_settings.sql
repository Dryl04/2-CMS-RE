/*
  # Add page targeting columns to global_hf_settings

  ## Changes
  - Add `target_page_ids` (uuid[], nullable) to specify which existing pages should receive the global H/F override
  - When target_page_ids is NULL or empty, the setting applies to no specific existing pages (only new ones if apply_on_import/create is true)
  - When target_page_ids contains page IDs, those pages will have their header/footer overridden at render time

  ## Important Notes
  - This does NOT modify existing page data (sections_data). The override is applied at render time only.
  - Pages retain their original header/footer in sections_data for when the override is deactivated.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'global_hf_settings' AND column_name = 'target_page_ids'
  ) THEN
    ALTER TABLE global_hf_settings ADD COLUMN target_page_ids uuid[] DEFAULT NULL;
  END IF;
END $$;
