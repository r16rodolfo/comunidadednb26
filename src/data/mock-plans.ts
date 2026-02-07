export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  currency: string;
  interval: 'free' | 'monthly' | 'quarterly' | 'semiannual' | 'yearly';
  intervalLabel: string;
  features: string[];
  isActive: boolean;
  popular?: boolean;
  description: string;
  savingsPercent?: number;
}

export const defaultPlans: SubscriptionPlan[] = [
  {
    id: 'plan-free',
    name: 'Gratuito',
    slug: 'free',
    priceCents: 0,
    currency: 'BRL',
    interval: 'free',
    intervalLabel: '',
    description: 'Para começar sua jornada',
    features: [
      '10 transações no planner',
      'Acesso limitado à academy',
      'Cupons públicos',
      'Suporte por email',
    ],
    isActive: true,
  },
  {
    id: 'plan-monthly',
    name: 'Mensal',
    slug: 'premium-monthly',
    priceCents: 3000,
    currency: 'BRL',
    interval: 'monthly',
    intervalLabel: '/mês',
    description: 'Acesso completo sem compromisso',
    features: [
      'Transações ilimitadas',
      'Acesso completo à academy',
      'Cupons exclusivos',
      'Análise DNB',
      'Relatórios avançados',
      'Suporte prioritário',
    ],
    isActive: true,
  },
  {
    id: 'plan-quarterly',
    name: 'Trimestral',
    slug: 'premium-quarterly',
    priceCents: 6000,
    currency: 'BRL',
    interval: 'quarterly',
    intervalLabel: '/trimestre',
    description: 'Economize com o plano trimestral',
    features: [
      'Transações ilimitadas',
      'Acesso completo à academy',
      'Cupons exclusivos',
      'Análise DNB',
      'Relatórios avançados',
      'Suporte prioritário',
    ],
    isActive: true,
    savingsPercent: 33,
    popular: true,
  },
  {
    id: 'plan-semiannual',
    name: 'Semestral',
    slug: 'premium-semiannual',
    priceCents: 10500,
    currency: 'BRL',
    interval: 'semiannual',
    intervalLabel: '/semestre',
    description: 'Economia de longo prazo',
    features: [
      'Transações ilimitadas',
      'Acesso completo à academy',
      'Cupons exclusivos',
      'Análise DNB',
      'Relatórios avançados',
      'Suporte prioritário',
      'Conteúdo exclusivo antecipado',
    ],
    isActive: true,
    savingsPercent: 42,
  },
  {
    id: 'plan-yearly',
    name: 'Anual',
    slug: 'premium-yearly',
    priceCents: 18500,
    currency: 'BRL',
    interval: 'yearly',
    intervalLabel: '/ano',
    description: 'Melhor custo-benefício',
    features: [
      'Transações ilimitadas',
      'Acesso completo à academy',
      'Cupons exclusivos',
      'Análise DNB',
      'Relatórios avançados',
      'Suporte prioritário',
      'Conteúdo exclusivo antecipado',
      'Bônus exclusivo anual',
    ],
    isActive: true,
    savingsPercent: 49,
  },
];

export const formatPrice = (priceCents: number): string => {
  if (priceCents === 0) return 'R$ 0';
  return `R$ ${(priceCents / 100).toFixed(2).replace('.', ',')}`;
};

export const getMonthlyEquivalent = (plan: SubscriptionPlan): number => {
  switch (plan.interval) {
    case 'free': return 0;
    case 'monthly': return plan.priceCents;
    case 'quarterly': return Math.round(plan.priceCents / 3);
    case 'semiannual': return Math.round(plan.priceCents / 6);
    case 'yearly': return Math.round(plan.priceCents / 12);
  }
};

export const formatMonthlyEquivalent = (plan: SubscriptionPlan): string => {
  const monthly = getMonthlyEquivalent(plan);
  if (monthly === 0) return 'R$ 0';
  return `R$ ${(monthly / 100).toFixed(2).replace('.', ',')}`;
};
