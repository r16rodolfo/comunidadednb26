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
  Pencil,
  FileText,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { parseLocalDate } from '@/lib/utils';
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
  onViewDetail?: () => void;
}

export default function AnalysisHero({
  analysis,
  recommendation,
  onViewVideo,
  onViewImage,
  onViewDetail,
}: AnalysisHeroProps) {
  const IconComponent = iconMap[recommendation.icon as keyof typeof iconMap];

  const wasEdited = analysis.updatedAt && analysis.createdAt
    && new Date(analysis.updatedAt).getTime() - new Date(analysis.createdAt).getTime() > 60000;

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
            <div className="text-right">
              <span className="text-sm font-bold block">
                {format(parseLocalDate(analysis.date), "dd 'de' MMMM, yyyy", { locale: ptBR })}
              </span>
              {analysis.createdAt && (
                <span className="text-xs text-muted-foreground block">
                  Publicado às {format(new Date(analysis.createdAt), "HH:mm")}
                </span>
              )}
              {wasEdited && (
                <span className="text-xs text-muted-foreground/70 italic flex items-center gap-1 justify-end mt-0.5">
                  <Pencil className="h-2.5 w-2.5" />
                  Editado {analysis.editedByName ? `por ${analysis.editedByName}` : ''} em {format(new Date(analysis.updatedAt!), "dd/MM 'às' HH:mm")}
                </span>
              )}
            </div>
          </div>

          {/* Middle: Quotes */}
          <div className="grid grid-cols-2 gap-4">
            <PriceIndicator label="USD/BRL" symbol="$" price={analysis.dollarPrice} variation={analysis.dollarVariation} />
            <PriceIndicator label="EUR/BRL" symbol="€" price={analysis.euroPrice} variation={analysis.euroVariation} />
          </div>

          {/* Summary */}
          <p className="text-sm leading-relaxed text-foreground">
            {analysis.summary}
          </p>

          {/* Action buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            {onViewDetail && (
              <Button variant="default" onClick={onViewDetail} className="gap-2 flex-1 min-w-[180px]">
                <FileText className="h-4 w-4" />
                Ver análise completa
              </Button>
            )}
            {analysis.videoUrl && (
              <Button variant="outline" onClick={onViewVideo} className="gap-2 flex-1 min-w-[180px]">
                <Play className="h-4 w-4" />
                Assistir Vídeo
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PriceIndicator({ label, symbol, price, variation }: { label: string; symbol: string; price: number; variation: number }) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
        <span className="text-sm font-semibold text-muted-foreground">{symbol}</span>
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <span className="text-xl font-bold block">R$ {price.toFixed(2)}</span>
        <span className={`text-xs font-semibold block ${getVariationColorClass(variation)}`}>
          {variation >= 0 ? '+' : ''}{variation}%
        </span>
      </div>
    </div>
  );
}
