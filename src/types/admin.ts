
export interface PlatformConfig {
  id: string;
  siteName: string;
  siteDescription: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  maxFreeUsers: number;
  features: {
    planner: boolean;
    academy: boolean;
    achadinhos: boolean;
    analytics: boolean;
  };
  limits: {
    freeTransactions: number;
    premiumTransactions: number;
    apiCalls: number;
  };
}

export interface APIConfig {
  id: string;
  name: string;
  /** Masked key for display only (e.g. "sk-...abc1"). Raw keys must NEVER be stored in frontend state. */
  maskedKey: string;
  endpoint?: string;
  isActive: boolean;
  isConfigured: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  isActive: boolean;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  premiumUsers: number;
  freeUsers: number;
  newUsersThisMonth: number;
}

export interface FinancialStats {
  totalRevenue: number;
  monthlyRevenue: number;
  activeSubscriptions: number;
  churnRate: number;
}
