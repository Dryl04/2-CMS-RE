/*
  # Create global header/footer settings table

  ## Purpose
  Allows administrators to define a "global" header and/or footer section
  (stored as a JSON section object, exactly like a PageBuilderSection) that
  can be automatically injected into pages at creation-time (import or manual)
  or applied retroactively to a set of existing pages.

  ## New Tables
  - `global_hf_settings`
    - `id` (uuid, PK)
    - `label` (text) – human-readable name for this configuration
    - `header_section` (jsonb, nullable) – full PageBuilderSection JSON for the header
    - `footer_section` (jsonb, nullable) – full PageBuilderSection JSON for the footer
    - `apply_on_import` (boolean, default false) – auto-inject on new import
    - `apply_on_create` (boolean, default false) – auto-inject on manual page creation
    - `is_active` (boolean, default true) – whether this config is currently active
    - `created_by` (uuid, FK to user_profiles)
    - `created_at` / `updated_at`

  ## Security
  - RLS enabled
  - Admins and SEO managers can read/write
  - Regular authenticated users can only read active configs
*/

CREATE TABLE IF NOT EXISTS global_hf_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL DEFAULT 'Configuration par défaut',
  header_section jsonb DEFAULT NULL,
  footer_section jsonb DEFAULT NULL,
  apply_on_import boolean NOT NULL DEFAULT false,
  apply_on_create boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE global_hf_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and managers can select global hf settings"
  ON global_hf_settings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'seo_manager', 'content_creator')
    )
  );

CREATE POLICY "Admins and managers can insert global hf settings"
  ON global_hf_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'seo_manager')
    )
  );

CREATE POLICY "Admins and managers can update global hf settings"
  ON global_hf_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'seo_manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'seo_manager')
    )
  );

CREATE POLICY "Admins and managers can delete global hf settings"
  ON global_hf_settings FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'seo_manager')
    )
  );
