import { MarketAnalysis, MarketRecommendation } from '@/types/dnb';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  DollarSign,
  Play,
  ImageIcon,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const iconMap = {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
};

interface AnalysisDetailModalProps {
  analysis: MarketAnalysis | null;
  recommendation: MarketRecommendation | null;
  open: boolean;
  onClose: () => void;
}

export default function AnalysisDetailModal({
  analysis,
  recommendation,
  open,
  onClose,
}: AnalysisDetailModalProps) {
  if (!analysis || !recommendation) return null;

  const IconComponent = iconMap[recommendation.icon as keyof typeof iconMap];

  const badgeStyles: Record<string, string> = {
    ideal: 'bg-green-100 text-green-800 border-green-300',
    alert: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'not-ideal': 'bg-red-100 text-red-800 border-red-300',
    wait: 'bg-blue-100 text-blue-800 border-blue-300',
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <DialogTitle className="text-lg">
                Análise de{' '}
                {format(new Date(analysis.date), "dd 'de' MMMM, yyyy", {
                  locale: ptBR,
                })}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {analysis.summary}
              </DialogDescription>
            </div>
            <Badge
              className={`${badgeStyles[analysis.recommendation]} border text-xs font-semibold shrink-0`}
            >
              {IconComponent && <IconComponent className="h-3 w-3 mr-1" />}
              {recommendation.label}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Quotes */}
          <div className="grid grid-cols-2 gap-3">
            <QuoteCard
              label="USD/BRL"
              price={analysis.dollarPrice}
              variation={analysis.dollarVariation}
            />
            <QuoteCard
              label="EUR/BRL"
              price={analysis.euroPrice}
              variation={analysis.euroVariation}
            />
          </div>

          {/* Full Analysis */}
          <div>
            <h4 className="text-sm font-semibold mb-2 text-primary">
              Análise Completa
            </h4>
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
              {analysis.fullAnalysis}
            </p>
          </div>

          {/* Technical Levels */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 border rounded-lg bg-red-50/50 border-red-200">
              <h4 className="text-xs font-semibold text-red-600 flex items-center gap-1 mb-2">
                <TrendingUp className="h-3 w-3" />
                Resistências
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {analysis.resistances.map((level, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="bg-red-100 text-red-700 text-xs"
                  >
                    R$ {level.toFixed(2)}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="p-3 border rounded-lg bg-green-50/50 border-green-200">
              <h4 className="text-xs font-semibold text-green-600 flex items-center gap-1 mb-2">
                <TrendingDown className="h-3 w-3" />
                Suportes
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {analysis.supports.map((level, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="bg-green-100 text-green-700 text-xs"
                  >
                    R$ {level.toFixed(2)}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Media Actions */}
          {(analysis.videoUrl || analysis.imageUrl) && (
            <div className="flex gap-2 pt-2 border-t">
              {analysis.videoUrl && (
                <Button variant="outline" size="sm" className="gap-2">
                  <Play className="h-4 w-4" />
                  Assistir Vídeo
                </Button>
              )}
              {analysis.imageUrl && (
                <Button variant="outline" size="sm" className="gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Ver Gráfico
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function QuoteCard({
  label,
  price,
  variation,
}: {
  label: string;
  price: number;
  variation: number;
}) {
  const isPositive = variation >= 0;

  return (
    <div className="p-3 rounded-lg bg-muted/50">
      <div className="flex items-center gap-2 mb-1">
        <DollarSign className="h-3 w-3 text-muted-foreground" />
        <span className="text-xs text-muted-foreground font-medium">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-bold">R$ {price.toFixed(2)}</span>
        <span
          className={`text-xs font-semibold ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {isPositive ? '+' : ''}
          {variation}%
        </span>
      </div>
    </div>
  );
}
