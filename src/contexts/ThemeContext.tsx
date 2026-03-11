import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme } from '@/lib/themeTypes';
import { defaultThemes } from '@/lib/defaultThemes';

const THEMES_STORAGE_KEY = 'cms_legacy_themes';
const CURRENT_THEME_STORAGE_KEY = 'cms_legacy_current_theme_id';

function buildDefaultThemes(): Theme[] {
  const now = new Date().toISOString();
  return defaultThemes.map((theme, index) => ({
    ...theme,
    id: `legacy-theme-${index + 1}`,
    created_at: now,
    updated_at: now,
  }));
}

function readStoredThemes(): Theme[] {
  if (typeof localStorage === 'undefined') {
    return buildDefaultThemes();
  }

  try {
    const raw = localStorage.getItem(THEMES_STORAGE_KEY);
    if (!raw) {
      return buildDefaultThemes();
    }

    const parsed = JSON.parse(raw) as Theme[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : buildDefaultThemes();
  } catch {
    return buildDefaultThemes();
  }
}

function persistThemes(themes: Theme[]) {
  if (typeof localStorage === 'undefined') {
    return;
  }

  localStorage.setItem(THEMES_STORAGE_KEY, JSON.stringify(themes));
}

function persistCurrentTheme(themeId: string | null) {
  if (typeof localStorage === 'undefined') {
    return;
  }

  if (!themeId) {
    localStorage.removeItem(CURRENT_THEME_STORAGE_KEY);
    return;
  }

  localStorage.setItem(CURRENT_THEME_STORAGE_KEY, themeId);
}

function readCurrentThemeId(): string | null {
  if (typeof localStorage === 'undefined') {
    return null;
  }

  return localStorage.getItem(CURRENT_THEME_STORAGE_KEY);
}

interface ThemeContextType {
  currentTheme: Theme | null;
  themes: Theme[];
  loading: boolean;
  error: string | null;
  setCurrentTheme: (theme: Theme) => void;
  fetchThemes: () => Promise<void>;
  initializeDefaultThemes: () => Promise<void>;
  createTheme: (theme: Omit<Theme, 'id' | 'created_at' | 'updated_at'>) => Promise<Theme | null>;
  updateTheme: (id: string, updates: Partial<Theme>) => Promise<void>;
  deleteTheme: (id: string) => Promise<void>;
  applyThemeToPage: (pageId: string, themeId: string) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(null);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchThemes = async () => {
    try {
      setLoading(true);
      setError(null);
      const storedThemes = readStoredThemes();
      setThemes(storedThemes);

      const storedCurrentThemeId = readCurrentThemeId();
      const resolvedTheme =
        storedThemes.find((theme) => theme.id === storedCurrentThemeId) ||
        storedThemes.find((theme) => theme.is_default) ||
        storedThemes[0] ||
        null;

      setCurrentTheme(resolvedTheme);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error fetching themes:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultThemes = async () => {
    try {
      setLoading(true);
      setError(null);
      const nextThemes = buildDefaultThemes();
      persistThemes(nextThemes);
      const defaultTheme = nextThemes.find((theme) => theme.is_default) || nextThemes[0] || null;
      persistCurrentTheme(defaultTheme?.id ?? null);
      setThemes(nextThemes);
      setCurrentTheme(defaultTheme);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error initializing default themes:', err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createTheme = async (themeData: Omit<Theme, 'id' | 'created_at' | 'updated_at'>): Promise<Theme | null> => {
    try {
      const nextTheme: Theme = {
        ...themeData,
        custom_css: themeData.custom_css ?? null,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setThemes(prev => {
        const nextThemes = [...prev, nextTheme];
        persistThemes(nextThemes);
        return nextThemes;
      });
      return nextTheme;
    } catch (error) {
      console.error('Error creating theme:', error);
      return null;
    }
  };

  const updateTheme = async (id: string, updates: Partial<Theme>) => {
    try {
      setThemes(prev => {
        const nextThemes = prev.map(theme => (theme.id === id ? { ...theme, ...updates, updated_at: new Date().toISOString() } : theme));
        persistThemes(nextThemes);
        return nextThemes;
      });

      if (currentTheme?.id === id) {
        setCurrentTheme(prev => (prev ? { ...prev, ...updates } : null));
      }
    } catch (error) {
      console.error('Error updating theme:', error);
      throw error;
    }
  };

  const deleteTheme = async (id: string) => {
    try {
      const nextThemes = themes.filter(theme => theme.id !== id);
      persistThemes(nextThemes);
      setThemes(nextThemes);

      if (currentTheme?.id === id) {
        const nextTheme = nextThemes.find(t => t.is_default) || nextThemes[0] || null;
        setCurrentTheme(nextTheme || null);
        persistCurrentTheme(nextTheme?.id ?? null);
      }
    } catch (error) {
      console.error('Error deleting theme:', error);
      throw error;
    }
  };

  const applyThemeToPage = async (pageId: string, themeId: string) => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(`cms_legacy_page_theme:${pageId}`, themeId);
      }
    } catch (error) {
      console.error('Error applying theme to page:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchThemes();
  }, []);

  useEffect(() => {
    persistCurrentTheme(currentTheme?.id ?? null);
  }, [currentTheme]);

  const value: ThemeContextType = {
    currentTheme,
    themes,
    loading,
    error,
    setCurrentTheme,
    fetchThemes,
    initializeDefaultThemes,
    createTheme,
    updateTheme,
    deleteTheme,
    applyThemeToPage,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
