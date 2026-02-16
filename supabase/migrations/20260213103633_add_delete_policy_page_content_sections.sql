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
