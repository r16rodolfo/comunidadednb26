
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, AuthState, LoginCredentials, RegisterData, UserRole } from '@/types/auth';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<UserProfile>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: UserRole) => boolean;
  viewAsUser: boolean;
  setViewAsUser: (value: boolean) => void;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const roleHierarchy: Record<string, number> = {
  admin: 1,
  gestor: 2,
  premium: 3,
  free: 4,
};

async function fetchUserProfile(supaUser: User): Promise<UserProfile> {
  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', supaUser.id)
    .maybeSingle();

  // Fetch roles
  const { data: roles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', supaUser.id);

  // Determine primary role (highest privilege)
  let primaryRole = UserRole.FREE;
  if (roles && roles.length > 0) {
    const sorted = roles.sort((a: any, b: any) => 
      (roleHierarchy[a.role] || 99) - (roleHierarchy[b.role] || 99)
    );
    primaryRole = sorted[0].role as UserRole;
  }

  return {
    id: supaUser.id,
    email: supaUser.email || '',
    name: profile?.name || supaUser.user_metadata?.name || supaUser.user_metadata?.full_name || '',
    avatar: profile?.avatar_url || supaUser.user_metadata?.avatar_url,
    role: primaryRole,
    permissions: [],
    preferences: { theme: 'light', notifications: true, language: 'pt-BR' },
    createdAt: new Date(supaUser.created_at),
    updatedAt: new Date(profile?.updated_at || supaUser.created_at),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const [session, setSession] = useState<Session | null>(null);
  const [viewAsUser, setViewAsUser] = useState(false);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        
        if (session?.user) {
          // Defer Supabase calls with setTimeout to avoid deadlock
          setTimeout(async () => {
            try {
              const profile = await fetchUserProfile(session.user);
              setAuthState({ user: profile, isAuthenticated: true, isLoading: false });
            } catch (error) {
              console.error('Error fetching profile, using fallback:', error);
              // Fallback: keep user authenticated with minimal profile
              const fallbackProfile: UserProfile = {
                id: session.user.id,
                email: session.user.email || '',
                name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || '',
                avatar: session.user.user_metadata?.avatar_url,
                role: UserRole.FREE,
                permissions: [],
                preferences: { theme: 'light', notifications: true, language: 'pt-BR' },
                createdAt: new Date(session.user.created_at),
                updatedAt: new Date(),
              };
              setAuthState({ user: fallbackProfile, isAuthenticated: true, isLoading: false });
            }
          }, 0);
        } else {
          setAuthState({ user: null, isAuthenticated: false, isLoading: false });
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user).then(profile => {
          setAuthState({ user: profile, isAuthenticated: true, isLoading: false });
        }).catch((error) => {
          console.error('Error fetching profile on init, using fallback:', error);
          const fallbackProfile: UserProfile = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || '',
            avatar: session.user.user_metadata?.avatar_url,
            role: UserRole.FREE,
            permissions: [],
            preferences: { theme: 'light', notifications: true, language: 'pt-BR' },
            createdAt: new Date(session.user.created_at),
            updatedAt: new Date(),
          };
          setAuthState({ user: fallbackProfile, isAuthenticated: true, isLoading: false });
        });
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<UserProfile> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Erro ao fazer login');

    const profile = await fetchUserProfile(data.user);
    setAuthState({ user: profile, isAuthenticated: true, isLoading: false });
    return profile;
  };

  const register = async (data: RegisterData) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name: data.name,
        },
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        throw new Error('Este e-mail já está cadastrado. Tente fazer login.');
      }
      throw new Error(error.message);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setAuthState({ user: null, isAuthenticated: false, isLoading: false });
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/login`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) throw new Error(error.message);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!authState.user) return;
    
    const { error } = await supabase
      .from('profiles')
      .update({
        name: data.name,
        avatar_url: data.avatar,
      })
      .eq('user_id', authState.user.id);

    if (error) throw new Error(error.message);

    const updatedUser = { ...authState.user, ...data, updatedAt: new Date() };
    setAuthState(prev => ({ ...prev, user: updatedUser }));
  };

  const hasPermission = (permission: string): boolean => {
    if (!authState.user) return false;
    if (authState.user.role === UserRole.ADMIN) return true;
    return authState.user.permissions.some(p => p.id === permission);
  };

  const hasRole = (role: UserRole): boolean => {
    if (!authState.user) return false;
    if (authState.user.role === UserRole.ADMIN) return true;
    if (role === UserRole.GESTOR && authState.user.role === UserRole.GESTOR) return true;
    if (role === UserRole.PREMIUM && (authState.user.role === UserRole.PREMIUM || authState.user.role === UserRole.GESTOR)) return true;
    return authState.user.role === role;
  };

  const value: AuthContextType = {
    ...authState,
    login, register, logout, updateProfile,
    hasPermission, hasRole,
    viewAsUser, setViewAsUser,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
