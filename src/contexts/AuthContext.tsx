import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, UserProfile, User, Session } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  requiresPasswordChange: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ error: Error | null }>;
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
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const requiresPasswordChange = Boolean(user?.must_change_password);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const timeoutId = setTimeout(() => {
          console.warn('Auth initialization timeout, proceeding anyway');
          setLoading(false);
        }, 10000);

        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          await loadUserProfile(currentSession.user.id);
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      (async () => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          await loadUserProfile(newSession.user.id);
        } else {
          setProfile(null);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('[AuthContext] Error loading user profile:', error);
        setProfile(null);
        return;
      }

      if (!data) {
        console.warn('[AuthContext] No user profile found, creating default profile');

        const { data: { user: currentUser } } = await supabase.auth.getUser();

        if (!currentUser?.email) {
          console.error('[AuthContext] Cannot create profile: no user email found');
          setProfile(null);
          return;
        }

        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert([{
            id: userId,
            email: currentUser.email,
            role: 'content_creator',
            full_name: currentUser.user_metadata?.full_name || ''
          }])
          .select()
          .single();

        if (createError) {
          console.error('[AuthContext] Error creating user profile:', createError);
          setProfile(null);
        } else {
          setProfile(newProfile);
        }
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('[AuthContext] Unexpected error loading user profile:', error);
      setProfile(null);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { error: error ? new Error(error.message) : null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || '',
          },
          emailRedirectTo: undefined,
        },
      });

      if (error) {
        return { error: new Error(error.message) };
      }

      if (data.user) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([{
            id: data.user.id,
            email: data.user.email || email,
            full_name: fullName || '',
            role: 'content_creator'
          }]);

        if (profileError) {
          console.warn('Profile creation error (may already exist):', profileError);
        }
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const { data, error } = await supabase.auth.changePassword({
        currentPassword,
        newPassword,
      });

      if (error) {
        return { error: new Error(error.message) };
      }

      setSession(data.session);
      setUser(data.user ?? null);
      if (data.user) {
        await loadUserProfile(data.user.id);
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const isAdmin = () => profile?.role === 'admin';

  const isSEOManager = () => profile?.role === 'seo_manager';

  const canManagePages = () => profile?.role === 'admin' || profile?.role === 'seo_manager';

  const value = {
    user,
    session,
    profile,
    loading,
    requiresPasswordChange,
    signIn,
    signUp,
    changePassword,
    signOut,
    isAdmin,
    isSEOManager,
    canManagePages,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
