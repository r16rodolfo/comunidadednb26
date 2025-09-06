import { useState, useEffect } from "react";
import { Ticket, Sparkles } from 'lucide-react';
import Layout from '@/components/Layout';
import { CouponFilters } from "@/components/coupons/CouponFilters";
import { CouponGrid } from "@/components/coupons/CouponGrid";
import { CouponModal } from "@/components/coupons/CouponModal";
import { useCoupons } from "@/hooks/useCoupons";
import { Coupon, CouponFilters as Filters } from "@/types/coupons";

export default function Coupons() {
  const { coupons, categories, loading, getCoupons, incrementClickCount } = useCoupons();
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    status: 'active',
    sortBy: 'newest'
  });

  useEffect(() => {
    getCoupons(filters);
  }, [filters]);

  const handleGetCoupon = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setIsModalOpen(true);
  };

  const handleCopyCode = (code: string) => {
    if (selectedCoupon) {
      incrementClickCount(selectedCoupon.id);
    }
  };

  const handleVisitSite = (url: string) => {
    if (selectedCoupon) {
      incrementClickCount(selectedCoupon.id);
    }
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

  const activeCoupons = coupons.filter(coupon => coupon.isActive);

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Ticket className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Cupons de Parceiros</h1>
            <Sparkles className="h-6 w-6 text-yellow-500" />
          </div>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubra ofertas exclusivas dos nossos parceiros e economize em suas compras favoritas.
          </p>
        </div>

        {/* Filtros */}
        <CouponFilters
          filters={filters}
          categories={categories}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          totalResults={filters.status === 'active' ? activeCoupons.length : coupons.length}
        />

        {/* Grid de Cupons */}
        <CouponGrid
          coupons={filters.status === 'active' ? activeCoupons : coupons}
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