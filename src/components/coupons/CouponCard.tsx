import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, ExternalLink, Tag, Lock, Crown } from "lucide-react";
import { Coupon } from "@/types/coupons";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

interface CouponCardProps {
  coupon: Coupon;
  onGetCoupon: (coupon: Coupon) => void;
  isUserPremium?: boolean;
}

export const CouponCard = ({ coupon, onGetCoupon, isUserPremium = false }: CouponCardProps) => {
  const navigate = useNavigate();
  const isExpiringSoon = coupon.expirationDate && 
    new Date(coupon.expirationDate).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000;
  const isExpired = coupon.expirationDate && new Date(coupon.expirationDate) < new Date();
  const isLocked = coupon.isPremiumOnly && !isUserPremium;

  return (
    <Card className="group h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 border-border/50 hover:border-primary/20 relative overflow-hidden">
      {/* Premium badge */}
      {coupon.isPremiumOnly && (
        <div className="absolute top-3 right-3 z-10">
          <Badge className="bg-amber-500/90 text-white border-0 text-xs gap-1">
            <Crown className="h-3 w-3" />
            Premium
          </Badge>
        </div>
      )}

      <CardContent className="p-6 flex-1 space-y-4">
        {/* Partner Logo and Info — always visible */}
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

        {/* Blurred content for locked coupons */}
        <div className={isLocked ? "blur-sm select-none pointer-events-none" : ""}>
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
          <div className="space-y-2 mt-3">
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
            className="w-full group/button mt-4" 
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
            <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border/30 mt-3">
              {coupon.clickCount} pessoas usaram este cupom
            </div>
          )}
        </div>

        {/* Lock overlay for free users */}
        {isLocked && (
          <div className="absolute inset-0 top-[85px] flex items-center justify-center bg-background/30 backdrop-blur-[1px] rounded-b-lg">
            <div className="flex flex-col items-center gap-3 text-center px-6">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Lock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Exclusivo Premium</p>
                <p className="text-xs text-muted-foreground mt-1">Assine para desbloquear este cupom</p>
              </div>
              <Button 
                size="sm" 
                className="bg-amber-500 hover:bg-amber-600 text-white"
                onClick={() => navigate('/subscription')}
              >
                Assinar agora
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
