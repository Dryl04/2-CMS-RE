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
