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
