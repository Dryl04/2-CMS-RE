import { supabase } from './supabase';
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
  const { data, error } = await supabase
    .from('global_hf_settings')
    .select('*')
    .eq('is_active', true)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('[globalHFSettings] Error loading active setting:', error);
    return null;
  }
  return data as GlobalHFSetting | null;
}

export async function loadAllGlobalHFSettings(): Promise<GlobalHFSetting[]> {
  const { data, error } = await supabase
    .from('global_hf_settings')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('[globalHFSettings] Error loading settings:', error);
    return [];
  }
  return (data || []) as GlobalHFSetting[];
}

export function applySectionsWithGlobalHF(
  sections: PageBuilderSection[],
  setting: GlobalHFSetting,
  pageId?: string
): PageBuilderSection[] {
  const shouldApply = isSettingApplicableToPage(setting, pageId);
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

function isSettingApplicableToPage(setting: GlobalHFSetting, pageId?: string): boolean {
  if (!setting.is_active) return false;
  if (!pageId) return false;

  const ids = setting.target_page_ids;
  if (!ids || ids.length === 0) return false;

  return ids.includes(pageId);
}

