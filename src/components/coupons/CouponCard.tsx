import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ticket, Clock, ExternalLink, Tag } from "lucide-react";
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
    <Card className="group h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 border-border/50 hover:border-primary/20">
      <CardContent className="p-6 flex-1 space-y-4">
        {/* Partner Logo and Info */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted/50 flex-shrink-0 border border-border/50">
            <img 
              src={coupon.partnerLogo} 
              alt={`Logo ${coupon.partnerName}`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
              {coupon.partnerName}
            </h3>
            {coupon.category && (
              <div className="flex items-center gap-1">
                <Tag className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {coupon.category}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Offer Title */}
        <div className="space-y-2">
          <h4 className="font-medium text-foreground line-clamp-2 leading-tight">
            {coupon.offerTitle}
          </h4>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {coupon.description}
          </p>
        </div>

        {/* Expiration and Status */}
        <div className="space-y-2">
          {coupon.expirationDate && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                Válido até {format(new Date(coupon.expirationDate), 'dd/MM/yyyy', { locale: ptBR })}
              </span>
            </div>
          )}
          
          <div className="flex flex-wrap gap-2">
            {isExpiringSoon && !isExpired && (
              <Badge variant="outline" className="text-xs border-orange-200 text-orange-600">
                Expira em breve
              </Badge>
            )}
            {isExpired && (
              <Badge variant="destructive" className="text-xs">
                Expirado
              </Badge>
            )}
          </div>
        </div>

        {/* Action Button */}
        <Button 
          className="w-full group/button" 
          onClick={() => onGetCoupon(coupon)}
          disabled={isExpired}
          variant={isExpired ? "secondary" : "default"}
        >
          {isExpired ? (
            "CUPOM EXPIRADO"
          ) : (
            <>
              PEGAR CUPOM
              <ExternalLink className="ml-2 h-4 w-4 transition-transform group-hover/button:translate-x-1" />
            </>
          )}
        </Button>

        {/* Usage Stats */}
        {coupon.clickCount > 0 && (
          <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border/30">
            {coupon.clickCount} pessoas usaram este cupom
          </div>
        )}
      </CardContent>
    </Card>
  );
};