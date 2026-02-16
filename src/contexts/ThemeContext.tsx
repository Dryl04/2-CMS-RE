import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme } from '../lib/themeTypes';
import { supabase } from '../lib/supabase';
import { defaultThemes } from '../lib/defaultThemes';

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
      const { data, error: fetchError } = await supabase
        .from('themes')
        .select('*')
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: true });

      if (fetchError) {
        console.error('Error fetching themes:', fetchError);
        if (fetchError.message.includes('Could not find the table')) {
          setThemes(defaultThemes);
          if (!currentTheme) {
            const defaultTheme = defaultThemes.find(t => t.is_default) || defaultThemes[0];
            setCurrentTheme(defaultTheme);
          }
        } else {
          setError(fetchError.message);
        }
        return;
      }

      setThemes(data || []);

      if (!currentTheme && data && data.length > 0) {
        const defaultTheme = data.find(t => t.is_default) || data[0];
        setCurrentTheme(defaultTheme);
      }
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

      const themesToInsert = defaultThemes.map(theme => ({
        name: theme.name,
        description: theme.description,
        colors: theme.colors,
        typography: theme.typography,
        spacing: theme.spacing,
        components: theme.components,
        user_id: null,
        is_default: theme.is_default,
      }));

      const { data, error: insertError } = await supabase
        .from('themes')
        .insert(themesToInsert)
        .select();

      if (insertError) {
        console.error('Error initializing themes:', insertError);
        setError(insertError.message);
        throw insertError;
      }

      console.log('Default themes initialized successfully');
      await fetchThemes();
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('themes')
        .insert([{
          ...themeData,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;

      setThemes(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Error creating theme:', error);
      return null;
    }
  };

  const updateTheme = async (id: string, updates: Partial<Theme>) => {
    try {
      const { error } = await supabase
        .from('themes')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      setThemes(prev =>
        prev.map(theme => (theme.id === id ? { ...theme, ...updates } : theme))
      );

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
      const { error } = await supabase
        .from('themes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setThemes(prev => prev.filter(theme => theme.id !== id));

      if (currentTheme?.id === id) {
        const nextTheme = themes.find(t => t.id !== id && t.is_default) || themes.find(t => t.id !== id);
        setCurrentTheme(nextTheme || null);
      }
    } catch (error) {
      console.error('Error deleting theme:', error);
      throw error;
    }
  };

  const applyThemeToPage = async (pageId: string, themeId: string) => {
    try {
      const { error } = await supabase
        .from('page_templates')
        .update({ theme_id: themeId })
        .eq('id', pageId);

      if (error) throw error;
    } catch (error) {
      console.error('Error applying theme to page:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchThemes();
  }, []);

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
