import { UserRole } from '@/types/auth';

export const getRoleLabel = (role: UserRole): string => {
  switch (role) {
    case UserRole.ADMIN: return 'Admin';
    case UserRole.GESTOR: return 'Gestor';
    case UserRole.PREMIUM: return 'Premium';
    case UserRole.FREE: return 'Gratuito';
  }
};

export const getRoleFullLabel = (role: UserRole): string => {
  switch (role) {
    case UserRole.ADMIN: return 'Administrador Master';
    case UserRole.GESTOR: return 'Gestor de Conteúdo';
    case UserRole.PREMIUM: return 'Assinante Premium';
    case UserRole.FREE: return 'Assinante Gratuito';
  }
};

export const getRoleBadgeVariant = (role: UserRole): 'destructive' | 'secondary' | 'outline' | 'default' => {
  switch (role) {
    case UserRole.ADMIN: return 'destructive';
    case UserRole.GESTOR: return 'default';
    case UserRole.PREMIUM: return 'secondary';
    case UserRole.FREE: return 'outline';
  }
};
