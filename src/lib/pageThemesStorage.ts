import { PageTheme } from './pageThemes';
import { supabase } from './supabase';

const STORAGE_KEY = 'custom_page_themes';

export async function loadAllThemes(): Promise<PageTheme[]> {
  try {
    const { data, error } = await supabase
      .from('page_themes')
      .select('*')
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(row => ({
      id: row.id,
      name: row.name,
      description: row.description || '',
      css: row.css,
    }));
  } catch (error) {
    console.error('Error loading themes:', error);
    return [];
  }
}

export async function loadCustomThemes(): Promise<PageTheme[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('page_themes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(row => ({
      id: row.id,
      name: row.name,
      description: row.description || '',
      css: row.css,
    }));
  } catch (error) {
    console.error('Error loading custom themes:', error);
    return [];
  }
}

export async function saveCustomTheme(theme: PageTheme): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const isExisting = await getThemeById(theme.id);

    if (isExisting) {
      const { error } = await supabase
        .from('page_themes')
        .update({
          name: theme.name,
          description: theme.description,
          css: theme.css,
          updated_at: new Date().toISOString(),
        })
        .eq('id', theme.id)
        .eq('user_id', user.id);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('page_themes')
        .insert({
          name: theme.name,
          description: theme.description,
          css: theme.css,
          user_id: user.id,
          is_default: false,
        });

      if (error) throw error;
    }
  } catch (error) {
    console.error('Error saving custom theme:', error);
    throw error;
  }
}

export async function deleteCustomTheme(themeId: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('page_themes')
      .delete()
      .eq('id', themeId)
      .eq('user_id', user.id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting custom theme:', error);
    throw error;
  }
}

export function getAllThemes(): PageTheme[] {
  return [];
}

export async function getThemeById(id: string): Promise<PageTheme | null> {
  try {
    const { data, error } = await supabase
      .from('page_themes')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      css: data.css,
    };
  } catch (error) {
    console.error('Error loading theme:', error);
    return null;
  }
}

export async function isCustomTheme(themeId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('page_themes')
      .select('user_id')
      .eq('id', themeId)
      .maybeSingle();

    if (error) throw error;
    return data?.user_id !== null;
  } catch (error) {
    console.error('Error checking custom theme:', error);
    return false;
  }
}

export function createEmptyTheme(): PageTheme {
  return {
    id: `temp-${Date.now()}`,
    name: 'Nouveau thème',
    description: 'Thème personnalisé',
    css: {
      bodyFont: 'Inter, system-ui, sans-serif',
      headingFont: 'Inter, system-ui, sans-serif',
      backgroundColor: '#ffffff',
      primaryColor: '#3b82f6',
      secondaryColor: '#8b5cf6',
      accentColor: '#10b981',
      textColor: '#1f2937',
      headingColor: '#111827',
      textBase: '16px',
      textSm: '14px',
      textLg: '18px',
      h1Size: '48px',
      h2Size: '36px',
      h3Size: '30px',
      h4Size: '24px',
      textWeight: '400',
      headingWeight: '700',
    },
  };
}

export async function migrateLocalStorageThemes(): Promise<{ success: boolean; count: number; message: string }> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { success: true, count: 0, message: 'No themes to migrate' };
    }

    const themes = JSON.parse(stored) as PageTheme[];
    if (themes.length === 0) {
      return { success: true, count: 0, message: 'No themes to migrate' };
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, count: 0, message: 'User not authenticated' };
    }

    let migrated = 0;
    for (const theme of themes) {
      try {
        const { error } = await supabase
          .from('page_themes')
          .insert({
            name: theme.name,
            description: theme.description,
            css: theme.css,
            user_id: user.id,
            is_default: false,
          });

        if (!error) {
          migrated++;
        }
      } catch (err) {
        console.error('Error migrating theme:', theme.name, err);
      }
    }

    if (migrated > 0) {
      localStorage.removeItem(STORAGE_KEY);
    }

    return {
      success: true,
      count: migrated,
      message: `Successfully migrated ${migrated} theme(s)`,
    };
  } catch (error) {
    console.error('Error migrating themes:', error);
    return {
      success: false,
      count: 0,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
