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

// Admin Content page - cursos agora em mock-academy.ts (mockAdminCourses)

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

export const contentPerformance = [
  { name: 'Fundamentos do Câmbio', views: 1250, completions: 890, engagement: 71 },
  { name: 'Estratégias Avançadas', views: 980, completions: 640, engagement: 65 },
  { name: 'Cartões Internacionais', views: 2100, completions: 1680, engagement: 80 },
  { name: 'Seguros de Viagem', views: 850, completions: 595, engagement: 70 },
];

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
