import { PageBuilderSection } from '@/lib/pageBuilderTypes';

export interface FoundSectionLink {
  path: string;
  key: string;
  value: string;
  sectionIndex?: number;
  sectionType?: string;
  sectionId?: string;
  elementLabel?: string;
}

export interface InternalLinkReplacementResult {
  sections: PageBuilderSection[];
  updatedCount: number;
}

/** Classification d'un lien (indépendante de window.location.host) */
export type LinkKind = 'internal' | 'external' | 'anchor' | 'protocol' | 'unknown';

/**
 * Classifie un lien.
 * @param value - valeur brute du lien
 * @param siteHost - hostname du site (ex: "example.com"). Si omis, les URLs absolues identiques au site ne sont pas détectées.
 */
export function classifyLink(value: string, siteHost?: string): LinkKind {
  const raw = value.trim();
  if (!raw) return 'unknown';
  if (raw.startsWith('#')) return 'anchor';
  if (raw.startsWith('mailto:') || raw.startsWith('tel:') || raw.startsWith('javascript:') || raw.startsWith('data:')) {
    return 'protocol';
  }
  if (/^https?:\/\//i.test(raw)) {
    try {
      const parsed = new URL(raw);
      if (siteHost && parsed.host === siteHost) return 'internal';
      return 'external';
    } catch {
      return 'unknown';
    }
  }
  // Relative paths (/ or plain slug) → always internal
  return 'internal';
}

const HTML_HREF_REGEX = /href="([^"]+)"/g;

export function normalizeInternalPath(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      return url.pathname.replace(/^\/+|\/+$/g, '');
    } catch {
      return '';
    }
  }

  return trimmed.replace(/^\/+|\/+$/g, '');
}

function splitSuffix(value: string): { base: string; suffix: string } {
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

function rewritePathValue(rawValue: string, oldPath: string, newPath: string): string | null {
  const trimmed = rawValue.trim();
  if (!trimmed) return null;

  const normalizedOld = normalizeInternalPath(oldPath);
  const normalizedNew = normalizeInternalPath(newPath);
  if (!normalizedOld || !normalizedNew || normalizedOld === normalizedNew) return null;

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      const normalizedCurrent = normalizeInternalPath(url.pathname);
      if (normalizedCurrent !== normalizedOld) return null;
      url.pathname = `/${normalizedNew}`;
      return url.toString();
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

function shouldInspectKey(key: string): boolean {
  const lower = key.toLowerCase();
  return lower.includes('link') || lower.includes('href') || lower.includes('url') || lower === 'src';
}

function deepMapLinks(value: unknown, oldPath: string, newPath: string, currentKey?: string): { value: unknown; updatedCount: number } {
  if (typeof value === 'string') {
    let updatedCount = 0;
    let nextValue = value;

    if (nextValue.includes('<a ') && nextValue.includes('href="')) {
      nextValue = nextValue.replace(HTML_HREF_REGEX, (full, hrefValue: string) => {
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
    const nextRecord: Record<string, unknown> = {};

    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      const mapped = deepMapLinks(item, oldPath, newPath, key);
      updatedCount += mapped.updatedCount;
      nextRecord[key] = mapped.value;
    }

    return { value: nextRecord, updatedCount };
  }

  return { value, updatedCount: 0 };
}

const LABEL_CANDIDATE_KEYS = [
  'label', 'text', 'title', 'name', 'ctaText', 'buttonText', 'primaryCta', 'secondaryCta',
  'primaryText', 'secondaryText', 'linkText', 'platform', 'accountText', 'searchText', 'cartText',
];

function pickLabelFromParent(parent: Record<string, unknown>): string | undefined {
  for (const key of LABEL_CANDIDATE_KEYS) {
    const val = parent[key];
    if (typeof val === 'string' && val.trim()) return val.trim();
  }
  return undefined;
}

function deepCollectLinks(
  value: unknown,
  path: string,
  bucket: FoundSectionLink[],
  currentKey?: string,
  parentObject?: Record<string, unknown>,
  includeEmpty?: boolean,
): void {
  if (typeof value === 'string') {
    if (currentKey && shouldInspectKey(currentKey) && (value.trim() || includeEmpty)) {
      const elementLabel = parentObject ? pickLabelFromParent(parentObject) : undefined;
      bucket.push({ path, key: currentKey, value, elementLabel });
    }

    if (value.includes('<a ') && value.includes('href="')) {
      const matches = value.matchAll(HTML_HREF_REGEX);
      for (const match of matches) {
        if (match[1]) {
          bucket.push({ path: `${path}[href]`, key: currentKey || 'html', value: match[1] });
        }
      }
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      deepCollectLinks(item, `${path}[${index}]`, bucket, currentKey, typeof item === 'object' && item !== null ? (item as Record<string, unknown>) : parentObject, includeEmpty);
    });
    return;
  }

  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    for (const [key, item] of Object.entries(obj)) {
      const nextPath = path ? `${path}.${key}` : key;
      deepCollectLinks(item, nextPath, bucket, key, obj, includeEmpty);
    }
  }
}

export function extractLinksFromSections(sections: PageBuilderSection[], options?: { includeEmpty?: boolean }): FoundSectionLink[] {
  const rawBucket: FoundSectionLink[] = [];
  const includeEmpty = options?.includeEmpty;
  sections.forEach((section, index) => {
    deepCollectLinks(section.content, `sections[${index}].content`, rawBucket, undefined, undefined, includeEmpty);
    deepCollectLinks(section.design, `sections[${index}].design`, rawBucket, undefined, undefined, includeEmpty);
  });
  return rawBucket.map((link) => {
    const match = link.path.match(/^sections\[(\d+)\]/);
    if (!match) return link;
    const idx = parseInt(match[1], 10);
    const section = sections[idx];
    if (!section) return link;
    return { ...link, sectionIndex: idx, sectionType: section.type, sectionId: section.id };
  });
}

export function replaceInternalLinksInSections(
  sections: PageBuilderSection[],
  oldPath: string,
  newPath: string,
): InternalLinkReplacementResult {
  const mapped = deepMapLinks(sections, oldPath, newPath);
  return {
    sections: mapped.value as PageBuilderSection[],
    updatedCount: mapped.updatedCount,
  };
}

// ---------------------------------------------------------------------------
// Literal (exact-string) link replacement — used for external links
// ---------------------------------------------------------------------------

function deepMapLiteral(
  value: unknown,
  oldValue: string,
  newValue: string,
  currentKey?: string,
): { value: unknown; updatedCount: number } {
  if (typeof value === 'string') {
    let updatedCount = 0;
    let nextValue = value;

    if (nextValue.includes('<a ') && nextValue.includes('href="')) {
      nextValue = nextValue.replace(HTML_HREF_REGEX, (full, hrefValue: string) => {
        if (hrefValue !== oldValue) return full;
        updatedCount += 1;
        return `href="${newValue}"`;
      });
    }

    if (currentKey && shouldInspectKey(currentKey) && nextValue === oldValue) {
      updatedCount += 1;
      nextValue = newValue;
    }

    return { value: nextValue, updatedCount };
  }

  if (Array.isArray(value)) {
    let updatedCount = 0;
    const nextArray = value.map((item) => {
      const mapped = deepMapLiteral(item, oldValue, newValue, currentKey);
      updatedCount += mapped.updatedCount;
      return mapped.value;
    });
    return { value: nextArray, updatedCount };
  }

  if (value && typeof value === 'object') {
    let updatedCount = 0;
    const nextRecord: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      const mapped = deepMapLiteral(item, oldValue, newValue, key);
      updatedCount += mapped.updatedCount;
      nextRecord[key] = mapped.value;
    }
    return { value: nextRecord, updatedCount };
  }

  return { value, updatedCount: 0 };
}

/**
 * Remplace un lien par correspondance exacte de chaîne (utile pour les liens externes).
 */
export function replaceLiteralLinkInSections(
  sections: PageBuilderSection[],
  oldValue: string,
  newValue: string,
): InternalLinkReplacementResult {
  const mapped = deepMapLiteral(sections, oldValue, newValue);
  return {
    sections: mapped.value as PageBuilderSection[],
    updatedCount: mapped.updatedCount,
  };
}

function setNestedValue(obj: Record<string, unknown>, keys: string[], value: string): boolean {
  let current: unknown = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    const arrayMatch = k.match(/^(.+)\[(\d+)\]$/);
    if (arrayMatch) {
      const arr = (current as Record<string, unknown>)[arrayMatch[1]];
      if (!Array.isArray(arr)) return false;
      current = arr[parseInt(arrayMatch[2], 10)];
    } else {
      if (!current || typeof current !== 'object') return false;
      current = (current as Record<string, unknown>)[k];
    }
    if (current === undefined || current === null) return false;
  }

  const lastKey = keys[keys.length - 1];
  const arrayMatch = lastKey.match(/^(.+)\[(\d+)\]$/);
  if (arrayMatch) {
    const arr = (current as Record<string, unknown>)[arrayMatch[1]];
    if (!Array.isArray(arr)) return false;
    arr[parseInt(arrayMatch[2], 10)] = value;
    return true;
  }

  if (!current || typeof current !== 'object') return false;
  (current as Record<string, unknown>)[lastKey] = value;
  return true;
}

export function replaceTargetedLinkInSections(
  sections: PageBuilderSection[],
  sectionIndex: number,
  fieldKey: string,
  oldValue: string,
  newValue: string,
  fieldPath?: string,
): InternalLinkReplacementResult {
  const cloned = JSON.parse(JSON.stringify(sections)) as PageBuilderSection[];
  const section = cloned[sectionIndex];
  if (!section) return { sections: cloned, updatedCount: 0 };

  if (fieldPath) {
    const pathAfterContent = fieldPath.replace(/^sections\[\d+\]\./, '');
    const keys = pathAfterContent.split('.').flatMap((k) => {
      const m = k.match(/^(.+?)(\[\d+\])+$/);
      if (!m) return [k];
      const parts: string[] = [];
      const idxMatches = k.match(/\[\d+\]/g);
      if (idxMatches) {
        const base = k.slice(0, k.indexOf('['));
        parts.push(`${base}${idxMatches[0]}`);
        for (let i = 1; i < idxMatches.length; i++) {
          parts.push(idxMatches[i].replace(/[\[\]]/g, ''));
        }
      }
      return parts.length ? parts : [k];
    });

    if (setNestedValue(section as unknown as Record<string, unknown>, keys, newValue)) {
      return { sections: cloned, updatedCount: 1 };
    }
  }

  const deepReplace = (obj: unknown, key?: string): { value: unknown; count: number } => {
    if (typeof obj === 'string') {
      if (key === fieldKey && obj === oldValue) {
        return { value: newValue, count: 1 };
      }
      return { value: obj, count: 0 };
    }
    if (Array.isArray(obj)) {
      let count = 0;
      const arr = obj.map((item) => {
        if (count > 0) return item;
        const r = deepReplace(item, key);
        count += r.count;
        return r.value;
      });
      return { value: arr, count };
    }
    if (obj && typeof obj === 'object') {
      let count = 0;
      const rec: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
        if (count > 0) {
          rec[k] = v;
          continue;
        }
        const r = deepReplace(v, k);
        count += r.count;
        rec[k] = r.value;
      }
      return { value: rec, count };
    }
    return { value: obj, count: 0 };
  };

  const contentResult = deepReplace(section.content);
  if (contentResult.count > 0) {
    section.content = contentResult.value as Record<string, unknown>;
    return { sections: cloned, updatedCount: contentResult.count };
  }

  const designResult = deepReplace(section.design);
  if (designResult.count > 0) {
    section.design = designResult.value as Record<string, unknown>;
    return { sections: cloned, updatedCount: designResult.count };
  }

  return { sections: cloned, updatedCount: 0 };
}
