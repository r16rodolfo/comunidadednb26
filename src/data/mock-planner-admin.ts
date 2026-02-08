// Mock data for Admin Planner Analytics Dashboard

export interface PlannerUserSummary {
  id: string;
  name: string;
  email: string;
  currency: string;
  targetAmount: number;
  totalPurchased: number;
  progressPercentage: number;
  totalTransactions: number;
  averageRate: number;
  totalPaidBRL: number;
  tripDate: string;
  lastPurchaseDate: string;
}

export interface PlannerTransaction {
  id: string;
  userId: string;
  date: string;
  location: string;
  normalizedLocation: string | null; // null = unmatched
  amount: number;
  currency: string;
  rate: number;
  totalPaid: number;
}

export interface LocationAggregate {
  name: string;
  totalVolume: number;
  totalBRL: number;
  transactionCount: number;
  userCount: number;
  averageRate: number;
  category: string | null;
}

export interface UnmatchedLocation {
  rawName: string;
  occurrences: number;
  suggestedMatch: string | null;
  users: string[];
}

// --- Mock Users with Planner Data ---

export const mockPlannerUsers: PlannerUserSummary[] = [
  {
    id: 'u1',
    name: 'Ana Silva',
    email: 'ana@example.com',
    currency: 'USD',
    targetAmount: 3000,
    totalPurchased: 1850,
    progressPercentage: 61.7,
    totalTransactions: 8,
    averageRate: 5.42,
    totalPaidBRL: 10027,
    tripDate: '2026-06-15',
    lastPurchaseDate: '2026-02-05',
  },
  {
    id: 'u2',
    name: 'Carlos Santos',
    email: 'carlos@example.com',
    currency: 'EUR',
    targetAmount: 2000,
    totalPurchased: 2000,
    progressPercentage: 100,
    totalTransactions: 12,
    averageRate: 6.18,
    totalPaidBRL: 12360,
    tripDate: '2026-03-20',
    lastPurchaseDate: '2026-02-01',
  },
  {
    id: 'u3',
    name: 'Fernanda Lima',
    email: 'fernanda@example.com',
    currency: 'USD',
    targetAmount: 5000,
    totalPurchased: 1200,
    progressPercentage: 24,
    totalTransactions: 4,
    averageRate: 5.55,
    totalPaidBRL: 6660,
    tripDate: '2026-12-01',
    lastPurchaseDate: '2026-01-28',
  },
  {
    id: 'u4',
    name: 'Pedro Costa',
    email: 'pedro@example.com',
    currency: 'USD',
    targetAmount: 1500,
    totalPurchased: 900,
    progressPercentage: 60,
    totalTransactions: 5,
    averageRate: 5.38,
    totalPaidBRL: 4842,
    tripDate: '2026-04-10',
    lastPurchaseDate: '2026-02-07',
  },
  {
    id: 'u5',
    name: 'Maria Oliveira',
    email: 'maria@example.com',
    currency: 'GBP',
    targetAmount: 1800,
    totalPurchased: 600,
    progressPercentage: 33.3,
    totalTransactions: 3,
    averageRate: 7.25,
    totalPaidBRL: 4350,
    tripDate: '2026-08-20',
    lastPurchaseDate: '2026-01-15',
  },
  {
    id: 'u6',
    name: 'João Pereira',
    email: 'joao.p@example.com',
    currency: 'USD',
    targetAmount: 2500,
    totalPurchased: 2100,
    progressPercentage: 84,
    totalTransactions: 9,
    averageRate: 5.47,
    totalPaidBRL: 11487,
    tripDate: '2026-05-05',
    lastPurchaseDate: '2026-02-06',
  },
  {
    id: 'u7',
    name: 'Lucia Mendes',
    email: 'lucia@example.com',
    currency: 'EUR',
    targetAmount: 3000,
    totalPurchased: 450,
    progressPercentage: 15,
    totalTransactions: 2,
    averageRate: 6.22,
    totalPaidBRL: 2799,
    tripDate: '2027-01-10',
    lastPurchaseDate: '2026-01-20',
  },
];

// --- All Transactions (used for drill-down) ---

export const mockPlannerTransactions: PlannerTransaction[] = [
  // Ana - 8 transactions
  { id: 't1', userId: 'u1', date: '2025-11-10', location: 'Banco do Brasil', normalizedLocation: 'Banco do Brasil', amount: 200, currency: 'USD', rate: 5.35, totalPaid: 1070 },
  { id: 't2', userId: 'u1', date: '2025-12-01', location: 'Wise', normalizedLocation: 'Wise', amount: 300, currency: 'USD', rate: 5.40, totalPaid: 1620 },
  { id: 't3', userId: 'u1', date: '2025-12-20', location: 'BB', normalizedLocation: null, amount: 250, currency: 'USD', rate: 5.38, totalPaid: 1345 },
  { id: 't4', userId: 'u1', date: '2026-01-05', location: 'Nubank', normalizedLocation: 'Nubank', amount: 200, currency: 'USD', rate: 5.42, totalPaid: 1084 },
  { id: 't5', userId: 'u1', date: '2026-01-15', location: 'Banco do Brasil', normalizedLocation: 'Banco do Brasil', amount: 300, currency: 'USD', rate: 5.45, totalPaid: 1635 },
  { id: 't6', userId: 'u1', date: '2026-01-22', location: 'wise app', normalizedLocation: null, amount: 200, currency: 'USD', rate: 5.44, totalPaid: 1088 },
  { id: 't7', userId: 'u1', date: '2026-02-01', location: 'Remessa Online', normalizedLocation: 'Remessa Online', amount: 150, currency: 'USD', rate: 5.48, totalPaid: 822 },
  { id: 't8', userId: 'u1', date: '2026-02-05', location: 'Nubank', normalizedLocation: 'Nubank', amount: 250, currency: 'USD', rate: 5.45, totalPaid: 1362.50 },

  // Carlos - 12 transactions
  { id: 't9', userId: 'u2', date: '2025-09-15', location: 'Banco do Brasil', normalizedLocation: 'Banco do Brasil', amount: 150, currency: 'EUR', rate: 6.10, totalPaid: 915 },
  { id: 't10', userId: 'u2', date: '2025-10-01', location: 'Wise', normalizedLocation: 'Wise', amount: 200, currency: 'EUR', rate: 6.15, totalPaid: 1230 },
  { id: 't11', userId: 'u2', date: '2025-10-20', location: 'Casa de Câmbio Turismo', normalizedLocation: 'Casa de Câmbio Turismo', amount: 150, currency: 'EUR', rate: 6.25, totalPaid: 937.50 },
  { id: 't12', userId: 'u2', date: '2025-11-05', location: 'Bco Brasil', normalizedLocation: null, amount: 180, currency: 'EUR', rate: 6.12, totalPaid: 1101.60 },
  { id: 't13', userId: 'u2', date: '2025-11-18', location: 'Wise', normalizedLocation: 'Wise', amount: 200, currency: 'EUR', rate: 6.18, totalPaid: 1236 },
  { id: 't14', userId: 'u2', date: '2025-12-03', location: 'Remessa Online', normalizedLocation: 'Remessa Online', amount: 180, currency: 'EUR', rate: 6.20, totalPaid: 1116 },
  { id: 't15', userId: 'u2', date: '2025-12-15', location: 'Nubank', normalizedLocation: 'Nubank', amount: 150, currency: 'EUR', rate: 6.15, totalPaid: 922.50 },
  { id: 't16', userId: 'u2', date: '2026-01-02', location: 'Banco do Brasil', normalizedLocation: 'Banco do Brasil', amount: 200, currency: 'EUR', rate: 6.18, totalPaid: 1236 },
  { id: 't17', userId: 'u2', date: '2026-01-10', location: 'Wise', normalizedLocation: 'Wise', amount: 150, currency: 'EUR', rate: 6.22, totalPaid: 933 },
  { id: 't18', userId: 'u2', date: '2026-01-20', location: 'Casa Cambio Turismo', normalizedLocation: null, amount: 140, currency: 'EUR', rate: 6.28, totalPaid: 879.20 },
  { id: 't19', userId: 'u2', date: '2026-01-28', location: 'Remessa Online', normalizedLocation: 'Remessa Online', amount: 100, currency: 'EUR', rate: 6.20, totalPaid: 620 },
  { id: 't20', userId: 'u2', date: '2026-02-01', location: 'Nubank', normalizedLocation: 'Nubank', amount: 200, currency: 'EUR', rate: 6.15, totalPaid: 1230 },

  // Fernanda - 4 transactions
  { id: 't21', userId: 'u3', date: '2025-12-10', location: 'Banco do Brasil', normalizedLocation: 'Banco do Brasil', amount: 400, currency: 'USD', rate: 5.50, totalPaid: 2200 },
  { id: 't22', userId: 'u3', date: '2026-01-05', location: 'Wise', normalizedLocation: 'Wise', amount: 300, currency: 'USD', rate: 5.55, totalPaid: 1665 },
  { id: 't23', userId: 'u3', date: '2026-01-18', location: 'Corretora X', normalizedLocation: null, amount: 250, currency: 'USD', rate: 5.58, totalPaid: 1395 },
  { id: 't24', userId: 'u3', date: '2026-01-28', location: 'Nubank', normalizedLocation: 'Nubank', amount: 250, currency: 'USD', rate: 5.60, totalPaid: 1400 },

  // Pedro - 5 transactions
  { id: 't25', userId: 'u4', date: '2025-12-05', location: 'Wise', normalizedLocation: 'Wise', amount: 200, currency: 'USD', rate: 5.32, totalPaid: 1064 },
  { id: 't26', userId: 'u4', date: '2025-12-20', location: 'Banco do Brasil', normalizedLocation: 'Banco do Brasil', amount: 150, currency: 'USD', rate: 5.35, totalPaid: 802.50 },
  { id: 't27', userId: 'u4', date: '2026-01-10', location: 'Remessa Online', normalizedLocation: 'Remessa Online', amount: 200, currency: 'USD', rate: 5.40, totalPaid: 1080 },
  { id: 't28', userId: 'u4', date: '2026-01-25', location: 'Nubank', normalizedLocation: 'Nubank', amount: 150, currency: 'USD', rate: 5.38, totalPaid: 807 },
  { id: 't29', userId: 'u4', date: '2026-02-07', location: 'wise', normalizedLocation: null, amount: 200, currency: 'USD', rate: 5.42, totalPaid: 1084 },

  // Maria - 3 transactions
  { id: 't30', userId: 'u5', date: '2025-12-15', location: 'Banco do Brasil', normalizedLocation: 'Banco do Brasil', amount: 200, currency: 'GBP', rate: 7.20, totalPaid: 1440 },
  { id: 't31', userId: 'u5', date: '2026-01-05', location: 'Wise', normalizedLocation: 'Wise', amount: 200, currency: 'GBP', rate: 7.25, totalPaid: 1450 },
  { id: 't32', userId: 'u5', date: '2026-01-15', location: 'Remessa Online', normalizedLocation: 'Remessa Online', amount: 200, currency: 'GBP', rate: 7.30, totalPaid: 1460 },

  // João P - 9 transactions
  { id: 't33', userId: 'u6', date: '2025-10-15', location: 'Banco do Brasil', normalizedLocation: 'Banco do Brasil', amount: 250, currency: 'USD', rate: 5.40, totalPaid: 1350 },
  { id: 't34', userId: 'u6', date: '2025-11-01', location: 'Wise', normalizedLocation: 'Wise', amount: 300, currency: 'USD', rate: 5.42, totalPaid: 1626 },
  { id: 't35', userId: 'u6', date: '2025-11-15', location: 'Nubank', normalizedLocation: 'Nubank', amount: 200, currency: 'USD', rate: 5.45, totalPaid: 1090 },
  { id: 't36', userId: 'u6', date: '2025-12-01', location: 'BB', normalizedLocation: null, amount: 250, currency: 'USD', rate: 5.48, totalPaid: 1370 },
  { id: 't37', userId: 'u6', date: '2025-12-15', location: 'Remessa Online', normalizedLocation: 'Remessa Online', amount: 200, currency: 'USD', rate: 5.50, totalPaid: 1100 },
  { id: 't38', userId: 'u6', date: '2026-01-05', location: 'Wise', normalizedLocation: 'Wise', amount: 250, currency: 'USD', rate: 5.47, totalPaid: 1367.50 },
  { id: 't39', userId: 'u6', date: '2026-01-18', location: 'Nubank', normalizedLocation: 'Nubank', amount: 200, currency: 'USD', rate: 5.50, totalPaid: 1100 },
  { id: 't40', userId: 'u6', date: '2026-02-01', location: 'Banco do Brasil', normalizedLocation: 'Banco do Brasil', amount: 200, currency: 'USD', rate: 5.52, totalPaid: 1104 },
  { id: 't41', userId: 'u6', date: '2026-02-06', location: 'Wise', normalizedLocation: 'Wise', amount: 250, currency: 'USD', rate: 5.48, totalPaid: 1370 },

  // Lucia - 2 transactions
  { id: 't42', userId: 'u7', date: '2026-01-10', location: 'Banco do Brasil', normalizedLocation: 'Banco do Brasil', amount: 250, currency: 'EUR', rate: 6.20, totalPaid: 1550 },
  { id: 't43', userId: 'u7', date: '2026-01-20', location: 'Wise', normalizedLocation: 'Wise', amount: 200, currency: 'EUR', rate: 6.24, totalPaid: 1248 },
];

// --- Aggregated Location Data ---

export const mockLocationAggregates: LocationAggregate[] = [
  { name: 'Banco do Brasil', totalVolume: 2750, totalBRL: 14908.50, transactionCount: 11, userCount: 6, averageRate: 5.42, category: 'Banco' },
  { name: 'Wise', totalVolume: 2750, totalBRL: 14945.50, transactionCount: 12, userCount: 7, averageRate: 5.43, category: 'App/Fintech' },
  { name: 'Nubank', totalVolume: 1600, totalBRL: 8666, transactionCount: 7, userCount: 5, averageRate: 5.42, category: 'App/Fintech' },
  { name: 'Remessa Online', totalVolume: 1030, totalBRL: 5598, transactionCount: 5, userCount: 4, averageRate: 5.44, category: 'App/Fintech' },
  { name: 'Casa de Câmbio Turismo', totalVolume: 150, totalBRL: 937.50, transactionCount: 1, userCount: 1, averageRate: 6.25, category: 'Casa de Câmbio' },
];

// --- Unmatched Locations (need admin mapping) ---

export const mockUnmatchedLocations: UnmatchedLocation[] = [
  { rawName: 'BB', occurrences: 2, suggestedMatch: 'Banco do Brasil', users: ['Ana Silva', 'João Pereira'] },
  { rawName: 'wise app', occurrences: 1, suggestedMatch: 'Wise', users: ['Ana Silva'] },
  { rawName: 'Bco Brasil', occurrences: 1, suggestedMatch: 'Banco do Brasil', users: ['Carlos Santos'] },
  { rawName: 'wise', occurrences: 1, suggestedMatch: 'Wise', users: ['Pedro Costa'] },
  { rawName: 'Casa Cambio Turismo', occurrences: 1, suggestedMatch: 'Casa de Câmbio Turismo', users: ['Carlos Santos'] },
  { rawName: 'Corretora X', occurrences: 1, suggestedMatch: null, users: ['Fernanda Lima'] },
];

// --- Aggregate Stats ---

export const mockPlannerStats = {
  totalUsers: 7,
  totalTransactions: 43,
  totalVolumeBRL: 52525,
  totalVolumeUSD: 7050,
  totalVolumeEUR: 2450,
  totalVolumeGBP: 600,
  averageRateUSD: 5.45,
  averageRateEUR: 6.18,
  averageRateGBP: 7.25,
  usersWithGoalComplete: 1,
  unmatchedLocations: 6,
  averageTransactionsPerUser: 6.1,
};

// --- Volume by Month (for chart) ---

export const mockVolumeByMonth = [
  { month: 'Set', volumeBRL: 915, transactions: 1 },
  { month: 'Out', volumeBRL: 4217, transactions: 4 },
  { month: 'Nov', volumeBRL: 6685, transactions: 5 },
  { month: 'Dez', volumeBRL: 13805, transactions: 9 },
  { month: 'Jan', volumeBRL: 17303, transactions: 13 },
  { month: 'Fev', volumeBRL: 9600, transactions: 6 },
];

// --- Currency Distribution ---

export const mockCurrencyDistribution = [
  { name: 'USD', value: 65, color: 'hsl(var(--primary))' },
  { name: 'EUR', value: 25, color: 'hsl(var(--success))' },
  { name: 'GBP', value: 10, color: 'hsl(var(--warning))' },
];
