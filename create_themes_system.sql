/*
  INSTRUCTIONS: Copiez et exécutez ce script dans le SQL Editor de Supabase
  Dashboard > SQL Editor > New query
*/

-- Create themes table
CREATE TABLE IF NOT EXISTS themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  colors jsonb NOT NULL DEFAULT '{}',
  typography jsonb NOT NULL DEFAULT '{}',
  spacing jsonb NOT NULL DEFAULT '{}',
  components jsonb NOT NULL DEFAULT '{}',
  custom_css text DEFAULT '',
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add custom_css column to themes if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'themes' AND column_name = 'custom_css'
  ) THEN
    ALTER TABLE themes ADD COLUMN custom_css text DEFAULT '';
  END IF;
END $$;

-- Add theme_id to page_templates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'page_templates' AND column_name = 'theme_id'
  ) THEN
    ALTER TABLE page_templates ADD COLUMN theme_id uuid REFERENCES themes(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Enable RLS on themes
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can read all themes" ON themes;
DROP POLICY IF EXISTS "Users can create their own themes" ON themes;
DROP POLICY IF EXISTS "Users can update their own themes" ON themes;
DROP POLICY IF EXISTS "Users can delete their own themes" ON themes;

-- Policy: All authenticated users can read all themes
CREATE POLICY "Authenticated users can read all themes"
  ON themes
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users can create their own themes
CREATE POLICY "Users can create their own themes"
  ON themes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update only their own themes (not system themes)
CREATE POLICY "Users can update their own themes"
  ON themes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND user_id IS NOT NULL)
  WITH CHECK (auth.uid() = user_id AND user_id IS NOT NULL);

-- Policy: Users can delete only their own themes (not system themes)
CREATE POLICY "Users can delete their own themes"
  ON themes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id AND user_id IS NOT NULL);

-- Insert default modern themes
INSERT INTO themes (name, description, colors, typography, spacing, components, user_id, is_default)
VALUES
  (
    'Modern Professional',
    'Clean and professional design with neutral tones',
    '{
      "primary": "#2563eb",
      "secondary": "#64748b",
      "accent": "#0ea5e9",
      "background": "#ffffff",
      "surface": "#f8fafc",
      "text": "#0f172a",
      "textSecondary": "#475569",
      "border": "#e2e8f0",
      "success": "#10b981",
      "warning": "#f59e0b",
      "error": "#ef4444"
    }',
    '{
      "fontFamily": "system-ui, -apple-system, sans-serif",
      "fontSize": {
        "xs": "0.75rem",
        "sm": "0.875rem",
        "base": "1rem",
        "lg": "1.125rem",
        "xl": "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.875rem",
        "4xl": "2.25rem",
        "5xl": "3rem"
      },
      "fontWeight": {
        "normal": "400",
        "medium": "500",
        "semibold": "600",
        "bold": "700"
      },
      "lineHeight": {
        "tight": "1.2",
        "normal": "1.5",
        "relaxed": "1.75"
      }
    }',
    '{
      "scale": ["0", "0.25rem", "0.5rem", "0.75rem", "1rem", "1.5rem", "2rem", "3rem", "4rem", "6rem", "8rem"]
    }',
    '{
      "borderRadius": {
        "sm": "0.25rem",
        "md": "0.5rem",
        "lg": "0.75rem",
        "xl": "1rem"
      },
      "shadow": {
        "sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "md": "0 4px 6px -1px rgb(0 0 0 / 0.1)",
        "lg": "0 10px 15px -3px rgb(0 0 0 / 0.1)",
        "xl": "0 20px 25px -5px rgb(0 0 0 / 0.1)"
      }
    }',
    null,
    true
  ),
  (
    'Bold & Dynamic',
    'Energetic design with vibrant colors and strong contrast',
    '{
      "primary": "#dc2626",
      "secondary": "#0891b2",
      "accent": "#f59e0b",
      "background": "#fefefe",
      "surface": "#fef2f2",
      "text": "#1e1e1e",
      "textSecondary": "#525252",
      "border": "#fecaca",
      "success": "#16a34a",
      "warning": "#ea580c",
      "error": "#dc2626"
    }',
    '{
      "fontFamily": "system-ui, -apple-system, sans-serif",
      "fontSize": {
        "xs": "0.75rem",
        "sm": "0.875rem",
        "base": "1rem",
        "lg": "1.125rem",
        "xl": "1.375rem",
        "2xl": "1.75rem",
        "3xl": "2.25rem",
        "4xl": "3rem",
        "5xl": "4rem"
      },
      "fontWeight": {
        "normal": "400",
        "medium": "600",
        "semibold": "700",
        "bold": "800"
      },
      "lineHeight": {
        "tight": "1.1",
        "normal": "1.4",
        "relaxed": "1.6"
      }
    }',
    '{
      "scale": ["0", "0.25rem", "0.5rem", "1rem", "1.5rem", "2rem", "3rem", "4rem", "6rem", "8rem", "12rem"]
    }',
    '{
      "borderRadius": {
        "sm": "0.125rem",
        "md": "0.375rem",
        "lg": "0.5rem",
        "xl": "0.75rem"
      },
      "shadow": {
        "sm": "0 2px 4px 0 rgb(0 0 0 / 0.1)",
        "md": "0 6px 12px -2px rgb(0 0 0 / 0.15)",
        "lg": "0 12px 24px -4px rgb(0 0 0 / 0.2)",
        "xl": "0 24px 48px -8px rgb(0 0 0 / 0.25)"
      }
    }',
    null,
    true
  ),
  (
    'Minimalist Elegance',
    'Refined and minimal design with subtle accents',
    '{
      "primary": "#18181b",
      "secondary": "#71717a",
      "accent": "#a855f7",
      "background": "#ffffff",
      "surface": "#fafafa",
      "text": "#09090b",
      "textSecondary": "#71717a",
      "border": "#e4e4e7",
      "success": "#22c55e",
      "warning": "#eab308",
      "error": "#ef4444"
    }',
    '{
      "fontFamily": "ui-serif, Georgia, serif",
      "fontSize": {
        "xs": "0.8125rem",
        "sm": "0.9375rem",
        "base": "1.0625rem",
        "lg": "1.1875rem",
        "xl": "1.3125rem",
        "2xl": "1.625rem",
        "3xl": "2rem",
        "4xl": "2.5rem",
        "5xl": "3.5rem"
      },
      "fontWeight": {
        "normal": "300",
        "medium": "400",
        "semibold": "500",
        "bold": "600"
      },
      "lineHeight": {
        "tight": "1.25",
        "normal": "1.625",
        "relaxed": "1.875"
      }
    }',
    '{
      "scale": ["0", "0.125rem", "0.25rem", "0.5rem", "0.75rem", "1rem", "1.5rem", "2rem", "3rem", "4rem", "6rem"]
    }',
    '{
      "borderRadius": {
        "sm": "0.125rem",
        "md": "0.25rem",
        "lg": "0.375rem",
        "xl": "0.5rem"
      },
      "shadow": {
        "sm": "0 1px 2px 0 rgb(0 0 0 / 0.03)",
        "md": "0 2px 4px -1px rgb(0 0 0 / 0.06)",
        "lg": "0 4px 8px -2px rgb(0 0 0 / 0.08)",
        "xl": "0 8px 16px -4px rgb(0 0 0 / 0.1)"
      }
    }',
    null,
    true
  ),
  (
    'Dark Mode Premium',
    'Sophisticated dark theme with premium feel',
    '{
      "primary": "#3b82f6",
      "secondary": "#6366f1",
      "accent": "#8b5cf6",
      "background": "#0a0a0a",
      "surface": "#171717",
      "text": "#fafafa",
      "textSecondary": "#a3a3a3",
      "border": "#262626",
      "success": "#10b981",
      "warning": "#f59e0b",
      "error": "#f43f5e"
    }',
    '{
      "fontFamily": "system-ui, -apple-system, sans-serif",
      "fontSize": {
        "xs": "0.75rem",
        "sm": "0.875rem",
        "base": "1rem",
        "lg": "1.125rem",
        "xl": "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.875rem",
        "4xl": "2.25rem",
        "5xl": "3rem"
      },
      "fontWeight": {
        "normal": "400",
        "medium": "500",
        "semibold": "600",
        "bold": "700"
      },
      "lineHeight": {
        "tight": "1.2",
        "normal": "1.5",
        "relaxed": "1.75"
      }
    }',
    '{
      "scale": ["0", "0.25rem", "0.5rem", "0.75rem", "1rem", "1.5rem", "2rem", "3rem", "4rem", "6rem", "8rem"]
    }',
    '{
      "borderRadius": {
        "sm": "0.375rem",
        "md": "0.5rem",
        "lg": "0.75rem",
        "xl": "1rem"
      },
      "shadow": {
        "sm": "0 1px 3px 0 rgb(0 0 0 / 0.5)",
        "md": "0 4px 8px -2px rgb(0 0 0 / 0.5)",
        "lg": "0 12px 20px -4px rgb(0 0 0 / 0.5)",
        "xl": "0 24px 40px -8px rgb(0 0 0 / 0.5)"
      }
    }',
    null,
    true
  ),
  (
    'Ocean Breeze',
    'Calm and refreshing design inspired by ocean colors',
    '{
      "primary": "#0891b2",
      "secondary": "#06b6d4",
      "accent": "#14b8a6",
      "background": "#f0fdfa",
      "surface": "#ffffff",
      "text": "#134e4a",
      "textSecondary": "#0f766e",
      "border": "#99f6e4",
      "success": "#14b8a6",
      "warning": "#f59e0b",
      "error": "#ef4444"
    }',
    '{
      "fontFamily": "system-ui, -apple-system, sans-serif",
      "fontSize": {
        "xs": "0.75rem",
        "sm": "0.875rem",
        "base": "1rem",
        "lg": "1.125rem",
        "xl": "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.875rem",
        "4xl": "2.25rem",
        "5xl": "3rem"
      },
      "fontWeight": {
        "normal": "400",
        "medium": "500",
        "semibold": "600",
        "bold": "700"
      },
      "lineHeight": {
        "tight": "1.2",
        "normal": "1.5",
        "relaxed": "1.75"
      }
    }',
    '{
      "scale": ["0", "0.25rem", "0.5rem", "0.75rem", "1rem", "1.5rem", "2rem", "3rem", "4rem", "6rem", "8rem"]
    }',
    '{
      "borderRadius": {
        "sm": "0.5rem",
        "md": "0.75rem",
        "lg": "1rem",
        "xl": "1.5rem"
      },
      "shadow": {
        "sm": "0 1px 2px 0 rgb(8 145 178 / 0.1)",
        "md": "0 4px 6px -1px rgb(8 145 178 / 0.15)",
        "lg": "0 10px 15px -3px rgb(8 145 178 / 0.2)",
        "xl": "0 20px 25px -5px rgb(8 145 178 / 0.25)"
      }
    }',
    null,
    true
  )
ON CONFLICT DO NOTHING;
