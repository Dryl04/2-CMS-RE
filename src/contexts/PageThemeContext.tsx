import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PageTheme } from '../lib/pageThemes';
import { loadAllThemes, saveCustomTheme, deleteCustomTheme, migrateLocalStorageThemes } from '../lib/pageThemesStorage';
import { useAuth } from './AuthContext';

interface PageThemeContextType {
  pageThemes: PageTheme[];
  loading: boolean;
  error: string | null;
  refreshThemes: () => Promise<void>;
  saveTheme: (theme: PageTheme) => Promise<void>;
  deleteTheme: (themeId: string) => Promise<void>;
  migrateLegacyThemes: () => Promise<{ success: boolean; count: number; message: string }>;
}

const PageThemeContext = createContext<PageThemeContextType | undefined>(undefined);

export function PageThemeProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const [pageThemes, setPageThemes] = useState<PageTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshThemes = async () => {
    try {
      setLoading(true);
      setError(null);
      const themes = await loadAllThemes();
      setPageThemes(themes);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load themes';
      setError(message);
      console.error('Error loading themes:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveTheme = async (theme: PageTheme) => {
    try {
      setError(null);
      await saveCustomTheme(theme);
      await refreshThemes();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save theme';
      setError(message);
      throw err;
    }
  };

  const deleteTheme = async (themeId: string) => {
    try {
      setError(null);
      await deleteCustomTheme(themeId);
      await refreshThemes();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete theme';
      setError(message);
      throw err;
    }
  };

  const migrateLegacyThemes = async () => {
    try {
      setError(null);
      const result = await migrateLocalStorageThemes();
      if (result.success && result.count > 0) {
        await refreshThemes();
      }
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to migrate themes';
      return { success: false, count: 0, message };
    }
  };

  useEffect(() => {
    if (profile) {
      refreshThemes();
    } else {
      setPageThemes([]);
      setLoading(false);
    }
  }, [profile]);

  return (
    <PageThemeContext.Provider
      value={{
        pageThemes,
        loading,
        error,
        refreshThemes,
        saveTheme,
        deleteTheme,
        migrateLegacyThemes,
      }}
    >
      {children}
    </PageThemeContext.Provider>
  );
}

export function usePageTheme() {
  const context = useContext(PageThemeContext);
  if (context === undefined) {
    throw new Error('usePageTheme must be used within a PageThemeProvider');
  }
  return context;
}
