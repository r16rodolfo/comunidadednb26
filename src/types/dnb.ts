export interface MarketAnalysis {
  id: string;
  date: string;
  recommendation: 'ideal' | 'alert' | 'not-ideal' | 'wait';
  dollarPrice: number;
  dollarVariation: number;
  euroPrice: number;
  euroVariation: number;
  summary: string;
  fullAnalysis: string;
  videoUrl?: string;
  imageUrl?: string;
  chartData?: ChartDataPoint[];
  supports: number[];
  resistances: number[];
  createdAt?: string;
  updatedAt?: string;
  editedByName?: string;
}

export interface ChartDataPoint {
  date: string;
  price: number;
  volume?: number;
}

export interface MarketRecommendation {
  type: 'ideal' | 'alert' | 'not-ideal' | 'wait';
  label: string;
  description: string;
  color: string;
  icon: string;
}