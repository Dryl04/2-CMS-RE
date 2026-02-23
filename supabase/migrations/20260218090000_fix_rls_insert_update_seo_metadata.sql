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
