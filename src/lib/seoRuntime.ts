import { SEOMetadata, SiteSettings } from '@/lib/supabase';
import { normalizeSiteSettings } from '@/lib/siteSettings';

export interface ResolvedHeadData {
  title: string;
  description: string;
  canonicalUrl: string;
  robots: string;
  locale: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  socialImageAlt: string;
  schemaType: string;
}

export interface SEOValidationIssue {
  level: 'error' | 'warning' | 'info';
  message: string;
}

function sanitizeBaseUrl(url?: string | null): string {
  const value = (url || '').trim();
  if (!value) return 'https://example.com';
  return value.replace(/\/$/, '');
}

export function buildPageUrl(pageKey: string, settings?: Partial<SiteSettings> | null): string {
  const siteSettings = normalizeSiteSettings(settings || undefined);
  const baseUrl = sanitizeBaseUrl(siteSettings.base_url);
  return pageKey ? `${baseUrl}/${pageKey.replace(/^\/+/, '')}` : `${baseUrl}/`;
}

export function buildRobotsValue(page: Partial<SEOMetadata>, settings?: Partial<SiteSettings> | null): string {
  const siteSettings = normalizeSiteSettings(settings || undefined);
  if (page.meta_robots?.trim()) return page.meta_robots.trim();
  const directives = new Set(
    (siteSettings.default_meta_robots || 'index,follow')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  );

  if (page.noindex) {
    directives.delete('index');
    directives.add('noindex');
  }
  if (page.nofollow) {
    directives.delete('follow');
    directives.add('nofollow');
  }

  return Array.from(directives).join(',');
}

export function resolveHeadData(page: SEOMetadata, settings?: Partial<SiteSettings> | null): ResolvedHeadData {
  const siteSettings = normalizeSiteSettings(settings || undefined);
  const baseTitle = page.title?.trim() || siteSettings.site_name;
  const titleSuffix = siteSettings.default_title_suffix?.trim();
  const title = titleSuffix && !baseTitle.includes(titleSuffix)
    ? `${baseTitle} ${titleSuffix}`
    : baseTitle;
  const description = page.description?.trim() || siteSettings.default_meta_description?.trim() || '';
  const canonicalUrl = page.canonical_url?.trim() || buildPageUrl(page.page_key, siteSettings);
  const ogTitle = page.og_title?.trim() || title;
  const ogDescription = page.og_description?.trim() || description;
  const ogImage = page.og_image?.trim() || siteSettings.default_og_image?.trim() || '';
  const twitterTitle = page.twitter_title?.trim() || ogTitle;
  const twitterDescription = page.twitter_description?.trim() || ogDescription;
  const twitterImage = page.twitter_image?.trim() || ogImage;

  return {
    title,
    description,
    canonicalUrl,
    robots: buildRobotsValue(page, siteSettings),
    locale: page.language?.trim() || siteSettings.default_locale || 'fr',
    ogTitle,
    ogDescription,
    ogImage,
    ogType: page.og_type?.trim() || 'website',
    twitterCard: siteSettings.default_twitter_card || 'summary_large_image',
    twitterTitle,
    twitterDescription,
    twitterImage,
    socialImageAlt: page.social_image_alt?.trim() || page.title,
    schemaType: page.schema_type?.trim() || siteSettings.default_schema_type || 'WebPage',
  };
}

export function buildSchemaGraph(page: SEOMetadata, settings?: Partial<SiteSettings> | null): Array<Record<string, any>> {
  const siteSettings = normalizeSiteSettings(settings || undefined);
  const head = resolveHeadData(page, siteSettings);
  const graph: Array<Record<string, any>> = [];

  if (siteSettings.organization_name) {
    graph.push({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: siteSettings.organization_name,
      url: sanitizeBaseUrl(siteSettings.base_url),
      logo: siteSettings.organization_logo_url || undefined,
      sameAs: siteSettings.organization_same_as || undefined,
    });
  }

  if (page.schema_jsonld?.trim()) {
    try {
      const parsed = JSON.parse(page.schema_jsonld);
      if (Array.isArray(parsed)) return [...graph, ...parsed];
      return [...graph, parsed];
    } catch {
      // Ignore invalid JSON-LD here; form validation handles surfacing it.
    }
  }

  graph.push({
    '@context': 'https://schema.org',
    '@type': head.schemaType,
    name: page.title,
    headline: page.seo_h1 || page.title,
    description: head.description || undefined,
    url: head.canonicalUrl,
    inLanguage: head.locale,
    image: head.ogImage || undefined,
    dateModified: page.updated_at,
    datePublished: page.published_at || page.created_at,
  });

  return graph;
}

export function validatePageSEO(page: Partial<SEOMetadata>, settings?: Partial<SiteSettings> | null): SEOValidationIssue[] {
  const issues: SEOValidationIssue[] = [];
  const siteSettings = normalizeSiteSettings(settings || undefined);
  const title = page.title?.trim() || '';
  const description = page.description?.trim() || '';
  const canonical = page.canonical_url?.trim() || (page.page_key ? buildPageUrl(page.page_key, siteSettings) : '');
  const socialImage = page.og_image?.trim() || siteSettings.default_og_image?.trim() || '';

  if (!title) {
    issues.push({ level: 'error', message: 'Le titre SEO est obligatoire.' });
  } else if (title.length > 60) {
    issues.push({ level: 'warning', message: 'Le titre depasse 60 caracteres.' });
  }

  if (!description) {
    issues.push({ level: 'warning', message: 'La meta description est vide.' });
  } else if (description.length > 160) {
    issues.push({ level: 'warning', message: 'La meta description depasse 160 caracteres.' });
  }

  if (!canonical) {
    issues.push({ level: 'error', message: 'Aucune URL canonique resolue pour cette page.' });
  }

  if (!socialImage) {
    issues.push({ level: 'warning', message: 'Aucune image de partage sociale n\'est definie.' });
  }

  if (page.status === 'published' && page.noindex) {
    issues.push({ level: 'warning', message: 'La page est publiee mais marquee noindex.' });
  }

  if (page.schema_jsonld?.trim()) {
    try {
      JSON.parse(page.schema_jsonld);
    } catch {
      issues.push({ level: 'error', message: 'Le JSON-LD n\'est pas valide.' });
    }
  }

  if (!siteSettings.base_url) {
    issues.push({ level: 'warning', message: 'Le domaine de base du site n\'est pas configure.' });
  }

  return issues;
}