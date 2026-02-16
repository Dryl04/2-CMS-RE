import { supabase } from './supabase';
import { defaultThemes } from './defaultThemes';

export async function createThemesTable(): Promise<{ success: boolean; message: string }> {
  try {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS themes (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name text NOT NULL,
        description text,
        colors jsonb NOT NULL DEFAULT '{}',
        typography jsonb NOT NULL DEFAULT '{}',
        spacing jsonb NOT NULL DEFAULT '{}',
        components jsonb NOT NULL DEFAULT '{}',
        user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
        is_default boolean DEFAULT false,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );
    `;

    const addThemeIdSQL = `
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'page_templates' AND column_name = 'theme_id'
        ) THEN
          ALTER TABLE page_templates ADD COLUMN theme_id uuid REFERENCES themes(id) ON DELETE SET NULL;
        END IF;
      END $$;
    `;

    const enableRLSSQL = `ALTER TABLE themes ENABLE ROW LEVEL SECURITY;`;

    const createPoliciesSQL = [
      `DROP POLICY IF EXISTS "Authenticated users can read all themes" ON themes;`,
      `CREATE POLICY "Authenticated users can read all themes" ON themes FOR SELECT TO authenticated USING (true);`,
      `DROP POLICY IF EXISTS "Users can create their own themes" ON themes;`,
      `CREATE POLICY "Users can create their own themes" ON themes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);`,
      `DROP POLICY IF EXISTS "Users can update their own themes" ON themes;`,
      `CREATE POLICY "Users can update their own themes" ON themes FOR UPDATE TO authenticated USING (auth.uid() = user_id AND user_id IS NOT NULL) WITH CHECK (auth.uid() = user_id AND user_id IS NOT NULL);`,
      `DROP POLICY IF EXISTS "Users can delete their own themes" ON themes;`,
      `CREATE POLICY "Users can delete their own themes" ON themes FOR DELETE TO authenticated USING (auth.uid() = user_id AND user_id IS NOT NULL);`,
    ];

    return {
      success: false,
      message: 'This feature requires Supabase service role key which is not available in the browser. Please execute the SQL script manually in Supabase Dashboard.',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function insertDefaultThemes(): Promise<{ success: boolean; message: string; count?: number }> {
  try {
    const themesToInsert = defaultThemes.map(theme => ({
      name: theme.name,
      description: theme.description,
      colors: theme.colors,
      typography: theme.typography,
      spacing: theme.spacing,
      components: theme.components,
      custom_css: theme.custom_css,
      user_id: null,
      is_default: theme.is_default,
    }));

    const { data, error } = await supabase
      .from('themes')
      .insert(themesToInsert)
      .select();

    if (error) {
      if (error.message.includes('duplicate key')) {
        return {
          success: true,
          message: 'Themes already exist',
          count: 0,
        };
      }
      throw error;
    }

    return {
      success: true,
      message: `Successfully inserted ${data.length} themes`,
      count: data.length,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export function getSQLScript(): string {
  return `-- Create themes table
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
  USING (auth.uid() = user_id AND user_id IS NOT NULL);`;
}
