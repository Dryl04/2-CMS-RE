/**
 * Central link registry for normalization, validation,
 * redirect resolution, and slug-change propagation.
 */

import { supabase } from '@/lib/supabase';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns true if the link is an internal path (starts with `/`). */
export function isInternalLink(link: string): boolean {
  if (!link || link === '#') return false;
  return link.startsWith('/') && !link.startsWith('//');
}

/** Returns true for fully-qualified external URLs. */
export function isExternalLink(link: string): boolean {
  if (!link) return false;
  return /^https?:\/\//i.test(link) || link.startsWith('//');
}

/** Normalizes a raw page_key (no leading slash) into a canonical path (`/page_key`). */
export function normalizeInternalLink(pageKey: string): string {
  const key = pageKey.replace(/^\/+/, '');
  return `/${key}`;
}

/** Extracts the raw page_key from a canonical path (`/page_key` → `page_key`). */
export function extractPageKeyFromLink(link: string): string {
  return link.replace(/^\/+/, '');
}

// ---------------------------------------------------------------------------
// Deep-scan helpers
// ---------------------------------------------------------------------------

/** Link field names used throughout the CMS. */
const LINK_FIELD_NAMES = new Set([
  'link', 'href', 'url', 'ctaLink', 'primaryLink', 'secondaryLink',
  'targetUrl', 'actionUrl', 'buttonLink',
]);

/** Recursively collect all internal link values found in a widget content object. */
export function scanLinksInContent(obj: unknown, results: Set<string> = new Set()): Set<string> {
  if (!obj || typeof obj !== 'object') return results;
  if (Array.isArray(obj)) {
    (obj as unknown[]).forEach((item) => scanLinksInContent(item, results));
    return results;
  }
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (LINK_FIELD_NAMES.has(key) && typeof value === 'string' && isInternalLink(value)) {
      results.add(value);
    } else if (value && typeof value === 'object') {
      scanLinksInContent(value, results);
    }
  }
  return results;
}

/** Recursively rewrite all occurrences of `oldPath` to `newPath` in a content tree. */
export function rewriteLinksInContent(obj: unknown, oldPath: string, newPath: string): unknown {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return (obj as unknown[]).map((item) => rewriteLinksInContent(item, oldPath, newPath));
  }
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (LINK_FIELD_NAMES.has(key) && value === oldPath) {
      result[key] = newPath;
    } else if (value && typeof value === 'object') {
      result[key] = rewriteLinksInContent(value, oldPath, newPath);
    } else {
      result[key] = value;
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Slug-change propagation
// ---------------------------------------------------------------------------

/**
 * When a page's slug (page_key) changes from `oldPageKey` to `newPageKey`:
 *  1. Rewrites all occurrences of the old internal path in every page's sections_data.
 *  2. Upserts a 301 redirect record so historical URLs keep working.
 *
 * Returns the number of pages whose sections_data was updated.
 */
export async function propagateSlugChange(
  oldPageKey: string,
  newPageKey: string,
): Promise<{ updatedPages: number; error?: string }> {
  const oldPath = normalizeInternalLink(oldPageKey);
  const newPath = normalizeInternalLink(newPageKey);

  if (oldPath === newPath) return { updatedPages: 0 };

  try {
    // 1. Fetch all pages that have sections_data
    const { data: pages, error: fetchError } = await supabase
      .from('seo_metadata')
      .select('id, sections_data')
      .not('sections_data', 'is', null);

    if (fetchError) throw fetchError;

    let updatedCount = 0;
    const updates: Promise<unknown>[] = [];

    for (const page of pages ?? []) {
      const sections = page.sections_data;
      if (!Array.isArray(sections) || sections.length === 0) continue;

      const linksFound = scanLinksInContent(sections);
      if (!linksFound.has(oldPath)) continue;

      const updatedSections = rewriteLinksInContent(sections, oldPath, newPath);
      updates.push(
        supabase
          .from('seo_metadata')
          .update({ sections_data: updatedSections, updated_at: new Date().toISOString() })
          .eq('id', page.id),
      );
      updatedCount++;
    }

    await Promise.all(updates);

    // 2. Record the 301 redirect
    // old_path / new_path store the raw page_key (no leading slash) to match
    // how page_key is stored in seo_metadata and queried in resolveRedirect().
    await supabase
      .from('page_redirects')
      .upsert(
        {
          old_path: oldPageKey,
          new_path: newPageKey,
          redirect_type: 301,
          is_manual: false,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'old_path' },
      );

    return { updatedPages: updatedCount };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { updatedPages: 0, error: msg };
  }
}

// ---------------------------------------------------------------------------
// Redirect resolution
// ---------------------------------------------------------------------------

/**
 * Follows the redirect chain for `path` (raw page_key without leading slash).
 * Returns the final resolved page_key, or `null` if no redirect is found.
 * Limits chain traversal to 5 hops to avoid loops.
 */
export async function resolveRedirect(path: string): Promise<string | null> {
  let current = path.replace(/^\/+/, '');
  const visited = new Set<string>();

  for (let i = 0; i < 5; i++) {
    if (visited.has(current)) break;
    visited.add(current);

    const { data } = await supabase
      .from('page_redirects')
      .select('new_path')
      .eq('old_path', current)
      .maybeSingle();

    if (!data?.new_path) return null;
    current = data.new_path;
  }

  return current === path.replace(/^\/+/, '') ? null : current;
}

// ---------------------------------------------------------------------------
// Link scanning across all pages (for the Link Manager UI)
// ---------------------------------------------------------------------------

export interface PageLinkEntry {
  pageId: string;
  pageTitle: string;
  pageKey: string;
  linkValue: string;
  linkType: 'internal' | 'external' | 'anchor';
}

/** Scan all pages and return a flat list of link entries from sections_data. */
export async function getAllPageLinks(): Promise<PageLinkEntry[]> {
  const { data: pages, error } = await supabase
    .from('seo_metadata')
    .select('id, page_key, title, sections_data')
    .order('page_key', { ascending: true });

  if (error || !pages) return [];

  const results: PageLinkEntry[] = [];

  for (const page of pages) {
    if (!Array.isArray(page.sections_data)) continue;
    collectLinksFromContent(page.sections_data, page.id, page.title ?? page.page_key, page.page_key, results);
  }

  return results;
}

function collectLinksFromContent(
  obj: unknown,
  pageId: string,
  pageTitle: string,
  pageKey: string,
  results: PageLinkEntry[],
): void {
  if (!obj || typeof obj !== 'object') return;
  if (Array.isArray(obj)) {
    (obj as unknown[]).forEach((item) => collectLinksFromContent(item, pageId, pageTitle, pageKey, results));
    return;
  }
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (LINK_FIELD_NAMES.has(key) && typeof value === 'string' && value && value !== '#') {
      const linkType: PageLinkEntry['linkType'] = isInternalLink(value)
        ? 'internal'
        : isExternalLink(value)
        ? 'external'
        : 'anchor';
      // Avoid exact duplicates per page
      if (!results.some((r) => r.pageId === pageId && r.linkValue === value)) {
        results.push({ pageId, pageTitle, pageKey, linkValue: value, linkType });
      }
    } else if (value && typeof value === 'object') {
      collectLinksFromContent(value, pageId, pageTitle, pageKey, results);
    }
  }
}
