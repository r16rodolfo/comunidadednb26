export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  originalPrice?: number;
  category: string;
  affiliateLinks: AffiliateLink[];
  specifications?: string[];
  featured?: boolean;
  discount?: number;
  rating?: number;
  reviewCount?: number;
}

export interface AffiliateLink {
  platform: 'Amazon' | 'Shopee' | 'AliExpress' | 'Mercado Livre';
  url: string;
  price: number;
  availability: 'in-stock' | 'out-of-stock' | 'limited';
}

export interface ProductFilters {
  search: string;
  category: string;
  sortBy: 'name' | 'price-low' | 'price-high' | 'rating' | 'featured';
  minPrice?: number;
  maxPrice?: number;
}

export const CATEGORIES = [
  'Todos',
  'Eletrônicos',
  'Viagem',
  'Bagagem',
  'Acessórios',
  'Roupas',
  'Gadgets',
  'Casa',
  'Beleza',
  'Esporte'
] as const;

export type Category = typeof CATEGORIES[number];