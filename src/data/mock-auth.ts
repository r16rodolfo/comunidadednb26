import { UserProfile, UserRole } from '@/types/auth';

export const mockUsers: UserProfile[] = [
  {
    id: '1',
    email: 'admin@dnb.com',
    name: 'Administrador Master',
    role: UserRole.ADMIN,
    permissions: [
      { id: 'all', name: 'All Permissions', description: 'Full system access' },
    ],
    preferences: { theme: 'light', notifications: true, language: 'pt-BR' },
    createdAt: new Date(),
    updatedAt: new Date(),
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
      startedAt: new Date(),
    },
    preferences: { theme: 'light', notifications: true, language: 'pt-BR' },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
