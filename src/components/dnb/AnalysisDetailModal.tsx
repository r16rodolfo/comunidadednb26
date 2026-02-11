import { useState } from 'react';
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
  Pencil,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { parseLocalDate } from '@/lib/utils';
import {
  recommendationBadgeStyles,
  getVariationColorClass,
} from '@/lib/recommendation-styles';
import VideoPlayerModal from './VideoPlayerModal';

const iconMap = { TrendingUp, TrendingDown, AlertTriangle, Clock };

interface AnalysisDetailModalProps {
  analysis: MarketAnalysis | null;
  recommendation: MarketRecommendation | null;
  open: boolean;
  onClose: () => void;
}

export default function AnalysisDetailModal({ analysis, recommendation, open, onClose }: AnalysisDetailModalProps) {
  const [showVideo, setShowVideo] = useState(false);

  if (!analysis || !recommendation) return null;

  const IconComponent = iconMap[recommendation.icon as keyof typeof iconMap];

  const wasEdited = analysis.updatedAt && analysis.createdAt
    && new Date(analysis.updatedAt).getTime() - new Date(analysis.createdAt).getTime() > 60000;

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <DialogTitle className="text-lg">
                  Análise de{' '}
                  {format(parseLocalDate(analysis.date), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                </DialogTitle>
                <DialogDescription className="mt-1">
                  {analysis.summary}
                </DialogDescription>
                <div className="mt-1 space-y-0.5">
                  {analysis.createdAt && (
                    <span className="text-xs text-muted-foreground block">
                      Publicado às {format(new Date(analysis.createdAt), "HH:mm 'de' dd/MM/yyyy")}
                    </span>
                  )}
                  {wasEdited && (
                    <span className="text-xs text-muted-foreground/70 italic flex items-center gap-1">
                      <Pencil className="h-2.5 w-2.5" />
                      Editado {analysis.editedByName ? `por ${analysis.editedByName}` : ''} em {format(new Date(analysis.updatedAt!), "dd/MM 'às' HH:mm")}
                    </span>
                  )}
                </div>
              </div>
              <Badge className={`${recommendationBadgeStyles[analysis.recommendation]} border text-xs font-semibold shrink-0`}>
                {IconComponent && <IconComponent className="h-3 w-3 mr-1" />}
                {recommendation.label}
              </Badge>
            </div>
          </DialogHeader>

          {/* Media buttons */}
          {(analysis.videoUrl || analysis.imageUrl) && (
            <div className="flex gap-2 -mt-1">
              {analysis.videoUrl && (
                <Button
                  className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground flex-1"
                  size="sm"
                  onClick={() => setShowVideo(true)}
                >
                  <Play className="h-4 w-4" />
                  Assistir Vídeo
                </Button>
              )}
              {analysis.imageUrl && (
                <Button
                  variant="secondary"
                  className="gap-2 flex-1"
                  size="sm"
                  onClick={() => window.open(analysis.imageUrl, '_blank')}
                >
                  <ImageIcon className="h-4 w-4" />
                  Ver Gráfico
                </Button>
              )}
            </div>
          )}

          <div className="space-y-5 pt-1">
            {/* Quotes */}
            <div className="grid grid-cols-2 gap-3">
              <QuoteCard label="USD/BRL" price={analysis.dollarPrice} variation={analysis.dollarVariation} />
              <QuoteCard label="EUR/BRL" price={analysis.euroPrice} variation={analysis.euroVariation} />
            </div>

            {/* Full Analysis */}
            <div>
              <h4 className="text-sm font-semibold mb-2 text-primary">Análise Completa</h4>
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">{analysis.fullAnalysis}</p>
            </div>

            {/* Technical Levels */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 border rounded-lg bg-destructive/5 border-destructive/20">
                <h4 className="text-xs font-semibold text-destructive flex items-center gap-1 mb-2">
                  <TrendingUp className="h-3 w-3" />Resistências
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.resistances.map((level, i) => (
                    <Badge key={i} variant="secondary" className="bg-destructive/10 text-destructive text-xs">R$ {level.toFixed(2)}</Badge>
                  ))}
                </div>
              </div>
              <div className="p-3 border rounded-lg bg-primary/5 border-primary/20">
                <h4 className="text-xs font-semibold text-primary flex items-center gap-1 mb-2">
                  <TrendingDown className="h-3 w-3" />Suportes
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.supports.map((level, i) => (
                    <Badge key={i} variant="secondary" className="bg-primary/10 text-primary text-xs">R$ {level.toFixed(2)}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Video Player Modal */}
      {analysis.videoUrl && (
        <VideoPlayerModal
          open={showVideo}
          onClose={() => setShowVideo(false)}
          videoUrl={analysis.videoUrl}
          title={`Vídeo — Análise de ${format(parseLocalDate(analysis.date), "dd/MM/yyyy")}`}
        />
      )}
    </>
  );
}

function QuoteCard({ label, price, variation }: { label: string; price: number; variation: number }) {
  return (
    <div className="p-3 rounded-lg bg-muted/50">
      <div className="flex items-center gap-2 mb-1">
        <DollarSign className="h-3 w-3 text-muted-foreground" />
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-bold">R$ {price.toFixed(2)}</span>
        <span className={`text-xs font-semibold ${getVariationColorClass(variation)}`}>
          {variation >= 0 ? '+' : ''}{variation}%
        </span>
      </div>
    </div>
  );
}
