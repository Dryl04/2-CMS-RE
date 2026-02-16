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
