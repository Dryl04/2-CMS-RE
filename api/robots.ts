import { createClient } from '@supabase/supabase-js';

type SiteSettingsRecord = {
  base_url?: string | null;
  robots_txt_overrides?: string | null;
};

export default async function handler(_req: any, res: any) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    res.status(500).send('Missing Supabase environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data } = await supabase
    .from('site_settings')
    .select('base_url, robots_txt_overrides')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const settings = (data || {}) as SiteSettingsRecord;
  const baseUrl = (settings.base_url || process.env.VERCEL_PROJECT_PRODUCTION_URL || '').replace(/\/$/, '');
  const resolvedBaseUrl = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl || 'example.com'}`;

  const content = [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${resolvedBaseUrl}/sitemap.xml`,
    settings.robots_txt_overrides?.trim() ? '' : null,
    settings.robots_txt_overrides?.trim() || null,
  ].filter(Boolean).join('\n');

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=3600');
  res.status(200).send(content);
}