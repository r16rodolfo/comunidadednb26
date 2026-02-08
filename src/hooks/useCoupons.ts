import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Coupon, CouponCategory, CouponFilters, CreateCouponData, UpdateCouponData } from '@/types/coupons';

// ── Mappers ─────────────────────────────────────────────────
const mapCouponRow = (row: any): Coupon => ({
  id: row.id,
  partnerName: row.partner_name,
  partnerLogo: row.partner_logo,
  categoryId: row.category_id ?? undefined,
  category: row.coupon_categories?.name ?? undefined,
  offerTitle: row.offer_title,
  description: row.description,
  code: row.code,
  destinationUrl: row.destination_url,
  expirationDate: row.expiration_date ?? undefined,
  isActive: row.is_active,
  clickCount: row.click_count,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapCategoryRow = (row: any): CouponCategory => ({
  id: row.id,
  name: row.name,
  isActive: row.is_active,
});

// ── Hook ────────────────────────────────────────────────────
export const useCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [categories, setCategories] = useState<CouponCategory[]>([]);
  const [loading, setLoading] = useState(false);

  // ─── Fetch coupons ────────────────────────────────────────
  const getCoupons = useCallback(async (filters?: CouponFilters) => {
    setLoading(true);
    try {
      let query = supabase
        .from('coupons')
        .select('*, coupon_categories(name)');

      if (filters?.status === 'active') {
        query = query.eq('is_active', true);
      } else if (filters?.status === 'inactive') {
        query = query.eq('is_active', false);
      }

      if (filters?.search) {
        const searchPattern = `%${filters.search}%`;
        query = query.or(`partner_name.ilike.${searchPattern},offer_title.ilike.${searchPattern}`);
      }

      // Sort
      switch (filters?.sortBy) {
        case 'expiring':
          query = query.order('expiration_date', { ascending: true, nullsFirst: false });
          break;
        case 'partner':
          query = query.order('partner_name', { ascending: true });
          break;
        case 'clicks':
          query = query.order('click_count', { ascending: false });
          break;
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }

      const { data, error } = await query;
      if (error) throw error;

      let mapped = (data || []).map(mapCouponRow);

      // Client-side category filter (by name)
      if (filters?.category) {
        mapped = mapped.filter(c => c.category === filters.category);
      }

      setCoupons(mapped);
    } catch (err) {
      console.error('Error fetching coupons:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── Fetch categories ─────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    const { data, error } = await supabase
      .from('coupon_categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
      return;
    }
    setCategories((data || []).map(mapCategoryRow));
  }, []);

  // ─── Category CRUD ────────────────────────────────────────
  const addCategory = useCallback(async (name: string): Promise<CouponCategory | null> => {
    const trimmed = name.trim();
    if (!trimmed) return null;

    const { data, error } = await supabase
      .from('coupon_categories')
      .insert({ name: trimmed })
      .select()
      .single();

    if (error) {
      console.error('Error adding category:', error);
      return null;
    }

    const newCat = mapCategoryRow(data);
    setCategories(prev => [...prev, newCat].sort((a, b) => a.name.localeCompare(b.name)));
    return newCat;
  }, []);

  const updateCategory = useCallback(async (id: string, name: string): Promise<boolean> => {
    const trimmed = name.trim();
    if (!trimmed) return false;

    const { error } = await supabase
      .from('coupon_categories')
      .update({ name: trimmed })
      .eq('id', id);

    if (error) {
      console.error('Error updating category:', error);
      return false;
    }

    setCategories(prev =>
      prev.map(c => c.id === id ? { ...c, name: trimmed } : c)
        .sort((a, b) => a.name.localeCompare(b.name))
    );
    return true;
  }, []);

  const toggleCategory = useCallback(async (id: string) => {
    const cat = categories.find(c => c.id === id);
    if (!cat) return;

    const { error } = await supabase
      .from('coupon_categories')
      .update({ is_active: !cat.isActive })
      .eq('id', id);

    if (error) {
      console.error('Error toggling category:', error);
      return;
    }

    setCategories(prev => prev.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
  }, [categories]);

  const deleteCategory = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('coupon_categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting category:', error);
      return;
    }

    setCategories(prev => prev.filter(c => c.id !== id));
  }, []);

  const getCouponsCountByCategory = useCallback((categoryName: string): number => {
    return coupons.filter(c => c.category === categoryName).length;
  }, [coupons]);

  // ─── Coupon CRUD ──────────────────────────────────────────
  const createCoupon = async (data: CreateCouponData): Promise<Coupon> => {
    const { data: row, error } = await supabase
      .from('coupons')
      .insert({
        partner_name: data.partnerName,
        partner_logo: data.partnerLogo,
        category_id: data.categoryId || null,
        offer_title: data.offerTitle,
        description: data.description,
        code: data.code,
        destination_url: data.destinationUrl,
        expiration_date: data.expirationDate || null,
        is_active: data.isActive,
      })
      .select('*, coupon_categories(name)')
      .single();

    if (error) throw error;
    return mapCouponRow(row);
  };

  const updateCoupon = async (data: UpdateCouponData): Promise<Coupon> => {
    const updatePayload: Record<string, any> = {};
    if (data.partnerName !== undefined) updatePayload.partner_name = data.partnerName;
    if (data.partnerLogo !== undefined) updatePayload.partner_logo = data.partnerLogo;
    if (data.categoryId !== undefined) updatePayload.category_id = data.categoryId || null;
    if (data.offerTitle !== undefined) updatePayload.offer_title = data.offerTitle;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.code !== undefined) updatePayload.code = data.code;
    if (data.destinationUrl !== undefined) updatePayload.destination_url = data.destinationUrl;
    if (data.expirationDate !== undefined) updatePayload.expiration_date = data.expirationDate || null;
    if (data.isActive !== undefined) updatePayload.is_active = data.isActive;

    const { data: row, error } = await supabase
      .from('coupons')
      .update(updatePayload)
      .eq('id', data.id)
      .select('*, coupon_categories(name)')
      .single();

    if (error) throw error;
    return mapCouponRow(row);
  };

  const deleteCoupon = async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id);

    if (error) throw error;
  };

  const incrementClickCount = async (id: string): Promise<void> => {
    await supabase.rpc('increment_coupon_click', { coupon_id: id });
  };

  return {
    coupons, categories, loading,
    getCoupons, fetchCategories,
    createCoupon, updateCoupon, deleteCoupon,
    incrementClickCount,
    addCategory, updateCategory, toggleCategory, deleteCategory,
    getCouponsCountByCategory,
  };
};
