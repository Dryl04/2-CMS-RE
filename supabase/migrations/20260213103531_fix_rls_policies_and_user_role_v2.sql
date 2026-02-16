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
