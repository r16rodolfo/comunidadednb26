
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
    dnbAnalysis: boolean;
    coupons: boolean;
  };
  limits: {
    freeTransactions: number;
    premiumTransactions: number;
    apiCalls: number;
  };
  integrations: {
    bunnyLibraryId: string;
  };
}

// ── Home Page Configuration ──

export type LucideIconName =
  | 'Plane' | 'Globe' | 'Map' | 'Compass' | 'Luggage'
  | 'Wallet' | 'TrendingUp' | 'BarChart3' | 'PiggyBank' | 'DollarSign'
  | 'CreditCard' | 'Banknote' | 'Star' | 'Heart' | 'Sparkles'
  | 'Rocket' | 'Target' | 'Award' | 'Zap' | 'Sun';

export interface WelcomeCardConfig {
  icon: LucideIconName;
  title: string;
  subtitle: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
}

export interface BannerItem {
  id: string;
  imageUrl: string; // URL da imagem (Bunny Storage ou base64)
  redirectUrl: string;
  alt: string;
  order: number;
}

export interface StepCardConfig {
  id: string;
  number: string;
  title: string;
  description: string;
}

export interface HomeConfig {
  welcomeCard: WelcomeCardConfig;
  banners: BannerItem[];
  stepCards: StepCardConfig[];
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
