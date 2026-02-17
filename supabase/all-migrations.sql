-- Auto-generated migration bundle
-- Generated at: 2026-02-17T08:36:24Z
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


COMMIT;

