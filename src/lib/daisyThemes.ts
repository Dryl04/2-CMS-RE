import { supabase } from './supabase';

function hexToLinear(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function hexToOklch(hex: string): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return hex;
  const r = hexToLinear(parseInt(clean.slice(0, 2), 16));
  const g = hexToLinear(parseInt(clean.slice(2, 4), 16));
  const b = hexToLinear(parseInt(clean.slice(4, 6), 16));

  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const bVal = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;

  const C = Math.sqrt(a * a + bVal * bVal);
  let H = (Math.atan2(bVal, a) * 180) / Math.PI;
  if (H < 0) H += 360;

  const Lpct = Math.round(L * 10000) / 100;
  const Cfixed = Math.round(C * 10000) / 10000;
  const Hfixed = Math.round(H * 100) / 100;

  return `${Lpct}% ${Cfixed} ${Hfixed}`;
}

function toOklchValue(value: string): string {
  if (!value) return value;
  const trimmed = value.trim();
  if (trimmed.startsWith('#')) return hexToOklch(trimmed);
  return trimmed;
}

export interface DaisyThemeTokens {
  'primary': string;
  'primary-content': string;
  'secondary': string;
  'secondary-content': string;
  'accent': string;
  'accent-content': string;
  'neutral': string;
  'neutral-content': string;
  'base-100': string;
  'base-200': string;
  'base-300': string;
  'base-content': string;
  'info': string;
  'info-content': string;
  'success': string;
  'success-content': string;
  'warning': string;
  'warning-content': string;
  'error': string;
  'error-content': string;
}

export interface DaisyFontConfig {
  bodyFont?: string;
  headingFont?: string;
  headingWeight?: string;
  googleFonts?: string[]; // Font names to import from Google Fonts
}

export interface DaisyTheme {
  id: string;
  name: string;
  slug: string;
  source: 'daisyui' | 'custom';
  tokens: DaisyThemeTokens;
  font_config?: DaisyFontConfig | null;
  is_active: boolean;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface WidgetThemeConfig {
  themeMode: 'inherit' | 'named' | 'custom';
  themeRef?: string;
  customTokens?: Partial<DaisyThemeTokens>;
}

export const TOKEN_LABELS: Record<keyof DaisyThemeTokens, string> = {
  'primary': 'Primaire',
  'primary-content': 'Contenu primaire',
  'secondary': 'Secondaire',
  'secondary-content': 'Contenu secondaire',
  'accent': 'Accent',
  'accent-content': 'Contenu accent',
  'neutral': 'Neutre',
  'neutral-content': 'Contenu neutre',
  'base-100': 'Base 100',
  'base-200': 'Base 200',
  'base-300': 'Base 300',
  'base-content': 'Contenu base',
  'info': 'Info',
  'info-content': 'Contenu info',
  'success': 'Succès',
  'success-content': 'Contenu succès',
  'warning': 'Avertissement',
  'warning-content': 'Contenu avertissement',
  'error': 'Erreur',
  'error-content': 'Contenu erreur',
};

export const TOKEN_GROUPS = [
  { label: 'Couleurs principales', keys: ['primary', 'primary-content', 'secondary', 'secondary-content', 'accent', 'accent-content'] as (keyof DaisyThemeTokens)[] },
  { label: 'Neutres & Base', keys: ['neutral', 'neutral-content', 'base-100', 'base-200', 'base-300', 'base-content'] as (keyof DaisyThemeTokens)[] },
  { label: 'Statuts', keys: ['info', 'info-content', 'success', 'success-content', 'warning', 'warning-content', 'error', 'error-content'] as (keyof DaisyThemeTokens)[] },
];

export const NO_THEME_SLUG = 'none';

export const OFFICIAL_THEME_SLUGS = [
  'light', 'dark', 'cupcake', 'bumblebee', 'emerald', 'corporate',
  'synthwave', 'retro', 'cyberpunk', 'valentine', 'halloween', 'garden',
  'forest', 'aqua', 'lofi', 'pastel', 'fantasy', 'wireframe', 'black',
  'luxury', 'dracula', 'cmyk', 'autumn', 'business', 'acid', 'lemonade',
  'night', 'coffee', 'winter', 'dim', 'nord', 'sunset',
];

export function createEmptyTokens(): DaisyThemeTokens {
  return {
    'primary': '#570df8',
    'primary-content': '#ffffff',
    'secondary': '#f000b8',
    'secondary-content': '#ffffff',
    'accent': '#37cdbe',
    'accent-content': '#163835',
    'neutral': '#2a323c',
    'neutral-content': '#a6adbb',
    'base-100': '#ffffff',
    'base-200': '#f2f2f2',
    'base-300': '#e5e6e6',
    'base-content': '#1f2937',
    'info': '#3abff8',
    'info-content': '#002b3d',
    'success': '#36d399',
    'success-content': '#003320',
    'warning': '#fbbd23',
    'warning-content': '#382800',
    'error': '#f87272',
    'error-content': '#470000',
  };
}

export function tokensAreDifferent(a: DaisyThemeTokens, b: DaisyThemeTokens): boolean {
  const keys = Object.keys(a) as (keyof DaisyThemeTokens)[];
  return keys.some(k => a[k]?.toLowerCase() !== b[k]?.toLowerCase());
}

export function createNoThemeEntry(): DaisyTheme {
  return {
    id: 'no-theme-special',
    name: 'Aucun thème',
    slug: NO_THEME_SLUG,
    source: 'daisyui',
    tokens: createEmptyTokens(),
    is_active: false,
    user_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export async function loadAllDaisyThemes(): Promise<DaisyTheme[]> {
  const { data, error } = await supabase
    .from('daisyui_themes')
    .select('*');

  if (error) throw error;
  
  // Sort themes: light first, dark second, then daisyui themes alphabetically, then custom themes
  const themes = data || [];
  const sortedThemes = themes.sort((a, b) => {
    // Special ordering for light and dark
    if (a.slug === 'light') return -1;
    if (b.slug === 'light') return 1;
    if (a.slug === 'dark') return b.slug === 'light' ? 1 : -1;
    if (b.slug === 'dark') return a.slug === 'light' ? -1 : 1;
    
    // Group by source: daisyui before custom
    if (a.source !== b.source) {
      return a.source === 'daisyui' ? -1 : 1;
    }
    
    // Within same source, sort alphabetically
    return a.name.localeCompare(b.name);
  });
  
  // Add "No Theme" option at the beginning
  return [createNoThemeEntry(), ...sortedThemes];
}

export async function loadActiveTheme(): Promise<DaisyTheme | null> {
  const { data, error } = await supabase
    .from('daisyui_themes')
    .select('*')
    .eq('is_active', true)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function setActiveTheme(themeId: string): Promise<void> {
  const { error: clearError } = await supabase
    .from('daisyui_themes')
    .update({ is_active: false })
    .eq('is_active', true);

  if (clearError) throw clearError;

  const { error } = await supabase
    .from('daisyui_themes')
    .update({ is_active: true, updated_at: new Date().toISOString() })
    .eq('id', themeId);

  if (error) throw error;
}

export async function createCustomTheme(
  name: string,
  slug: string,
  tokens: DaisyThemeTokens,
  userId: string,
  fontConfig?: DaisyFontConfig | null
): Promise<DaisyTheme> {
  const { data, error } = await supabase
    .from('daisyui_themes')
    .insert({ name, slug, source: 'custom', tokens, user_id: userId, font_config: fontConfig || null })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCustomTheme(
  id: string,
  updates: { name?: string; slug?: string; tokens?: DaisyThemeTokens; font_config?: DaisyFontConfig | null }
): Promise<void> {
  const { error } = await supabase
    .from('daisyui_themes')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}

export async function deleteCustomTheme(id: string): Promise<void> {
  const { error } = await supabase
    .from('daisyui_themes')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export function getThemeInlineVars(tokens: DaisyThemeTokens): Record<string, string> {
  return {
    '--p': toOklchValue(tokens.primary),
    '--pc': toOklchValue(tokens['primary-content']),
    '--s': toOklchValue(tokens.secondary),
    '--sc': toOklchValue(tokens['secondary-content']),
    '--a': toOklchValue(tokens.accent),
    '--ac': toOklchValue(tokens['accent-content']),
    '--n': toOklchValue(tokens.neutral),
    '--nc': toOklchValue(tokens['neutral-content']),
    '--b1': toOklchValue(tokens['base-100']),
    '--b2': toOklchValue(tokens['base-200']),
    '--b3': toOklchValue(tokens['base-300']),
    '--bc': toOklchValue(tokens['base-content']),
    '--in': toOklchValue(tokens.info),
    '--inc': toOklchValue(tokens['info-content']),
    '--su': toOklchValue(tokens.success),
    '--suc': toOklchValue(tokens['success-content']),
    '--wa': toOklchValue(tokens.warning),
    '--wac': toOklchValue(tokens['warning-content']),
    '--er': toOklchValue(tokens.error),
    '--erc': toOklchValue(tokens['error-content']),
  };
}

export function generateCustomThemeCSS(slug: string, tokens: DaisyThemeTokens, fontConfig?: DaisyFontConfig | null): string {
  let css = '';
  
  // Add Google Fonts import if needed
  const googleFonts = extractGoogleFontNames(fontConfig);
  if (googleFonts.length > 0) {
    css += generateGoogleFontsImport(googleFonts, DEFAULT_FONT_WEIGHTS) + '\n\n';
  }
  
  const hex = (v: string) => v.trim().startsWith('#') ? v.trim() : v.trim();
  css += `[data-theme="${slug}"] {
  --p: ${toOklchValue(tokens.primary)};
  --fallback-p: ${hex(tokens.primary)};
  --pc: ${toOklchValue(tokens['primary-content'])};
  --fallback-pc: ${hex(tokens['primary-content'])};
  --s: ${toOklchValue(tokens.secondary)};
  --fallback-s: ${hex(tokens.secondary)};
  --sc: ${toOklchValue(tokens['secondary-content'])};
  --fallback-sc: ${hex(tokens['secondary-content'])};
  --a: ${toOklchValue(tokens.accent)};
  --fallback-a: ${hex(tokens.accent)};
  --ac: ${toOklchValue(tokens['accent-content'])};
  --fallback-ac: ${hex(tokens['accent-content'])};
  --n: ${toOklchValue(tokens.neutral)};
  --fallback-n: ${hex(tokens.neutral)};
  --nc: ${toOklchValue(tokens['neutral-content'])};
  --fallback-nc: ${hex(tokens['neutral-content'])};
  --b1: ${toOklchValue(tokens['base-100'])};
  --fallback-b1: ${hex(tokens['base-100'])};
  --b2: ${toOklchValue(tokens['base-200'])};
  --fallback-b2: ${hex(tokens['base-200'])};
  --b3: ${toOklchValue(tokens['base-300'])};
  --fallback-b3: ${hex(tokens['base-300'])};
  --bc: ${toOklchValue(tokens['base-content'])};
  --fallback-bc: ${hex(tokens['base-content'])};
  --in: ${toOklchValue(tokens.info)};
  --fallback-in: ${hex(tokens.info)};
  --inc: ${toOklchValue(tokens['info-content'])};
  --fallback-inc: ${hex(tokens['info-content'])};
  --su: ${toOklchValue(tokens.success)};
  --fallback-su: ${hex(tokens.success)};
  --suc: ${toOklchValue(tokens['success-content'])};
  --fallback-suc: ${hex(tokens['success-content'])};
  --wa: ${toOklchValue(tokens.warning)};
  --fallback-wa: ${hex(tokens.warning)};
  --wac: ${toOklchValue(tokens['warning-content'])};
  --fallback-wac: ${hex(tokens['warning-content'])};
  --er: ${toOklchValue(tokens.error)};
  --fallback-er: ${hex(tokens.error)};
  --erc: ${toOklchValue(tokens['error-content'])};
  --fallback-erc: ${hex(tokens['error-content'])};`;

  if (fontConfig?.bodyFont) {
    css += `\n  font-family: ${fontConfig.bodyFont};`;
  }
  
  css += `\n}`;

  if (fontConfig?.headingFont) {
    css += `\n\n[data-theme="${slug}"] h1,
[data-theme="${slug}"] h2,
[data-theme="${slug}"] h3,
[data-theme="${slug}"] h4,
[data-theme="${slug}"] h5,
[data-theme="${slug}"] h6 {
  font-family: ${fontConfig.headingFont};`;
    if (fontConfig.headingWeight) {
      css += `\n  font-weight: ${fontConfig.headingWeight};`;
    }
    css += `\n}`;
  }

  return css;
}

/**
 * Extract Google Font names from font family strings
 * E.g., "Roboto, sans-serif" -> "Roboto"
 */
export function extractGoogleFontNames(fontConfig?: DaisyFontConfig | null): string[] {
  if (!fontConfig) return [];
  
  const fonts: string[] = [];
  
  // Extract from bodyFont
  if (fontConfig.bodyFont) {
    const firstFont = fontConfig.bodyFont.split(',')[0].trim().replace(/['"]/g, '');
    if (firstFont && !isSystemFont(firstFont)) {
      fonts.push(firstFont);
    }
  }
  
  // Extract from headingFont
  if (fontConfig.headingFont) {
    const firstFont = fontConfig.headingFont.split(',')[0].trim().replace(/['"]/g, '');
    if (firstFont && !isSystemFont(firstFont) && !fonts.includes(firstFont)) {
      fonts.push(firstFont);
    }
  }
  
  return fonts;
}

/**
 * Check if a font is a system font (no need to import)
 */
function isSystemFont(fontName: string): boolean {
  const systemFonts = [
    'system-ui', 'sans-serif', 'serif', 'monospace', 'cursive', 'fantasy',
    'arial', 'helvetica', 'times', 'courier', 'verdana', 'georgia', 'palatino',
    'garamond', 'bookman', 'comic sans ms', 'trebuchet ms', 'impact'
  ];
  return systemFonts.includes(fontName.toLowerCase());
}

/**
 * Default font weights to import from Google Fonts
 */
const DEFAULT_FONT_WEIGHTS = ['300', '400', '500', '600', '700', '800', '900'];

/**
 * Generate Google Fonts import URL
 */
export function generateGoogleFontsImport(fonts: string[], weights: string[] = DEFAULT_FONT_WEIGHTS): string {
  if (fonts.length === 0) return '';
  
  const fontParams = fonts
    .map(font => {
      const fontName = font.replace(/ /g, '+');
      const weightParam = weights.join(';');
      return `family=${fontName}:wght@${weightParam}`;
    })
    .join('&');
  
  return `@import url('https://fonts.googleapis.com/css2?${fontParams}&display=swap');`;
}

export function slugify(name: string): string {
  const normalized = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');

  return normalized || 'theme';
}

export interface ThemeUsage {
  pageThemes: number;
  pageTemplates: number;
  totalUsages: number;
}

export async function getThemeUsage(themeSlug: string): Promise<ThemeUsage> {
  // Check page_themes table for usage
  // Note: Using .eq() method for proper parameterization
  const { data: pageThemesData, error: pageThemesError } = await supabase
    .from('page_themes')
    .select('id')
    .eq('css->>daisyTheme', themeSlug);
  
  if (pageThemesError && !pageThemesError.message.includes('does not exist')) {
    console.warn('Error checking page_themes:', pageThemesError);
  }
  
  const pageThemesCount = pageThemesData?.length || 0;
  
  // Check page_templates for usage (if theme_id column exists)
  const pageTemplatesCount = 0;
  // This would require joining with daisyui_themes table
  // For now, we'll implement a basic check
  
  return {
    pageThemes: pageThemesCount,
    pageTemplates: pageTemplatesCount,
    totalUsages: pageThemesCount + pageTemplatesCount,
  };
}

export class ThemeError extends Error {
  constructor(
    message: string,
    public code: 'DUPLICATE' | 'IN_USE' | 'NOT_FOUND' | 'INVALID' | 'FORBIDDEN',
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'ThemeError';
  }
}

export async function createCustomThemeWithValidation(
  name: string,
  slug: string,
  tokens: DaisyThemeTokens,
  userId: string,
  existingThemes: DaisyTheme[],
  fontConfig?: DaisyFontConfig | null
): Promise<DaisyTheme> {
  // Check for duplicate slug
  const duplicateSlug = existingThemes.find(t => t.slug === slug);
  if (duplicateSlug) {
    throw new ThemeError('Un thème avec ce slug existe déjà', 'DUPLICATE', 409);
  }

  // Check for identical tokens
  const identicalTokens = existingThemes.find(t => !tokensAreDifferent(t.tokens, tokens));
  if (identicalTokens) {
    throw new ThemeError(
      `Un thème avec des tokens identiques existe déjà: "${identicalTokens.name}"`,
      'DUPLICATE',
      409
    );
  }

  return await createCustomTheme(name, slug, tokens, userId, fontConfig);
}

export async function updateCustomThemeWithValidation(
  id: string,
  updates: { name?: string; slug?: string; tokens?: DaisyThemeTokens; font_config?: DaisyFontConfig | null },
  existingThemes: DaisyTheme[]
): Promise<void> {
  const theme = existingThemes.find(t => t.id === id);
  if (!theme) {
    throw new ThemeError('Thème non trouvé', 'NOT_FOUND', 404);
  }

  if (theme.source !== 'custom') {
    throw new ThemeError('Impossible de modifier un thème officiel', 'FORBIDDEN', 403);
  }

  // Check for duplicate slug if slug is being updated
  if (updates.slug && updates.slug !== theme.slug) {
    const duplicateSlug = existingThemes.find(t => t.id !== id && t.slug === updates.slug);
    if (duplicateSlug) {
      throw new ThemeError('Un thème avec ce slug existe déjà', 'DUPLICATE', 409);
    }
  }

  // Check for identical tokens if tokens are being updated
  if (updates.tokens) {
    const identicalTokens = existingThemes.find(
      t => t.id !== id && !tokensAreDifferent(t.tokens, updates.tokens!)
    );
    if (identicalTokens) {
      throw new ThemeError(
        `Un thème avec des tokens identiques existe déjà: "${identicalTokens.name}"`,
        'DUPLICATE',
        409
      );
    }
  }

  await updateCustomTheme(id, updates);
}

export async function deleteCustomThemeWithValidation(
  id: string,
  theme: DaisyTheme,
  force: boolean = false
): Promise<{ success: boolean; usage?: ThemeUsage }> {
  if (theme.source !== 'custom') {
    throw new ThemeError('Impossible de supprimer un thème officiel', 'FORBIDDEN', 403);
  }

  const usage = await getThemeUsage(theme.slug);
  
  if (usage.totalUsages > 0 && !force) {
    return {
      success: false,
      usage,
    };
  }

  await deleteCustomTheme(id);
  return { success: true };
}
