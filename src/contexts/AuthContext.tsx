
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { UserProfile, AuthState, LoginCredentials, RegisterData, UserRole } from '@/types/auth';
import { mockUsers } from '@/data/mock-auth';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<UserProfile>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: UserRole) => boolean;
  viewAsUser: boolean;
  setViewAsUser: (value: boolean) => void;
  checkSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });
  const [viewAsUser, setViewAsUser] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('dnb_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setAuthState({ user, isAuthenticated: true, isLoading: false });
      } catch {
        localStorage.removeItem('dnb_user');
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const user = mockUsers.find(u => u.email === credentials.email);
    if (user) {
      localStorage.setItem('dnb_user', JSON.stringify(user));
      setAuthState({ user, isAuthenticated: true, isLoading: false });
      return user;
    } else {
      throw new Error('Credenciais inválidas');
    }
  };

  const register = async (data: RegisterData) => {
    const newUser: UserProfile = {
      id: String(Date.now()),
      email: data.email,
      name: data.name,
      role: UserRole.FREE,
      permissions: [],
      preferences: { theme: 'light', notifications: true, language: 'pt-BR' },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    localStorage.setItem('dnb_user', JSON.stringify(newUser));
    setAuthState({ user: newUser, isAuthenticated: true, isLoading: false });
  };

  const logout = () => {
    localStorage.removeItem('dnb_user');
    setAuthState({ user: null, isAuthenticated: false, isLoading: false });
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!authState.user) return;
    const updatedUser = { ...authState.user, ...data, updatedAt: new Date() };
    localStorage.setItem('dnb_user', JSON.stringify(updatedUser));
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
    return authState.user.role === role;
  };

  const checkSubscription = async () => {
    if (!authState.user) return;
    try {
      console.log('Checking subscription for user:', authState.user.email);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const value: AuthContextType = {
    ...authState,
    login, register, logout, updateProfile,
    hasPermission, hasRole,
    viewAsUser, setViewAsUser,
    checkSubscription
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
