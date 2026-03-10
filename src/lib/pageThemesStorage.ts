import { PageTheme } from './pageThemes';
import { api } from './api';

const STORAGE_KEY = 'custom_page_themes';

export async function loadAllThemes(): Promise<PageTheme[]> {
  try {
    const { data, error } = await api.themes.page.list();
    if (error) throw error;

    return (data || []).map((row: any) => ({
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
    const { data: userData, error: userError } = await api.auth.getUser();
    if (userError || !userData) return [];

    // All page themes are returned, filter client-side by user
    const { data, error } = await api.themes.page.list();
    if (error) throw error;

    return (data || [])
      .filter((row: any) => row.user_id === userData.id)
      .map((row: any) => ({
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
    const { data: userData, error: userError } = await api.auth.getUser();
    if (userError || !userData) throw new Error('User not authenticated');

    const isExisting = await getThemeById(theme.id);

    if (isExisting) {
      const { error } = await api.themes.page.save({
        id: theme.id,
        name: theme.name,
        description: theme.description,
        css: theme.css,
      });
      if (error) throw error;
    } else {
      const { error } = await api.themes.page.save({
        name: theme.name,
        description: theme.description,
        css: theme.css,
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
    const { data: userData, error: userError } = await api.auth.getUser();
    if (userError || !userData) throw new Error('User not authenticated');

    const { error } = await api.themes.page.delete(themeId);
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
    const { data, error } = await api.themes.page.getById(id);
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
    const { data, error } = await api.themes.page.isCustom(themeId);
    if (error) throw error;
    return data?.is_custom ?? false;
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

    const { data, error } = await api.themes.page.migrate();
    if (error) {
      return { success: false, count: 0, message: error.message || 'Migration failed' };
    }

    if (data?.success) {
      localStorage.removeItem(STORAGE_KEY);
    }

    return data || { success: true, count: 0, message: 'No themes to migrate' };
  } catch (error) {
    console.error('Error migrating themes:', error);
    return {
      success: false,
      count: 0,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
