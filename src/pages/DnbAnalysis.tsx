import { useState } from 'react';
import Layout from '@/components/Layout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Info } from 'lucide-react';
import { useDnb } from '@/hooks/useDnb';
import { MarketAnalysis } from '@/types/dnb';
import AnalysisHero from '@/components/dnb/AnalysisHero';
import AnalysisFeedCard from '@/components/dnb/AnalysisFeedCard';
import AnalysisDetailModal from '@/components/dnb/AnalysisDetailModal';

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

  const latestAnalysis = getLatestAnalysis();
  const latestRecommendation = latestAnalysis
    ? getRecommendationConfig(latestAnalysis.recommendation)
    : null;

  // Filter history (exclude latest which is in the hero)
  const historyAnalyses = analyses.filter((a) => a.id !== latestAnalysis?.id);

  // Period filter logic
  const filteredHistory = historyAnalyses.filter((analysis) => {
    if (periodFilter === 'all') return true;
    const now = new Date();
    const analysisDate = new Date(analysis.date);
    const diffDays = Math.floor(
      (now.getTime() - analysisDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (periodFilter === '7d') return diffDays <= 7;
    if (periodFilter === '30d') return diffDays <= 30;
    if (periodFilter === '90d') return diffDays <= 90;
    return true;
  });

  const selectedRecommendation = selectedAnalysis
    ? getRecommendationConfig(selectedAnalysis.recommendation)
    : null;

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
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Análise de Mercado
          </h1>
          <p className="text-muted-foreground text-sm">
            Recomendações diárias do mercado cambial
          </p>
        </div>

        {/* Disclaimer */}
        <Alert className="border-destructive/30 bg-destructive/5 backdrop-blur-sm shadow-sm">
          <Info className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-xs text-destructive/80">
            <strong>Disclaimer:</strong> As análises são baseadas em estudos
            técnicos e fundamentalistas. O mercado financeiro está sujeito a
            variações imprevisíveis. As recomendações não constituem verdade
            absoluta.
          </AlertDescription>
        </Alert>

        {/* Hero - Latest Analysis */}
        {latestAnalysis && latestRecommendation && (
          <AnalysisHero
            analysis={latestAnalysis}
            recommendation={latestRecommendation}
          />
        )}

        {/* History Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Histórico</h2>
            <div className="flex items-center gap-2">
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger className="w-[160px] h-8 text-xs">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todo o período</SelectItem>
                  <SelectItem value="7d">Últimos 7 dias</SelectItem>
                  <SelectItem value="30d">Últimos 30 dias</SelectItem>
                  <SelectItem value="90d">Últimos 90 dias</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={recommendationFilter}
                onValueChange={setRecommendationFilter}
              >
                <SelectTrigger className="w-[160px] h-8 text-xs">
                  <SelectValue placeholder="Recomendação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="ideal">Momento Ideal</SelectItem>
                  <SelectItem value="alert">Alerta</SelectItem>
                  <SelectItem value="not-ideal">Não Ideal</SelectItem>
                  <SelectItem value="wait">Aguardar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Feed Cards */}
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">
                Nenhuma análise encontrada para o período selecionado
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHistory.map((analysis) => {
                const rec = getRecommendationConfig(analysis.recommendation);
                return (
                  <AnalysisFeedCard
                    key={analysis.id}
                    analysis={analysis}
                    recommendation={rec}
                    onViewDetail={() => setSelectedAnalysis(analysis)}
                  />
                );
              })}
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
      </div>
    </Layout>
  );
}
