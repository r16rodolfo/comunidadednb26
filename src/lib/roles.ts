import { UserRole } from '@/types/auth';

export const getRoleLabel = (role: UserRole): string => {
  switch (role) {
    case UserRole.ADMIN: return 'Admin';
    case UserRole.PREMIUM: return 'Premium';
    case UserRole.FREE: return 'Gratuito';
  }
};

export const getRoleFullLabel = (role: UserRole): string => {
  switch (role) {
    case UserRole.ADMIN: return 'Administrador Master';
    case UserRole.PREMIUM: return 'Assinante Premium';
    case UserRole.FREE: return 'Assinante Gratuito';
  }
};

export const getRoleBadgeVariant = (role: UserRole): 'destructive' | 'secondary' | 'outline' => {
  switch (role) {
    case UserRole.ADMIN: return 'destructive';
    case UserRole.PREMIUM: return 'secondary';
    case UserRole.FREE: return 'outline';
  }
};
