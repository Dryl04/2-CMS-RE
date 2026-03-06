import { createClient } from '@supabase/supabase-js';

type PageRecord = {
  page_key: string;
  updated_at: string;
  canonical_url?: string | null;
  noindex?: boolean;
  exclude_from_sitemap?: boolean;
};

type SiteSettingsRecord = {
  base_url?: string | null;
};

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export default async function handler(_req: any, res: any) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    res.status(500).send('Missing Supabase environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const [{ data: settingsData }, { data: pagesData, error: pagesError }] = await Promise.all([
    supabase
      .from('site_settings')
      .select('base_url')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('seo_metadata')
      .select('page_key, updated_at, canonical_url, noindex, exclude_from_sitemap')
      .eq('status', 'published')
      .order('updated_at', { ascending: false }),
  ]);

  if (pagesError) {
    res.status(500).send(pagesError.message);
    return;
  }

  const settings = (settingsData || {}) as SiteSettingsRecord;
  const baseUrl = (settings.base_url || process.env.VERCEL_PROJECT_PRODUCTION_URL || '').replace(/\/$/, '');
  const resolvedBaseUrl = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl || 'example.com'}`;
  const pages = ((pagesData || []) as PageRecord[]).filter((page) => !page.noindex && !page.exclude_from_sitemap);

  const urls = [
    `  <url><loc>${xmlEscape(`${resolvedBaseUrl}/`)}</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>`,
    ...pages.map((page) => {
      const loc = page.canonical_url?.trim() || `${resolvedBaseUrl}/${page.page_key.replace(/^\/+/, '')}`;
      const lastmod = new Date(page.updated_at).toISOString().split('T')[0];
      return `  <url><loc>${xmlEscape(loc)}</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`;
    }),
  ];

  const xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', ...urls, '</urlset>'].join('\n');

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=3600');
  res.status(200).send(xml);
}