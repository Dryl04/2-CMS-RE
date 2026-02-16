/*
  # Create page_themes table for typography and styling themes

  1. New Tables
    - `page_themes`
      - `id` (uuid, primary key)
      - `name` (text) - Theme display name
      - `description` (text) - Theme description
      - `css` (jsonb) - CSS configuration containing:
        - bodyFont, headingFont
        - textColor, headingColor
        - textBase, textSm, textLg
        - h1Size, h2Size, h3Size, h4Size
        - textWeight, headingWeight
      - `user_id` (uuid) - Creator of the theme (null for default themes)
      - `is_default` (boolean) - Whether this is a default/system theme
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Changes
    - Add `page_theme_id` column to `page_templates` table to link templates with themes

  3. Security
    - Enable RLS on `page_themes` table
    - All authenticated users can read all themes
    - Users can create their own themes
    - Users can only update/delete their own custom themes (not default themes)

  4. Initial Data
    - Insert 6 default page themes (default, elegant, modern, bold, minimal, classic)
*/

-- Create page_themes table
CREATE TABLE IF NOT EXISTS page_themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  css jsonb NOT NULL DEFAULT '{}',
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add page_theme_id to page_templates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'page_templates' AND column_name = 'page_theme_id'
  ) THEN
    ALTER TABLE page_templates ADD COLUMN page_theme_id uuid REFERENCES page_themes(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE page_themes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can read all page themes" ON page_themes;
DROP POLICY IF EXISTS "Users can create their own page themes" ON page_themes;
DROP POLICY IF EXISTS "Users can update their own page themes" ON page_themes;
DROP POLICY IF EXISTS "Users can delete their own page themes" ON page_themes;

-- Policy: All authenticated users can read all themes
CREATE POLICY "Authenticated users can read all page themes"
  ON page_themes
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users can create their own themes
CREATE POLICY "Users can create their own page themes"
  ON page_themes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update only their own themes (not default themes)
CREATE POLICY "Users can update their own page themes"
  ON page_themes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND user_id IS NOT NULL)
  WITH CHECK (auth.uid() = user_id AND user_id IS NOT NULL);

-- Policy: Users can delete only their own themes (not default themes)
CREATE POLICY "Users can delete their own page themes"
  ON page_themes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id AND user_id IS NOT NULL);

-- Insert default page themes
INSERT INTO page_themes (name, description, css, user_id, is_default) VALUES
(
  'Par défaut',
  'Thème par défaut avec Inter',
  '{"bodyFont":"Inter, system-ui, sans-serif","headingFont":"Inter, system-ui, sans-serif","textColor":"#1f2937","headingColor":"#111827","textBase":"16px","textSm":"14px","textLg":"18px","h1Size":"48px","h2Size":"36px","h3Size":"30px","h4Size":"24px","textWeight":"400","headingWeight":"700"}'::jsonb,
  NULL,
  true
),
(
  'Élégant',
  'Typographie élégante avec Playfair Display',
  '{"bodyFont":"Georgia, serif","headingFont":"\"Playfair Display\", Georgia, serif","textColor":"#374151","headingColor":"#1f2937","textBase":"17px","textSm":"15px","textLg":"19px","h1Size":"56px","h2Size":"40px","h3Size":"32px","h4Size":"26px","textWeight":"400","headingWeight":"700"}'::jsonb,
  NULL,
  true
),
(
  'Moderne',
  'Design moderne avec Poppins',
  '{"bodyFont":"\"Poppins\", system-ui, sans-serif","headingFont":"\"Poppins\", system-ui, sans-serif","textColor":"#4b5563","headingColor":"#111827","textBase":"15px","textSm":"13px","textLg":"17px","h1Size":"44px","h2Size":"34px","h3Size":"28px","h4Size":"22px","textWeight":"400","headingWeight":"600"}'::jsonb,
  NULL,
  true
),
(
  'Audacieux',
  'Typographie forte et audacieuse',
  '{"bodyFont":"\"Roboto\", system-ui, sans-serif","headingFont":"\"Montserrat\", system-ui, sans-serif","textColor":"#374151","headingColor":"#000000","textBase":"16px","textSm":"14px","textLg":"18px","h1Size":"52px","h2Size":"38px","h3Size":"30px","h4Size":"24px","textWeight":"400","headingWeight":"800"}'::jsonb,
  NULL,
  true
),
(
  'Minimaliste',
  'Design épuré et minimaliste',
  '{"bodyFont":"\"Work Sans\", system-ui, sans-serif","headingFont":"\"Work Sans\", system-ui, sans-serif","textColor":"#6b7280","headingColor":"#374151","textBase":"15px","textSm":"13px","textLg":"17px","h1Size":"40px","h2Size":"32px","h3Size":"26px","h4Size":"20px","textWeight":"300","headingWeight":"500"}'::jsonb,
  NULL,
  true
),
(
  'Classique',
  'Typographie classique avec Times',
  '{"bodyFont":"\"Lora\", Georgia, serif","headingFont":"\"Merriweather\", Georgia, serif","textColor":"#1f2937","headingColor":"#111827","textBase":"18px","textSm":"16px","textLg":"20px","h1Size":"48px","h2Size":"36px","h3Size":"30px","h4Size":"24px","textWeight":"400","headingWeight":"700"}'::jsonb,
  NULL,
  true
)
ON CONFLICT DO NOTHING;