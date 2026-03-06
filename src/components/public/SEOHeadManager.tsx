import { useEffect } from 'react';
import { SEOMetadata, SiteSettings } from '@/lib/supabase';
import { buildSchemaGraph, resolveHeadData } from '@/lib/seoRuntime';

interface SEOHeadManagerProps {
  page: SEOMetadata;
  siteSettings?: SiteSettings | null;
}

function upsertMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([key, value]) => element?.setAttribute(key, value));
  element.dataset.seoManaged = 'true';
}

function upsertLink(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector(selector) as HTMLLinkElement | null;
  if (!element) {
    element = document.createElement('link');
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([key, value]) => element?.setAttribute(key, value));
  element.dataset.seoManaged = 'true';
}

export default function SEOHeadManager({ page, siteSettings }: SEOHeadManagerProps) {
  useEffect(() => {
    const head = resolveHeadData(page, siteSettings);
    document.documentElement.lang = head.locale || 'fr';
    document.title = head.title;

    upsertMeta('meta[name="description"]', { name: 'description', content: head.description });
    upsertMeta('meta[name="robots"]', { name: 'robots', content: head.robots });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: head.ogTitle });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: head.ogDescription });
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: head.ogImage });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: head.canonicalUrl });
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: head.ogType });
    upsertMeta('meta[property="og:locale"]', { property: 'og:locale', content: head.locale });
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: head.twitterCard });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: head.twitterTitle });
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: head.twitterDescription });
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: head.twitterImage });
    upsertMeta('meta[name="twitter:image:alt"]', { name: 'twitter:image:alt', content: head.socialImageAlt });

    if (siteSettings?.google_site_verification) {
      upsertMeta('meta[name="google-site-verification"]', {
        name: 'google-site-verification',
        content: siteSettings.google_site_verification,
      });
    }

    if (siteSettings?.bing_site_verification) {
      upsertMeta('meta[name="msvalidate.01"]', {
        name: 'msvalidate.01',
        content: siteSettings.bing_site_verification,
      });
    }

    upsertLink('link[rel="canonical"]', { rel: 'canonical', href: head.canonicalUrl });

    if (siteSettings?.favicon_url) {
      upsertLink('link[rel="icon"]', { rel: 'icon', href: siteSettings.favicon_url });
    }
    if (siteSettings?.apple_touch_icon_url) {
      upsertLink('link[rel="apple-touch-icon"]', {
        rel: 'apple-touch-icon',
        href: siteSettings.apple_touch_icon_url,
      });
    }
    if (siteSettings?.site_webmanifest_url) {
      upsertLink('link[rel="manifest"]', { rel: 'manifest', href: siteSettings.site_webmanifest_url });
    }

    const schema = buildSchemaGraph(page, siteSettings);
    let schemaElement = document.head.querySelector('#seo-managed-jsonld') as HTMLScriptElement | null;
    if (!schemaElement) {
      schemaElement = document.createElement('script');
      schemaElement.id = 'seo-managed-jsonld';
      schemaElement.type = 'application/ld+json';
      schemaElement.dataset.seoManaged = 'true';
      document.head.appendChild(schemaElement);
    }
    schemaElement.text = JSON.stringify(schema.length === 1 ? schema[0] : schema);
  }, [page, siteSettings]);

  return null;
}