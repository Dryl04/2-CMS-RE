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