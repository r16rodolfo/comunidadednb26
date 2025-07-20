
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { UserProfile, AuthState, LoginCredentials, RegisterData, UserRole } from '@/types/auth';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock data for demonstration
const mockUsers: UserProfile[] = [
  {
    id: '1',
    email: 'admin@dnb.com',
    name: 'Administrador Master',
    role: UserRole.ADMIN,
    permissions: [
      { id: 'all', name: 'All Permissions', description: 'Full system access' }
    ],
    preferences: { theme: 'light', notifications: true, language: 'pt-BR' },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    email: 'gestor@dnb.com',
    name: 'Gestor DNB',
    role: UserRole.MANAGER,
    permissions: [
      { id: 'manage_users', name: 'Manage Users', description: 'Manage platform users' },
      { id: 'manage_content', name: 'Manage Content', description: 'Manage courses and products' }
    ],
    preferences: { theme: 'light', notifications: true, language: 'pt-BR' },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    email: 'premium@dnb.com',
    name: 'Usuario Premium',
    role: UserRole.PREMIUM,
    permissions: [],
    subscription: {
      plan: 'premium',
      status: 'active',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      startedAt: new Date()
    },
    preferences: { theme: 'light', notifications: true, language: 'pt-BR' },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  useEffect(() => {
    // Check for stored user data
    const storedUser = localStorage.getItem('dnb_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false
        });
      } catch {
        localStorage.removeItem('dnb_user');
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    // Mock authentication
    const user = mockUsers.find(u => u.email === credentials.email);
    if (user) {
      localStorage.setItem('dnb_user', JSON.stringify(user));
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false
      });
    } else {
      throw new Error('Credenciais inválidas');
    }
  };

  const register = async (data: RegisterData) => {
    // Mock registration
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
    setAuthState({
      user: newUser,
      isAuthenticated: true,
      isLoading: false
    });
  };

  const logout = () => {
    localStorage.removeItem('dnb_user');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
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

  const value: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    updateProfile,
    hasPermission,
    hasRole
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
