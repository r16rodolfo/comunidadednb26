import { useState, useEffect, useCallback } from 'react';
import { Coupon, CouponCategory, CouponFilters, CreateCouponData, UpdateCouponData } from '@/types/coupons';
import { mockCoupons as initialMockCoupons, mockCategories as defaultCategories } from '@/data/mock-coupons';

const CATEGORIES_STORAGE_KEY = 'dnb_coupon_categories';

const loadCategories = (): CouponCategory[] => {
  const stored = localStorage.getItem(CATEGORIES_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return defaultCategories;
    }
  }
  return defaultCategories;
};

const saveCategories = (categories: CouponCategory[]) => {
  localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
};

export const useCoupons = () => {
  const [allCoupons, setAllCoupons] = useState<Coupon[]>(initialMockCoupons);
  const [coupons, setCoupons] = useState<Coupon[]>(initialMockCoupons);
  const [categories, setCategories] = useState<CouponCategory[]>(loadCategories);
  const [loading, setLoading] = useState(false);

  const getCoupons = useCallback((filters?: CouponFilters) => {
    setLoading(true);
    setTimeout(() => {
      let filtered = [...allCoupons];

      if (filters?.category) {
        filtered = filtered.filter(coupon => coupon.category === filters.category);
      }

      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(coupon =>
          coupon.partnerName.toLowerCase().includes(searchLower) ||
          coupon.offerTitle.toLowerCase().includes(searchLower)
        );
      }

      if (filters?.status && filters.status !== 'all') {
        if (filters.status === 'active') {
          filtered = filtered.filter(coupon => coupon.isActive);
        } else if (filters.status === 'inactive') {
          filtered = filtered.filter(coupon => !coupon.isActive);
        }
      }

      if (filters?.sortBy) {
        switch (filters.sortBy) {
          case 'newest':
            filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            break;
          case 'expiring':
            filtered.sort((a, b) => {
              if (!a.expirationDate) return 1;
              if (!b.expirationDate) return -1;
              return new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
            });
            break;
          case 'partner':
            filtered.sort((a, b) => a.partnerName.localeCompare(b.partnerName));
            break;
          case 'clicks':
            filtered.sort((a, b) => b.clickCount - a.clickCount);
            break;
        }
      }

      setCoupons(filtered);
      setLoading(false);
    }, 500);
  }, [allCoupons]);

  // ─── Category CRUD ────────────────────────────────────────

  const addCategory = useCallback((name: string): CouponCategory | null => {
    const trimmed = name.trim();
    if (!trimmed) return null;

    const exists = categories.some(c => c.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) return null;

    const newCategory: CouponCategory = {
      id: Date.now().toString(),
      name: trimmed,
      isActive: true,
    };
    const updated = [...categories, newCategory];
    setCategories(updated);
    saveCategories(updated);
    return newCategory;
  }, [categories]);

  const updateCategory = useCallback((id: string, name: string): boolean => {
    const trimmed = name.trim();
    if (!trimmed) return false;

    const exists = categories.some(c => c.name.toLowerCase() === trimmed.toLowerCase() && c.id !== id);
    if (exists) return false;

    const oldCategory = categories.find(c => c.id === id);
    const updated = categories.map(c => c.id === id ? { ...c, name: trimmed } : c);
    setCategories(updated);
    saveCategories(updated);

    // Update coupons that use the old category name
    if (oldCategory && oldCategory.name !== trimmed) {
      setAllCoupons(prev => prev.map(coupon =>
        coupon.category === oldCategory.name ? { ...coupon, category: trimmed } : coupon
      ));
    }

    return true;
  }, [categories]);

  const toggleCategory = useCallback((id: string) => {
    const updated = categories.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c);
    setCategories(updated);
    saveCategories(updated);
  }, [categories]);

  const deleteCategory = useCallback((id: string) => {
    const category = categories.find(c => c.id === id);
    const updated = categories.filter(c => c.id !== id);
    setCategories(updated);
    saveCategories(updated);

    // Remove category from coupons that use it
    if (category) {
      setAllCoupons(prev => prev.map(coupon =>
        coupon.category === category.name ? { ...coupon, category: undefined } : coupon
      ));
    }
  }, [categories]);

  const getCouponsCountByCategory = useCallback((categoryName: string): number => {
    return allCoupons.filter(c => c.category === categoryName).length;
  }, [allCoupons]);

  // ─── Coupon CRUD ──────────────────────────────────────────

  const createCoupon = async (data: CreateCouponData): Promise<Coupon> => {
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        const newCoupon: Coupon = {
          ...data,
          id: Date.now().toString(),
          clickCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setAllCoupons(prev => [newCoupon, ...prev]);
        setLoading(false);
        resolve(newCoupon);
      }, 1000);
    });
  };

  const updateCoupon = async (data: UpdateCouponData): Promise<Coupon> => {
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        setAllCoupons(prev => prev.map(coupon =>
          coupon.id === data.id
            ? { ...coupon, ...data, updatedAt: new Date() }
            : coupon
        ));
        const updatedCoupon = allCoupons.find(c => c.id === data.id)!;
        setLoading(false);
        resolve(updatedCoupon);
      }, 1000);
    });
  };

  const deleteCoupon = async (id: string): Promise<void> => {
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        setAllCoupons(prev => prev.filter(coupon => coupon.id !== id));
        setLoading(false);
        resolve();
      }, 500);
    });
  };

  const incrementClickCount = async (id: string): Promise<void> => {
    setAllCoupons(prev => prev.map(coupon =>
      coupon.id === id
        ? { ...coupon, clickCount: coupon.clickCount + 1 }
        : coupon
    ));
  };

  const getActiveCoupons = () => coupons.filter(coupon => coupon.isActive);
  const getCouponById = (id: string) => allCoupons.find(coupon => coupon.id === id);

  useEffect(() => {
    getCoupons();
  }, [getCoupons]);

  return {
    coupons, categories, loading,
    getCoupons, createCoupon, updateCoupon, deleteCoupon,
    incrementClickCount, getActiveCoupons, getCouponById,
    addCategory, updateCategory: updateCategory, toggleCategory, deleteCategory,
    getCouponsCountByCategory,
  };
};
