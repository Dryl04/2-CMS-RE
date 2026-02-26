import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  DaisyTheme,
  DaisyThemeTokens,
  DaisyFontConfig,
  loadAllDaisyThemes,
  setActiveTheme as setActiveThemeDB,
  createCustomThemeWithValidation,
  updateCustomThemeWithValidation,
  deleteCustomThemeWithValidation,
  ThemeError,
  ThemeUsage,
  generateCustomThemeCSS,
} from '@/lib/daisyThemes';
import { useAuth } from './AuthContext';

interface DaisyThemeContextType {
  themes: DaisyTheme[];
  activeTheme: DaisyTheme | null;
  loading: boolean;
  error: string | null;
  setActiveTheme: (themeId: string) => Promise<void>;
  createTheme: (name: string, slug: string, tokens: DaisyThemeTokens, fontConfig?: DaisyFontConfig | null) => Promise<DaisyTheme>;
  updateTheme: (id: string, updates: { name?: string; slug?: string; tokens?: DaisyThemeTokens; font_config?: DaisyFontConfig | null }) => Promise<void>;
  removeTheme: (id: string, force?: boolean) => Promise<{ success: boolean; usage?: ThemeUsage }>;
  refreshThemes: () => Promise<void>;
  getThemeBySlug: (slug: string) => DaisyTheme | undefined;
  isThemeInUse: (themeId: string) => boolean;
}

const DaisyThemeContext = createContext<DaisyThemeContextType | undefined>(undefined);

let customStyleEl: HTMLStyleElement | null = null;

function applyPlatformBaseTheme() {
  document.documentElement.setAttribute('data-theme', 'light');
}

function injectCustomThemeCSS(themes: DaisyTheme[]) {
  const customThemes = themes.filter(t => t.source === 'custom');
  if (customThemes.length === 0) {
    if (customStyleEl) {
      customStyleEl.remove();
      customStyleEl = null;
    }
    return;
  }

  const css = customThemes.map(t => generateCustomThemeCSS(t.slug, t.tokens, t.font_config)).join('\n\n');

  if (!customStyleEl) {
    customStyleEl = document.createElement('style');
    customStyleEl.id = 'daisy-custom-themes';
    document.head.appendChild(customStyleEl);
  }
  customStyleEl.textContent = css;
}

export function DaisyThemeProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const [themes, setThemes] = useState<DaisyTheme[]>([]);
  const [activeTheme, setActiveThemeState] = useState<DaisyTheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    applyPlatformBaseTheme();
  }, []);

  const refreshThemes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const allThemes = await loadAllDaisyThemes();
      setThemes(allThemes);
      injectCustomThemeCSS(allThemes);

      const active = allThemes.find(t => t.is_active) || allThemes.find(t => t.slug === 'light') || allThemes[0];
      if (active) {
        setActiveThemeState(active);
      }
      applyPlatformBaseTheme();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load themes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (profile) {
      refreshThemes();
    } else {
      setThemes([]);
      setActiveThemeState(null);
      setLoading(false);
    }
  }, [profile, refreshThemes]);

  const setActiveTheme = async (themeId: string) => {
    try {
      setError(null);
      await setActiveThemeDB(themeId);
      const theme = themes.find(t => t.id === themeId);
      if (theme) {
        setActiveThemeState(theme);
        applyPlatformBaseTheme();
        setThemes(prev => prev.map(t => ({ ...t, is_active: t.id === themeId })));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set active theme');
      throw err;
    }
  };

  const createTheme = async (name: string, slug: string, tokens: DaisyThemeTokens, fontConfig?: DaisyFontConfig | null): Promise<DaisyTheme> => {
    try {
      setError(null);
      if (!profile) throw new Error('Not authenticated');

      const newTheme = await createCustomThemeWithValidation(name, slug, tokens, profile.id, themes, fontConfig);
      await refreshThemes();
      return newTheme;
    } catch (err) {
      if (err instanceof ThemeError) {
        setError(err.message);
        throw err;
      }
      const message = err instanceof Error ? err.message : 'Failed to create theme';
      setError(message);
      throw new Error(message);
    }
  };

  const updateTheme = async (id: string, updates: { name?: string; slug?: string; tokens?: DaisyThemeTokens; font_config?: DaisyFontConfig | null }) => {
    try {
      setError(null);
      await updateCustomThemeWithValidation(id, updates, themes);
      await refreshThemes();
    } catch (err) {
      if (err instanceof ThemeError) {
        setError(err.message);
        throw err;
      }
      const message = err instanceof Error ? err.message : 'Failed to update theme';
      setError(message);
      throw new Error(message);
    }
  };

  const removeTheme = async (id: string, force: boolean = false): Promise<{ success: boolean; usage?: ThemeUsage }> => {
    try {
      setError(null);
      const theme = themes.find(t => t.id === id);
      if (!theme) throw new Error('Theme not found');

      const result = await deleteCustomThemeWithValidation(id, theme, force);
      
      if (!result.success) {
        // Theme is in use, return usage info
        return result;
      }

      // If the deleted theme was active, switch to light theme
      if (theme.is_active) {
        const fallback = themes.find(t => t.slug === 'light') || themes[0];
        if (fallback && fallback.id !== id) {
          await setActiveTheme(fallback.id);
        }
      }

      await refreshThemes();
      return { success: true };
    } catch (err) {
      if (err instanceof ThemeError) {
        setError(err.message);
        throw err;
      }
      const message = err instanceof Error ? err.message : 'Failed to delete theme';
      setError(message);
      throw new Error(message);
    }
  };

  const getThemeBySlug = (slug: string) => themes.find(t => t.slug === slug);
  const isThemeInUse = (themeId: string) => activeTheme?.id === themeId;

  return (
    <DaisyThemeContext.Provider
      value={{
        themes,
        activeTheme,
        loading,
        error,
        setActiveTheme,
        createTheme,
        updateTheme,
        removeTheme,
        refreshThemes,
        getThemeBySlug,
        isThemeInUse,
      }}
    >
      {children}
    </DaisyThemeContext.Provider>
  );
}

export function useDaisyTheme() {
  const context = useContext(DaisyThemeContext);
  if (context === undefined) {
    throw new Error('useDaisyTheme must be used within a DaisyThemeProvider');
  }
  return context;
}
