/*
  # Add site settings, tracking integrations, and enrich seo metadata

  1. New tables
    - `site_settings`
    - `tracking_integrations`

  2. SEO metadata enrichments
    - social fields, robots fields, schema fields, keyword fields

  3. Security
    - public read for site settings
    - public read for active tracking integrations
    - authenticated write for admins and seo managers
*/

CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name text NOT NULL DEFAULT 'SEO Manager',
  base_url text NOT NULL DEFAULT 'https://example.com',
  default_locale text NOT NULL DEFAULT 'fr',
  default_title_suffix text,
  default_meta_description text,
  default_og_image text,
  default_twitter_card text NOT NULL DEFAULT 'summary_large_image',
  default_meta_robots text NOT NULL DEFAULT 'index,follow',
  favicon_url text,
  apple_touch_icon_url text,
  site_webmanifest_url text DEFAULT '/site.webmanifest',
  organization_name text,
  organization_logo_url text,
  organization_same_as text[] DEFAULT '{}',
  google_site_verification text,
  bing_site_verification text,
  default_schema_type text DEFAULT 'WebPage',
  robots_txt_overrides text,
  enable_cookie_banner boolean NOT NULL DEFAULT true,
  cookie_banner_message text,
  created_by uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read site settings" ON site_settings;
CREATE POLICY "Public can read site settings"
  ON site_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins and managers can insert site settings" ON site_settings;
CREATE POLICY "Admins and managers can insert site settings"
  ON site_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'seo_manager')
    )
  );

DROP POLICY IF EXISTS "Admins and managers can update site settings" ON site_settings;
CREATE POLICY "Admins and managers can update site settings"
  ON site_settings FOR UPDATE
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

CREATE TABLE IF NOT EXISTS tracking_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope text NOT NULL CHECK (scope IN ('site', 'page')),
  page_id uuid REFERENCES seo_metadata(id) ON DELETE CASCADE,
  provider text NOT NULL,
  label text NOT NULL,
  placement text NOT NULL DEFAULT 'head' CHECK (placement IN ('head', 'body_start', 'body_end')),
  mode text NOT NULL DEFAULT 'preset' CHECK (mode IN ('preset', 'custom')),
  config_json jsonb,
  custom_code text,
  requires_consent boolean NOT NULL DEFAULT true,
  consent_category text NOT NULL DEFAULT 'analytics' CHECK (consent_category IN ('necessary', 'analytics', 'ads', 'social')),
  is_active boolean NOT NULL DEFAULT true,
  load_strategy text NOT NULL DEFAULT 'after_consent' CHECK (load_strategy IN ('immediate', 'after_consent', 'lazy', 'route_change')),
  disable_inherited boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tracking_integrations_scope ON tracking_integrations(scope);
CREATE INDEX IF NOT EXISTS idx_tracking_integrations_page_id ON tracking_integrations(page_id);
CREATE INDEX IF NOT EXISTS idx_tracking_integrations_active ON tracking_integrations(is_active);

ALTER TABLE tracking_integrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active tracking integrations" ON tracking_integrations;
CREATE POLICY "Public can read active tracking integrations"
  ON tracking_integrations FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins managers and creators can manage tracking integrations" ON tracking_integrations;
CREATE POLICY "Admins managers and creators can manage tracking integrations"
  ON tracking_integrations FOR ALL
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

ALTER TABLE seo_metadata ADD COLUMN IF NOT EXISTS meta_robots text;
ALTER TABLE seo_metadata ADD COLUMN IF NOT EXISTS og_type text DEFAULT 'website';
ALTER TABLE seo_metadata ADD COLUMN IF NOT EXISTS twitter_title text;
ALTER TABLE seo_metadata ADD COLUMN IF NOT EXISTS twitter_description text;
ALTER TABLE seo_metadata ADD COLUMN IF NOT EXISTS twitter_image text;
ALTER TABLE seo_metadata ADD COLUMN IF NOT EXISTS social_image_alt text;
ALTER TABLE seo_metadata ADD COLUMN IF NOT EXISTS schema_type text DEFAULT 'WebPage';
ALTER TABLE seo_metadata ADD COLUMN IF NOT EXISTS schema_jsonld text;
ALTER TABLE seo_metadata ADD COLUMN IF NOT EXISTS noindex boolean NOT NULL DEFAULT false;
ALTER TABLE seo_metadata ADD COLUMN IF NOT EXISTS nofollow boolean NOT NULL DEFAULT false;
ALTER TABLE seo_metadata ADD COLUMN IF NOT EXISTS exclude_from_sitemap boolean NOT NULL DEFAULT false;
ALTER TABLE seo_metadata ADD COLUMN IF NOT EXISTS primary_keyword text;
ALTER TABLE seo_metadata ADD COLUMN IF NOT EXISTS secondary_keywords text[] DEFAULT '{}';
ALTER TABLE seo_metadata ADD COLUMN IF NOT EXISTS breadcrumb_title text;
ALTER TABLE seo_metadata ADD COLUMN IF NOT EXISTS published_at timestamptz;
ALTER TABLE seo_metadata ADD COLUMN IF NOT EXISTS last_reviewed_at timestamptz;