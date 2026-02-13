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
  const [showImage, setShowImage] = useState(false);

  if (!analysis || !recommendation) return null;

  const IconComponent = iconMap[recommendation.icon as keyof typeof iconMap];

  const wasEdited = analysis.updatedAt && analysis.createdAt
    && new Date(analysis.updatedAt).getTime() - new Date(analysis.createdAt).getTime() > 60000;

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 gap-4">
          {/* Header */}
          <DialogHeader className="pb-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <DialogTitle className="text-base sm:text-lg">
                  Análise de{' '}
                  {format(parseLocalDate(analysis.date), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Detalhes da análise de mercado
                </DialogDescription>
                <div className="mt-1 space-y-0.5">
                  {analysis.createdAt && (
                    <span className="text-xs text-muted-foreground block">
                      Publicado em {format(new Date(analysis.createdAt), "dd/MM/yyyy 'às' HH:mm")}
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
              <Badge className={`${recommendationBadgeStyles[analysis.recommendation]} border text-xs font-semibold shrink-0 mr-6`}>
                {IconComponent && <IconComponent className="h-3 w-3 mr-1" />}
                {recommendation.label}
              </Badge>
            </div>
          </DialogHeader>

          {/* 3-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Card 1: Video / Media */}
            <div className="rounded-xl border bg-card p-4 flex flex-col gap-3">
              <h4 className="text-sm font-semibold">Assista nossa análise</h4>
              {analysis.videoUrl ? (
                <div
                  className="relative rounded-lg overflow-hidden bg-muted aspect-video cursor-pointer group"
                  onClick={() => setShowVideo(true)}
                >
                  {analysis.imageUrl ? (
                    <img src={analysis.imageUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center">
                      <Play className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                    <div className="h-11 w-11 rounded-full bg-primary/90 flex items-center justify-center">
                      <Play className="h-5 w-5 text-primary-foreground fill-primary-foreground" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center rounded-lg bg-muted/50 p-6">
                  <p className="text-xs text-muted-foreground text-center">Nenhum vídeo disponível</p>
                </div>
              )}
              {analysis.imageUrl && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-2 w-full"
                  onClick={() => window.open(analysis.imageUrl, '_blank')}
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  Ver Gráfico
                </Button>
              )}
            </div>

            {/* Card 2: Cotações */}
            <div className="rounded-xl border bg-card p-4 flex flex-col gap-4">
              <h4 className="text-sm font-semibold">Cotação na Publicação</h4>
              <QuoteRow flag="🇺🇸" label="USD/BRL" price={analysis.dollarPrice} variation={analysis.dollarVariation} />
              <div className="border-t" />
              <QuoteRow flag="🇪🇺" label="EUR/BRL" price={analysis.euroPrice} variation={analysis.euroVariation} />
            </div>

            {/* Card 3: Níveis de Negociação */}
            <div className="rounded-xl border bg-card p-4 flex flex-col gap-3">
              <h4 className="text-sm font-semibold">Níveis de Negociação</h4>
              <div className="space-y-2">
                {analysis.resistances.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-destructive" />
                      Resistências
                    </span>
                    {analysis.resistances.map((level, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-lg border bg-destructive/5 border-destructive/15">
                        <span className="text-xs text-muted-foreground">Nível {i + 1}</span>
                        <span className="text-sm font-bold">R$ {level.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
                {analysis.supports.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <TrendingDown className="h-3 w-3 text-primary" />
                      Suportes
                    </span>
                    {analysis.supports.map((level, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-lg border bg-primary/5 border-primary/15">
                        <span className="text-xs text-muted-foreground">Nível {i + 1}</span>
                        <span className="text-sm font-bold">R$ {level.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
                {analysis.resistances.length === 0 && analysis.supports.length === 0 && (
                  <p className="text-xs text-muted-foreground">Nenhum nível informado</p>
                )}
              </div>
            </div>
          </div>

          {/* Análise do Especialista */}
          {analysis.fullAnalysis && (
            <div className="rounded-xl border bg-card p-4">
              <h4 className="text-sm font-semibold mb-3">Análise do Especialista</h4>
              <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">
                {analysis.fullAnalysis}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

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

function QuoteRow({ flag, label, price, variation }: { flag: string; label: string; price: number; variation: number }) {
  const arrow = variation >= 0 ? '▲' : '▼';
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-base">{flag}</span>
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight">{price.toFixed(4)}</span>
        <span className={`text-xs font-semibold ${getVariationColorClass(variation)}`}>
          {arrow} {Math.abs(variation).toFixed(2)}%
        </span>
      </div>
    </div>
  );
}
