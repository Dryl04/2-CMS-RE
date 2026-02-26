/*
  # Create page_redirects table for centralized link management

  Stores automatic 301 redirects created when a page slug changes,
  as well as manually-managed redirections.
*/

CREATE TABLE IF NOT EXISTS page_redirects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  old_path text NOT NULL,
  new_path text NOT NULL,
  redirect_type integer NOT NULL DEFAULT 301,
  is_manual boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT page_redirects_old_path_unique UNIQUE (old_path)
);

-- Enable RLS
ALTER TABLE page_redirects ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read redirects (needed for public URL resolution)
CREATE POLICY "Authenticated users can read redirects"
  ON page_redirects FOR SELECT
  TO authenticated
  USING (true);

-- Only admins and SEO managers can manage redirects
CREATE POLICY "Admins and SEO managers can manage redirects"
  ON page_redirects FOR ALL
  TO authenticated
  USING (public.is_admin_or_manager())
  WITH CHECK (public.is_admin_or_manager());
