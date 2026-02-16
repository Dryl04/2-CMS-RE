import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  DaisyTheme,
  DaisyThemeTokens,
  loadAllDaisyThemes,
  loadActiveTheme,
  setActiveTheme as setActiveThemeDB,
  createCustomTheme,
  updateCustomTheme,
  deleteCustomTheme,
  tokensAreDifferent,
  generateCustomThemeCSS,
} from '../lib/daisyThemes';
import { useAuth } from './AuthContext';

interface DaisyThemeContextType {
  themes: DaisyTheme[];
  activeTheme: DaisyTheme | null;
  loading: boolean;
  error: string | null;
  setActiveTheme: (themeId: string) => Promise<void>;
  createTheme: (name: string, slug: string, tokens: DaisyThemeTokens) => Promise<DaisyTheme>;
  updateTheme: (id: string, updates: { name?: string; slug?: string; tokens?: DaisyThemeTokens }) => Promise<void>;
  removeTheme: (id: string) => Promise<void>;
  refreshThemes: () => Promise<void>;
  getThemeBySlug: (slug: string) => DaisyTheme | undefined;
  isThemeInUse: (themeId: string) => boolean;
}

const DaisyThemeContext = createContext<DaisyThemeContextType | undefined>(undefined);

let customStyleEl: HTMLStyleElement | null = null;

function applyThemeToDocument(slug: string) {
  document.documentElement.setAttribute('data-theme', slug);
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

  const css = customThemes.map(t => generateCustomThemeCSS(t.slug, t.tokens)).join('\n\n');

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
        applyThemeToDocument(active.slug);
      }
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
        applyThemeToDocument(theme.slug);
        setThemes(prev => prev.map(t => ({ ...t, is_active: t.id === themeId })));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set active theme');
      throw err;
    }
  };

  const createTheme = async (name: string, slug: string, tokens: DaisyThemeTokens): Promise<DaisyTheme> => {
    try {
      setError(null);
      if (!profile) throw new Error('Not authenticated');

      const duplicate = themes.find(t => t.slug === slug);
      if (duplicate) throw new Error('Un thème avec ce slug existe déjà');

      const identicalTokens = themes.find(t => !tokensAreDifferent(t.tokens, tokens));
      if (identicalTokens) throw new Error('Un thème avec des tokens identiques existe déjà');

      const newTheme = await createCustomTheme(name, slug, tokens, profile.id);
      await refreshThemes();
      return newTheme;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create theme');
      throw err;
    }
  };

  const updateTheme = async (id: string, updates: { name?: string; slug?: string; tokens?: DaisyThemeTokens }) => {
    try {
      setError(null);
      const theme = themes.find(t => t.id === id);
      if (!theme || theme.source !== 'custom') throw new Error('Cannot update official themes');

      if (updates.tokens) {
        const identicalTokens = themes.find(t => t.id !== id && !tokensAreDifferent(t.tokens, updates.tokens!));
        if (identicalTokens) throw new Error('Un thème avec des tokens identiques existe déjà');
      }

      await updateCustomTheme(id, updates);
      await refreshThemes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update theme');
      throw err;
    }
  };

  const removeTheme = async (id: string) => {
    try {
      setError(null);
      const theme = themes.find(t => t.id === id);
      if (!theme || theme.source !== 'custom') throw new Error('Cannot delete official themes');

      if (theme.is_active) {
        const fallback = themes.find(t => t.slug === 'light') || themes[0];
        if (fallback) await setActiveTheme(fallback.id);
      }

      await deleteCustomTheme(id);
      await refreshThemes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete theme');
      throw err;
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
