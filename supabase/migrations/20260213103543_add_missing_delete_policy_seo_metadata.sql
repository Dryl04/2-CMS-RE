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
