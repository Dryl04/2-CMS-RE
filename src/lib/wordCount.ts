const SKIP_KEYS = new Set([
  'link', 'href', 'url', 'src', 'image', 'logo', 'icon', 'video',
  'ctaLink', 'primaryLink', 'secondaryLink', 'buttonUrl', 'buttonLink',
  'searchLink', 'cartLink', 'accountLink', 'socialLinks',
  'background', 'overlay', 'color', 'fontFamily', 'cssClasses', 'customCSS',
  'id', 'type', 'variant', 'order', 'themeRef', 'themeMode',
]);

const URL_PATTERN = /^(https?:\/\/|mailto:|tel:|javascript:|data:|\/\/)/i;
const HTML_TAG_PATTERN = /<[^>]+>/g;

function countWords(text: string): number {
  const stripped = text.replace(HTML_TAG_PATTERN, ' ').trim();
  if (!stripped) return 0;
  return stripped.split(/\s+/).filter(Boolean).length;
}

function extractTextFromValue(value: unknown, key?: string): number {
  if (key && SKIP_KEYS.has(key)) return 0;

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed || URL_PATTERN.test(trimmed)) return 0;
    return countWords(trimmed);
  }

  if (Array.isArray(value)) {
    return value.reduce((sum, item) => sum + extractTextFromValue(item), 0);
  }

  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).reduce(
      (sum, [k, v]) => sum + extractTextFromValue(v, k),
      0,
    );
  }

  return 0;
}

export function computePageWordCount(page: {
  title?: string;
  description?: string;
  content?: string;
  seo_h1?: string;
  seo_h2?: string;
  sections_data?: unknown[];
}): number {
  let total = 0;

  if (page.title) total += countWords(page.title);
  if (page.description) total += countWords(page.description);
  if (page.content) total += countWords(page.content);
  if (page.seo_h1) total += countWords(page.seo_h1);
  if (page.seo_h2) total += countWords(page.seo_h2);

  if (Array.isArray(page.sections_data)) {
    for (const section of page.sections_data) {
      if (section && typeof section === 'object') {
        const s = section as Record<string, unknown>;
        total += extractTextFromValue(s.content);
      }
    }
  }

  return total;
}

export function formatWordCount(count: number): string {
  if (count === 0) return '—';
  return count.toLocaleString('fr-FR') + ' mot' + (count > 1 ? 's' : '');
}
