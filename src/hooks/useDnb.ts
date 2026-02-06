import { useState, useEffect } from 'react';
import { MarketAnalysis } from '@/types/dnb';
import { mockAnalyses, recommendations } from '@/data/mock-dnb';

export function useDnb() {
  const [analyses, setAnalyses] = useState<MarketAnalysis[]>([]);
  const [filteredAnalyses, setFilteredAnalyses] = useState<MarketAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<string>('');
  const [recommendationFilter, setRecommendationFilter] = useState<string>('all');

  useEffect(() => {
    const loadAnalyses = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnalyses(mockAnalyses);
      setFilteredAnalyses(mockAnalyses);
      setIsLoading(false);
    };
    loadAnalyses();
  }, []);

  useEffect(() => {
    let filtered = [...analyses];

    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filtered = filtered.filter(analysis => new Date(analysis.date) >= filterDate);
    }

    if (recommendationFilter !== 'all') {
      filtered = filtered.filter(analysis => analysis.recommendation === recommendationFilter);
    }

    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setFilteredAnalyses(filtered);
  }, [analyses, dateFilter, recommendationFilter]);

  const getLatestAnalysis = () => (analyses.length > 0 ? analyses[0] : null);

  const getRecommendationConfig = (type: string) => recommendations[type] || recommendations.wait;

  return {
    analyses: filteredAnalyses,
    isLoading,
    dateFilter, setDateFilter,
    recommendationFilter, setRecommendationFilter,
    getLatestAnalysis, getRecommendationConfig, recommendations
  };
}
