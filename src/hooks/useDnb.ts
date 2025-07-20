import { useState, useEffect } from 'react';
import { MarketAnalysis, MarketRecommendation } from '@/types/dnb';

// Mock data for demonstration
const mockAnalyses: MarketAnalysis[] = [
  {
    id: '1',
    date: '2024-01-17',
    recommendation: 'wait',
    dollarPrice: 5.59,
    dollarVariation: -0.35,
    euroPrice: 6.44,
    euroVariation: -0.67,
    summary: 'Dólar em baixa mas cenário lateral mantido',
    fullAnalysis: 'O dólar fechou em baixa de -0,35% nessa quinta, 17, após chega a subir 0,75% na máxima do dia. A baixa de hoje, influenciada pelas negociações sobre a taxa de 50% dos EUA, anima, mas não muda o cenário. Ainda estamos lateral. É o 6º pregão entre R$5,55 e R$5,63 Para baixo há suporte em R$5,52 e R$5,50. Para cima, R$5,63 e R$5,80. O Euro também recuou 0,67% a R$6,44. Cenário similar. Amanhã avaliaremos novas recomendações.',
    supports: [5.50, 5.52],
    resistances: [5.63, 5.80],
    chartData: [
      { date: '2024-01-15', price: 5.61 },
      { date: '2024-01-16', price: 5.63 },
      { date: '2024-01-17', price: 5.59 }
    ]
  },
  {
    id: '2',
    date: '2024-01-16',
    recommendation: 'alert',
    dollarPrice: 5.63,
    dollarVariation: 0.71,
    euroPrice: 6.48,
    euroVariation: 0.45,
    summary: 'Dólar em alta, atenção aos níveis de resistência',
    fullAnalysis: 'O dólar subiu 0,71% hoje, testando novamente o nível de R$5,63. Movimento influenciado por incertezas políticas domésticas. Mantenha atenção aos níveis de resistência em R$5,63 e R$5,80. Volume de negociações aumentou significativamente.',
    supports: [5.55, 5.50],
    resistances: [5.63, 5.80]
  },
  {
    id: '3',
    date: '2024-01-15',
    recommendation: 'ideal',
    dollarPrice: 5.55,
    dollarVariation: -1.2,
    euroPrice: 6.42,
    euroVariation: -0.8,
    summary: 'Momento favorável para compra com dólar em baixa',
    fullAnalysis: 'Excelente oportunidade de compra com dólar recuando para R$5,55. Movimento técnico importante com rompimento de suporte. Recomendamos aproveitar este nível para posições cambiais.',
    videoUrl: 'https://example.com/video1',
    supports: [5.50, 5.45],
    resistances: [5.60, 5.65]
  }
];

const recommendations: Record<string, MarketRecommendation> = {
  ideal: {
    type: 'ideal',
    label: 'Momento Ideal',
    description: 'Condições favoráveis para compra',
    color: 'text-green-600 bg-green-50 border-green-200',
    icon: 'TrendingUp'
  },
  alert: {
    type: 'alert',
    label: 'Momento de Alerta',
    description: 'Atenção aos movimentos do mercado',
    color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    icon: 'AlertTriangle'
  },
  'not-ideal': {
    type: 'not-ideal',
    label: 'Momento Não Ideal',
    description: 'Evitar operações no momento',
    color: 'text-red-600 bg-red-50 border-red-200',
    icon: 'TrendingDown'
  },
  wait: {
    type: 'wait',
    label: 'Momento de Aguardar',
    description: 'Aguardar melhor oportunidade',
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    icon: 'Clock'
  }
};

export function useDnb() {
  const [analyses, setAnalyses] = useState<MarketAnalysis[]>([]);
  const [filteredAnalyses, setFilteredAnalyses] = useState<MarketAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<string>('');
  const [recommendationFilter, setRecommendationFilter] = useState<string>('all');

  useEffect(() => {
    // Simulate API call
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
      filtered = filtered.filter(analysis => {
        const analysisDate = new Date(analysis.date);
        return analysisDate >= filterDate;
      });
    }

    if (recommendationFilter !== 'all') {
      filtered = filtered.filter(analysis => 
        analysis.recommendation === recommendationFilter
      );
    }

    // Sort by date descending
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setFilteredAnalyses(filtered);
  }, [analyses, dateFilter, recommendationFilter]);

  const getLatestAnalysis = () => {
    return analyses.length > 0 ? analyses[0] : null;
  };

  const getRecommendationConfig = (type: string) => {
    return recommendations[type] || recommendations.wait;
  };

  return {
    analyses: filteredAnalyses,
    isLoading,
    dateFilter,
    setDateFilter,
    recommendationFilter,
    setRecommendationFilter,
    getLatestAnalysis,
    getRecommendationConfig,
    recommendations
  };
}