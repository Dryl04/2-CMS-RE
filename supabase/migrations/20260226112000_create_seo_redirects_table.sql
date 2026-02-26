/*
  # Create seo_redirects table

  Objectif:
  - Conserver l'historique des anciens slugs après renommage
  - Permettre une résolution centralisée des redirections 301
  - Prévenir les collisions via un index unique sur source_path
*/

CREATE TABLE IF NOT EXISTS public.seo_redirects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_path text NOT NULL,
  target_path text NOT NULL,
  source_page_id uuid REFERENCES public.seo_metadata(id) ON DELETE SET NULL,
  target_page_id uuid REFERENCES public.seo_metadata(id) ON DELETE SET NULL,
  reason text,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT seo_redirects_source_target_different CHECK (source_path <> target_path)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_seo_redirects_source_path_unique
  ON public.seo_redirects (source_path)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_seo_redirects_target_path
  ON public.seo_redirects (target_path);

CREATE INDEX IF NOT EXISTS idx_seo_redirects_source_page_id
  ON public.seo_redirects (source_page_id);

CREATE INDEX IF NOT EXISTS idx_seo_redirects_target_page_id
  ON public.seo_redirects (target_page_id);

DROP TRIGGER IF EXISTS on_seo_redirects_updated ON public.seo_redirects;
CREATE TRIGGER on_seo_redirects_updated
  BEFORE UPDATE ON public.seo_redirects
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.seo_redirects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active redirects" ON public.seo_redirects;
CREATE POLICY "Public can read active redirects"
  ON public.seo_redirects FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "SEO managers can create redirects" ON public.seo_redirects;
CREATE POLICY "SEO managers can create redirects"
  ON public.seo_redirects FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'seo_manager')
    )
  );

DROP POLICY IF EXISTS "SEO managers can update redirects" ON public.seo_redirects;
CREATE POLICY "SEO managers can update redirects"
  ON public.seo_redirects FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'seo_manager')
    )
  )
  WITH CHECK (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'seo_manager')
    )
  );

DROP POLICY IF EXISTS "SEO managers can delete redirects" ON public.seo_redirects;
CREATE POLICY "SEO managers can delete redirects"
  ON public.seo_redirects FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'seo_manager')
    )
  );
