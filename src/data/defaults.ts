/**
 * Default configurations for the platform.
 * These are legitimate fallback values, NOT mock data.
 */

import type { HomeConfig } from '@/types/admin';

// ── Home Page Default Config ──
export const defaultHomeConfig: HomeConfig = {
  welcomeCard: {
    icon: 'Plane',
    title: 'Bem-vinda à Comunidade DNB!',
    subtitle: 'Sua jornada financeira para viagens internacionais começa aqui',
    body: 'Transforme seus sonhos de viagem em realidade com planejamento inteligente. Nossa plataforma oferece todas as ferramentas necessárias para otimizar suas compras de câmbio e garantir que você aproveite cada centavo da sua viagem.',
    ctaLabel: 'Começar Planejamento',
    ctaUrl: '/planner',
  },
  banners: [],
  stepCards: [
    { id: 'step-1', number: '1', title: 'Defina suas Metas', description: 'Estabeleça objetivos claros para suas viagens e compras de câmbio' },
    { id: 'step-2', number: '2', title: 'Acompanhe o Mercado', description: 'Monitore cotações e tome decisões inteligentes no momento certo' },
    { id: 'step-3', number: '3', title: 'Execute com Confiança', description: 'Realize suas compras com base em análises e planejamento sólido' },
  ],
};

// ── Platform Default Config ──
export const defaultPlatformConfig = {
  id: 'platform-1',
  siteName: 'Comunidade DNB',
  siteDescription: 'Viaje com inteligência',
  logoUrl: localStorage.getItem('platform_logo') || undefined,
  primaryColor: '#0ea5e9',
  secondaryColor: '#8b5cf6',
  maintenanceMode: false,
  registrationEnabled: true,
  maxFreeUsers: 1000,
  features: {
    planner: true,
    academy: true,
    dnbAnalysis: true,
    coupons: true,
  },
  limits: {
    freeTransactions: 10,
    premiumTransactions: -1,
    apiCalls: 1000,
  },
  integrations: {
    bunnyLibraryId: localStorage.getItem('bunny_library_id') || '',
  },
};
