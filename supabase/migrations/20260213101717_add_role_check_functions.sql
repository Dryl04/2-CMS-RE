/*
  # Add role check helper functions

  1. Changes
    - Add is_admin_or_manager() function to safely check role without recursion
    - Update policies on seo_metadata, page_templates, template_sections,
      section_types, page_content_sections, and media_files that reference
      user_profiles to use the new functions

  2. Purpose
    - Prevent infinite recursion when RLS policies on other tables
      query user_profiles which itself has RLS enabled
*/

CREATE OR REPLACE FUNCTION public.is_admin_or_manager()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'seo_manager')
  );
$$;

DROP POLICY IF EXISTS "Admins and SEO managers can manage all pages" ON seo_metadata;
CREATE POLICY "Admins and SEO managers can manage all pages"
  ON seo_metadata
  FOR ALL
  TO authenticated
  USING (public.is_admin_or_manager());

DROP POLICY IF EXISTS "Admins can manage section types" ON section_types;
CREATE POLICY "Admins can manage section types"
  ON section_types
  FOR ALL
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage all templates" ON page_templates;
CREATE POLICY "Admins can manage all templates"
  ON page_templates
  FOR ALL
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Users can read public and own templates" ON page_templates;
CREATE POLICY "Users can read public and own templates"
  ON page_templates
  FOR SELECT
  TO authenticated
  USING (
    is_public = true
    OR created_by = auth.uid()
    OR public.is_admin_or_manager()
  );

DROP POLICY IF EXISTS "Admins can manage all template sections" ON template_sections;
CREATE POLICY "Admins can manage all template sections"
  ON template_sections
  FOR ALL
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Users can read template sections" ON template_sections;
CREATE POLICY "Users can read template sections"
  ON template_sections
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM page_templates
      WHERE page_templates.id = template_sections.template_id
      AND (
        page_templates.is_public = true
        OR page_templates.created_by = auth.uid()
        OR public.is_admin_or_manager()
      )
    )
  );

DROP POLICY IF EXISTS "Admins and managers can manage all sections" ON page_content_sections;
CREATE POLICY "Admins and managers can manage all sections"
  ON page_content_sections
  FOR ALL
  TO authenticated
  USING (public.is_admin_or_manager());

DROP POLICY IF EXISTS "Admins can manage all media" ON media_files;
CREATE POLICY "Admins can manage all media"
  ON media_files
  FOR ALL
  TO authenticated
  USING (public.is_admin());
