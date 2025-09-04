import { Coupon } from "@/types/coupons";
import { CouponCard } from "./CouponCard";

interface CouponGridProps {
  coupons: Coupon[];
  onGetCoupon: (coupon: Coupon) => void;
  loading?: boolean;
}

export const CouponGrid = ({ coupons, onGetCoupon, loading }: CouponGridProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-muted rounded-lg h-64" />
          </div>
        ))}
      </div>
    );
  }

  if (coupons.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <svg 
              className="w-12 h-12 text-muted-foreground" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            Nenhum cupom encontrado
          </h3>
          <p className="text-muted-foreground">
            Tente ajustar os filtros ou remover alguns critérios de busca.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {coupons.map((coupon) => (
        <CouponCard
          key={coupon.id}
          coupon={coupon}
          onGetCoupon={onGetCoupon}
        />
      ))}
    </div>
  );
};