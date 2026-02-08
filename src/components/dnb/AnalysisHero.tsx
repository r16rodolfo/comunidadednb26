import { MarketAnalysis, MarketRecommendation } from '@/types/dnb';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  Play,
  ImageIcon,
  DollarSign,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  recommendationBadgeStyles,
  recommendationGradientStyles,
  getVariationColorClass,
} from '@/lib/recommendation-styles';

const iconMap = {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
};

interface AnalysisHeroProps {
  analysis: MarketAnalysis;
  recommendation: MarketRecommendation;
  onViewVideo?: () => void;
  onViewImage?: () => void;
}

export default function AnalysisHero({
  analysis,
  recommendation,
  onViewVideo,
  onViewImage,
}: AnalysisHeroProps) {
  const IconComponent = iconMap[recommendation.icon as keyof typeof iconMap];

  return (
    <Card className={`border-2 bg-gradient-to-br ${recommendationGradientStyles[analysis.recommendation]} shadow-lg overflow-hidden`}>
      <CardContent className="p-6 md:p-8">
        <div className="flex flex-col gap-6">
          {/* Top: Badge + Date */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              {IconComponent && (
                <div className={`p-2 rounded-full ${recommendationBadgeStyles[analysis.recommendation]}`}>
                  <IconComponent className="h-5 w-5" />
                </div>
              )}
              <div>
                <Badge className={`${recommendationBadgeStyles[analysis.recommendation]} border text-sm font-semibold px-3 py-1`}>
                  {recommendation.label}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  {recommendation.description}
                </p>
              </div>
            </div>
            <span className="text-sm text-muted-foreground font-medium">
              {format(new Date(analysis.date), "dd 'de' MMMM, yyyy", { locale: ptBR })}
            </span>
          </div>

          {/* Middle: Quotes */}
          <div className="grid grid-cols-2 gap-4">
            <PriceIndicator
              label="USD/BRL"
              price={analysis.dollarPrice}
              variation={analysis.dollarVariation}
            />
            <PriceIndicator
              label="EUR/BRL"
              price={analysis.euroPrice}
              variation={analysis.euroVariation}
            />
          </div>

          {/* Summary */}
          <p className="text-sm leading-relaxed text-foreground/80">
            {analysis.summary}
          </p>

          {/* Media buttons */}
          <div className="flex items-center gap-2">
            {analysis.videoUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={onViewVideo}
                className="gap-2"
              >
                <Play className="h-4 w-4" />
                Assistir Vídeo
              </Button>
            )}
            {analysis.imageUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={onViewImage}
                className="gap-2"
              >
                <ImageIcon className="h-4 w-4" />
                Ver Gráfico
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PriceIndicator({
  label,
  price,
  variation,
}: {
  label: string;
  price: number;
  variation: number;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-background/60 backdrop-blur-sm">
      <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold">R$ {price.toFixed(2)}</span>
          <span className={`text-xs font-semibold ${getVariationColorClass(variation)}`}>
            {variation >= 0 ? '+' : ''}
            {variation}%
          </span>
        </div>
      </div>
    </div>
  );
}
