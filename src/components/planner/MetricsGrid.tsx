import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { PlannerMetrics } from "@/types/planner";
import { Target, TrendingUp, Clock, DollarSign, Calendar } from "lucide-react";

interface MetricsGridProps {
  metrics: PlannerMetrics;
  currency: string;
}

export function MetricsGrid({ metrics, currency }: MetricsGridProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : 'BRL',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatRate = (rate: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 4,
    }).format(rate);
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
      {/* Objetivo da Viagem */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Objetivo da Viagem</CardTitle>
          <Target className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {formatCurrency(metrics.targetAmount)}
          </div>
          <p className="text-xs text-muted-foreground">
            Meta em {currency}
          </p>
        </CardContent>
      </Card>

      {/* Total Comprado */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Comprado</CardTitle>
          <DollarSign className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {formatCurrency(metrics.totalPurchased)}
          </div>
          <p className="text-xs text-muted-foreground">
            {metrics.progressPercentage.toFixed(1)}% da meta
          </p>
        </CardContent>
      </Card>

      {/* Quanto Falta */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Quanto Falta</CardTitle>
          <TrendingUp className="h-4 w-4 text-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {formatCurrency(metrics.remaining)}
          </div>
          <div className="mt-2 space-y-2">
            <Progress value={metrics.progressPercentage} className="w-full" />
            <p className="text-xs text-muted-foreground">
              {(100 - metrics.progressPercentage).toFixed(1)}% restante
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preço Médio Pago */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Preço Médio Pago</CardTitle>
          <TrendingUp className="h-4 w-4 text-warning" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {metrics.averageRate > 0 ? formatRate(metrics.averageRate) : "—"}
          </div>
          <p className="text-xs text-muted-foreground">
            Custo médio por {currency}
          </p>
        </CardContent>
      </Card>

      {/* Data da Viagem */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Data da Viagem</CardTitle>
          <Calendar className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {metrics.daysUntilTrip}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-muted-foreground">
              {metrics.daysUntilTrip === 1 ? 'dia restante' : 'dias restantes'}
            </p>
            {metrics.daysUntilTrip < 30 && (
              <Badge variant="destructive" className="text-xs">
                Urgente
              </Badge>
            )}
            {metrics.daysUntilTrip >= 30 && metrics.daysUntilTrip < 90 && (
              <Badge variant="secondary" className="text-xs">
                Médio prazo
              </Badge>
            )}
            {metrics.daysUntilTrip >= 90 && (
              <Badge variant="outline" className="text-xs">
                Longo prazo
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}