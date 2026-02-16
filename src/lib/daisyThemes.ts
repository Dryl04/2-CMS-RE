import { supabase } from './supabase';

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

export interface DaisyTheme {
  id: string;
  name: string;
  slug: string;
  source: 'daisyui' | 'custom';
  tokens: DaisyThemeTokens;
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

export async function loadAllDaisyThemes(): Promise<DaisyTheme[]> {
  const { data, error } = await supabase
    .from('daisyui_themes')
    .select('*')
    .order('source')
    .order('name');

  if (error) throw error;
  return data || [];
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
  userId: string
): Promise<DaisyTheme> {
  const { data, error } = await supabase
    .from('daisyui_themes')
    .insert({ name, slug, source: 'custom', tokens, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCustomTheme(
  id: string,
  updates: { name?: string; slug?: string; tokens?: DaisyThemeTokens }
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

export function generateCustomThemeCSS(slug: string, tokens: DaisyThemeTokens): string {
  return `[data-theme="${slug}"] {
  --p: ${tokens.primary};
  --pc: ${tokens['primary-content']};
  --s: ${tokens.secondary};
  --sc: ${tokens['secondary-content']};
  --a: ${tokens.accent};
  --ac: ${tokens['accent-content']};
  --n: ${tokens.neutral};
  --nc: ${tokens['neutral-content']};
  --b1: ${tokens['base-100']};
  --b2: ${tokens['base-200']};
  --b3: ${tokens['base-300']};
  --bc: ${tokens['base-content']};
  --in: ${tokens.info};
  --inc: ${tokens['info-content']};
  --su: ${tokens.success};
  --suc: ${tokens['success-content']};
  --wa: ${tokens.warning};
  --wac: ${tokens['warning-content']};
  --er: ${tokens.error};
  --erc: ${tokens['error-content']};
}`;
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
