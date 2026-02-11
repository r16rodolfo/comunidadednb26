import { useState } from 'react';
import Layout from '@/components/Layout';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Info, CalendarSearch, X, TrendingUp } from 'lucide-react';
import { useDnb } from '@/hooks/useDnb';
import { parseLocalDate } from '@/lib/utils';
import { MarketAnalysis } from '@/types/dnb';
import AnalysisHero from '@/components/dnb/AnalysisHero';
import AnalysisFeedCard from '@/components/dnb/AnalysisFeedCard';
import AnalysisDetailModal from '@/components/dnb/AnalysisDetailModal';
import VideoPlayerModal from '@/components/dnb/VideoPlayerModal';
import { PageHeader } from '@/components/shared/PageHeader';

export default function DnbAnalysis() {
  const {
    analyses,
    isLoading,
    recommendationFilter,
    setRecommendationFilter,
    getLatestAnalysis,
    getRecommendationConfig,
  } = useDnb();

  const [selectedAnalysis, setSelectedAnalysis] = useState<MarketAnalysis | null>(null);
  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const [specificDate, setSpecificDate] = useState<string>('');
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [videoModal, setVideoModal] = useState<{ open: boolean; url: string; title: string }>({ open: false, url: '', title: '' });

  const latestAnalysis = getLatestAnalysis();
  const latestRecommendation = latestAnalysis
    ? getRecommendationConfig(latestAnalysis.recommendation)
    : null;

  // Filter history (exclude latest which is in the hero)
  const historyAnalyses = analyses.filter((a) => a.id !== latestAnalysis?.id);

  // Apply filters
  const filteredHistory = historyAnalyses.filter((analysis) => {
    if (specificDate) return analysis.date === specificDate;
    if (periodFilter === 'all' || showAllHistory) return true;
    const now = new Date();
    const analysisDate = parseLocalDate(analysis.date);
    const diffDays = Math.floor((now.getTime() - analysisDate.getTime()) / (1000 * 60 * 60 * 24));
    if (periodFilter === '7d') return diffDays <= 7;
    if (periodFilter === '30d') return diffDays <= 30;
    if (periodFilter === '90d') return diffDays <= 90;
    return true;
  });

  const selectedRecommendation = selectedAnalysis
    ? getRecommendationConfig(selectedAnalysis.recommendation)
    : null;

  const INITIAL_DISPLAY = 5;
  const displayedHistory = showAllHistory ? filteredHistory : filteredHistory.slice(0, INITIAL_DISPLAY);
  const hasMoreHistory = filteredHistory.length > INITIAL_DISPLAY && !showAllHistory;

  const clearFilters = () => {
    setPeriodFilter('all');
    setSpecificDate('');
    setRecommendationFilter('all');
    setShowAllHistory(false);
  };

  const hasActiveFilters = periodFilter !== 'all' || specificDate !== '' || recommendationFilter !== 'all';

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6 animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-48 bg-muted rounded-lg" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <PageHeader icon={TrendingUp} title="Análise de Mercado" description="Recomendações diárias do mercado cambial" />

        <p className="text-xs text-muted-foreground/70 flex items-start gap-1.5 leading-relaxed">
          <Info className="h-3 w-3 mt-0.5 shrink-0" />
          <span>
            <strong className="text-muted-foreground/80">Disclaimer:</strong> As análises são opinião técnica baseada em estudos fundamentalistas e técnicos. O mercado está sujeito a variações imprevisíveis.
          </span>
        </p>

        {/* Hero - Latest Analysis */}
        {latestAnalysis && latestRecommendation && (
          <AnalysisHero
            analysis={latestAnalysis}
            recommendation={latestRecommendation}
            onViewVideo={latestAnalysis.videoUrl ? () => setVideoModal({ open: true, url: latestAnalysis.videoUrl!, title: 'Vídeo — Análise mais recente' }) : undefined}
            onViewImage={latestAnalysis.imageUrl ? () => window.open(latestAnalysis.imageUrl, '_blank') : undefined}
            onViewDetail={() => setSelectedAnalysis(latestAnalysis)}
          />
        )}

        {/* History Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Histórico</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <CalendarSearch className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <Input
                  type="date"
                  value={specificDate}
                  onChange={(e) => { setSpecificDate(e.target.value); if (e.target.value) setPeriodFilter('all'); }}
                  className="h-8 text-xs pl-7 w-[150px]"
                  placeholder="Data específica"
                />
              </div>

              <Select value={periodFilter} onValueChange={(v) => { setPeriodFilter(v); setSpecificDate(''); setShowAllHistory(false); }} disabled={!!specificDate}>
                <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="Período" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todo período</SelectItem>
                  <SelectItem value="7d">Últimos 7 dias</SelectItem>
                  <SelectItem value="30d">Últimos 30 dias</SelectItem>
                  <SelectItem value="90d">Últimos 90 dias</SelectItem>
                </SelectContent>
              </Select>

              <Select value={recommendationFilter} onValueChange={setRecommendationFilter}>
                <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="Recomendação" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="ideal">Momento Ideal</SelectItem>
                  <SelectItem value="alert">Alerta</SelectItem>
                  <SelectItem value="not-ideal">Não Ideal</SelectItem>
                  <SelectItem value="wait">Aguardar</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-xs gap-1 text-muted-foreground">
                  <X className="h-3 w-3" />Limpar
                </Button>
              )}
            </div>
          </div>

          {displayedHistory.length === 0 && !hasActiveFilters ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">As análises anteriores aparecerão aqui conforme forem publicadas.</p>
            </div>
          ) : displayedHistory.length === 0 && hasActiveFilters ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">Nenhuma análise encontrada para os filtros selecionados</p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedHistory.map((analysis) => {
                const rec = getRecommendationConfig(analysis.recommendation);
                return (
                  <AnalysisFeedCard key={analysis.id} analysis={analysis} recommendation={rec} onViewDetail={() => setSelectedAnalysis(analysis)} />
                );
              })}
            </div>
          )}

          {hasMoreHistory && (
            <div className="text-center pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowAllHistory(true)} className="text-xs">
                Ver todo histórico ({filteredHistory.length} análises)
              </Button>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        <AnalysisDetailModal
          analysis={selectedAnalysis}
          recommendation={selectedRecommendation}
          open={!!selectedAnalysis}
          onClose={() => setSelectedAnalysis(null)}
        />

        {/* Video Player Modal (from Hero) */}
        <VideoPlayerModal
          open={videoModal.open}
          onClose={() => setVideoModal({ open: false, url: '', title: '' })}
          videoUrl={videoModal.url}
          title={videoModal.title}
        />
      </div>
    </Layout>
  );
}
