import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ticket, Clock } from "lucide-react";
import { Coupon } from "@/types/coupons";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CouponCardProps {
  coupon: Coupon;
  onGetCoupon: (coupon: Coupon) => void;
}

export const CouponCard = ({ coupon, onGetCoupon }: CouponCardProps) => {
  const isExpiringSoon = coupon.expirationDate && 
    new Date(coupon.expirationDate).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000;

  const isExpired = coupon.expirationDate && new Date(coupon.expirationDate) < new Date();

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-card border-border">
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
            <img 
              src={coupon.partnerLogo} 
              alt={`Logo ${coupon.partnerName}`}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground mb-1 truncate">
              {coupon.partnerName}
            </h3>
            
            {coupon.category && (
              <Badge variant="secondary" className="text-xs mb-2">
                {coupon.category}
              </Badge>
            )}
          </div>
        </div>

        <div className="mb-4">
          <h4 className="font-medium text-foreground mb-2 line-clamp-2">
            {coupon.offerTitle}
          </h4>
          
          {coupon.expirationDate && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
              <Clock className="w-3 h-3" />
              <span>
                Válido até {format(new Date(coupon.expirationDate), 'dd/MM/yyyy', { locale: ptBR })}
              </span>
              {isExpiringSoon && !isExpired && (
                <Badge variant="outline" className="ml-2 text-xs border-amber-500 text-amber-600">
                  Expira em breve
                </Badge>
              )}
              {isExpired && (
                <Badge variant="destructive" className="ml-2 text-xs">
                  Expirado
                </Badge>
              )}
            </div>
          )}
        </div>

        <Button 
          onClick={() => onGetCoupon(coupon)}
          disabled={isExpired}
          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
          variant={isExpired ? "outline" : "default"}
        >
          <Ticket className="w-4 h-4 mr-2" />
          {isExpired ? 'Cupom Expirado' : 'PEGAR CUPOM'}
        </Button>

        {coupon.clickCount > 0 && (
          <div className="text-xs text-muted-foreground text-center mt-2">
            {coupon.clickCount} pessoas usaram este cupom
          </div>
        )}
      </CardContent>
    </Card>
  );
};