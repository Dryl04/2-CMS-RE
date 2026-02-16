/*
  # Système de modèles de pages et sections structurées

  1. Nouvelles tables
    - `section_types`
      - Types de sections disponibles (Hero, Features, Testimonials, etc.)
      - Avec schéma JSON de validation
    
    - `page_templates`
      - Modèles de pages réutilisables
      - Créés par les utilisateurs ou prédéfinis
    
    - `template_sections`
      - Sections d'un modèle avec ordre et contraintes
      - Contraintes : min_words, max_words, required, etc.
    
    - `page_content_sections`
      - Contenu réel des sections pour chaque page
      - Lie seo_metadata aux sections avec leur contenu
    
    - `media_files`
      - Index des fichiers médias uploadés
      - Métadonnées, URL Supabase Storage, dimensions, etc.

  2. Sécurité
    - Enable RLS sur toutes les tables
    - Politiques adaptées aux rôles utilisateurs
  
  3. Modifications
    - Ajout de template_id dans seo_metadata
*/

-- Table des types de sections disponibles
CREATE TABLE IF NOT EXISTS section_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  label text NOT NULL,
  description text,
  icon text,
  schema jsonb NOT NULL DEFAULT '{}',
  preview_image text,
  is_system boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE section_types ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut lire les types de sections
CREATE POLICY "Anyone can read section types"
  ON section_types FOR SELECT
  USING (true);

-- Seuls les admins peuvent gérer les types de sections
CREATE POLICY "Admins can manage section types"
  ON section_types FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Table des modèles de pages
CREATE TABLE IF NOT EXISTS page_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  thumbnail text,
  is_public boolean DEFAULT false,
  is_system boolean DEFAULT false,
  created_by uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE page_templates ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs authentifiés peuvent lire les modèles publics et les leurs
CREATE POLICY "Users can read public and own templates"
  ON page_templates FOR SELECT
  TO authenticated
  USING (is_public = true OR created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'seo_manager')
  ));

-- Les utilisateurs authentifiés peuvent créer des modèles
CREATE POLICY "Authenticated users can create templates"
  ON page_templates FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Les utilisateurs peuvent mettre à jour leurs propres modèles
CREATE POLICY "Users can update own templates"
  ON page_templates FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Les admins peuvent tout gérer
CREATE POLICY "Admins can manage all templates"
  ON page_templates FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS on_page_template_updated ON page_templates;
CREATE TRIGGER on_page_template_updated
  BEFORE UPDATE ON page_templates
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Table des sections d'un modèle avec contraintes
CREATE TABLE IF NOT EXISTS template_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES page_templates(id) ON DELETE CASCADE,
  section_type_id uuid NOT NULL REFERENCES section_types(id) ON DELETE RESTRICT,
  order_index int NOT NULL,
  label text,
  min_words int DEFAULT 0,
  max_words int,
  required boolean DEFAULT true,
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE template_sections ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs authentifiés peuvent lire les sections des modèles accessibles
CREATE POLICY "Users can read template sections"
  ON template_sections FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM page_templates
      WHERE id = template_sections.template_id
      AND (is_public = true OR created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'seo_manager')
      ))
    )
  );

-- Les utilisateurs peuvent créer des sections pour leurs modèles
CREATE POLICY "Users can create sections for own templates"
  ON template_sections FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM page_templates
      WHERE id = template_sections.template_id
      AND created_by = auth.uid()
    )
  );

-- Les utilisateurs peuvent modifier les sections de leurs modèles
CREATE POLICY "Users can update sections of own templates"
  ON template_sections FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM page_templates
      WHERE id = template_sections.template_id
      AND created_by = auth.uid()
    )
  );

-- Les utilisateurs peuvent supprimer les sections de leurs modèles
CREATE POLICY "Users can delete sections of own templates"
  ON template_sections FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM page_templates
      WHERE id = template_sections.template_id
      AND created_by = auth.uid()
    )
  );

-- Les admins peuvent tout gérer
CREATE POLICY "Admins can manage all template sections"
  ON template_sections FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Table du contenu des sections pour chaque page
CREATE TABLE IF NOT EXISTS page_content_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid NOT NULL REFERENCES seo_metadata(id) ON DELETE CASCADE,
  template_section_id uuid REFERENCES template_sections(id) ON DELETE SET NULL,
  section_type_id uuid NOT NULL REFERENCES section_types(id) ON DELETE RESTRICT,
  order_index int NOT NULL,
  content jsonb NOT NULL DEFAULT '{}',
  background_image text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE page_content_sections ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut lire les sections des pages publiées
CREATE POLICY "Anyone can read sections of published pages"
  ON page_content_sections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM seo_metadata
      WHERE id = page_content_sections.page_id AND status = 'published'
    )
  );

-- Les utilisateurs authentifiés peuvent lire toutes les sections
CREATE POLICY "Authenticated users can read all sections"
  ON page_content_sections FOR SELECT
  TO authenticated
  USING (true);

-- Les utilisateurs peuvent créer des sections pour leurs pages
CREATE POLICY "Users can create sections for own pages"
  ON page_content_sections FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM seo_metadata
      WHERE id = page_content_sections.page_id
      AND user_id = auth.uid()
    )
  );

-- Les utilisateurs peuvent modifier les sections de leurs pages
CREATE POLICY "Users can update sections of own pages"
  ON page_content_sections FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM seo_metadata
      WHERE id = page_content_sections.page_id
      AND user_id = auth.uid()
    )
  );

-- Les admins et SEO managers peuvent tout gérer
CREATE POLICY "Admins and managers can manage all sections"
  ON page_content_sections FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'seo_manager')
    )
  );

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS on_page_content_section_updated ON page_content_sections;
CREATE TRIGGER on_page_content_section_updated
  BEFORE UPDATE ON page_content_sections
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Table des fichiers médias
CREATE TABLE IF NOT EXISTS media_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  original_filename text NOT NULL,
  file_path text NOT NULL,
  file_size bigint NOT NULL,
  mime_type text NOT NULL,
  width int,
  height int,
  alt_text text,
  uploaded_by uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs authentifiés peuvent lire tous les médias
CREATE POLICY "Authenticated users can read all media"
  ON media_files FOR SELECT
  TO authenticated
  USING (true);

-- Les utilisateurs authentifiés peuvent uploader des médias
CREATE POLICY "Authenticated users can upload media"
  ON media_files FOR INSERT
  TO authenticated
  WITH CHECK (uploaded_by = auth.uid());

-- Les utilisateurs peuvent supprimer leurs propres médias
CREATE POLICY "Users can delete own media"
  ON media_files FOR DELETE
  TO authenticated
  USING (uploaded_by = auth.uid());

-- Les admins peuvent tout gérer
CREATE POLICY "Admins can manage all media"
  ON media_files FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Ajout de template_id dans seo_metadata
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'seo_metadata' AND column_name = 'template_id'
  ) THEN
    ALTER TABLE seo_metadata ADD COLUMN template_id uuid REFERENCES page_templates(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Création d'index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_template_sections_template_id ON template_sections(template_id);
CREATE INDEX IF NOT EXISTS idx_template_sections_order ON template_sections(template_id, order_index);
CREATE INDEX IF NOT EXISTS idx_page_content_sections_page_id ON page_content_sections(page_id);
CREATE INDEX IF NOT EXISTS idx_page_content_sections_order ON page_content_sections(page_id, order_index);
CREATE INDEX IF NOT EXISTS idx_media_files_uploaded_by ON media_files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_seo_metadata_template_id ON seo_metadata(template_id);

-- Insertion des types de sections prédéfinis
INSERT INTO section_types (name, label, description, icon, is_system, schema) VALUES
  ('hero', 'Hero Section', 'Section d''en-tête avec titre principal et CTA', 'Zap', true, '{"title": "string", "subtitle": "string", "cta_text": "string", "cta_url": "string", "image": "string"}'),
  ('features', 'Features Grid', 'Grille de fonctionnalités avec icônes', 'Grid', true, '{"title": "string", "items": [{"icon": "string", "title": "string", "description": "string"}]}'),
  ('testimonials', 'Testimonials', 'Section de témoignages clients', 'MessageCircle', true, '{"title": "string", "items": [{"name": "string", "role": "string", "content": "string", "avatar": "string"}]}'),
  ('cta', 'Call to Action', 'Section d''appel à l''action', 'ArrowRight', true, '{"title": "string", "description": "string", "button_text": "string", "button_url": "string"}'),
  ('content', 'Rich Content', 'Section de contenu riche avec HTML', 'FileText', true, '{"content": "html"}'),
  ('image_text', 'Image + Text', 'Section avec image et texte côte à côte', 'Image', true, '{"title": "string", "content": "string", "image": "string", "image_position": "left|right"}'),
  ('stats', 'Statistics', 'Section de statistiques et chiffres clés', 'BarChart', true, '{"title": "string", "items": [{"value": "string", "label": "string"}]}'),
  ('faq', 'FAQ', 'Section de questions/réponses', 'HelpCircle', true, '{"title": "string", "items": [{"question": "string", "answer": "string"}]}')
ON CONFLICT (name) DO NOTHING;