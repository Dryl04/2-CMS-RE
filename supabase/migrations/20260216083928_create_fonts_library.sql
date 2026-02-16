/*
  # Create fonts_library table for managing imported fonts

  1. New Tables
    - `fonts_library`
      - `id` (uuid, primary key)
      - `font_name` (text, unique) - Name of the font (e.g., "Roboto", "Poppins")
      - `font_family` (text) - Full font-family CSS value
      - `font_url` (text) - Google Fonts URL or custom font URL
      - `font_weights` (text[]) - Available font weights (e.g., ["300", "400", "700"])
      - `is_google_font` (boolean) - Whether this is from Google Fonts
      - `imported_by` (uuid) - User who imported the font (null for system fonts)
      - `is_system` (boolean) - Whether this is a system/default font
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `fonts_library` table
    - All authenticated users can read all fonts
    - Users can import new fonts
    - Only admins can delete fonts (or users can delete their own imported fonts)

  3. Initial Data
    - Insert common Google Fonts for immediate availability
*/

-- Create fonts_library table
CREATE TABLE IF NOT EXISTS fonts_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  font_name text UNIQUE NOT NULL,
  font_family text NOT NULL,
  font_url text NOT NULL,
  font_weights text[] DEFAULT ARRAY['400', '700'],
  is_google_font boolean DEFAULT true,
  imported_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_system boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE fonts_library ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can read all fonts" ON fonts_library;
DROP POLICY IF EXISTS "Users can import fonts" ON fonts_library;
DROP POLICY IF EXISTS "Users can delete their own imported fonts" ON fonts_library;

-- Policy: All authenticated users can read all fonts
CREATE POLICY "Authenticated users can read all fonts"
  ON fonts_library
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users can import new fonts
CREATE POLICY "Users can import fonts"
  ON fonts_library
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = imported_by);

-- Policy: Users can delete only their own imported fonts (not system fonts)
CREATE POLICY "Users can delete their own imported fonts"
  ON fonts_library
  FOR DELETE
  TO authenticated
  USING (auth.uid() = imported_by AND imported_by IS NOT NULL AND is_system = false);

-- Insert common system fonts
INSERT INTO fonts_library (font_name, font_family, font_url, font_weights, is_google_font, imported_by, is_system) VALUES
(
  'Inter',
  '"Inter", system-ui, sans-serif',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap',
  ARRAY['300', '400', '500', '600', '700', '800', '900'],
  true,
  NULL,
  true
),
(
  'Roboto',
  '"Roboto", system-ui, sans-serif',
  'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap',
  ARRAY['300', '400', '500', '700', '900'],
  true,
  NULL,
  true
),
(
  'Poppins',
  '"Poppins", system-ui, sans-serif',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap',
  ARRAY['300', '400', '500', '600', '700', '800', '900'],
  true,
  NULL,
  true
),
(
  'Playfair Display',
  '"Playfair Display", serif',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&display=swap',
  ARRAY['400', '500', '600', '700', '800', '900'],
  true,
  NULL,
  true
),
(
  'Montserrat',
  '"Montserrat", system-ui, sans-serif',
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap',
  ARRAY['300', '400', '500', '600', '700', '800', '900'],
  true,
  NULL,
  true
),
(
  'Open Sans',
  '"Open Sans", system-ui, sans-serif',
  'https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700;800&display=swap',
  ARRAY['300', '400', '500', '600', '700', '800'],
  true,
  NULL,
  true
),
(
  'Lato',
  '"Lato", system-ui, sans-serif',
  'https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&display=swap',
  ARRAY['300', '400', '700', '900'],
  true,
  NULL,
  true
),
(
  'Merriweather',
  '"Merriweather", serif',
  'https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700;900&display=swap',
  ARRAY['300', '400', '700', '900'],
  true,
  NULL,
  true
)
ON CONFLICT (font_name) DO NOTHING;