import { useState, useEffect } from "react";
import { Ticket } from 'lucide-react';
import Layout from '@/components/Layout';
import { CouponFilters } from "@/components/coupons/CouponFilters";
import { CouponGrid } from "@/components/coupons/CouponGrid";
import { CouponModal } from "@/components/coupons/CouponModal";
import { useCoupons } from "@/hooks/useCoupons";
import { Coupon, CouponFilters as Filters } from "@/types/coupons";
import { PageHeader } from '@/components/shared/PageHeader';

export default function Coupons() {
  const { coupons, categories, loading, getCoupons, fetchCategories, incrementClickCount } = useCoupons();
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    status: 'active',
    sortBy: 'newest'
  });

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    getCoupons(filters);
  }, [filters, getCoupons]);

  const handleGetCoupon = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setIsModalOpen(true);
    incrementClickCount(coupon.id);
  };

  const handleCopyCode = (_code: string) => {
    // Click already counted when modal opened
  };

  const handleVisitSite = (_url: string) => {
    // Click already counted when modal opened
  };

  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      status: 'active',
      sortBy: 'newest'
    });
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <PageHeader icon={Ticket} title="Cupons de Parceiros" description="Descubra ofertas exclusivas dos nossos parceiros." />

        {/* Filtros */}
        <CouponFilters
          filters={filters}
          categories={categories}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          totalResults={coupons.length}
        />

        {/* Grid de Cupons */}
        <CouponGrid
          coupons={coupons}
          onGetCoupon={handleGetCoupon}
          loading={loading}
        />

        {/* Modal de Detalhes */}
        <CouponModal
          coupon={selectedCoupon}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCopyCode={handleCopyCode}
          onVisitSite={handleVisitSite}
        />
      </div>
    </Layout>
  );
}
