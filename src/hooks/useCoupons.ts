import { useState, useEffect } from 'react';
import { Coupon, CouponCategory, CouponFilters, CreateCouponData, UpdateCouponData } from '@/types/coupons';

// Mock data for development
const mockCoupons: Coupon[] = [
  {
    id: '1',
    partnerName: 'Amazon',
    partnerLogo: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=100&h=100&fit=crop&crop=center',
    category: 'Tecnologia',
    offerTitle: '10% de desconto em eletrônicos',
    description: 'Válido para compras acima de R$ 200. Não cumulativo com outras promoções. Válido apenas na primeira compra.',
    code: 'TECH10',
    destinationUrl: 'https://amazon.com.br',
    expirationDate: new Date('2024-12-31'),
    isActive: true,
    clickCount: 245,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    partnerName: 'Nike',
    partnerLogo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop&crop=center',
    category: 'Moda',
    offerTitle: 'R$ 50 OFF em compras acima de R$ 300',
    description: 'Desconto aplicável em toda linha de tênis e roupas esportivas. Válido até o final do mês.',
    code: 'NIKE50',
    destinationUrl: 'https://nike.com.br',
    expirationDate: new Date('2024-10-31'),
    isActive: true,
    clickCount: 189,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: '3',
    partnerName: 'Booking.com',
    partnerLogo: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=100&h=100&fit=crop&crop=center',
    category: 'Viagens',
    offerTitle: '15% de desconto em hotéis',
    description: 'Válido para reservas de hotéis nacionais e internacionais. Mínimo de 2 diárias.',
    code: 'HOTEL15',
    destinationUrl: 'https://booking.com',
    expirationDate: new Date('2024-11-30'),
    isActive: true,
    clickCount: 123,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01')
  },
  {
    id: '4',
    partnerName: 'iFood',
    partnerLogo: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=100&h=100&fit=crop&crop=center',
    category: 'Alimentação',
    offerTitle: 'Frete grátis + 20% OFF',
    description: 'Aplicável em pedidos acima de R$ 35. Válido para novos usuários.',
    code: 'FOOD20',
    destinationUrl: 'https://ifood.com.br',
    isActive: false,
    clickCount: 67,
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-15')
  }
];

const mockCategories: CouponCategory[] = [
  { id: '1', name: 'Tecnologia', isActive: true },
  { id: '2', name: 'Moda', isActive: true },
  { id: '3', name: 'Viagens', isActive: true },
  { id: '4', name: 'Alimentação', isActive: true },
  { id: '5', name: 'Casa e Jardim', isActive: true },
  { id: '6', name: 'Saúde e Beleza', isActive: true }
];

export const useCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>(mockCoupons);
  const [categories, setCategories] = useState<CouponCategory[]>(mockCategories);
  const [loading, setLoading] = useState(false);

  const getCoupons = (filters?: CouponFilters) => {
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      let filteredCoupons = [...mockCoupons];

      if (filters?.category) {
        filteredCoupons = filteredCoupons.filter(coupon => coupon.category === filters.category);
      }

      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredCoupons = filteredCoupons.filter(coupon => 
          coupon.partnerName.toLowerCase().includes(searchLower) ||
          coupon.offerTitle.toLowerCase().includes(searchLower)
        );
      }

      if (filters?.status && filters.status !== 'all') {
        if (filters.status === 'active') {
          filteredCoupons = filteredCoupons.filter(coupon => coupon.isActive);
        } else if (filters.status === 'inactive') {
          filteredCoupons = filteredCoupons.filter(coupon => !coupon.isActive);
        }
      }

      if (filters?.sortBy) {
        switch (filters.sortBy) {
          case 'newest':
            filteredCoupons.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            break;
          case 'expiring':
            filteredCoupons.sort((a, b) => {
              if (!a.expirationDate) return 1;
              if (!b.expirationDate) return -1;
              return new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
            });
            break;
          case 'partner':
            filteredCoupons.sort((a, b) => a.partnerName.localeCompare(b.partnerName));
            break;
          case 'clicks':
            filteredCoupons.sort((a, b) => b.clickCount - a.clickCount);
            break;
        }
      }

      setCoupons(filteredCoupons);
      setLoading(false);
    }, 500);
  };

  const createCoupon = async (data: CreateCouponData): Promise<Coupon> => {
    setLoading(true);
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const newCoupon: Coupon = {
          ...data,
          id: Date.now().toString(),
          clickCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setCoupons(prev => [newCoupon, ...prev]);
        setLoading(false);
        resolve(newCoupon);
      }, 1000);
    });
  };

  const updateCoupon = async (data: UpdateCouponData): Promise<Coupon> => {
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        setCoupons(prev => prev.map(coupon => 
          coupon.id === data.id 
            ? { ...coupon, ...data, updatedAt: new Date() }
            : coupon
        ));
        const updatedCoupon = coupons.find(c => c.id === data.id)!;
        setLoading(false);
        resolve(updatedCoupon);
      }, 1000);
    });
  };

  const deleteCoupon = async (id: string): Promise<void> => {
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        setCoupons(prev => prev.filter(coupon => coupon.id !== id));
        setLoading(false);
        resolve();
      }, 500);
    });
  };

  const incrementClickCount = async (id: string): Promise<void> => {
    setCoupons(prev => prev.map(coupon => 
      coupon.id === id 
        ? { ...coupon, clickCount: coupon.clickCount + 1 }
        : coupon
    ));
  };

  const getActiveCoupons = () => {
    return coupons.filter(coupon => coupon.isActive);
  };

  const getCouponById = (id: string) => {
    return coupons.find(coupon => coupon.id === id);
  };

  useEffect(() => {
    getCoupons();
  }, []);

  return {
    coupons,
    categories,
    loading,
    getCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    incrementClickCount,
    getActiveCoupons,
    getCouponById
  };
};