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