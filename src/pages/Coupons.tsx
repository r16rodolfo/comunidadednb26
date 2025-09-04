import { useState, useEffect } from "react";
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Portal de Cupons de Parceiros
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubra ofertas exclusivas dos nossos parceiros e economize em suas compras favoritas.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <CouponFilters
            filters={filters}
            categories={categories}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
            totalResults={filters.status === 'active' ? activeCoupons.length : coupons.length}
          />
        </div>

        {/* Coupons Grid */}
        <CouponGrid
          coupons={filters.status === 'active' ? activeCoupons : coupons}
          onGetCoupon={handleGetCoupon}
          loading={loading}
        />

        {/* Coupon Detail Modal */}
        <CouponModal
          coupon={selectedCoupon}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCopyCode={handleCopyCode}
          onVisitSite={handleVisitSite}
        />
      </div>
    </div>
  );
}