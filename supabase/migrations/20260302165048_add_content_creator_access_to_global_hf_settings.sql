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
