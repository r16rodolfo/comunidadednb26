import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Copy, ExternalLink, Clock, Check } from "lucide-react";
import { Coupon } from "@/types/coupons";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface CouponModalProps {
  coupon: Coupon | null;
  isOpen: boolean;
  onClose: () => void;
  onCopyCode: (code: string) => void;
  onVisitSite: (url: string) => void;
}

export const CouponModal = ({ coupon, isOpen, onClose, onCopyCode, onVisitSite }: CouponModalProps) => {
  const [codeCopied, setCodeCopied] = useState(false);
  const { toast } = useToast();

  if (!coupon) return null;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCodeCopied(true);
      onCopyCode(coupon.code);
      toast({
        title: "Código copiado!",
        description: "O código do cupom foi copiado para sua área de transferência.",
      });
      
      setTimeout(() => setCodeCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o código. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleVisitSite = () => {
    onVisitSite(coupon.destinationUrl);
    window.open(coupon.destinationUrl, '_blank', 'noopener,noreferrer');
  };

  const isExpired = coupon.expirationDate && new Date(coupon.expirationDate) < new Date();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
              <img 
                src={coupon.partnerLogo} 
                alt={`Logo ${coupon.partnerName}`}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-1">
              <DialogTitle className="text-lg font-semibold text-left">
                {coupon.partnerName}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {coupon.offerTitle}
              </p>
              {coupon.category && (
                <Badge variant="secondary" className="mt-2">
                  {coupon.category}
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <Separator />

        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2 text-foreground">Regras de Utilização</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {coupon.description}
            </p>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-2">Código do cupom</p>
              <div className="flex items-center justify-between">
                <code className="text-lg font-mono font-bold text-foreground">
                  {coupon.code}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyCode}
                  disabled={isExpired}
                  className="ml-2"
                >
                  {codeCopied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {codeCopied ? 'Copiado!' : 'Copiar'}
                </Button>
              </div>
            </div>

            <Button 
              onClick={handleVisitSite}
              disabled={isExpired}
              className="w-full"
              size="lg"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              {isExpired ? 'Cupom Expirado' : 'IR PARA O SITE'}
            </Button>
          </div>

          {coupon.expirationDate && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-2">
              <Clock className="w-4 h-4" />
              <span>
                {isExpired 
                  ? `Expirou em ${format(new Date(coupon.expirationDate), 'dd/MM/yyyy', { locale: ptBR })}`
                  : `Válido até ${format(new Date(coupon.expirationDate), 'dd/MM/yyyy', { locale: ptBR })}`
                }
              </span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};