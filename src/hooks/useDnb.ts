import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MarketAnalysis, MarketRecommendation } from '@/types/dnb';

// Recommendation config stays client-side (UI-only concern)
export const recommendations: Record<string, MarketRecommendation> = {
  ideal: {
    type: 'ideal',
    label: 'Momento Ideal',
    description: 'Condições favoráveis para compra',
    color: 'text-success bg-success/10 border-success/20',
    icon: 'TrendingUp',
  },
  alert: {
    type: 'alert',
    label: 'Momento de Alerta',
    description: 'Atenção aos movimentos do mercado',
    color: 'text-warning bg-warning/10 border-warning/20',
    icon: 'AlertTriangle',
  },
  'not-ideal': {
    type: 'not-ideal',
    label: 'Momento Não Ideal',
    description: 'Evitar operações no momento',
    color: 'text-destructive bg-destructive/10 border-destructive/20',
    icon: 'TrendingDown',
  },
  wait: {
    type: 'wait',
    label: 'Momento de Aguardar',
    description: 'Aguardar melhor oportunidade',
    color: 'text-info bg-info/10 border-info/20',
    icon: 'Clock',
  },
};

function mapRow(row: any): MarketAnalysis {
  return {
    id: row.id,
    date: row.date,
    recommendation: row.recommendation,
    dollarPrice: Number(row.dollar_price),
    dollarVariation: Number(row.dollar_variation),
    euroPrice: Number(row.euro_price),
    euroVariation: Number(row.euro_variation),
    summary: row.summary,
    fullAnalysis: row.full_analysis,
    videoUrl: row.video_url || undefined,
    imageUrl: row.image_url || undefined,
    supports: (row.supports || []).map(Number),
    resistances: (row.resistances || []).map(Number),
  };
}

export function useDnb() {
  const [recommendationFilter, setRecommendationFilter] = useState<string>('all');

  const { data: analyses = [], isLoading } = useQuery({
    queryKey: ['market-analyses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('market_analyses')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      return (data || []).map(mapRow);
    },
  });

  const filteredAnalyses = useMemo(() => {
    if (recommendationFilter === 'all') return analyses;
    return analyses.filter(a => a.recommendation === recommendationFilter);
  }, [analyses, recommendationFilter]);

  const getLatestAnalysis = () => (analyses.length > 0 ? analyses[0] : null);

  const getRecommendationConfig = (type: string) =>
    recommendations[type] || recommendations.wait;

  return {
    analyses: filteredAnalyses,
    isLoading,
    recommendationFilter,
    setRecommendationFilter,
    getLatestAnalysis,
    getRecommendationConfig,
    recommendations,
  };
}
