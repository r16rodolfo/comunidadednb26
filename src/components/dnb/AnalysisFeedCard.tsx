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
  Eye,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const iconMap = {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
};

interface AnalysisFeedCardProps {
  analysis: MarketAnalysis;
  recommendation: MarketRecommendation;
  onViewDetail: () => void;
}

export default function AnalysisFeedCard({
  analysis,
  recommendation,
  onViewDetail,
}: AnalysisFeedCardProps) {
  const IconComponent = iconMap[recommendation.icon as keyof typeof iconMap];

  const badgeStyles: Record<string, string> = {
    ideal: 'bg-green-100 text-green-700 border-green-200',
    alert: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'not-ideal': 'bg-red-100 text-red-700 border-red-200',
    wait: 'bg-blue-100 text-blue-700 border-blue-200',
  };

  const dotStyles: Record<string, string> = {
    ideal: 'bg-green-500',
    alert: 'bg-yellow-500',
    'not-ideal': 'bg-red-500',
    wait: 'bg-blue-500',
  };

  return (
    <Card
      className="group cursor-pointer hover:shadow-md transition-all duration-200 hover:border-primary/30"
      onClick={onViewDetail}
    >
      <CardContent className="p-4 md:p-5">
        <div className="flex items-start gap-4">
          {/* Timeline dot */}
          <div className="flex flex-col items-center pt-1 shrink-0">
            <div className={`w-3 h-3 rounded-full ${dotStyles[analysis.recommendation]} ring-2 ring-background shadow-sm`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Top row: date + badge */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  {format(new Date(analysis.date), "dd/MM/yyyy", { locale: ptBR })}
                </span>
                <Badge
                  variant="outline"
                  className={`${badgeStyles[analysis.recommendation]} border text-xs font-medium`}
                >
                  {IconComponent && <IconComponent className="h-3 w-3 mr-1" />}
                  {recommendation.label}
                </Badge>
              </div>

              {/* Prices */}
              <div className="flex items-center gap-2 sm:gap-3 text-xs flex-wrap">
                <span className="font-medium">
                  USD <span className="font-bold">R$ {analysis.dollarPrice.toFixed(2)}</span>
                  <span className={`ml-1 ${analysis.dollarVariation >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analysis.dollarVariation >= 0 ? '+' : ''}{analysis.dollarVariation}%
                  </span>
                </span>
                <span className="text-muted-foreground hidden sm:inline">|</span>
                <span className="font-medium">
                  EUR <span className="font-bold">R$ {analysis.euroPrice.toFixed(2)}</span>
                  <span className={`ml-1 ${analysis.euroVariation >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analysis.euroVariation >= 0 ? '+' : ''}{analysis.euroVariation}%
                  </span>
                </span>
              </div>
            </div>

            {/* Summary */}
            <p className="text-sm text-muted-foreground line-clamp-2">
              {analysis.summary}
            </p>

            {/* Bottom row: media indicators + action */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                {analysis.videoUrl && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Play className="h-3 w-3" /> Vídeo
                  </span>
                )}
                {analysis.imageUrl && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <ImageIcon className="h-3 w-3" /> Gráfico
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetail();
                }}
              >
                <Eye className="h-3 w-3" />
                Ver análise
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
