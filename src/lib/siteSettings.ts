import { supabase, SiteSettings } from '@/lib/supabase';

export const DEFAULT_SITE_SETTINGS: Omit<SiteSettings, 'id' | 'created_at' | 'updated_at'> = {
  site_name: 'SEO Manager',
  base_url: typeof window !== 'undefined' ? window.location.origin : 'https://example.com',
  default_locale: 'fr',
  default_title_suffix: null,
  default_meta_description: null,
  default_og_image: '/image.png',
  default_twitter_card: 'summary_large_image',
  default_meta_robots: 'index,follow',
  favicon_url: '/favicon.svg',
  apple_touch_icon_url: null,
  site_webmanifest_url: '/site.webmanifest',
  organization_name: null,
  organization_logo_url: null,
  organization_same_as: [],
  google_site_verification: null,
  bing_site_verification: null,
  default_schema_type: 'WebPage',
  robots_txt_overrides: null,
  enable_cookie_banner: true,
  cookie_banner_message: 'Nous utilisons des cookies pour mesurer l\'audience et optimiser les conversions.',
  created_by: null,
};

export function normalizeSiteSettings(data?: Partial<SiteSettings> | null): SiteSettings {
  const fallbackId = 'local-default';
  const now = new Date(0).toISOString();
  return {
    id: data?.id || fallbackId,
    created_at: data?.created_at || now,
    updated_at: data?.updated_at || now,
    ...DEFAULT_SITE_SETTINGS,
    ...data,
    organization_same_as: Array.isArray(data?.organization_same_as)
      ? data?.organization_same_as.filter(Boolean)
      : DEFAULT_SITE_SETTINGS.organization_same_as,
  };
}

export async function loadSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('[siteSettings] Error loading settings:', error);
    return normalizeSiteSettings();
  }

  return normalizeSiteSettings(data as Partial<SiteSettings> | null);
}

export async function saveSiteSettings(
  values: Partial<SiteSettings>,
  existingId?: string,
  userId?: string | null
): Promise<SiteSettings> {
  const {
    id: _id,
    created_at: _createdAt,
    updated_at: _updatedAt,
    ...updatableValues
  } = values;

  const payload = {
    ...updatableValues,
    created_by: userId ?? updatableValues.created_by ?? null,
    updated_at: new Date().toISOString(),
  };

  if (existingId && existingId !== 'local-default') {
    const { data, error } = await supabase
      .from('site_settings')
      .update(payload)
      .eq('id', existingId)
      .select('*')
      .single();

    if (error) throw error;
    return normalizeSiteSettings(data as SiteSettings);
  }

  const { data, error } = await supabase
    .from('site_settings')
    .insert(payload)
    .select('*')
    .single();

  if (error) throw error;
  return normalizeSiteSettings(data as SiteSettings);
}

export function splitSocialLinks(value: string): string[] {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function formatSocialLinks(value?: string[] | null): string {
  return Array.isArray(value) ? value.join('\n') : '';
}