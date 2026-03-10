import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, UserProfile } from '@/lib/api';

interface AuthContextType {
  user: UserProfile | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isAdmin: () => boolean;
  isSEOManager: () => boolean;
  canManagePages: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const timeoutId = setTimeout(() => {
          console.warn('Auth initialization timeout, proceeding anyway');
          setLoading(false);
        }, 10000);

        // If we have a stored token, validate it by fetching the current user
        if (api.auth.hasToken()) {
          const { data, error } = await api.auth.getUser();
          if (error) {
            console.warn('[AuthContext] Token invalid or expired, clearing');
            setUser(null);
            setProfile(null);
          } else if (data) {
            setUser(data);
            setProfile(data);
          }
        }

        clearTimeout(timeoutId);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes (e.g., 401 token expiry)
    const { unsubscribe } = api.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setProfile(session.user);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await api.auth.signIn(email, password);

      if (error) {
        return { error: new Error(error.message) };
      }

      if (data?.user) {
        setUser(data.user);
        setProfile(data.user);
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const { data, error } = await api.auth.signUp(email, password, fullName);

      if (error) {
        return { error: new Error(error.message) };
      }

      if (data?.user) {
        setUser(data.user);
        setProfile(data.user);
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await api.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const isAdmin = () => profile?.role === 'admin';

  const isSEOManager = () => profile?.role === 'seo_manager';

  const canManagePages = () => profile?.role === 'admin' || profile?.role === 'seo_manager';

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin,
    isSEOManager,
    canManagePages,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
