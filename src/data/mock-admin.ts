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

export const adminStats = {
  totalUsers: 1234,
  activeUsers: 567,
  newUsersThisMonth: 89,
  totalCourses: 45,
  monthlyRevenue: 25678,
};

export const recentUsers = [
  { id: '1', name: 'João Silva', email: 'joao@email.com', role: 'premium', joinedAt: '2024-01-15' },
  { id: '2', name: 'Maria Santos', email: 'maria@email.com', role: 'free', joinedAt: '2024-01-14' },
  { id: '3', name: 'Pedro Costa', email: 'pedro@email.com', role: 'premium', joinedAt: '2024-01-13' },
];

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

// Admin Users page
export const mockAdminUsers = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@email.com',
    role: 'Premium',
    status: 'Ativo',
    lastAccess: '2024-01-15',
    subscription: 'Premium Mensal',
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@email.com',
    role: 'Gratuito',
    status: 'Ativo',
    lastAccess: '2024-01-14',
    subscription: 'Gratuito',
  },
  {
    id: '3',
    name: 'Pedro Costa',
    email: 'pedro@email.com',
    role: 'Premium',
    status: 'Inativo',
    lastAccess: '2024-01-10',
    subscription: 'Premium Anual',
  },
];

// Admin Content page - cursos agora no banco de dados (tabela courses)

// Admin Analytics page
export const monthlyRevenue = [
  { month: 'Jan', revenue: 15420, users: 180 },
  { month: 'Fev', revenue: 18750, users: 220 },
  { month: 'Mar', revenue: 22150, users: 280 },
  { month: 'Abr', revenue: 19800, users: 250 },
  { month: 'Mai', revenue: 25600, users: 320 },
  { month: 'Jun', revenue: 28900, users: 390 },
];

export const userActivity = [
  { day: 'Seg', logins: 145, newUsers: 12 },
  { day: 'Ter', logins: 189, newUsers: 18 },
  { day: 'Qua', logins: 167, newUsers: 15 },
  { day: 'Qui', logins: 203, newUsers: 22 },
  { day: 'Sex', logins: 178, newUsers: 16 },
  { day: 'Sáb', logins: 134, newUsers: 9 },
  { day: 'Dom', logins: 98, newUsers: 7 },
];

// Performance de conteúdo por curso (vinculado aos cursos no banco de dados)
export interface CoursePerformance {
  courseId: string;
  courseName: string;
  totalLessons: number;
  publishedLessons: number;
  totalViews: number;
  uniqueViewers: number;
  completions: number;
  avgWatchTime: number; // percentual médio de visualização do vídeo
  engagementRate: number; // completions / uniqueViewers * 100
  retentionRate: number; // % de alunos que avançam entre módulos
  cps: number; // Content Performance Score (0-100)
}

// Performance por aula individual
export interface LessonPerformance {
  lessonId: string;
  lessonTitle: string;
  courseId: string;
  moduleName: string;
  views: number;
  completions: number;
  avgWatchTime: number;
  dropOffRate: number; // % que abandona antes de terminar
}

// Dados vinculados ao curso "Fundamentos do Câmbio" (id: '1')
// e "Estratégias Avançadas de Câmbio" (id: '2')
export const coursePerformance: CoursePerformance[] = [
  {
    courseId: '1',
    courseName: 'Fundamentos do Câmbio',
    totalLessons: 6,
    publishedLessons: 6,
    totalViews: 3840,
    uniqueViewers: 412,
    completions: 287,
    avgWatchTime: 78,
    engagementRate: 69.7,
    retentionRate: 72,
    cps: 74,
  },
  {
    courseId: '2',
    courseName: 'Estratégias Avançadas de Câmbio',
    totalLessons: 4,
    publishedLessons: 0,
    totalViews: 0,
    uniqueViewers: 0,
    completions: 0,
    avgWatchTime: 0,
    engagementRate: 0,
    retentionRate: 0,
    cps: 0,
  },
];

export const lessonPerformance: LessonPerformance[] = [
  // Curso 1 - Módulo 1
  { lessonId: 'lesson1', lessonTitle: 'O que é câmbio?', courseId: '1', moduleName: 'Introdução ao Câmbio', views: 980, completions: 890, avgWatchTime: 92, dropOffRate: 9 },
  { lessonId: 'lesson2', lessonTitle: 'Como funciona o mercado', courseId: '1', moduleName: 'Introdução ao Câmbio', views: 820, completions: 695, avgWatchTime: 85, dropOffRate: 15 },
  { lessonId: 'lesson3', lessonTitle: 'Tipos de moeda', courseId: '1', moduleName: 'Introdução ao Câmbio', views: 680, completions: 540, avgWatchTime: 79, dropOffRate: 21 },
  { lessonId: 'lesson4', lessonTitle: 'Documentação necessária', courseId: '1', moduleName: 'Introdução ao Câmbio', views: 520, completions: 410, avgWatchTime: 76, dropOffRate: 21 },
  // Curso 1 - Módulo 2
  { lessonId: 'lesson5', lessonTitle: 'Quando comprar moeda', courseId: '1', moduleName: 'Estratégias de Compra', views: 460, completions: 340, avgWatchTime: 71, dropOffRate: 26 },
  { lessonId: 'lesson6', lessonTitle: 'Planejamento de compras', courseId: '1', moduleName: 'Estratégias de Compra', views: 380, completions: 265, avgWatchTime: 68, dropOffRate: 30 },
];

// Fórmula CPS: (engagementRate * 0.35) + (avgWatchTime * 0.30) + (retentionRate * 0.20) + (completionRate * 0.15)
// onde completionRate = (completions / totalLessons_started) normalizado
export const calculateCPS = (course: CoursePerformance): number => {
  if (course.uniqueViewers === 0) return 0;
  const completionRate = (course.completions / course.uniqueViewers) * 100;
  return Math.round(
    course.engagementRate * 0.35 +
    course.avgWatchTime * 0.30 +
    course.retentionRate * 0.20 +
    completionRate * 0.15
  );
};

// Mantém export legado para compatibilidade (derivado dos cursos reais)
export const contentPerformance = coursePerformance
  .filter(c => c.totalViews > 0)
  .map(c => ({
    name: c.courseName,
    views: c.totalViews,
    completions: c.completions,
    engagement: c.engagementRate,
  }));

export const subscriptionTypes = [
  { name: 'Gratuito', value: 65, color: 'hsl(var(--muted-foreground))' },
  { name: 'Premium', value: 35, color: 'hsl(var(--success))' },
];

export const topProducts = [
  { name: 'Cartão Pré-pago', clicks: 2450, conversions: 89, revenue: 4450 },
  { name: 'Seguro Viagem', clicks: 1890, conversions: 67, revenue: 3350 },
  { name: 'App de Câmbio', clicks: 1650, conversions: 45, revenue: 2250 },
  { name: 'Conta Global', clicks: 1420, conversions: 38, revenue: 1900 },
];

// Revenue by payment method
export const monthlyRevenueByGateway = [
  { month: 'Jan', pix: 8520, cartao: 6900, total: 15420 },
  { month: 'Fev', pix: 10200, cartao: 8550, total: 18750 },
  { month: 'Mar', pix: 12800, cartao: 9350, total: 22150 },
  { month: 'Abr', pix: 10900, cartao: 8900, total: 19800 },
  { month: 'Mai', pix: 14200, cartao: 11400, total: 25600 },
  { month: 'Jun', pix: 16100, cartao: 12800, total: 28900 },
];

export const paymentMethodDistribution = [
  { name: 'PIX', value: 56, color: 'hsl(var(--success))' },
  { name: 'Cartão de Crédito', value: 44, color: 'hsl(var(--primary))' },
];

export const paymentStats = {
  totalPayments: 1847,
  pixPayments: 1034,
  cardPayments: 813,
  totalRevenue: 130620,
  pixRevenue: 72720,
  cardRevenue: 57900,
  avgTicketPix: 70.33,
  avgTicketCard: 71.22,
  failedPayments: 42,
  refunds: 8,
};

export const recentPayments = [
  { id: 'pay_1', user: 'Ana Silva', method: 'pix' as const, plan: 'Trimestral', amount: 6000, status: 'paid' as const, date: '2025-02-07' },
  { id: 'pay_2', user: 'Carlos Santos', method: 'card' as const, plan: 'Anual', amount: 18500, status: 'paid' as const, date: '2025-02-06' },
  { id: 'pay_3', user: 'Fernanda Lima', method: 'pix' as const, plan: 'Mensal', amount: 3000, status: 'paid' as const, date: '2025-02-06' },
  { id: 'pay_4', user: 'Pedro Costa', method: 'card' as const, plan: 'Semestral', amount: 10500, status: 'paid' as const, date: '2025-02-05' },
  { id: 'pay_5', user: 'Maria Oliveira', method: 'pix' as const, plan: 'Mensal', amount: 3000, status: 'failed' as const, date: '2025-02-05' },
  { id: 'pay_6', user: 'João Costa', method: 'card' as const, plan: 'Trimestral', amount: 6000, status: 'paid' as const, date: '2025-02-04' },
  { id: 'pay_7', user: 'Lucia Mendes', method: 'pix' as const, plan: 'Anual', amount: 18500, status: 'paid' as const, date: '2025-02-03' },
  { id: 'pay_8', user: 'Roberto Alves', method: 'pix' as const, plan: 'Mensal', amount: 3000, status: 'refunded' as const, date: '2025-02-02' },
];

export const revenueByPlan = [
  { name: 'Mensal', pix: 42, cartao: 58, totalRevenue: 28500 },
  { name: 'Trimestral', pix: 61, cartao: 39, totalRevenue: 38400 },
  { name: 'Semestral', pix: 55, cartao: 45, totalRevenue: 31500 },
  { name: 'Anual', pix: 48, cartao: 52, totalRevenue: 32220 },
];

// Admin Subscriptions page
export const mockSubscriptions = [
  {
    id: '1',
    user: { name: 'Ana Silva', email: 'ana@example.com', avatar: '' },
    plan: 'Mensal',
    status: 'active',
    amount: 'R$ 30,00',
    startDate: '2024-01-15',
    nextBilling: '2024-02-15',
    stripeId: 'sub_1234567890',
  },
  {
    id: '2',
    user: { name: 'Carlos Santos', email: 'carlos@example.com', avatar: '' },
    plan: 'Anual',
    status: 'active',
    amount: 'R$ 185,00',
    startDate: '2023-12-01',
    nextBilling: '2024-12-01',
    stripeId: 'sub_0987654321',
  },
  {
    id: '3',
    user: { name: 'Maria Oliveira', email: 'maria@example.com', avatar: '' },
    plan: 'Trimestral',
    status: 'cancelled',
    amount: 'R$ 60,00',
    startDate: '2024-01-01',
    nextBilling: null as string | null,
    stripeId: 'sub_1122334455',
  },
  {
    id: '4',
    user: { name: 'João Costa', email: 'joao@example.com', avatar: '' },
    plan: 'Gratuito',
    status: 'free',
    amount: 'R$ 0,00',
    startDate: '2024-01-20',
    nextBilling: null as string | null,
    stripeId: null as string | null,
  },
  {
    id: '5',
    user: { name: 'Fernanda Lima', email: 'fernanda@example.com', avatar: '' },
    plan: 'Semestral',
    status: 'active',
    amount: 'R$ 105,00',
    startDate: '2024-01-10',
    nextBilling: '2024-07-10',
    stripeId: 'sub_5566778899',
  },
];
