import { api } from './api';
import { PageBuilderSection } from './pageBuilderTypes';

export interface GlobalHFSetting {
  id: string;
  label: string;
  header_section: PageBuilderSection | null;
  footer_section: PageBuilderSection | null;
  apply_on_import: boolean;
  apply_on_create: boolean;
  is_active: boolean;
  target_page_ids: string[] | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type GlobalHFApplicationContext = 'existing' | 'import' | 'create';

interface ApplySectionsWithGlobalHFOptions {
  pageId?: string;
  context?: GlobalHFApplicationContext;
}

const HEADER_TYPES = new Set([
  'header', 'header-top-info', 'header-with-icons',
  'header-account-bar', 'header-full-contact', 'header-clickfunnel',
]);

const FOOTER_TYPES = new Set([
  'footer', 'clickfunnel-footer', 'cinematic-footer',
]);

export function isHeaderType(type: string): boolean {
  return HEADER_TYPES.has(type);
}

export function isFooterType(type: string): boolean {
  return FOOTER_TYPES.has(type);
}

export async function loadActiveGlobalHFSetting(): Promise<GlobalHFSetting | null> {
  const { data, error } = await api.globalHf.getActive();
  if (error) {
    console.error('[globalHFSettings] Error loading active setting:', error);
    return null;
  }
  // getActive returns an array, take the first one
  const items = Array.isArray(data) ? data : (data ? [data] : []);
  return (items[0] as GlobalHFSetting) || null;
}

export async function loadAllGlobalHFSettings(): Promise<GlobalHFSetting[]> {
  const { data, error } = await api.globalHf.list();
  if (error) {
    console.error('[globalHFSettings] Error loading settings:', error);
    return [];
  }
  return (data || []) as GlobalHFSetting[];
}

export async function activateGlobalHFSetting(settingId: string): Promise<void> {
  const { error } = await api.globalHf.activate(settingId);
  if (error) throw error;
}

export function shouldApplyGlobalHFSetting(
  setting: GlobalHFSetting,
  context: GlobalHFApplicationContext = 'existing',
  pageId?: string,
): boolean {
  if (!setting.is_active) return false;

  if (context === 'import') {
    return setting.apply_on_import;
  }

  if (context === 'create') {
    return setting.apply_on_create;
  }

  if (!pageId) return false;

  const ids = setting.target_page_ids;
  if (!ids || ids.length === 0) return false;

  return ids.includes(pageId);
}

export function applySectionsWithGlobalHF(
  sections: PageBuilderSection[],
  setting: GlobalHFSetting,
  options?: string | ApplySectionsWithGlobalHFOptions,
): PageBuilderSection[] {
  const resolvedOptions: ApplySectionsWithGlobalHFOptions =
    typeof options === 'string'
      ? { pageId: options, context: 'existing' }
      : (options || {});

  const shouldApply = shouldApplyGlobalHFSetting(
    setting,
    resolvedOptions.context || 'existing',
    resolvedOptions.pageId,
  );

  if (!shouldApply) return sections;

  const hasGlobalHeader = !!setting.header_section;
  const hasGlobalFooter = !!setting.footer_section;

  if (!hasGlobalHeader && !hasGlobalFooter) return sections;

  let result = [...sections];

  if (hasGlobalHeader) {
    result = result.filter(s => !isHeaderType(s.type));
    const headerSection: PageBuilderSection = {
      ...setting.header_section!,
      id: `global-header-${setting.id}`,
      order: -1,
    };
    result.unshift(headerSection);
  }

  if (hasGlobalFooter) {
    result = result.filter(s => !isFooterType(s.type));
    const footerSection: PageBuilderSection = {
      ...setting.footer_section!,
      id: `global-footer-${setting.id}`,
      order: result.length,
    };
    result.push(footerSection);
  }

  return result.map((s, i) => ({ ...s, order: i }));
}
