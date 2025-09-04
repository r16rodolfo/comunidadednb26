export interface Coupon {
  id: string;
  partnerName: string;
  partnerLogo: string;
  category?: string;
  offerTitle: string;
  description: string;
  code: string;
  destinationUrl: string;
  expirationDate?: Date;
  isActive: boolean;
  clickCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CouponCategory {
  id: string;
  name: string;
  isActive: boolean;
}

export interface CouponFilters {
  category?: string;
  search?: string;
  status?: 'active' | 'inactive' | 'all';
  sortBy?: 'newest' | 'expiring' | 'partner' | 'clicks';
}

export interface CreateCouponData {
  partnerName: string;
  partnerLogo: string;
  category?: string;
  offerTitle: string;
  description: string;
  code: string;
  destinationUrl: string;
  expirationDate?: Date;
  isActive: boolean;
}

export interface UpdateCouponData extends Partial<CreateCouponData> {
  id: string;
}

export enum CouponStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired'
}