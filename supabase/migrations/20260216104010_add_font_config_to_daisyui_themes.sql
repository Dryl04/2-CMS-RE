/*
  # Add font configuration to DaisyUI themes

  1. Modified Tables
    - `daisyui_themes`
      - `font_config` (jsonb, nullable) - stores font settings per theme
        - bodyFont: body text font family
        - headingFont: heading font family
        - headingWeight: heading font weight (300-900)

  2. Notes
    - Font config is optional; when null, widgets use their default fonts
    - Stored as JSONB for flexibility
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daisyui_themes' AND column_name = 'font_config'
  ) THEN
    ALTER TABLE daisyui_themes ADD COLUMN font_config jsonb DEFAULT NULL;
  END IF;
END $$;
