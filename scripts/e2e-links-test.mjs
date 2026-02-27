import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing env vars VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY/VITE_SUPABASE_ANON_KEY');
  process.exit(2);
}

const supabase = createClient(url, key);

const now = Date.now();
const oldSlug = `e2e-slug-old-${now}`;
const newSlug = `e2e-slug-new-${now}`;
const sourceSlug = `e2e-source-${now}`;

const sourceSections = [
  {
    id: `hero-${now}`,
    type: 'hero',
    content: {
      headline: 'E2E Source',
      ctaLink: `/${oldSlug}`,
      description: `<p>Voir <a href="/${oldSlug}">la page cible</a></p>`,
    },
    design: {
      theme: 'light',
      spacing: 'md',
      containerWidth: 'xl',
      borderRadius: 'none',
      background: { type: 'color', value: '#ffffff', opacity: 1 },
      typography: { headingSize: 'xl', bodySize: 'md', alignment: 'left' },
      customClasses: '',
    },
  },
];

const targetSections = [
  {
    id: `hero-target-${now}`,
    type: 'hero',
    content: { headline: 'E2E Target' },
    design: {
      theme: 'light',
      spacing: 'md',
      containerWidth: 'xl',
      borderRadius: 'none',
      background: { type: 'color', value: '#ffffff', opacity: 1 },
      typography: { headingSize: 'xl', bodySize: 'md', alignment: 'left' },
      customClasses: '',
    },
  },
];

const HTML_HREF_REGEX = /href="([^"]+)"/g;

function normalizeInternalPath(value) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      return parsed.pathname.replace(/^\/+|\/+$/g, '');
    } catch {
      return '';
    }
  }

  return trimmed.replace(/^\/+|\/+$/g, '');
}

function splitSuffix(value) {
  const queryIndex = value.indexOf('?');
  const hashIndex = value.indexOf('#');

  if (queryIndex === -1 && hashIndex === -1) {
    return { base: value, suffix: '' };
  }

  const cutAt =
    queryIndex === -1
      ? hashIndex
      : hashIndex === -1
        ? queryIndex
        : Math.min(queryIndex, hashIndex);

  return {
    base: value.slice(0, cutAt),
    suffix: value.slice(cutAt),
  };
}

function rewritePathValue(rawValue, oldPath, newPath) {
  const trimmed = String(rawValue || '').trim();
  if (!trimmed) return null;

  const normalizedOld = normalizeInternalPath(oldPath);
  const normalizedNew = normalizeInternalPath(newPath);
  if (!normalizedOld || !normalizedNew || normalizedOld === normalizedNew) return null;

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      const normalizedCurrent = normalizeInternalPath(parsed.pathname);
      if (normalizedCurrent !== normalizedOld) return null;
      parsed.pathname = `/${normalizedNew}`;
      return parsed.toString();
    } catch {
      return null;
    }
  }

  const { base, suffix } = splitSuffix(trimmed);
  const normalizedBase = normalizeInternalPath(base);
  if (normalizedBase !== normalizedOld) return null;

  const hasLeadingSlash = base.startsWith('/');
  const nextBase = hasLeadingSlash ? `/${normalizedNew}` : normalizedNew;
  return `${nextBase}${suffix}`;
}

function shouldInspectKey(key) {
  const lower = String(key || '').toLowerCase();
  return lower.includes('link') || lower.includes('href') || lower.includes('url') || lower === 'src';
}

function deepMapLinks(value, oldPath, newPath, currentKey) {
  if (typeof value === 'string') {
    let updatedCount = 0;
    let nextValue = value;

    if (nextValue.includes('<a ') && nextValue.includes('href="')) {
      nextValue = nextValue.replace(HTML_HREF_REGEX, (full, hrefValue) => {
        const rewritten = rewritePathValue(hrefValue, oldPath, newPath);
        if (!rewritten || rewritten === hrefValue) return full;
        updatedCount += 1;
        return `href="${rewritten}"`;
      });
    }

    if (currentKey && shouldInspectKey(currentKey)) {
      const rewritten = rewritePathValue(nextValue, oldPath, newPath);
      if (rewritten && rewritten !== nextValue) {
        updatedCount += 1;
        nextValue = rewritten;
      }
    }

    return { value: nextValue, updatedCount };
  }

  if (Array.isArray(value)) {
    let updatedCount = 0;
    const nextArray = value.map((item) => {
      const mapped = deepMapLinks(item, oldPath, newPath, currentKey);
      updatedCount += mapped.updatedCount;
      return mapped.value;
    });
    return { value: nextArray, updatedCount };
  }

  if (value && typeof value === 'object') {
    let updatedCount = 0;
    const nextRecord = {};

    for (const [key, item] of Object.entries(value)) {
      const mapped = deepMapLinks(item, oldPath, newPath, key);
      updatedCount += mapped.updatedCount;
      nextRecord[key] = mapped.value;
    }

    return { value: nextRecord, updatedCount };
  }

  return { value, updatedCount: 0 };
}

async function cleanup() {
  await supabase.from('seo_redirects').delete().eq('source_path', oldSlug);
  await supabase.from('seo_metadata').delete().in('page_key', [oldSlug, newSlug, sourceSlug]);
}

async function run() {
  try {
    const { data: targetInsert, error: targetErr } = await supabase
      .from('seo_metadata')
      .insert({
        page_key: oldSlug,
        title: `E2E Target ${now}`,
        status: 'published',
        language: 'fr',
        sections_data: targetSections,
        canonical_url: `/${oldSlug}`,
      })
      .select('id, page_key')
      .single();
    if (targetErr) throw targetErr;

    const { data: sourceInsert, error: sourceErr } = await supabase
      .from('seo_metadata')
      .insert({
        page_key: sourceSlug,
        title: `E2E Source ${now}`,
        status: 'published',
        language: 'fr',
        sections_data: sourceSections,
        canonical_url: `/${sourceSlug}`,
      })
      .select('id')
      .single();
    if (sourceErr) throw sourceErr;

    const { error: renameErr } = await supabase
      .from('seo_metadata')
      .update({ page_key: newSlug, canonical_url: `/${newSlug}`, updated_at: new Date().toISOString() })
      .eq('id', targetInsert.id);
    if (renameErr) throw renameErr;

    const { data: allPages, error: pagesErr } = await supabase
      .from('seo_metadata')
      .select('id, sections_data')
      .in('id', [targetInsert.id, sourceInsert.id]);
    if (pagesErr) throw pagesErr;

    let totalLinkUpdates = 0;
    for (const page of allPages || []) {
      const pageSections = Array.isArray(page.sections_data) ? page.sections_data : [];
      if (pageSections.length === 0) continue;

      const replacement = deepMapLinks(pageSections, oldSlug, newSlug);
      if (replacement.updatedCount > 0) {
        totalLinkUpdates += replacement.updatedCount;
        const { error: updateErr } = await supabase
          .from('seo_metadata')
          .update({ sections_data: replacement.value, updated_at: new Date().toISOString() })
          .eq('id', page.id);
        if (updateErr) throw updateErr;
      }
    }

    const redirectPayload = {
      source_path: oldSlug,
      target_path: newSlug,
      source_page_id: targetInsert.id,
      target_page_id: targetInsert.id,
      reason: 'slug_change',
      is_active: true,
      created_by: null,
    };

    const { data: existingRedirect, error: existingRedirectErr } = await supabase
      .from('seo_redirects')
      .select('id')
      .eq('source_path', oldSlug)
      .maybeSingle();
    if (existingRedirectErr) throw existingRedirectErr;

    if (existingRedirect?.id) {
      const { error: updateRedirectErr } = await supabase
        .from('seo_redirects')
        .update({ ...redirectPayload, updated_at: new Date().toISOString() })
        .eq('id', existingRedirect.id);
      if (updateRedirectErr) throw updateRedirectErr;
    } else {
      const { error: insertRedirectErr } = await supabase
        .from('seo_redirects')
        .insert(redirectPayload);
      if (insertRedirectErr) throw insertRedirectErr;
    }

    const { data: sourceAfter, error: sourceAfterErr } = await supabase
      .from('seo_metadata')
      .select('sections_data')
      .eq('id', sourceInsert.id)
      .single();
    if (sourceAfterErr) throw sourceAfterErr;

    const serializedSections = JSON.stringify(sourceAfter.sections_data || []);
    const propagationOK = serializedSections.includes(`/${newSlug}`) && !serializedSections.includes(`/${oldSlug}`);

    const { data: oldDirect } = await supabase
      .from('seo_metadata')
      .select('id')
      .eq('page_key', oldSlug)
      .eq('status', 'published')
      .maybeSingle();

    const { data: redirectData, error: redirectLookupErr } = await supabase
      .from('seo_redirects')
      .select('target_path')
      .eq('source_path', oldSlug)
      .eq('is_active', true)
      .maybeSingle();
    if (redirectLookupErr) throw redirectLookupErr;

    const { data: newDirect, error: newDirectErr } = await supabase
      .from('seo_metadata')
      .select('id')
      .eq('page_key', newSlug)
      .eq('status', 'published')
      .maybeSingle();
    if (newDirectErr) throw newDirectErr;

    const runtimeRedirectOK = !oldDirect && !!redirectData?.target_path && redirectData.target_path === newSlug && !!newDirect;

    console.log(
      JSON.stringify(
        {
          scenario: 'rename slug -> verify propagation -> verify public redirect',
          oldSlug,
          newSlug,
          sourceSlug,
          totalLinkUpdates,
          propagationOK,
          runtimeRedirectOK,
          checks: {
            oldPublishedPageExists: !!oldDirect,
            redirectTarget: redirectData?.target_path || null,
            newPublishedPageExists: !!newDirect,
          },
        },
        null,
        2,
      ),
    );

    await cleanup();
  } catch (error) {
    console.error('E2E TEST FAILED');
    console.error(error);
    await cleanup();
    process.exit(1);
  }
}

await run();
