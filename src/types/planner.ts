export interface TripGoal {
  id: string;
  targetAmount: number;
  currency: string;
  tripDate: Date;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  date: Date;
  location: string;
  amount: number;
  rate: number;
  totalPaid: number;
  createdAt: Date;
}

export interface PlannerMetrics {
  targetAmount: number;
  totalPurchased: number;
  remaining: number;
  averageRate: number;
  progressPercentage: number;
  daysUntilTrip: number;
}

export interface BuyingPace {
  weekly: number;
  biweekly: number;
  monthly: number;
  urgencyLevel: 'low' | 'medium' | 'high';
}

export const SUPPORTED_CURRENCIES = [
  { code: 'USD', name: 'Dólar Americano', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'Libra Esterlina', symbol: '£' },
  { code: 'ARS', name: 'Peso Argentino', symbol: '$' },
  { code: 'CLP', name: 'Peso Chileno', symbol: '$' },
] as const;

export type CurrencyCode = typeof SUPPORTED_CURRENCIES[number]['code'];