-- Auto-generated migration bundle
-- Generated at: 2026-03-08T17:53:09Z
-- Source directory: supabase/migrations

BEGIN;

-- ===================================================================
-- MIGRATION: 20260207101206_create_seo_metadata_table.sql
-- ===================================================================
/*
  # Création de la table pour les métadonnées SEO

  1. Nouvelles tables
    - `seo_metadata`
      - `id` (uuid, clé primaire)
      - `page_key` (text, identifiant unique de la page)
      - `title` (text, titre SEO)
      - `description` (text, description meta)
      - `keywords` (text[], mots-clés)
      - `og_title` (text, Open Graph title)
      - `og_description` (text, Open Graph description)
      - `og_image` (text, URL image Open Graph)
      - `canonical_url` (text, URL canonique)
      - `language` (text, langue du contenu)
      - `status` (text, statut: draft, published, archived)
      - `imported_at` (timestamptz, date d'import)
      - `created_by` (text, email de l'utilisateur)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Sécurité
    - Enable RLS sur `seo_metadata`
    - Politique pour lecture publique des métadonnées publiées
    - Politique pour modification par utilisateurs authentifiés
*/

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

ALTER TABLE seo_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tout le monde peut lire les métadonnées publiées"
  ON seo_metadata
  FOR SELECT
  USING (status = 'published');

CREATE POLICY "Utilisateurs authentifiés peuvent créer des métadonnées"
  ON seo_metadata
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Utilisateurs authentifiés peuvent mettre à jour les métadonnées"
  ON seo_metadata
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

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
/*
  # Mise à jour des politiques RLS pour seo_metadata
  
  1. Modifications
    - Suppression des politiques restrictives nécessitant l'authentification
    - Ajout de politiques permissives pour permettre toutes les opérations
    - Ceci permet l'utilisation sans authentification pour le moment
  
  2. Note de sécurité
    - Pour un environnement de production, il est recommandé d'ajouter l'authentification
    - Ces politiques sont adaptées pour un environnement de développement/test
*/

DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'seo_metadata' 
    AND policyname = 'Tout le monde peut lire les métadonnées publiées'
  ) THEN
    DROP POLICY "Tout le monde peut lire les métadonnées publiées" ON seo_metadata;
  END IF;
END $$;

DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'seo_metadata' 
    AND policyname = 'Utilisateurs authentifiés peuvent créer des métadonnées'
  ) THEN
    DROP POLICY "Utilisateurs authentifiés peuvent créer des métadonnées" ON seo_metadata;
  END IF;
END $$;

DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'seo_metadata' 
    AND policyname = 'Utilisateurs authentifiés peuvent mettre à jour les métadonnées'
  ) THEN
    DROP POLICY "Utilisateurs authentifiés peuvent mettre à jour les métadonnées" ON seo_metadata;
  END IF;
END $$;

DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'seo_metadata' 
    AND policyname = 'Utilisateurs authentifiés peuvent supprimer les métadonnées'
  ) THEN
    DROP POLICY "Utilisateurs authentifiés peuvent supprimer les métadonnées" ON seo_metadata;
  END IF;
END $$;

CREATE POLICY "Tout le monde peut lire les métadonnées"
  ON seo_metadata
  FOR SELECT
  USING (true);

CREATE POLICY "Tout le monde peut créer des métadonnées"
  ON seo_metadata
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Tout le monde peut mettre à jour les métadonnées"
  ON seo_metadata
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Tout le monde peut supprimer les métadonnées"
  ON seo_metadata
  FOR DELETE
  USING (true);


-- ===================================================================
-- MIGRATION: 20260207104624_add_content_column_to_seo_metadata.sql
-- ===================================================================
/*
  # Ajout d'une colonne de contenu pour les pages SEO
  
  1. Modifications
    - Ajout de la colonne `content` à la table `seo_metadata`
      - `content` (text, contenu textuel de la page, nullable)
    
  2. Notes
    - Le contenu peut être du texte simple ou du HTML
    - Cette colonne permet de stocker le contenu principal de chaque page
    - Nullable pour permettre la compatibilité avec les données existantes
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'seo_metadata' 
    AND column_name = 'content'
  ) THEN
    ALTER TABLE seo_metadata ADD COLUMN content text;
  END IF;
END $$;


-- ===================================================================
-- MIGRATION: 20260213085639_create_user_profiles_and_roles.sql
-- ===================================================================
/*
  # Système d'authentification et de rôles utilisateurs

  1. Nouvelle table
    - `user_profiles`
      - `id` (uuid, primary key, référence auth.users)
      - `email` (text, unique)
      - `full_name` (text)
      - `role` (text, valeurs: admin, seo_manager, contributor)
      - `avatar_url` (text, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Sécurité
    - Enable RLS sur `user_profiles`
    - Politique : les utilisateurs peuvent lire leur propre profil
    - Politique : les utilisateurs peuvent mettre à jour leur propre profil
    - Politique : les admins peuvent lire tous les profils
    - Politique : les admins peuvent gérer tous les profils
  
  3. Fonction trigger
    - Création automatique du profil lors de l'inscription
    - Mise à jour automatique du champ updated_at

  4. Modifications
    - Ajout de la colonne user_id dans seo_metadata
    - Mise à jour des RLS policies de seo_metadata
*/

-- Création de la table user_profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'contributor' CHECK (role IN ('admin', 'seo_manager', 'contributor')),
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Politique : les utilisateurs peuvent lire leur propre profil
CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Politique : les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Politique : les admins peuvent lire tous les profils
CREATE POLICY "Admins can read all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Politique : les admins peuvent gérer tous les profils
CREATE POLICY "Admins can manage all profiles"
  ON user_profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Fonction pour créer automatiquement un profil utilisateur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer le profil automatiquement
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at sur user_profiles
DROP TRIGGER IF EXISTS on_user_profile_updated ON user_profiles;
CREATE TRIGGER on_user_profile_updated
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Ajout de la colonne user_id dans seo_metadata si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'seo_metadata' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE seo_metadata ADD COLUMN user_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Mise à jour des RLS policies de seo_metadata pour inclure la gestion par rôle
DROP POLICY IF EXISTS "Anyone can read published pages" ON seo_metadata;
DROP POLICY IF EXISTS "Authenticated users can manage their own pages" ON seo_metadata;

-- Tout le monde peut lire les pages publiées (pour le site public)
CREATE POLICY "Anyone can read published pages"
  ON seo_metadata FOR SELECT
  USING (status = 'published');

-- Les utilisateurs authentifiés peuvent voir toutes les pages
CREATE POLICY "Authenticated users can read all pages"
  ON seo_metadata FOR SELECT
  TO authenticated
  USING (true);

-- Les utilisateurs peuvent créer des pages
CREATE POLICY "Authenticated users can create pages"
  ON seo_metadata FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent mettre à jour leurs propres pages
CREATE POLICY "Users can update own pages"
  ON seo_metadata FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Les admins et SEO managers peuvent tout gérer
CREATE POLICY "Admins and SEO managers can manage all pages"
  ON seo_metadata FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'seo_manager')
    )
  );

-- Création d'un index sur user_id
CREATE INDEX IF NOT EXISTS idx_seo_metadata_user_id ON seo_metadata(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- ===================================================================
-- MIGRATION: 20260213085718_create_page_templates_and_sections.sql
-- ===================================================================
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

-- ===================================================================
-- MIGRATION: 20260213090200_setup_storage_for_media_fixed.sql
-- ===================================================================
/*
  # Configuration de Supabase Storage pour les médias

  1. Création du bucket
    - Bucket `media` pour stocker les images et vidéos
    - Bucket public pour permettre l'accès aux fichiers
  
  2. Politiques de sécurité
    - Les utilisateurs authentifiés peuvent uploader des fichiers
    - Tout le monde peut lire les fichiers (pour affichage public)
    - Les utilisateurs peuvent supprimer leurs propres fichiers
    - Les admins peuvent tout gérer
*/

-- Créer le bucket media s'il n'existe pas
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Politique : permettre aux utilisateurs authentifiés d'uploader
DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;
CREATE POLICY "Authenticated users can upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media');

-- Politique : tout le monde peut lire les médias
DROP POLICY IF EXISTS "Anyone can read media" ON storage.objects;
CREATE POLICY "Anyone can read media"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

-- Politique : les utilisateurs peuvent mettre à jour leurs propres fichiers
DROP POLICY IF EXISTS "Users can update own media" ON storage.objects;
CREATE POLICY "Users can update own media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'media' AND owner_id = auth.uid()::text)
WITH CHECK (bucket_id = 'media' AND owner_id = auth.uid()::text);

-- Politique : les utilisateurs peuvent supprimer leurs propres fichiers
DROP POLICY IF EXISTS "Users can delete own media" ON storage.objects;
CREATE POLICY "Users can delete own media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'media' AND owner_id = auth.uid()::text);

-- Politique : les admins peuvent tout gérer
DROP POLICY IF EXISTS "Admins can manage all media" ON storage.objects;
CREATE POLICY "Admins can manage all media"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'media' AND
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ===================================================================
-- MIGRATION: 20260213101218_add_delete_policy_for_page_templates.sql
-- ===================================================================
/*
  # Add delete policy for page_templates

  1. Changes
    - Add a DELETE policy so users can delete their own templates

  2. Security
    - Only the template creator can delete their template
    - Admins already have ALL access via existing policy
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'page_templates'
    AND policyname = 'Users can delete own templates'
  ) THEN
    CREATE POLICY "Users can delete own templates"
      ON page_templates
      FOR DELETE
      TO authenticated
      USING (created_by = auth.uid());
  END IF;
END $$;


-- ===================================================================
-- MIGRATION: 20260213101650_fix_user_profiles_infinite_recursion.sql
-- ===================================================================
/*
  # Fix infinite recursion in user_profiles RLS policies

  1. Problem
    - "Admins can manage all profiles" and "Admins can read all profiles" policies
      query user_profiles to check if the current user is admin
    - This causes infinite recursion because reading user_profiles triggers the same policy check

  2. Fix
    - Drop the self-referencing admin policies
    - Replace with a security definer function that bypasses RLS to check admin status
    - Recreate policies using the function instead of a subquery
*/

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;

CREATE POLICY "Admins can read all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can update all profiles"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete profiles"
  ON user_profiles
  FOR DELETE
  TO authenticated
  USING (public.is_admin());


-- ===================================================================
-- MIGRATION: 20260213101717_add_role_check_functions.sql
-- ===================================================================
/*
  # Add role check helper functions

  1. Changes
    - Add is_admin_or_manager() function to safely check role without recursion
    - Update policies on seo_metadata, page_templates, template_sections,
      section_types, page_content_sections, and media_files that reference
      user_profiles to use the new functions

  2. Purpose
    - Prevent infinite recursion when RLS policies on other tables
      query user_profiles which itself has RLS enabled
*/

CREATE OR REPLACE FUNCTION public.is_admin_or_manager()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'seo_manager')
  );
$$;

DROP POLICY IF EXISTS "Admins and SEO managers can manage all pages" ON seo_metadata;
CREATE POLICY "Admins and SEO managers can manage all pages"
  ON seo_metadata
  FOR ALL
  TO authenticated
  USING (public.is_admin_or_manager());

DROP POLICY IF EXISTS "Admins can manage section types" ON section_types;
CREATE POLICY "Admins can manage section types"
  ON section_types
  FOR ALL
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage all templates" ON page_templates;
CREATE POLICY "Admins can manage all templates"
  ON page_templates
  FOR ALL
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Users can read public and own templates" ON page_templates;
CREATE POLICY "Users can read public and own templates"
  ON page_templates
  FOR SELECT
  TO authenticated
  USING (
    is_public = true
    OR created_by = auth.uid()
    OR public.is_admin_or_manager()
  );

DROP POLICY IF EXISTS "Admins can manage all template sections" ON template_sections;
CREATE POLICY "Admins can manage all template sections"
  ON template_sections
  FOR ALL
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Users can read template sections" ON template_sections;
CREATE POLICY "Users can read template sections"
  ON template_sections
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM page_templates
      WHERE page_templates.id = template_sections.template_id
      AND (
        page_templates.is_public = true
        OR page_templates.created_by = auth.uid()
        OR public.is_admin_or_manager()
      )
    )
  );

DROP POLICY IF EXISTS "Admins and managers can manage all sections" ON page_content_sections;
CREATE POLICY "Admins and managers can manage all sections"
  ON page_content_sections
  FOR ALL
  TO authenticated
  USING (public.is_admin_or_manager());

DROP POLICY IF EXISTS "Admins can manage all media" ON media_files;
CREATE POLICY "Admins can manage all media"
  ON media_files
  FOR ALL
  TO authenticated
  USING (public.is_admin());


-- ===================================================================
-- MIGRATION: 20260213103531_fix_rls_policies_and_user_role_v2.sql
-- ===================================================================
/*
  # Fix RLS Policies and User Role

  1. Clean up duplicate/conflicting policies
    - Remove old "Tout le monde peut..." policies from seo_metadata
    - These policies were too permissive and conflict with proper RLS
  
  2. Fix user role
    - Update contributor role to content_creator (valid role)
    - Ensure role check constraint is correct

  3. Notes
    - This ensures proper security with clear, non-conflicting policies
    - After this, only authenticated users can manage their own content
    - Admins and SEO managers can manage all content
*/

-- Drop the overly permissive old policies
DROP POLICY IF EXISTS "Tout le monde peut créer des métadonnées" ON seo_metadata;
DROP POLICY IF EXISTS "Tout le monde peut lire les métadonnées" ON seo_metadata;
DROP POLICY IF EXISTS "Tout le monde peut mettre à jour les métadonnées" ON seo_metadata;
DROP POLICY IF EXISTS "Tout le monde peut supprimer les métadonnées" ON seo_metadata;

-- Drop old constraint first
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_role_check;

-- Update contributor to content_creator
UPDATE user_profiles 
SET role = 'content_creator' 
WHERE role = 'contributor';

-- Add new constraint with correct role names
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_role_check 
  CHECK (role IN ('admin', 'seo_manager', 'content_creator'));


-- ===================================================================
-- MIGRATION: 20260213103543_add_missing_delete_policy_seo_metadata.sql
-- ===================================================================
/*
  # Add Missing DELETE Policy for SEO Metadata

  1. New Policy
    - Allow users to delete their own pages
    - This was missing from the original RLS setup

  2. Security
    - Users can only delete pages they created (user_id = auth.uid())
    - Admins and SEO managers already have delete access via "manage all pages" policy
*/

-- Add policy for users to delete their own pages
CREATE POLICY "Users can delete own pages"
  ON seo_metadata
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);


-- ===================================================================
-- MIGRATION: 20260213103621_add_insert_policy_user_profiles.sql
-- ===================================================================
/*
  # Add INSERT Policy for User Profiles

  1. New Policy
    - Allow authenticated users to create their own profile
    - This is needed when a user signs up and the profile creation happens from the frontend

  2. Security
    - Users can only insert their own profile (id = auth.uid())
    - This prevents users from creating profiles for other users
*/

-- Add policy for users to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);


-- ===================================================================
-- MIGRATION: 20260213103633_add_delete_policy_page_content_sections.sql
-- ===================================================================
/*
  # Add DELETE Policy for Page Content Sections

  1. New Policy
    - Allow users to delete sections from their own pages
    - This was missing from the original RLS setup

  2. Security
    - Users can only delete sections from pages they own
    - Check is done via the seo_metadata table foreign key
    - Admins and SEO managers already have delete access via "manage all sections" policy
*/

-- Add policy for users to delete sections from their own pages
CREATE POLICY "Users can delete sections of own pages"
  ON page_content_sections
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM seo_metadata
      WHERE seo_metadata.id = page_content_sections.page_id
      AND seo_metadata.user_id = auth.uid()
    )
  );


-- ===================================================================
-- MIGRATION: 20260213110831_add_sections_data_jsonb_columns.sql
-- ===================================================================
/*
  # Add sections_data JSONB columns

  1. Modified Tables
    - `page_templates`
      - Added `sections_data` (jsonb) - stores the visual builder sections as JSON array
    - `seo_metadata`
      - Added `sections_data` (jsonb) - stores the page's visual sections for rendering

  2. Notes
    - sections_data stores an array of PageBuilderSection objects
    - This enables rendering pages with the visual widget system
    - Backwards compatible: existing pages without sections_data still work via content HTML
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'page_templates' AND column_name = 'sections_data'
  ) THEN
    ALTER TABLE page_templates ADD COLUMN sections_data jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'seo_metadata' AND column_name = 'sections_data'
  ) THEN
    ALTER TABLE seo_metadata ADD COLUMN sections_data jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;


-- ===================================================================
-- MIGRATION: 20260213133805_add_seo_headings_to_templates.sql
-- ===================================================================
/*
  # Add SEO Headings to Templates

  1. Changes
    - Add `seo_h1` column to page_templates table for main SEO heading
    - Add `seo_h2` column to page_templates table for secondary SEO heading
    
  2. Notes
    - H1 is critical for SEO and should be unique per page
    - H2 provides additional context and semantic structure
    - Both fields are optional to maintain backward compatibility
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'page_templates' AND column_name = 'seo_h1'
  ) THEN
    ALTER TABLE page_templates ADD COLUMN seo_h1 text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'page_templates' AND column_name = 'seo_h2'
  ) THEN
    ALTER TABLE page_templates ADD COLUMN seo_h2 text;
  END IF;
END $$;

-- ===================================================================
-- MIGRATION: 20260213133813_add_seo_headings_to_seo_metadata.sql
-- ===================================================================
/*
  # Add SEO Headings to SEO Metadata

  1. Changes
    - Add `seo_h1` column to seo_metadata table for main SEO heading
    - Add `seo_h2` column to seo_metadata table for secondary SEO heading
    
  2. Notes
    - H1 is critical for SEO and should be unique per page
    - H2 provides additional context and semantic structure
    - Both fields are optional to maintain backward compatibility
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'seo_metadata' AND column_name = 'seo_h1'
  ) THEN
    ALTER TABLE seo_metadata ADD COLUMN seo_h1 text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'seo_metadata' AND column_name = 'seo_h2'
  ) THEN
    ALTER TABLE seo_metadata ADD COLUMN seo_h2 text;
  END IF;
END $$;

-- ===================================================================
-- MIGRATION: 20260216080708_create_page_themes_table.sql
-- ===================================================================
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

-- ===================================================================
-- MIGRATION: 20260216083928_create_fonts_library.sql
-- ===================================================================
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

-- ===================================================================
-- MIGRATION: 20260216084347_update_page_themes_with_new_colors.sql
-- ===================================================================
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


-- ===================================================================
-- MIGRATION: 20260216093247_create_daisyui_themes_table.sql
-- ===================================================================
/*
  # Create daisyui_themes table for unified theme management

  1. New Tables
    - `daisyui_themes`
      - `id` (uuid, primary key)
      - `name` (text, unique) - Theme display name
      - `slug` (text, unique) - URL-safe identifier used in data-theme attribute
      - `source` (text) - 'daisyui' for official themes, 'custom' for user-created
      - `tokens` (jsonb) - Color token values (primary, secondary, accent, neutral, base-100, etc.)
      - `is_active` (boolean) - Whether this is the currently active global theme
      - `user_id` (uuid) - Owner of custom themes (null for official themes)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `daisyui_themes` table
    - All authenticated users can read all themes
    - Users can create/update/delete only their own custom themes
    - Official daisyUI themes cannot be modified or deleted

  3. Initial Data
    - Seed all 32 official daisyUI themes with their token values
*/

CREATE TABLE IF NOT EXISTS daisyui_themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  source text NOT NULL DEFAULT 'custom',
  tokens jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT false,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_source CHECK (source IN ('daisyui', 'custom'))
);

ALTER TABLE daisyui_themes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read themes" ON daisyui_themes;
DROP POLICY IF EXISTS "Users can create custom themes" ON daisyui_themes;
DROP POLICY IF EXISTS "Users can update own custom themes" ON daisyui_themes;
DROP POLICY IF EXISTS "Users can delete own custom themes" ON daisyui_themes;

CREATE POLICY "Anyone can read themes"
  ON daisyui_themes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create custom themes"
  ON daisyui_themes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND source = 'custom');

CREATE POLICY "Users can update own custom themes"
  ON daisyui_themes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND source = 'custom')
  WITH CHECK (auth.uid() = user_id AND source = 'custom');

CREATE POLICY "Users can delete own custom themes"
  ON daisyui_themes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id AND source = 'custom');

-- Seed official daisyUI themes
INSERT INTO daisyui_themes (name, slug, source, tokens, is_active) VALUES
('Light', 'light', 'daisyui', '{"primary":"#570df8","primary-content":"#ffffff","secondary":"#f000b8","secondary-content":"#ffffff","accent":"#37cdbe","accent-content":"#163835","neutral":"#2a323c","neutral-content":"#a6adbb","base-100":"#ffffff","base-200":"#f2f2f2","base-300":"#e5e6e6","base-content":"#1f2937","info":"#3abff8","info-content":"#002b3d","success":"#36d399","success-content":"#003320","warning":"#fbbd23","warning-content":"#382800","error":"#f87272","error-content":"#470000"}'::jsonb, true),
('Dark', 'dark', 'daisyui', '{"primary":"#661ae6","primary-content":"#ffffff","secondary":"#d926a9","secondary-content":"#ffffff","accent":"#1fb2a6","accent-content":"#ffffff","neutral":"#2a323c","neutral-content":"#a6adbb","base-100":"#1d232a","base-200":"#191e24","base-300":"#15191e","base-content":"#a6adbb","info":"#3abff8","info-content":"#002b3d","success":"#36d399","success-content":"#003320","warning":"#fbbd23","warning-content":"#382800","error":"#f87272","error-content":"#470000"}'::jsonb, false),
('Cupcake', 'cupcake', 'daisyui', '{"primary":"#65c3c8","primary-content":"#223D3E","secondary":"#ef9fbc","secondary-content":"#3D2B32","accent":"#eeaf3a","accent-content":"#3D3520","neutral":"#291334","neutral-content":"#D4C1DB","base-100":"#faf7f5","base-200":"#efecea","base-300":"#e7e2df","base-content":"#291334","info":"#3abff8","info-content":"#002b3d","success":"#36d399","success-content":"#003320","warning":"#fbbd23","warning-content":"#382800","error":"#f87272","error-content":"#470000"}'::jsonb, false),
('Bumblebee', 'bumblebee', 'daisyui', '{"primary":"#e0a82e","primary-content":"#3D2F0A","secondary":"#f9d72f","secondary-content":"#3D350B","accent":"#e0a82e","accent-content":"#3D2F0A","neutral":"#1f2937","neutral-content":"#d5d7da","base-100":"#ffffff","base-200":"#f2f2f2","base-300":"#e5e6e6","base-content":"#1f2937","info":"#3abff8","info-content":"#002b3d","success":"#36d399","success-content":"#003320","warning":"#fbbd23","warning-content":"#382800","error":"#f87272","error-content":"#470000"}'::jsonb, false),
('Emerald', 'emerald', 'daisyui', '{"primary":"#66cc8a","primary-content":"#1A3320","secondary":"#377cfb","secondary-content":"#0E1F3D","accent":"#ea5234","accent-content":"#ffffff","neutral":"#333c4d","neutral-content":"#d1d5db","base-100":"#ffffff","base-200":"#f2f2f2","base-300":"#e5e6e6","base-content":"#333c4d","info":"#3abff8","info-content":"#002b3d","success":"#36d399","success-content":"#003320","warning":"#fbbd23","warning-content":"#382800","error":"#f87272","error-content":"#470000"}'::jsonb, false),
('Corporate', 'corporate', 'daisyui', '{"primary":"#4b6bfb","primary-content":"#ffffff","secondary":"#7b92b2","secondary-content":"#1E2530","accent":"#67cba0","accent-content":"#1A3325","neutral":"#181a2a","neutral-content":"#d5d7da","base-100":"#ffffff","base-200":"#f2f2f2","base-300":"#e5e6e6","base-content":"#181a2a","info":"#3abff8","info-content":"#002b3d","success":"#36d399","success-content":"#003320","warning":"#fbbd23","warning-content":"#382800","error":"#f87272","error-content":"#470000"}'::jsonb, false),
('Synthwave', 'synthwave', 'daisyui', '{"primary":"#e779c1","primary-content":"#3D1E30","secondary":"#58c7f3","secondary-content":"#16323D","accent":"#f3cc30","accent-content":"#3D330C","neutral":"#20134e","neutral-content":"#f9f7fd","base-100":"#1a103d","base-200":"#150D33","base-300":"#110A29","base-content":"#f9f7fd","info":"#53c0f0","info-content":"#153040","success":"#71ead2","success-content":"#1C3B35","warning":"#f3cc30","warning-content":"#3D330C","error":"#e24056","error-content":"#390F16"}'::jsonb, false),
('Retro', 'retro', 'daisyui', '{"primary":"#ef9995","primary-content":"#3D2726","secondary":"#a4cbb4","secondary-content":"#29332D","accent":"#dc8850","accent-content":"#372214","neutral":"#2e282a","neutral-content":"#e4d8b4","base-100":"#ece3ca","base-200":"#e4d8b4","base-300":"#d5c5a1","base-content":"#282425","info":"#2094f3","info-content":"#08253D","success":"#009485","success-content":"#002521","warning":"#ff9900","warning-content":"#402600","error":"#ff5724","error-content":"#401609"}'::jsonb, false),
('Cyberpunk', 'cyberpunk', 'daisyui', '{"primary":"#ff7598","primary-content":"#3D1C25","secondary":"#75d1f0","secondary-content":"#1D343C","accent":"#c07eec","accent-content":"#301F3B","neutral":"#423f00","neutral-content":"#e7e600","base-100":"#ffee00","base-200":"#e6d600","base-300":"#ccbe00","base-content":"#333300","info":"#00fefe","info-content":"#004040","success":"#79ff79","success-content":"#1E401E","warning":"#ff7f00","warning-content":"#402000","error":"#ff4444","error-content":"#401111"}'::jsonb, false),
('Valentine', 'valentine', 'daisyui', '{"primary":"#e96d7b","primary-content":"#3A1B1F","secondary":"#a991f7","secondary-content":"#2A243E","accent":"#88dbdd","accent-content":"#223737","neutral":"#af4670","neutral-content":"#f2d9e1","base-100":"#fae7f4","base-200":"#f5d5ea","base-300":"#f0c3e0","base-content":"#632c3b","info":"#2094f3","info-content":"#08253D","success":"#009485","success-content":"#002521","warning":"#ff9900","warning-content":"#402600","error":"#ff5724","error-content":"#401609"}'::jsonb, false),
('Halloween', 'halloween', 'daisyui', '{"primary":"#f28c18","primary-content":"#3D2306","secondary":"#6d3a9c","secondary-content":"#e4d1f4","accent":"#51a800","accent-content":"#142A00","neutral":"#2f1b05","neutral-content":"#f0dcc8","base-100":"#212121","base-200":"#1a1a1a","base-300":"#131313","base-content":"#d5ccbb","info":"#2094f3","info-content":"#08253D","success":"#009485","success-content":"#002521","warning":"#ff9900","warning-content":"#402600","error":"#ff5724","error-content":"#401609"}'::jsonb, false),
('Garden', 'garden', 'daisyui', '{"primary":"#5c7f67","primary-content":"#ffffff","secondary":"#ecf4e7","secondary-content":"#3B3D39","accent":"#fae5e5","accent-content":"#3E3939","neutral":"#5d5656","neutral-content":"#d7d1d1","base-100":"#e9e7e7","base-200":"#dddada","base-300":"#d1cdcd","base-content":"#100f0f","info":"#2094f3","info-content":"#08253D","success":"#009485","success-content":"#002521","warning":"#ff9900","warning-content":"#402600","error":"#ff5724","error-content":"#401609"}'::jsonb, false),
('Forest', 'forest', 'daisyui', '{"primary":"#1eb854","primary-content":"#052E15","secondary":"#1db990","secondary-content":"#052E24","accent":"#1db5c4","accent-content":"#052D31","neutral":"#19362d","neutral-content":"#d1e0da","base-100":"#171212","base-200":"#120e0e","base-300":"#0d0a0a","base-content":"#d1caca","info":"#2094f3","info-content":"#08253D","success":"#009485","success-content":"#002521","warning":"#ff9900","warning-content":"#402600","error":"#ff5724","error-content":"#401609"}'::jsonb, false),
('Aqua', 'aqua', 'daisyui', '{"primary":"#09ecf3","primary-content":"#023B3D","secondary":"#966fb3","secondary-content":"#251C2D","accent":"#ffe999","accent-content":"#403A26","neutral":"#3b8ac4","neutral-content":"#d1e3f1","base-100":"#345da7","base-200":"#2D5196","base-300":"#264585","base-content":"#d5e0f0","info":"#2094f3","info-content":"#08253D","success":"#009485","success-content":"#002521","warning":"#ff9900","warning-content":"#402600","error":"#ff5724","error-content":"#401609"}'::jsonb, false),
('Lofi', 'lofi', 'daisyui', '{"primary":"#0d0d0d","primary-content":"#ffffff","secondary":"#1a1919","secondary-content":"#ffffff","accent":"#262626","accent-content":"#ffffff","neutral":"#000000","neutral-content":"#ffffff","base-100":"#ffffff","base-200":"#f2f2f2","base-300":"#e6e6e6","base-content":"#000000","info":"#0070f3","info-content":"#ffffff","success":"#21cc51","success-content":"#052E14","warning":"#ff6154","warning-content":"#401814","error":"#de1c8d","error-content":"#ffffff"}'::jsonb, false),
('Pastel', 'pastel', 'daisyui', '{"primary":"#d1c1d7","primary-content":"#353036","secondary":"#f6cbd1","secondary-content":"#3E3234","accent":"#b6e3d4","accent-content":"#2D3935","neutral":"#70acc7","neutral-content":"#1C2B32","base-100":"#ffffff","base-200":"#f9fafb","base-300":"#d1d5db","base-content":"#333333","info":"#8cc8ea","info-content":"#23323B","success":"#addfad","success-content":"#2B382B","warning":"#f5d38b","warning-content":"#3E3523","error":"#f1a3a8","error-content":"#3C292A"}'::jsonb, false),
('Fantasy', 'fantasy', 'daisyui', '{"primary":"#6e0b75","primary-content":"#ffffff","secondary":"#007ebd","secondary-content":"#ffffff","accent":"#f8860d","accent-content":"#3E2203","neutral":"#1f2937","neutral-content":"#d5d7da","base-100":"#ffffff","base-200":"#f2f2f2","base-300":"#e5e6e6","base-content":"#1f2937","info":"#3abff8","info-content":"#002b3d","success":"#36d399","success-content":"#003320","warning":"#fbbd23","warning-content":"#382800","error":"#f87272","error-content":"#470000"}'::jsonb, false),
('Wireframe', 'wireframe', 'daisyui', '{"primary":"#b8b8b8","primary-content":"#2E2E2E","secondary":"#b8b8b8","secondary-content":"#2E2E2E","accent":"#b8b8b8","accent-content":"#2E2E2E","neutral":"#ebebeb","neutral-content":"#3B3B3B","base-100":"#ffffff","base-200":"#eeeeee","base-300":"#dddddd","base-content":"#333333","info":"#0070f3","info-content":"#ffffff","success":"#21cc51","success-content":"#052E14","warning":"#ff6154","warning-content":"#401814","error":"#de1c8d","error-content":"#ffffff"}'::jsonb, false),
('Black', 'black', 'daisyui', '{"primary":"#343232","primary-content":"#d5d4d4","secondary":"#343232","secondary-content":"#d5d4d4","accent":"#343232","accent-content":"#d5d4d4","neutral":"#272626","neutral-content":"#d4d3d3","base-100":"#000000","base-200":"#0d0d0d","base-300":"#1a1a1a","base-content":"#cccccc","info":"#0070f3","info-content":"#ffffff","success":"#21cc51","success-content":"#052E14","warning":"#ff6154","warning-content":"#401814","error":"#de1c8d","error-content":"#ffffff"}'::jsonb, false),
('Luxury', 'luxury', 'daisyui', '{"primary":"#ffffff","primary-content":"#000000","secondary":"#152747","secondary-content":"#d1dBeb","accent":"#513448","accent-content":"#dAc5d4","neutral":"#331800","neutral-content":"#f0dcc8","base-100":"#09090b","base-200":"#070708","base-300":"#050506","base-content":"#dca54c","info":"#66c6ff","info-content":"#1A3240","success":"#87d039","success-content":"#22340E","warning":"#e2d562","warning-content":"#383518","error":"#ff6f6f","error-content":"#401C1C"}'::jsonb, false),
('Dracula', 'dracula', 'daisyui', '{"primary":"#ff79c6","primary-content":"#3D1E30","secondary":"#bd93f9","secondary-content":"#2F243E","accent":"#ffb86c","accent-content":"#3D2E1A","neutral":"#414558","neutral-content":"#d1d3da","base-100":"#282a36","base-200":"#21222c","base-300":"#1a1b24","base-content":"#f8f8f2","info":"#8be9fd","info-content":"#233A3F","success":"#50fa7b","success-content":"#143E1E","warning":"#f1fa8c","warning-content":"#3C3E23","error":"#ff5555","error-content":"#401515"}'::jsonb, false),
('CMYK', 'cmyk', 'daisyui', '{"primary":"#45AEEE","primary-content":"#112B3B","secondary":"#E8488A","secondary-content":"#3A1222","accent":"#FFC107","accent-content":"#403002","neutral":"#1a1a2e","neutral-content":"#d1d1dc","base-100":"#ffffff","base-200":"#f2f2f2","base-300":"#e5e6e6","base-content":"#1a1a2e","info":"#3abff8","info-content":"#002b3d","success":"#36d399","success-content":"#003320","warning":"#fbbd23","warning-content":"#382800","error":"#f87272","error-content":"#470000"}'::jsonb, false),
('Autumn', 'autumn', 'daisyui', '{"primary":"#8C0327","primary-content":"#f2ccd4","secondary":"#D85251","secondary-content":"#361414","accent":"#D59B6C","accent-content":"#36271B","neutral":"#826A5C","neutral-content":"#e8e0db","base-100":"#f1f1f1","base-200":"#e6e6e6","base-300":"#dbdbdb","base-content":"#1f1f1f","info":"#42ADBB","info-content":"#102B2F","success":"#499380","success-content":"#122520","warning":"#E97F14","warning-content":"#3A2005","error":"#DF1A2F","error-content":"#38060C"}'::jsonb, false),
('Business', 'business', 'daisyui', '{"primary":"#1C4E80","primary-content":"#d1dfeb","secondary":"#7C909A","secondary-content":"#1F2426","accent":"#EA6947","accent-content":"#3B1A12","neutral":"#23282E","neutral-content":"#d3d5d7","base-100":"#202020","base-200":"#1a1a1a","base-300":"#141414","base-content":"#d6d6d6","info":"#0091D5","info-content":"#002435","success":"#6BB187","success-content":"#1B2C22","warning":"#DBAE59","warning-content":"#372C17","error":"#AC3E31","error-content":"#2B100C"}'::jsonb, false),
('Acid', 'acid', 'daisyui', '{"primary":"#FF00F5","primary-content":"#40003D","secondary":"#FF7400","secondary-content":"#401D00","accent":"#CBFF00","accent-content":"#334000","neutral":"#1f1f1f","neutral-content":"#d1d1d1","base-100":"#fafafa","base-200":"#ebebeb","base-300":"#dcdcdc","base-content":"#1f1f1f","info":"#00b5ff","info-content":"#002D40","success":"#00a96e","success-content":"#002A1C","warning":"#ffbe00","warning-content":"#403000","error":"#ff5861","error-content":"#401618"}'::jsonb, false),
('Lemonade', 'lemonade', 'daisyui', '{"primary":"#519903","primary-content":"#142601","secondary":"#E9E92E","secondary-content":"#3A3A0B","accent":"#F7F9CA","accent-content":"#3E3E33","neutral":"#191A3E","neutral-content":"#d1d1dc","base-100":"#ffffff","base-200":"#f2f2f2","base-300":"#e5e6e6","base-content":"#191A3E","info":"#C8E1FF","info-content":"#323840","success":"#DEF29F","success-content":"#383D28","warning":"#F7E589","warning-content":"#3E3922","error":"#F2B6B5","error-content":"#3D2D2D"}'::jsonb, false),
('Night', 'night', 'daisyui', '{"primary":"#38bdf8","primary-content":"#0E2F3E","secondary":"#818cf8","secondary-content":"#20233E","accent":"#f471b5","accent-content":"#3D1C2D","neutral":"#1e293b","neutral-content":"#d1d8e4","base-100":"#0f172a","base-200":"#0d1322","base-300":"#0b0f1a","base-content":"#b2c5df","info":"#0ca5e9","info-content":"#03293A","success":"#2dd4bf","success-content":"#0B3530","warning":"#f4bf50","warning-content":"#3D3014","error":"#fb7085","error-content":"#3E1C21"}'::jsonb, false),
('Coffee', 'coffee', 'daisyui', '{"primary":"#DB924B","primary-content":"#372412","secondary":"#6F4E37","secondary-content":"#f0e2d4","accent":"#263E3F","accent-content":"#c9dAdb","neutral":"#120C12","neutral-content":"#d0c3d0","base-100":"#20161F","base-200":"#1a111a","base-300":"#140d14","base-content":"#cebdbd","info":"#8DCAC1","info-content":"#233230","success":"#9DB787","success-content":"#272E22","warning":"#FFD25F","warning-content":"#403518","error":"#FC9581","error-content":"#3F2520"}'::jsonb, false),
('Winter', 'winter', 'daisyui', '{"primary":"#047AFF","primary-content":"#ffffff","secondary":"#463AA2","secondary-content":"#ffffff","accent":"#C148AC","accent-content":"#30122B","neutral":"#021431","neutral-content":"#cdd4e0","base-100":"#ffffff","base-200":"#f2f7ff","base-300":"#e3ecf7","base-content":"#394E6A","info":"#93E7FB","info-content":"#243A3F","success":"#81CFD1","success-content":"#203434","warning":"#EFD7BB","warning-content":"#3C362F","error":"#E58B8B","error-content":"#392323"}'::jsonb, false),
('Dim', 'dim', 'daisyui', '{"primary":"#9FE88D","primary-content":"#283A23","secondary":"#FF7D5C","secondary-content":"#401F17","accent":"#C792E9","accent-content":"#32243A","neutral":"#2A303C","neutral-content":"#B2CCD6","base-100":"#2A303C","base-200":"#242933","base-300":"#1F242D","base-content":"#B2CCD6","info":"#28EBFF","info-content":"#0A3B40","success":"#62EFBD","success-content":"#183C2F","warning":"#EFD7BB","warning-content":"#3C362F","error":"#FFAE9B","error-content":"#402B27"}'::jsonb, false),
('Nord', 'nord', 'daisyui', '{"primary":"#5E81AC","primary-content":"#17202B","secondary":"#81A1C1","secondary-content":"#202830","accent":"#88C0D0","accent-content":"#223034","neutral":"#4C566A","neutral-content":"#d8dee9","base-100":"#eceff4","base-200":"#e5e9f0","base-300":"#d8dee9","base-content":"#2E3440","info":"#B48EAD","info-content":"#2D232B","success":"#A3BE8C","success-content":"#293023","warning":"#EBCB8B","warning-content":"#3B3223","error":"#BF616A","error-content":"#30181A"}'::jsonb, false),
('Sunset', 'sunset', 'daisyui', '{"primary":"#FF865B","primary-content":"#402117","secondary":"#FD6F9C","secondary-content":"#3F1C27","accent":"#2DD4BF","accent-content":"#0B3530","neutral":"#1E293B","neutral-content":"#d1d8e4","base-100":"#121C22","base-200":"#0F171C","base-300":"#0C1216","base-content":"#9FB9D0","info":"#38BDF8","info-content":"#0E2F3E","success":"#4ADE80","success-content":"#122B20","warning":"#FBBF24","warning-content":"#3E3009","error":"#FB7185","error-content":"#3E1C21"}'::jsonb, false)
ON CONFLICT (slug) DO NOTHING;

-- ===================================================================
-- MIGRATION: 20260216101148_fix_daisyui_themes_rls_policies.sql
-- ===================================================================
/*
  # Correction des policies RLS pour daisyui_themes
  
  1. Changements
    - Supprime l'ancienne policy UPDATE trop restrictive
    - Ajoute une policy pour permettre de changer is_active sur tous les thèmes
    - Ajoute une policy pour permettre de modifier les autres champs uniquement sur les thèmes personnalisés
  
  2. Raison
    - La policy précédente empêchait de changer le thème actif car elle bloquait
      les UPDATE sur les thèmes officiels (user_id = NULL)
    - Maintenant on sépare la logique : is_active peut être modifié sur tous les thèmes,
      mais les autres champs (name, slug, tokens) uniquement sur les thèmes personnalisés
*/

-- Supprimer l'ancienne policy UPDATE trop restrictive
DROP POLICY IF EXISTS "Users can update own custom themes" ON daisyui_themes;

-- Permettre à tous les utilisateurs authentifiés de changer is_active sur n'importe quel thème
CREATE POLICY "Users can activate any theme"
  ON daisyui_themes
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Créer une fonction trigger pour empêcher la modification des autres champs sur les thèmes officiels
CREATE OR REPLACE FUNCTION prevent_official_theme_modification()
RETURNS TRIGGER AS $$
BEGIN
  -- Si c'est un thème officiel
  IF OLD.source = 'daisyui' THEN
    -- Seul is_active peut être modifié
    IF NEW.name IS DISTINCT FROM OLD.name OR
       NEW.slug IS DISTINCT FROM OLD.slug OR
       NEW.tokens IS DISTINCT FROM OLD.tokens OR
       NEW.source IS DISTINCT FROM OLD.source OR
       NEW.user_id IS DISTINCT FROM OLD.user_id THEN
      RAISE EXCEPTION 'Cannot modify official DaisyUI themes';
    END IF;
  END IF;
  
  -- Si c'est un thème personnalisé, vérifier que l'utilisateur est le propriétaire
  IF OLD.source = 'custom' AND OLD.user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Cannot modify themes owned by other users';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger
DROP TRIGGER IF EXISTS check_theme_modification ON daisyui_themes;
CREATE TRIGGER check_theme_modification
  BEFORE UPDATE ON daisyui_themes
  FOR EACH ROW
  EXECUTE FUNCTION prevent_official_theme_modification();


-- ===================================================================
-- MIGRATION: 20260216104010_add_font_config_to_daisyui_themes.sql
-- ===================================================================
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


-- ===================================================================
-- MIGRATION: 20260216120400_add_daisy_theme_to_pages.sql
-- ===================================================================
/*
  # Add DaisyUI theme support to pages and templates
  
  1. Changes
    - Add `daisy_theme_slug` column to `seo_metadata` table
    - Add `daisy_theme_slug` column to `page_templates` table
    - These columns store the slug of the active DaisyUI theme for each page/template
    - NULL means inherit from global theme
    - Special value 'none' means no theme applied
*/

-- Add daisy_theme_slug to seo_metadata
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'seo_metadata' AND column_name = 'daisy_theme_slug'
  ) THEN
    ALTER TABLE seo_metadata ADD COLUMN daisy_theme_slug text DEFAULT NULL;
  END IF;
END $$;

-- Add daisy_theme_slug to page_templates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'page_templates' AND column_name = 'daisy_theme_slug'
  ) THEN
    ALTER TABLE page_templates ADD COLUMN daisy_theme_slug text DEFAULT NULL;
  END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN seo_metadata.daisy_theme_slug IS 'DaisyUI theme slug for this page. NULL = inherit global, "none" = no theme';
COMMENT ON COLUMN page_templates.daisy_theme_slug IS 'DaisyUI theme slug for this template. NULL = inherit global, "none" = no theme';


-- ===================================================================
-- MIGRATION: 20260217113000_add_daisy_theme_slug_to_page_templates.sql
-- ===================================================================
/*
  # Add daisy_theme_slug to page_templates

  This migration aligns DB schema with the frontend model/template builder.
  It safely adds the column only if missing.
*/

ALTER TABLE page_templates
ADD COLUMN IF NOT EXISTS daisy_theme_slug text;

CREATE INDEX IF NOT EXISTS idx_page_templates_daisy_theme_slug
  ON page_templates(daisy_theme_slug);


-- ===================================================================
-- MIGRATION: 20260217124500_fix_signup_role_default_and_trigger.sql
-- ===================================================================
/*
  # Fix signup failure from user_profiles role mismatch

  1. Problem
    - user_profiles.role default was originally 'contributor'
    - later constraint only allows ('admin', 'seo_manager', 'content_creator')
    - signup trigger inserts into user_profiles without explicit role
    - result: INSERT violates check constraint and Auth signup returns 500

  2. Fix
    - normalize old rows from contributor -> content_creator
    - enforce role constraint with valid values
    - set default role to content_creator
    - update handle_new_user trigger function to insert explicit valid role
*/

-- Normalize historical rows before constraint enforcement
UPDATE public.user_profiles
SET role = 'content_creator'
WHERE role = 'contributor';

-- Ensure the role check constraint is correct
ALTER TABLE public.user_profiles
DROP CONSTRAINT IF EXISTS user_profiles_role_check;

ALTER TABLE public.user_profiles
ADD CONSTRAINT user_profiles_role_check
CHECK (role IN ('admin', 'seo_manager', 'content_creator'));

-- Ensure new rows receive a valid default role
ALTER TABLE public.user_profiles
ALTER COLUMN role SET DEFAULT 'content_creator';

-- Make signup trigger explicit to avoid relying on defaults
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    'content_creator'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ===================================================================
-- MIGRATION: 20260218090000_fix_rls_insert_update_seo_metadata.sql
-- ===================================================================
/*
  # Fix RLS INSERT / UPDATE policies for seo_metadata

  Problem: INSERT policy requires auth.uid() = user_id, but the client
  was not always sending user_id on upsert (especially on edit).
  Additionally, rows created before user_id column was added have NULL user_id.

  Fix:
  1. Backfill NULL user_id rows with the first admin user_id so they become editable
  2. Recreate INSERT policy to allow any authenticated user to insert
     (WITH CHECK ensures user_id is set to their own id)
  3. Recreate UPDATE policy to allow owners + admins/seo_managers
*/

-- Backfill NULL user_id rows: assign to first admin user
UPDATE seo_metadata
SET user_id = (
  SELECT id FROM user_profiles WHERE role = 'admin' ORDER BY created_at LIMIT 1
)
WHERE user_id IS NULL
  AND EXISTS (SELECT 1 FROM user_profiles WHERE role = 'admin');

-- Drop and recreate INSERT policy
DROP POLICY IF EXISTS "Authenticated users can create pages" ON seo_metadata;
CREATE POLICY "Authenticated users can create pages"
  ON seo_metadata FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'seo_manager')
    )
  );

-- Drop and recreate UPDATE policy to also allow editing own pages when user_id matches
DROP POLICY IF EXISTS "Users can update own pages" ON seo_metadata;
CREATE POLICY "Users can update own pages"
  ON seo_metadata FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'seo_manager')
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'seo_manager')
    )
  );


-- ===================================================================
-- MIGRATION: 20260218090100_add_folder_columns.sql
-- ===================================================================
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


-- ===================================================================
-- MIGRATION: 20260226112000_create_seo_redirects_table.sql
-- ===================================================================
/*
  # Create seo_redirects table

  Objectif:
  - Conserver l'historique des anciens slugs après renommage
  - Permettre une résolution centralisée des redirections 301
  - Prévenir les collisions via un index unique sur source_path
*/

CREATE TABLE IF NOT EXISTS public.seo_redirects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_path text NOT NULL,
  target_path text NOT NULL,
  source_page_id uuid REFERENCES public.seo_metadata(id) ON DELETE SET NULL,
  target_page_id uuid REFERENCES public.seo_metadata(id) ON DELETE SET NULL,
  reason text,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT seo_redirects_source_target_different CHECK (source_path <> target_path)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_seo_redirects_source_path_unique
  ON public.seo_redirects (source_path)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_seo_redirects_target_path
  ON public.seo_redirects (target_path);

CREATE INDEX IF NOT EXISTS idx_seo_redirects_source_page_id
  ON public.seo_redirects (source_page_id);

CREATE INDEX IF NOT EXISTS idx_seo_redirects_target_page_id
  ON public.seo_redirects (target_page_id);

DROP TRIGGER IF EXISTS on_seo_redirects_updated ON public.seo_redirects;
CREATE TRIGGER on_seo_redirects_updated
  BEFORE UPDATE ON public.seo_redirects
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.seo_redirects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active redirects" ON public.seo_redirects;
CREATE POLICY "Public can read active redirects"
  ON public.seo_redirects FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "SEO managers can create redirects" ON public.seo_redirects;
CREATE POLICY "SEO managers can create redirects"
  ON public.seo_redirects FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'seo_manager')
    )
  );

DROP POLICY IF EXISTS "SEO managers can update redirects" ON public.seo_redirects;
CREATE POLICY "SEO managers can update redirects"
  ON public.seo_redirects FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'seo_manager')
    )
  )
  WITH CHECK (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'seo_manager')
    )
  );

DROP POLICY IF EXISTS "SEO managers can delete redirects" ON public.seo_redirects;
CREATE POLICY "SEO managers can delete redirects"
  ON public.seo_redirects FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'seo_manager')
    )
  );


-- ===================================================================
-- MIGRATION: 20260302162921_create_global_header_footer_settings.sql
-- ===================================================================
/*
  # Create global header/footer settings table

  ## Purpose
  Allows administrators to define a "global" header and/or footer section
  (stored as a JSON section object, exactly like a PageBuilderSection) that
  can be automatically injected into pages at creation-time (import or manual)
  or applied retroactively to a set of existing pages.

  ## New Tables
  - `global_hf_settings`
    - `id` (uuid, PK)
    - `label` (text) – human-readable name for this configuration
    - `header_section` (jsonb, nullable) – full PageBuilderSection JSON for the header
    - `footer_section` (jsonb, nullable) – full PageBuilderSection JSON for the footer
    - `apply_on_import` (boolean, default false) – auto-inject on new import
    - `apply_on_create` (boolean, default false) – auto-inject on manual page creation
    - `is_active` (boolean, default true) – whether this config is currently active
    - `created_by` (uuid, FK to user_profiles)
    - `created_at` / `updated_at`

  ## Security
  - RLS enabled
  - Admins and SEO managers can read/write
  - Regular authenticated users can only read active configs
*/

CREATE TABLE IF NOT EXISTS global_hf_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL DEFAULT 'Configuration par défaut',
  header_section jsonb DEFAULT NULL,
  footer_section jsonb DEFAULT NULL,
  apply_on_import boolean NOT NULL DEFAULT false,
  apply_on_create boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE global_hf_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and managers can select global hf settings"
  ON global_hf_settings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'seo_manager', 'content_creator')
    )
  );

CREATE POLICY "Admins and managers can insert global hf settings"
  ON global_hf_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'seo_manager')
    )
  );

CREATE POLICY "Admins and managers can update global hf settings"
  ON global_hf_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'seo_manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'seo_manager')
    )
  );

CREATE POLICY "Admins and managers can delete global hf settings"
  ON global_hf_settings FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'seo_manager')
    )
  );


-- ===================================================================
-- MIGRATION: 20260302165048_add_content_creator_access_to_global_hf_settings.sql
-- ===================================================================
/*
  # Extend global_hf_settings access to content_creator role

  ## Changes
  - Drop existing INSERT, UPDATE, DELETE policies that only allowed admin/seo_manager
  - Recreate them to also include content_creator role
  - SELECT policy already included content_creator, no change needed

  ## Security
  - content_creator can now fully manage global header/footer settings
  - All roles still require authentication
*/

DROP POLICY IF EXISTS "Admins and managers can insert global hf settings" ON global_hf_settings;
DROP POLICY IF EXISTS "Admins and managers can update global hf settings" ON global_hf_settings;
DROP POLICY IF EXISTS "Admins and managers can delete global hf settings" ON global_hf_settings;

CREATE POLICY "Admins managers and creators can insert global hf settings"
  ON global_hf_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'seo_manager', 'content_creator')
    )
  );

CREATE POLICY "Admins managers and creators can update global hf settings"
  ON global_hf_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'seo_manager', 'content_creator')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'seo_manager', 'content_creator')
    )
  );

CREATE POLICY "Admins managers and creators can delete global hf settings"
  ON global_hf_settings FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'seo_manager', 'content_creator')
    )
  );


-- ===================================================================
-- MIGRATION: 20260302171936_add_page_ids_to_global_hf_settings.sql
-- ===================================================================
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


-- ===================================================================
-- MIGRATION: 20260305184750_add_anon_select_policy_global_hf_settings.sql
-- ===================================================================
/*
  # Allow anonymous users to read active global HF settings

  ## Problem
  The existing SELECT policy on global_hf_settings is restricted to `authenticated`
  users only. When a real mobile device (or any unauthenticated visitor) loads a
  published page, the Supabase query in SEOPageViewer returns nothing because RLS
  blocks the anon role. As a result, globalHFSetting stays null and the global
  Header & Footer are never injected.

  ## Solution
  Add a SELECT policy for the `anon` role that allows reading settings where
  is_active = true. Write operations (INSERT/UPDATE/DELETE) remain restricted
  to authenticated users with the appropriate roles.

  ## Security Notes
  - Read-only: anon users can only SELECT, never INSERT/UPDATE/DELETE
  - Filtered: only active configurations are visible (WHERE is_active = true)
  - The data exposed is purely visual configuration (widget JSON), not personal data
*/

CREATE POLICY "Anon can read active global hf settings"
  ON global_hf_settings FOR SELECT
  TO anon
  USING (is_active = true);


-- ===================================================================
-- MIGRATION: 20260308100000_create_redaction_tables.sql
-- ===================================================================
/*
  # Menu Rédaction — Socle données et sécurité

  Plan technique 01 : création des tables coeur du module Rédaction.

  Structure du script (ordre résolvant les dépendances inter-tables) :
    0. Extension pg_trgm
    1. Création des 4 tables + index + triggers
    2. Activation RLS + politiques de sécurité (après que toutes les tables existent)
    3. Fonctions helpers
*/

-- ============================================================
-- 0. EXTENSION pg_trgm (requise pour l'index gin_trgm_ops)
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;


-- ============================================================
-- 1a. TABLE : seo_document_folders
-- ============================================================

CREATE TABLE IF NOT EXISTS seo_document_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  parent_id uuid NULL REFERENCES seo_document_folders(id) ON DELETE CASCADE,
  path text NOT NULL DEFAULT '',
  depth integer NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  created_by uuid NULL REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  CONSTRAINT uq_folder_name_per_parent UNIQUE NULLS NOT DISTINCT (parent_id, name)
);

CREATE INDEX IF NOT EXISTS idx_seo_document_folders_parent_id ON seo_document_folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_seo_document_folders_path ON seo_document_folders(path);
CREATE INDEX IF NOT EXISTS idx_seo_document_folders_depth ON seo_document_folders(depth);

DROP TRIGGER IF EXISTS on_seo_document_folders_updated ON seo_document_folders;
CREATE TRIGGER on_seo_document_folders_updated
  BEFORE UPDATE ON seo_document_folders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- ============================================================
-- 1b. TABLE : seo_documents
-- ============================================================

CREATE TABLE IF NOT EXISTS seo_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  editor_mode text NOT NULL DEFAULT 'plain' CHECK (editor_mode IN ('plain', 'rich', 'structured')),
  plain_content text NULL,
  rich_content jsonb NULL,
  structured_content jsonb NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'ready_for_ai', 'json_generated', 'published', 'archived')),
  folder_id uuid NULL REFERENCES seo_document_folders(id) ON DELETE SET NULL,
  author_user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE RESTRICT,
  owner_user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE RESTRICT,
  linked_template_id uuid NULL REFERENCES page_templates(id) ON DELETE SET NULL,
  linked_template_snapshot jsonb NULL,
  last_generated_json jsonb NULL,
  last_generated_at timestamptz NULL,
  last_generated_by uuid NULL REFERENCES user_profiles(id) ON DELETE SET NULL,
  published_page_id uuid NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  archived_at timestamptz NULL
);

CREATE INDEX IF NOT EXISTS idx_seo_documents_folder_id ON seo_documents(folder_id);
CREATE INDEX IF NOT EXISTS idx_seo_documents_author_user_id ON seo_documents(author_user_id);
CREATE INDEX IF NOT EXISTS idx_seo_documents_owner_user_id ON seo_documents(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_seo_documents_status ON seo_documents(status);
CREATE INDEX IF NOT EXISTS idx_seo_documents_name ON seo_documents USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_seo_documents_created_at ON seo_documents(created_at DESC);

DROP TRIGGER IF EXISTS on_seo_documents_updated ON seo_documents;
CREATE TRIGGER on_seo_documents_updated
  BEFORE UPDATE ON seo_documents
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- ============================================================
-- 1c. TABLE : seo_document_permissions
-- ============================================================

CREATE TABLE IF NOT EXISTS seo_document_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES seo_documents(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  permission_level text NOT NULL CHECK (permission_level IN ('reader', 'editor', 'owner')),
  granted_by uuid NULL REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),

  CONSTRAINT uq_document_permission_per_user UNIQUE (document_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_seo_doc_permissions_document_id ON seo_document_permissions(document_id);
CREATE INDEX IF NOT EXISTS idx_seo_doc_permissions_user_id ON seo_document_permissions(user_id);


-- ============================================================
-- 1d. TABLE : seo_document_activity_logs
-- ============================================================

CREATE TABLE IF NOT EXISTS seo_document_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES seo_documents(id) ON DELETE CASCADE,
  actor_user_id uuid NULL REFERENCES user_profiles(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  event_summary text NOT NULL,
  event_payload jsonb NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_seo_doc_logs_document_created
  ON seo_document_activity_logs(document_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_seo_doc_logs_event_type
  ON seo_document_activity_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_seo_doc_logs_actor
  ON seo_document_activity_logs(actor_user_id);


-- ============================================================
-- 2. RLS + POLITIQUES (toutes les tables existent à ce stade)
-- ============================================================

-- --- seo_document_folders ---
ALTER TABLE seo_document_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read all folders"
  ON seo_document_folders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create folders"
  ON seo_document_folders FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update folders"
  ON seo_document_folders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins and managers can delete folders"
  ON seo_document_folders FOR DELETE
  TO authenticated
  USING (public.is_admin_or_manager());

-- --- seo_documents ---
ALTER TABLE seo_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read all documents"
  ON seo_documents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own documents"
  ON seo_documents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_user_id AND auth.uid() = owner_user_id);

CREATE POLICY "Owners and editors can update documents"
  ON seo_documents FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = owner_user_id
    OR public.is_admin_or_manager()
    OR EXISTS (
      SELECT 1 FROM seo_document_permissions
      WHERE document_id = seo_documents.id
        AND user_id = auth.uid()
        AND permission_level IN ('editor', 'owner')
    )
  )
  WITH CHECK (
    auth.uid() = owner_user_id
    OR public.is_admin_or_manager()
    OR EXISTS (
      SELECT 1 FROM seo_document_permissions
      WHERE document_id = seo_documents.id
        AND user_id = auth.uid()
        AND permission_level IN ('editor', 'owner')
    )
  );

CREATE POLICY "Owners and admins can delete documents"
  ON seo_documents FOR DELETE
  TO authenticated
  USING (
    auth.uid() = owner_user_id
    OR public.is_admin_or_manager()
  );

-- --- seo_document_permissions ---
ALTER TABLE seo_document_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read document permissions"
  ON seo_document_permissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Document owners can grant permissions"
  ON seo_document_permissions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM seo_documents
      WHERE id = document_id AND owner_user_id = auth.uid()
    )
    OR public.is_admin_or_manager()
  );

CREATE POLICY "Document owners can update permissions"
  ON seo_document_permissions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM seo_documents
      WHERE id = document_id AND owner_user_id = auth.uid()
    )
    OR public.is_admin_or_manager()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM seo_documents
      WHERE id = document_id AND owner_user_id = auth.uid()
    )
    OR public.is_admin_or_manager()
  );

CREATE POLICY "Document owners can revoke permissions"
  ON seo_document_permissions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM seo_documents
      WHERE id = document_id AND owner_user_id = auth.uid()
    )
    OR public.is_admin_or_manager()
  );

-- --- seo_document_activity_logs ---
ALTER TABLE seo_document_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read activity logs"
  ON seo_document_activity_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert activity logs"
  ON seo_document_activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = actor_user_id);

-- UPDATE : interdit (pas de policy = aucune mise à jour possible)

CREATE POLICY "Only admins can delete activity logs"
  ON seo_document_activity_logs FOR DELETE
  TO authenticated
  USING (public.is_admin_or_manager());


-- ============================================================
-- 3a. FONCTION HELPER : log_document_activity
-- ============================================================

CREATE OR REPLACE FUNCTION public.log_document_activity(
  p_document_id uuid,
  p_actor_user_id uuid,
  p_event_type text,
  p_event_summary text,
  p_event_payload jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_log_id uuid;
BEGIN
  INSERT INTO public.seo_document_activity_logs (
    document_id, actor_user_id, event_type, event_summary, event_payload
  ) VALUES (
    p_document_id, p_actor_user_id, p_event_type, p_event_summary, p_event_payload
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;


-- ============================================================
-- 3b. FONCTION HELPER : recalcul du chemin de dossier
-- ============================================================

CREATE OR REPLACE FUNCTION public.recalculate_folder_path()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_parent_path text;
  v_parent_depth integer;
BEGIN
  IF NEW.parent_id IS NULL THEN
    NEW.path := NEW.name;
    NEW.depth := 0;
  ELSE
    IF NEW.parent_id = NEW.id THEN
      RAISE EXCEPTION 'Un dossier ne peut pas être son propre parent';
    END IF;

    SELECT path, depth INTO v_parent_path, v_parent_depth
    FROM public.seo_document_folders
    WHERE id = NEW.parent_id;

    IF v_parent_path IS NULL THEN
      RAISE EXCEPTION 'Dossier parent introuvable';
    END IF;

    NEW.path := v_parent_path || '/' || NEW.name;
    NEW.depth := v_parent_depth + 1;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_seo_document_folder_path ON seo_document_folders;
CREATE TRIGGER on_seo_document_folder_path
  BEFORE INSERT OR UPDATE ON seo_document_folders
  FOR EACH ROW EXECUTE FUNCTION public.recalculate_folder_path();





-- ===================================================================
-- MIGRATION: 20260308120000_redaction_edition_collaboration.sql
-- ===================================================================
/*
  # Menu Rédaction — Plan 02 : Édition, collaboration et actions métier

  Ajouts sur seo_documents :
    - last_edited_by   : dernier utilisateur ayant modifié
    - edit_lock_user_id : verrou léger informatif
    - edit_lock_at      : horodatage du verrou
    - trashed_at        : corbeille logique
    - trashed_by        : utilisateur ayant mis en corbeille

  Ajout sur seo_document_permissions :
    - updated_at : horodatage de dernière modification de permission
*/

-- ============================================================
-- 1. Nouvelles colonnes sur seo_documents
-- ============================================================

ALTER TABLE seo_documents
  ADD COLUMN IF NOT EXISTS last_edited_by uuid NULL REFERENCES user_profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS edit_lock_user_id uuid NULL REFERENCES user_profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS edit_lock_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS trashed_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS trashed_by uuid NULL REFERENCES user_profiles(id) ON DELETE SET NULL;

-- Index pour filtrer rapidement les documents non mis en corbeille
CREATE INDEX IF NOT EXISTS idx_seo_documents_trashed_at ON seo_documents(trashed_at);
CREATE INDEX IF NOT EXISTS idx_seo_documents_last_edited_by ON seo_documents(last_edited_by);


-- ============================================================
-- 2. Nouvelle colonne sur seo_document_permissions
-- ============================================================

ALTER TABLE seo_document_permissions
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Trigger updated_at sur permissions
DROP TRIGGER IF EXISTS on_seo_document_permissions_updated ON seo_document_permissions;
CREATE TRIGGER on_seo_document_permissions_updated
  BEFORE UPDATE ON seo_document_permissions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- ===================================================================
-- MIGRATION: 20260308140000_redaction_ia_publication.sql
-- ===================================================================
/*
  # Menu Rédaction — Plan 03 : IA, publication et intégration

  Nouvelles tables :
    1. seo_ai_provider_configs   — configuration fournisseur IA (global ou utilisateur)
    2. seo_ai_system_prompts     — prompt système global
    3. seo_document_ai_conversations — une conversation IA par document
    4. seo_document_ai_messages     — historique des messages
    5. seo_document_publication_runs — traçabilité des publications

  Ce fichier est idempotent (IF NOT EXISTS / IF EXISTS partout).
*/

-- ============================================================
-- 1a. Table seo_ai_provider_configs
-- ============================================================

CREATE TABLE IF NOT EXISTS seo_ai_provider_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope text NOT NULL CHECK (scope IN ('global', 'user')),
  user_id uuid NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  provider_key text NOT NULL,          -- openai, anthropic, mistral, etc.
  provider_label text NOT NULL,        -- Label d'affichage
  api_base_url text NULL,              -- URL de base optionnelle (custom endpoints)
  encrypted_api_key text NOT NULL,     -- Clé chiffrée stockée côté serveur
  default_model text NULL,             -- Modèle par défaut (gpt-4o, claude-sonnet-4-20250514, etc.)
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Un utilisateur ne peut avoir qu'une config par fournisseur
CREATE UNIQUE INDEX IF NOT EXISTS uq_ai_provider_user_key
  ON seo_ai_provider_configs(user_id, provider_key)
  WHERE scope = 'user';

-- Un seul global par fournisseur
CREATE UNIQUE INDEX IF NOT EXISTS uq_ai_provider_global_key
  ON seo_ai_provider_configs(provider_key)
  WHERE scope = 'global';

ALTER TABLE seo_ai_provider_configs ENABLE ROW LEVEL SECURITY;

-- RLS : les configs globales sont visibles par admin/seo_manager, les perso par leur propriétaire
DROP POLICY IF EXISTS "AI configs: admins see global" ON seo_ai_provider_configs;
CREATE POLICY "AI configs: admins see global" ON seo_ai_provider_configs
  FOR SELECT USING (
    scope = 'global' AND public.is_admin_or_manager()
  );

DROP POLICY IF EXISTS "AI configs: users see own" ON seo_ai_provider_configs;
CREATE POLICY "AI configs: users see own" ON seo_ai_provider_configs
  FOR SELECT USING (
    scope = 'user' AND user_id = auth.uid()
  );

DROP POLICY IF EXISTS "AI configs: admins manage global" ON seo_ai_provider_configs;
CREATE POLICY "AI configs: admins manage global" ON seo_ai_provider_configs
  FOR ALL USING (
    scope = 'global' AND public.is_admin_or_manager()
  );

DROP POLICY IF EXISTS "AI configs: users manage own" ON seo_ai_provider_configs;
CREATE POLICY "AI configs: users manage own" ON seo_ai_provider_configs
  FOR ALL USING (
    scope = 'user' AND user_id = auth.uid()
  );

-- Trigger updated_at
DROP TRIGGER IF EXISTS on_seo_ai_provider_configs_updated ON seo_ai_provider_configs;
CREATE TRIGGER on_seo_ai_provider_configs_updated
  BEFORE UPDATE ON seo_ai_provider_configs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- ============================================================
-- 1b. Table seo_ai_system_prompts
-- ============================================================

CREATE TABLE IF NOT EXISTS seo_ai_system_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  prompt_text text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  created_by uuid NULL REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE seo_ai_system_prompts ENABLE ROW LEVEL SECURITY;

-- Tout utilisateur authentifié peut lire les prompts
DROP POLICY IF EXISTS "System prompts: auth read" ON seo_ai_system_prompts;
CREATE POLICY "System prompts: auth read" ON seo_ai_system_prompts
  FOR SELECT USING (auth.role() = 'authenticated');

-- Seuls admin/seo_manager peuvent modifier
DROP POLICY IF EXISTS "System prompts: admins manage" ON seo_ai_system_prompts;
CREATE POLICY "System prompts: admins manage" ON seo_ai_system_prompts
  FOR ALL USING (public.is_admin_or_manager());

DROP TRIGGER IF EXISTS on_seo_ai_system_prompts_updated ON seo_ai_system_prompts;
CREATE TRIGGER on_seo_ai_system_prompts_updated
  BEFORE UPDATE ON seo_ai_system_prompts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insérer un prompt système par défaut
INSERT INTO seo_ai_system_prompts (name, prompt_text, is_default)
SELECT 'Prompt SEO par défaut',
  'Tu es un expert SEO. Tu reçois un texte rédactionnel et un modèle de page CMS.' ||
  ' Ta mission est de transformer le texte en un JSON compatible avec le système d''import du CMS.' ||
  ' Utilise le format content_overrides pour ne modifier que le contenu éditorial.' ||
  ' Ne modifie jamais les blocs design, les URLs d''images, les icônes ou la structure technique.' ||
  ' Respecte strictement le contrat JSON du repo.',
  true
WHERE NOT EXISTS (SELECT 1 FROM seo_ai_system_prompts WHERE is_default = true);


-- ============================================================
-- 1c. Table seo_document_ai_conversations
-- ============================================================

CREATE TABLE IF NOT EXISTS seo_document_ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid UNIQUE NOT NULL REFERENCES seo_documents(id) ON DELETE CASCADE,
  provider_config_id uuid NULL REFERENCES seo_ai_provider_configs(id) ON DELETE SET NULL,
  model_name text NULL,
  system_prompt_id uuid NULL REFERENCES seo_ai_system_prompts(id) ON DELETE SET NULL,
  system_prompt_snapshot text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE seo_document_ai_conversations ENABLE ROW LEVEL SECURITY;

-- Tout utilisateur authentifié peut lire et créer
DROP POLICY IF EXISTS "AI conversations: auth read" ON seo_document_ai_conversations;
CREATE POLICY "AI conversations: auth read" ON seo_document_ai_conversations
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "AI conversations: auth insert" ON seo_document_ai_conversations;
CREATE POLICY "AI conversations: auth insert" ON seo_document_ai_conversations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "AI conversations: auth update" ON seo_document_ai_conversations;
CREATE POLICY "AI conversations: auth update" ON seo_document_ai_conversations
  FOR UPDATE USING (auth.role() = 'authenticated');

DROP TRIGGER IF EXISTS on_seo_document_ai_conversations_updated ON seo_document_ai_conversations;
CREATE TRIGGER on_seo_document_ai_conversations_updated
  BEFORE UPDATE ON seo_document_ai_conversations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- ============================================================
-- 1d. Table seo_document_ai_messages
-- ============================================================

CREATE TABLE IF NOT EXISTS seo_document_ai_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES seo_document_ai_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('system', 'user', 'assistant')),
  content text NOT NULL,
  created_by uuid NULL REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation
  ON seo_document_ai_messages(conversation_id, created_at ASC);

ALTER TABLE seo_document_ai_messages ENABLE ROW LEVEL SECURITY;

-- Lecture ouverte
DROP POLICY IF EXISTS "AI messages: auth read" ON seo_document_ai_messages;
CREATE POLICY "AI messages: auth read" ON seo_document_ai_messages
  FOR SELECT USING (auth.role() = 'authenticated');

-- Insertion via frontend
DROP POLICY IF EXISTS "AI messages: auth insert" ON seo_document_ai_messages;
CREATE POLICY "AI messages: auth insert" ON seo_document_ai_messages
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Pas de modification ni suppression
-- (les messages sont immuables)


-- ============================================================
-- 1e. Table seo_document_publication_runs
-- ============================================================

CREATE TABLE IF NOT EXISTS seo_document_publication_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES seo_documents(id) ON DELETE CASCADE,
  actor_user_id uuid NULL REFERENCES user_profiles(id) ON DELETE SET NULL,
  target_mode text NOT NULL CHECK (target_mode IN ('create_page', 'update_page')),
  target_page_id uuid NULL,
  template_id uuid NULL REFERENCES page_templates(id) ON DELETE SET NULL,
  generated_json_snapshot jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed')),
  error_message text NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_publication_runs_document
  ON seo_document_publication_runs(document_id, created_at DESC);

ALTER TABLE seo_document_publication_runs ENABLE ROW LEVEL SECURITY;

-- Lecture ouverte
DROP POLICY IF EXISTS "Publication runs: auth read" ON seo_document_publication_runs;
CREATE POLICY "Publication runs: auth read" ON seo_document_publication_runs
  FOR SELECT USING (auth.role() = 'authenticated');

-- Insertion authentifiée
DROP POLICY IF EXISTS "Publication runs: auth insert" ON seo_document_publication_runs;
CREATE POLICY "Publication runs: auth insert" ON seo_document_publication_runs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Update uniquement par le système (pour mettre à jour status/error)
DROP POLICY IF EXISTS "Publication runs: auth update" ON seo_document_publication_runs;
CREATE POLICY "Publication runs: auth update" ON seo_document_publication_runs
  FOR UPDATE USING (auth.role() = 'authenticated');


COMMIT;

