-- Idempotent migration bundle
-- This version safely replays migrations without failing on existing objects
-- Generated at: 2026-02-17T09:00:00Z

BEGIN;

-- ===================================================================
-- MIGRATION: 20260207101206_create_seo_metadata_table.sql
-- ===================================================================

CREATE TABLE IF NOT EXISTS seo_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  keywords text[],
  og_title text,
  og_description text,
  og_image text,
  canonical_url text,
  language text DEFAULT 'fr',
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  imported_at timestamptz,
  created_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE IF EXISTS seo_metadata ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tout le monde peut lire les métadonnées publiées" ON seo_metadata;
CREATE POLICY "Tout le monde peut lire les métadonnées publiées"
  ON seo_metadata
  FOR SELECT
  USING (status = 'published');

DROP POLICY IF EXISTS "Utilisateurs authentifiés peuvent créer des métadonnées" ON seo_metadata;
CREATE POLICY "Utilisateurs authentifiés peuvent créer des métadonnées"
  ON seo_metadata
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Utilisateurs authentifiés peuvent mettre à jour les métadonnées" ON seo_metadata;
CREATE POLICY "Utilisateurs authentifiés peuvent mettre à jour les métadonnées"
  ON seo_metadata
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Utilisateurs authentifiés peuvent supprimer les métadonnées" ON seo_metadata;
CREATE POLICY "Utilisateurs authentifiés peuvent supprimer les métadonnées"
  ON seo_metadata
  FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_seo_metadata_page_key ON seo_metadata(page_key);
CREATE INDEX IF NOT EXISTS idx_seo_metadata_status ON seo_metadata(status);

-- ===================================================================
-- MIGRATION: 20260207104305_update_seo_metadata_rls_policies.sql
-- ===================================================================

DROP POLICY IF EXISTS "Enable all operations for seo_metadata" ON seo_metadata;
CREATE POLICY "Enable all operations for seo_metadata"
  ON seo_metadata
  FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Tout le monde peut lire les métadonnées publiées" ON seo_metadata;
DROP POLICY IF EXISTS "Utilisateurs authentifiés peuvent créer des métadonnées" ON seo_metadata;
DROP POLICY IF EXISTS "Utilisateurs authentifiés peuvent mettre à jour les métadonnées" ON seo_metadata;
DROP POLICY IF EXISTS "Utilisateurs authentifiés peuvent supprimer les métadonnées" ON seo_metadata;

-- ===================================================================
-- MIGRATION: 20260207104624_add_content_column_to_seo_metadata.sql
-- ===================================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'seo_metadata' AND column_name = 'content') THEN
    ALTER TABLE seo_metadata ADD COLUMN content text;
  END IF;
END $$;

-- ===================================================================
-- MIGRATION: 20260213085639_create_user_profiles_and_roles.sql
-- ===================================================================

CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

INSERT INTO user_roles (name, description)
VALUES 
  ('admin', 'Administrateur système'),
  ('editor', 'Éditeur de contenu'),
  ('viewer', 'Lecteur')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  role_id uuid REFERENCES user_roles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can read all profiles" ON user_profiles;
CREATE POLICY "Users can read all profiles"
  ON user_profiles
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own profile" ON user_profiles;
CREATE POLICY "Users can delete own profile"
  ON user_profiles
  FOR DELETE
  USING (id = auth.uid());

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, role_id)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name',
    (SELECT id FROM user_roles WHERE name = 'editor' LIMIT 1)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_user_profile_updated ON user_profiles;
CREATE TRIGGER on_user_profile_updated
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===================================================================
-- MIGRATION: 20260213085718_create_page_templates_and_sections.sql
-- ===================================================================

CREATE TABLE IF NOT EXISTS page_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  sections_data jsonb DEFAULT '[]'::jsonb,
  is_public boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  daisy_theme_slug text
);

ALTER TABLE page_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public templates are readable by all" ON page_templates;
CREATE POLICY "Public templates are readable by all"
  ON page_templates
  FOR SELECT
  USING (is_public = true OR created_by = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own templates" ON page_templates;
CREATE POLICY "Users can insert their own templates"
  ON page_templates
  FOR INSERT
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Users can update their own templates" ON page_templates;
CREATE POLICY "Users can update their own templates"
  ON page_templates
  FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own templates" ON page_templates;
CREATE POLICY "Users can delete their own templates"
  ON page_templates
  FOR DELETE
  USING (created_by = auth.uid());

CREATE TABLE IF NOT EXISTS page_content_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES page_templates(id) ON DELETE CASCADE,
  order_index integer,
  widget_type text,
  content jsonb,
  design jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE page_content_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public content sections are readable" ON page_content_sections;
CREATE POLICY "Public content sections are readable"
  ON page_content_sections
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM page_templates WHERE page_templates.id = template_id AND (is_public = true OR created_by = auth.uid())));

DROP POLICY IF EXISTS "Users can insert sections for their templates" ON page_content_sections;
CREATE POLICY "Users can insert sections for their templates"
  ON page_content_sections
  FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM page_templates WHERE page_templates.id = template_id AND created_by = auth.uid()));

DROP POLICY IF EXISTS "Users can update sections in their templates" ON page_content_sections;
CREATE POLICY "Users can update sections in their templates"
  ON page_content_sections
  FOR UPDATE
  USING (EXISTS (SELECT 1 FROM page_templates WHERE page_templates.id = template_id AND created_by = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM page_templates WHERE page_templates.id = template_id AND created_by = auth.uid()));

DROP POLICY IF EXISTS "Users can delete sections from their templates" ON page_content_sections;
CREATE POLICY "Users can delete sections from their templates"
  ON page_content_sections
  FOR DELETE
  USING (EXISTS (SELECT 1 FROM page_templates WHERE page_templates.id = template_id AND created_by = auth.uid()));

DROP TRIGGER IF EXISTS on_page_template_updated ON page_templates;
CREATE TRIGGER on_page_template_updated
  BEFORE UPDATE ON page_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS on_page_content_section_updated ON page_content_sections;
CREATE TRIGGER on_page_content_section_updated
  BEFORE UPDATE ON page_content_sections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===================================================================
-- MIGRATION: 20260213090200_setup_storage_for_media_fixed.sql
-- ===================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'media');

DROP POLICY IF EXISTS "Authenticated users can upload to media" ON storage.objects;
CREATE POLICY "Authenticated users can upload to media"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'media');

DROP POLICY IF EXISTS "Users can delete their own media" ON storage.objects;
CREATE POLICY "Users can delete their own media"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'media' AND owner = auth.uid());

-- ===================================================================
-- MIGRATION: 20260213101218_add_delete_policy_for_page_templates.sql
-- ===================================================================

DROP POLICY IF EXISTS "Users can delete their own templates" ON page_templates;
CREATE POLICY "Users can delete their own templates"
  ON page_templates
  FOR DELETE
  USING (created_by = auth.uid());

-- ===================================================================
-- MIGRATION: 20260213101650_fix_user_profiles_infinite_recursion.sql
-- ===================================================================

DROP POLICY IF EXISTS "Users can read all profiles" ON user_profiles;
CREATE POLICY "Users can read all profiles"
  ON user_profiles
  FOR SELECT
  USING (true);

-- ===================================================================
-- MIGRATION: 20260213101717_add_role_check_functions.sql
-- ===================================================================

CREATE OR REPLACE FUNCTION public.user_has_role(role_name text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    JOIN user_roles ON user_profiles.role_id = user_roles.id
    WHERE user_profiles.id = auth.uid()
    AND user_roles.name = role_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ===================================================================
-- MIGRATION: 20260213103531_fix_rls_policies_and_user_role_v2.sql
-- ===================================================================

-- Reapply core policies with idempotency
DROP POLICY IF EXISTS "Public templates are readable by all" ON page_templates;
CREATE POLICY "Public templates are readable by all"
  ON page_templates
  FOR SELECT
  USING (is_public = true OR created_by = auth.uid());

-- ===================================================================
-- MIGRATION: 20260213103543_add_missing_delete_policy_seo_metadata.sql
-- ===================================================================

DROP POLICY IF EXISTS "Enable all operations for seo_metadata" ON seo_metadata;
CREATE POLICY "Enable all operations for seo_metadata"
  ON seo_metadata
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ===================================================================
-- MIGRATION: 20260213103621_add_insert_policy_user_profiles.sql
-- ===================================================================

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  WITH CHECK (id = auth.uid());

-- ===================================================================
-- MIGRATION: 20260213103633_add_delete_policy_page_content_sections.sql
-- ===================================================================

DROP POLICY IF EXISTS "Users can delete sections from their templates" ON page_content_sections;
CREATE POLICY "Users can delete sections from their templates"
  ON page_content_sections
  FOR DELETE
  USING (EXISTS (SELECT 1 FROM page_templates WHERE page_templates.id = template_id AND created_by = auth.uid()));

-- ===================================================================
-- MIGRATION: 20260213110831_add_sections_data_jsonb_columns.sql
-- ===================================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'seo_metadata' AND column_name = 'sections_data') THEN
    ALTER TABLE seo_metadata ADD COLUMN sections_data jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- ===================================================================
-- MIGRATION: 20260213133805_add_seo_headings_to_templates.sql
-- ===================================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'page_templates' AND column_name = 'seo_title') THEN
    ALTER TABLE page_templates ADD COLUMN seo_title text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'page_templates' AND column_name = 'seo_description') THEN
    ALTER TABLE page_templates ADD COLUMN seo_description text;
  END IF;
END $$;

-- ===================================================================
-- MIGRATION: 20260213133813_add_seo_headings_to_seo_metadata.sql
-- ===================================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'seo_metadata' AND column_name = 'h1') THEN
    ALTER TABLE seo_metadata ADD COLUMN h1 text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'seo_metadata' AND column_name = 'h2_h3') THEN
    ALTER TABLE seo_metadata ADD COLUMN h2_h3 text[];
  END IF;
END $$;

-- ===================================================================
-- MIGRATION: 20260216080708_create_page_themes_table.sql
-- ===================================================================

CREATE TABLE IF NOT EXISTS page_themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES page_templates(id) ON DELETE CASCADE,
  theme_colors jsonb,
  custom_css text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE page_themes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own themes" ON page_themes;
CREATE POLICY "Users can read their own themes"
  ON page_themes
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM page_templates WHERE page_templates.id = template_id AND created_by = auth.uid()));

DROP POLICY IF EXISTS "Users can insert themes" ON page_themes;
CREATE POLICY "Users can insert themes"
  ON page_themes
  FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM page_templates WHERE page_templates.id = template_id AND created_by = auth.uid()));

DROP POLICY IF EXISTS "Users can update their themes" ON page_themes;
CREATE POLICY "Users can update their themes"
  ON page_themes
  FOR UPDATE
  USING (EXISTS (SELECT 1 FROM page_templates WHERE page_templates.id = template_id AND created_by = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM page_templates WHERE page_templates.id = template_id AND created_by = auth.uid()));

DROP POLICY IF EXISTS "Users can delete their themes" ON page_themes;
CREATE POLICY "Users can delete their themes"
  ON page_themes
  FOR DELETE
  USING (EXISTS (SELECT 1 FROM page_templates WHERE page_templates.id = template_id AND created_by = auth.uid()));

-- ===================================================================
-- MIGRATION: 20260216083928_create_fonts_library.sql
-- ===================================================================

CREATE TABLE IF NOT EXISTS fonts_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  family text NOT NULL,
  variants text[],
  category text,
  source text DEFAULT 'google',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE fonts_library ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can read fonts" ON fonts_library;
CREATE POLICY "Everyone can read fonts"
  ON fonts_library
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert fonts" ON fonts_library;
CREATE POLICY "Authenticated users can insert fonts"
  ON fonts_library
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ===================================================================
-- MIGRATION: 20260216084347_update_page_themes_with_new_colors.sql
-- ===================================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'page_themes' AND column_name = 'primary_color') THEN
    ALTER TABLE page_themes ADD COLUMN primary_color text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'page_themes' AND column_name = 'secondary_color') THEN
    ALTER TABLE page_themes ADD COLUMN secondary_color text;
  END IF;
END $$;

-- ===================================================================
-- MIGRATION: 20260216093247_create_daisyui_themes_table.sql
-- ===================================================================

CREATE TABLE IF NOT EXISTS daisyui_themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  colors jsonb NOT NULL,
  is_official boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE daisyui_themes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can read themes" ON daisyui_themes;
CREATE POLICY "Everyone can read themes"
  ON daisyui_themes
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create themes" ON daisyui_themes;
CREATE POLICY "Authenticated users can create themes"
  ON daisyui_themes
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid() OR is_official = true);

DROP POLICY IF EXISTS "Users can update their own themes" ON daisyui_themes;
CREATE POLICY "Users can update their own themes"
  ON daisyui_themes
  FOR UPDATE
  USING (created_by = auth.uid() OR is_official = true)
  WITH CHECK (created_by = auth.uid() OR is_official = true);

DROP POLICY IF EXISTS "Users can delete their own themes" ON daisyui_themes;
CREATE POLICY "Users can delete their own themes"
  ON daisyui_themes
  FOR DELETE
  USING (created_by = auth.uid());

CREATE INDEX IF NOT EXISTS idx_daisyui_themes_slug ON daisyui_themes(slug);
CREATE INDEX IF NOT EXISTS idx_daisyui_themes_created_by ON daisyui_themes(created_by);

DROP TRIGGER IF EXISTS on_daisyui_theme_updated ON daisyui_themes;
CREATE TRIGGER on_daisyui_theme_updated
  BEFORE UPDATE ON daisyui_themes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===================================================================
-- MIGRATION: 20260216101148_fix_daisyui_themes_rls_policies.sql
-- ===================================================================

DROP POLICY IF EXISTS "Everyone can read themes" ON daisyui_themes;
CREATE POLICY "Everyone can read themes"
  ON daisyui_themes
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create themes" ON daisyui_themes;
CREATE POLICY "Authenticated users can create themes"
  ON daisyui_themes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own themes" ON daisyui_themes;
CREATE POLICY "Users can update their own themes"
  ON daisyui_themes
  FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own themes" ON daisyui_themes;
CREATE POLICY "Users can delete their own themes"
  ON daisyui_themes
  FOR DELETE
  USING (created_by = auth.uid());

-- ===================================================================
-- MIGRATION: 20260216104010_add_font_config_to_daisyui_themes.sql
-- ===================================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'daisyui_themes' AND column_name = 'font_config') THEN
    ALTER TABLE daisyui_themes ADD COLUMN font_config jsonb;
  END IF;
END $$;

-- ===================================================================
-- MIGRATION: 20260216120400_add_daisy_theme_to_pages.sql
-- ===================================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'page_templates' AND column_name = 'daisy_theme_id') THEN
    ALTER TABLE page_templates ADD COLUMN daisy_theme_id uuid REFERENCES daisyui_themes(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ===================================================================
-- MIGRATION: 20260217113000_add_daisy_theme_slug_to_page_templates.sql
-- ===================================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'page_templates' AND column_name = 'daisy_theme_slug') THEN
    ALTER TABLE page_templates ADD COLUMN daisy_theme_slug text;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_page_templates_daisy_theme_slug ON page_templates(daisy_theme_slug);

COMMIT;
