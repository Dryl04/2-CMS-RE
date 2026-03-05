import { PageBuilderSection } from './pageBuilderTypes';

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null) return a === b;
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((v, i) => deepEqual(v, (b as unknown[])[i]));
  }

  const objA = a as Record<string, unknown>;
  const objB = b as Record<string, unknown>;
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((k) => deepEqual(objA[k], objB[k]));
}

function shallowMergeChangedKeys(
  oldObj: Record<string, unknown>,
  newObj: Record<string, unknown>,
  pageObj: Record<string, unknown>
): Record<string, unknown> {
  const result = { ...pageObj };

  const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

  for (const key of allKeys) {
    const oldVal = oldObj[key];
    const newVal = newObj[key];

    if (!deepEqual(oldVal, newVal)) {
      result[key] = newVal;
    }
  }

  return result;
}

function deepMergeChangedKeys(
  oldObj: Record<string, unknown>,
  newObj: Record<string, unknown>,
  pageObj: Record<string, unknown>
): Record<string, unknown> {
  const result = { ...pageObj };

  const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

  for (const key of allKeys) {
    const oldVal = oldObj[key];
    const newVal = newObj[key];

    if (deepEqual(oldVal, newVal)) {
      continue;
    }

    if (
      oldVal !== null &&
      newVal !== null &&
      typeof oldVal === 'object' &&
      typeof newVal === 'object' &&
      !Array.isArray(oldVal) &&
      !Array.isArray(newVal)
    ) {
      const pageSubObj =
        result[key] !== null &&
        typeof result[key] === 'object' &&
        !Array.isArray(result[key])
          ? (result[key] as Record<string, unknown>)
          : {};
      result[key] = deepMergeChangedKeys(
        oldVal as Record<string, unknown>,
        newVal as Record<string, unknown>,
        pageSubObj
      );
    } else {
      result[key] = newVal;
    }
  }

  return result;
}

export interface TemplateDiffResult {
  sectionsData: PageBuilderSection[];
  daisyThemeSlugChanged: boolean;
  newDaisyThemeSlug: string | null;
}

export function applyTemplateDiffToPage(
  oldTemplateSections: PageBuilderSection[],
  newTemplateSections: PageBuilderSection[],
  pageSections: PageBuilderSection[],
  oldDaisyThemeSlug: string | null,
  newDaisyThemeSlug: string | null
): TemplateDiffResult {
  const oldById = new Map(oldTemplateSections.map((s) => [s.id, s]));
  const newById = new Map(newTemplateSections.map((s) => [s.id, s]));
  const pageById = new Map(pageSections.map((s) => [s.id, s]));

  const removedIds = new Set(
    oldTemplateSections
      .filter((s) => !newById.has(s.id))
      .map((s) => s.id)
  );

  const mergedSections: PageBuilderSection[] = [];

  for (const newSection of newTemplateSections) {
    const oldSection = oldById.get(newSection.id);
    const pageSection = pageById.get(newSection.id);

    if (!oldSection) {
      mergedSections.push({ ...newSection });
      continue;
    }

    if (!pageSection) {
      mergedSections.push({ ...newSection });
      continue;
    }

    const mergedContent = deepMergeChangedKeys(
      oldSection.content as Record<string, unknown>,
      newSection.content as Record<string, unknown>,
      pageSection.content as Record<string, unknown>
    ) as Record<string, any>;

    const mergedDesign = deepMergeChangedKeys(
      oldSection.design as unknown as Record<string, unknown>,
      newSection.design as unknown as Record<string, unknown>,
      pageSection.design as unknown as Record<string, unknown>
    ) as PageBuilderSection['design'];

    const mergedAdvanced = deepMergeChangedKeys(
      oldSection.advanced as unknown as Record<string, unknown>,
      newSection.advanced as unknown as Record<string, unknown>,
      pageSection.advanced as unknown as Record<string, unknown>
    ) as PageBuilderSection['advanced'];

    const oldThemeConfig = (oldSection.themeConfig ?? {}) as Record<string, unknown>;
    const newThemeConfig = (newSection.themeConfig ?? {}) as Record<string, unknown>;
    const pageThemeConfig = (pageSection.themeConfig ?? {}) as Record<string, unknown>;
    const mergedThemeConfig = deepMergeChangedKeys(
      oldThemeConfig,
      newThemeConfig,
      pageThemeConfig
    ) as PageBuilderSection['themeConfig'];

    const typeChanged = !deepEqual(oldSection.type, newSection.type);
    const variantChanged = !deepEqual(oldSection.variant, newSection.variant);

    mergedSections.push({
      ...pageSection,
      order: newSection.order,
      type: typeChanged ? newSection.type : pageSection.type,
      variant: variantChanged ? newSection.variant : pageSection.variant,
      content: mergedContent,
      design: mergedDesign,
      advanced: mergedAdvanced,
      themeConfig: mergedThemeConfig,
    });
  }

  const pageOnlySections = pageSections.filter(
    (s) => !oldById.has(s.id) && !newById.has(s.id) && !removedIds.has(s.id)
  );
  mergedSections.push(...pageOnlySections);

  mergedSections.sort((a, b) => a.order - b.order);

  const daisyThemeSlugChanged = !deepEqual(oldDaisyThemeSlug, newDaisyThemeSlug);

  return {
    sectionsData: mergedSections,
    daisyThemeSlugChanged,
    newDaisyThemeSlug,
  };
}
