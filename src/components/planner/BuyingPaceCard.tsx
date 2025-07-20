import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BuyingPace } from "@/types/planner";
import { Clock, AlertTriangle, CheckCircle } from "lucide-react";

interface BuyingPaceCardProps {
  buyingPace: BuyingPace;
  currency: string;
}

export function BuyingPaceCard({ buyingPace, currency }: BuyingPaceCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : 'BRL',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getUrgencyConfig = () => {
    switch (buyingPace.urgencyLevel) {
      case 'high':
        return {
          icon: AlertTriangle,
          badge: { variant: 'destructive' as const, text: 'Alta Urgência' },
          description: 'Considere acelerar suas compras para atingir a meta',
          cardClass: 'border-destructive/50'
        };
      case 'medium':
        return {
          icon: Clock,
          badge: { variant: 'secondary' as const, text: 'Ritmo Moderado' },
          description: 'Mantenha um ritmo constante de compras',
          cardClass: 'border-warning/50'
        };
      case 'low':
        return {
          icon: CheckCircle,
          badge: { variant: 'outline' as const, text: 'Sem Pressa' },
          description: 'Você tem bastante tempo para planejar suas compras',
          cardClass: 'border-success/50'
        };
    }
  };

  const urgencyConfig = getUrgencyConfig();
  const UrgencyIcon = urgencyConfig.icon;

  return (
    <Card className={urgencyConfig.cardClass}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <UrgencyIcon className="h-5 w-5" />
            Ritmo de Compra
          </CardTitle>
          <Badge variant={urgencyConfig.badge.variant}>
            {urgencyConfig.badge.text}
          </Badge>
        </div>
        <CardDescription>
          {urgencyConfig.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-foreground">Semanal</p>
              <p className="text-xs text-muted-foreground">Compra a cada semana</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-foreground">
                {formatCurrency(buyingPace.weekly)}
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-foreground">Quinzenal</p>
              <p className="text-xs text-muted-foreground">Compra a cada 2 semanas</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-foreground">
                {formatCurrency(buyingPace.biweekly)}
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-foreground">Mensal</p>
              <p className="text-xs text-muted-foreground">Compra a cada mês</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-foreground">
                {formatCurrency(buyingPace.monthly)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}