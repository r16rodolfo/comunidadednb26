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

export const recentActivity = [
  { action: 'Novo usuário cadastrado', user: 'Ana Oliveira', time: '2 min atrás' },
  { action: 'Aula "Câmbio Básico" assistida', user: 'Carlos Lima', time: '5 min atrás' },
  { action: 'Produto adicionado aos favoritos', user: 'Lucia Ferreira', time: '10 min atrás' },
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
    achadinhos: true,
    analytics: true,
  },
  limits: {
    freeTransactions: 10,
    premiumTransactions: -1,
    apiCalls: 1000,
  },
};

export const defaultApiConfigs = [
  { id: '1', name: 'OpenAI API', maskedKey: 'sk-••••••••abc1', isActive: true, isConfigured: true },
  { id: '2', name: 'PandaVideo API', maskedKey: 'pv_••••••••d2e3', isActive: true, isConfigured: true },
  { id: '3', name: 'Exchange Rate API', maskedKey: '', isActive: false, isConfigured: false },
  { id: '4', name: 'Stripe Secret Key', maskedKey: 'sk_live_••••f4g5', isActive: true, isConfigured: true },
];

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

// Admin Content page
export const mockCourses = [
  {
    id: '1',
    title: 'Fundamentos do Câmbio',
    description: 'Aprenda os conceitos básicos do mercado de câmbio',
    status: 'Publicado',
    duration: '2h 30min',
    lessons: 8,
    students: 245,
    category: 'Iniciante',
    createdAt: '2024-01-10',
  },
  {
    id: '2',
    title: 'Estratégias Avançadas de Câmbio',
    description: 'Técnicas avançadas para otimizar suas operações',
    status: 'Rascunho',
    duration: '3h 15min',
    lessons: 12,
    students: 0,
    category: 'Avançado',
    createdAt: '2024-01-15',
  },
];

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

// Admin Subscriptions page
export const mockSubscriptions = [
  {
    id: '1',
    user: { name: 'Ana Silva', email: 'ana@example.com', avatar: '' },
    plan: 'Premium Mensal',
    status: 'active',
    amount: 'R$ 29,90',
    startDate: '2024-01-15',
    nextBilling: '2024-02-15',
    stripeId: 'sub_1234567890',
  },
  {
    id: '2',
    user: { name: 'Carlos Santos', email: 'carlos@example.com', avatar: '' },
    plan: 'Premium Anual',
    status: 'active',
    amount: 'R$ 299,90',
    startDate: '2023-12-01',
    nextBilling: '2024-12-01',
    stripeId: 'sub_0987654321',
  },
  {
    id: '3',
    user: { name: 'Maria Oliveira', email: 'maria@example.com', avatar: '' },
    plan: 'Premium Mensal',
    status: 'cancelled',
    amount: 'R$ 29,90',
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
];
