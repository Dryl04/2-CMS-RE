/*
  # Update existing page themes with new color properties

  1. Changes
    - Add new color properties to existing page themes:
      - backgroundColor (default: #ffffff)
      - primaryColor (default: #3b82f6)
      - secondaryColor (default: #8b5cf6)
      - accentColor (default: #10b981)
    
  2. Notes
    - This migration updates all existing themes in the page_themes table
    - Each default theme gets unique color values matching its design aesthetic
    - Custom themes get sensible default color values
*/

-- Update default theme
UPDATE page_themes
SET css = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        css,
        '{backgroundColor}',
        '"#ffffff"'
      ),
      '{primaryColor}',
      '"#3b82f6"'
    ),
    '{secondaryColor}',
    '"#8b5cf6"'
  ),
  '{accentColor}',
  '"#10b981"'
)
WHERE name = 'Par défaut' AND is_default = true;

-- Update elegant theme
UPDATE page_themes
SET css = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        css,
        '{backgroundColor}',
        '"#fafaf9"'
      ),
      '{primaryColor}',
      '"#a855f7"'
    ),
    '{secondaryColor}',
    '"#ec4899"'
  ),
  '{accentColor}',
  '"#f59e0b"'
)
WHERE name = 'Élégant' AND is_default = true;

-- Update modern theme
UPDATE page_themes
SET css = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        css,
        '{backgroundColor}',
        '"#ffffff"'
      ),
      '{primaryColor}',
      '"#06b6d4"'
    ),
    '{secondaryColor}',
    '"#8b5cf6"'
  ),
  '{accentColor}',
  '"#f43f5e"'
)
WHERE name = 'Moderne' AND is_default = true;

-- Update bold theme
UPDATE page_themes
SET css = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        css,
        '{backgroundColor}',
        '"#ffffff"'
      ),
      '{primaryColor}',
      '"#ef4444"'
    ),
    '{secondaryColor}',
    '"#f97316"'
  ),
  '{accentColor}',
  '"#eab308"'
)
WHERE name = 'Audacieux' AND is_default = true;

-- Update minimal theme
UPDATE page_themes
SET css = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        css,
        '{backgroundColor}',
        '"#fafafa"'
      ),
      '{primaryColor}',
      '"#64748b"'
    ),
    '{secondaryColor}',
    '"#94a3b8"'
  ),
  '{accentColor}',
  '"#0ea5e9"'
)
WHERE name = 'Minimaliste' AND is_default = true;

-- Update classic theme
UPDATE page_themes
SET css = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        css,
        '{backgroundColor}',
        '"#fffef7"'
      ),
      '{primaryColor}',
      '"#92400e"'
    ),
    '{secondaryColor}',
    '"#78350f"'
  ),
  '{accentColor}',
  '"#b45309"'
)
WHERE name = 'Classique' AND is_default = true;

-- Update any custom themes that don't have these properties
UPDATE page_themes
SET css = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        css,
        '{backgroundColor}',
        '"#ffffff"'
      ),
      '{primaryColor}',
      '"#3b82f6"'
    ),
    '{secondaryColor}',
    '"#8b5cf6"'
  ),
  '{accentColor}',
  '"#10b981"'
)
WHERE is_default = false 
  AND (
    css->>'backgroundColor' IS NULL 
    OR css->>'primaryColor' IS NULL
    OR css->>'secondaryColor' IS NULL
    OR css->>'accentColor' IS NULL
  );
