import { useState } from 'react';
import Layout from '@/components/Layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  Calendar,
  DollarSign,
  Euro,
  Play,
  BarChart3,
  Info
} from 'lucide-react';
import { useDnb } from '@/hooks/useDnb';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const iconMap = {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock
};

export default function DnbAnalysis() {
  const {
    analyses,
    isLoading,
    dateFilter,
    setDateFilter,
    recommendationFilter,
    setRecommendationFilter,
    getLatestAnalysis,
    getRecommendationConfig,
    recommendations
  } = useDnb();

  const latestAnalysis = getLatestAnalysis();
  const latestRecommendation = latestAnalysis ? getRecommendationConfig(latestAnalysis.recommendation) : null;

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6 animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
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
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Análise de Mercado DNB</h1>
          <p className="text-muted-foreground">
            Análises diárias do mercado cambial com recomendações de nossa equipe
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Current Recommendation */}
          {latestRecommendation && latestAnalysis && (
            <Card className={`border-2 ${latestRecommendation.color}`}>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="flex items-center space-x-2">
                  {(() => {
                    const IconComponent = iconMap[latestRecommendation.icon as keyof typeof iconMap];
                    return IconComponent ? <IconComponent className="h-5 w-5" /> : null;
                  })()}
                  <CardTitle className="text-sm font-medium">
                    Recomendação Atual
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="text-2xl font-bold">{latestRecommendation.label}</div>
                  <p className="text-xs text-muted-foreground">
                    {latestRecommendation.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Latest Analysis Date */}
          {latestAnalysis && (
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-sm font-medium ml-2">
                  Última Análise
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="text-2xl font-bold">
                    {format(new Date(latestAnalysis.date), 'dd/MM/yyyy', { locale: ptBR })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {latestAnalysis.summary}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current Prices */}
          {latestAnalysis && (
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-sm font-medium ml-2">
                  Cotações Atuais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">USD/BRL</span>
                    <div className="text-right">
                      <div className="font-bold">R$ {latestAnalysis.dollarPrice.toFixed(2)}</div>
                      <div className={`text-xs ${latestAnalysis.dollarVariation >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {latestAnalysis.dollarVariation >= 0 ? '+' : ''}{latestAnalysis.dollarVariation}%
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">EUR/BRL</span>
                    <div className="text-right">
                      <div className="font-bold">R$ {latestAnalysis.euroPrice.toFixed(2)}</div>
                      <div className={`text-xs ${latestAnalysis.euroVariation >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {latestAnalysis.euroVariation >= 0 ? '+' : ''}{latestAnalysis.euroVariation}%
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Disclaimer */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Importante:</strong> As análises apresentadas são baseadas em estudos técnicos e fundamentalistas, 
            mas o mercado financeiro está sujeito a variações e influências políticas e econômicas imprevisíveis. 
            As recomendações não constituem verdade absoluta e devem ser consideradas como opinião técnica. 
            Sempre avalie sua situação financeira e consulte um especialista antes de tomar decisões de investimento.
          </AlertDescription>
        </Alert>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros de Análise</CardTitle>
            <CardDescription>
              Filtre as análises por data e tipo de recomendação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date-filter">A partir da data</Label>
                <Input
                  id="date-filter"
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recommendation-filter">Tipo de recomendação</Label>
                <Select value={recommendationFilter} onValueChange={setRecommendationFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as recomendações" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as recomendações</SelectItem>
                    <SelectItem value="ideal">Momento Ideal</SelectItem>
                    <SelectItem value="alert">Momento de Alerta</SelectItem>
                    <SelectItem value="not-ideal">Momento Não Ideal</SelectItem>
                    <SelectItem value="wait">Momento de Aguardar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analysis List */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Análises</CardTitle>
            <CardDescription>
              Confira todas as análises realizadas pela nossa equipe
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analyses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma análise encontrada com os filtros aplicados
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {analyses.map((analysis) => {
                  const recommendation = getRecommendationConfig(analysis.recommendation);
                  const IconComponent = iconMap[recommendation.icon as keyof typeof iconMap];
                  
                  return (
                    <AccordionItem key={analysis.id} value={analysis.id}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center justify-between w-full mr-4">
                          <div className="flex items-center space-x-3">
                            {IconComponent && <IconComponent className="h-4 w-4" />}
                            <div className="text-left">
                              <div className="font-medium">
                                {format(new Date(analysis.date), 'dd/MM/yyyy', { locale: ptBR })}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {analysis.summary}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={recommendation.color}>
                              {recommendation.label}
                            </Badge>
                            <div className="text-right text-sm">
                              <div className="font-medium">R$ {analysis.dollarPrice.toFixed(2)}</div>
                              <div className={`text-xs ${analysis.dollarVariation >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {analysis.dollarVariation >= 0 ? '+' : ''}{analysis.dollarVariation}%
                              </div>
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-4">
                          {/* Full Analysis */}
                          <div>
                            <h4 className="font-medium mb-2">Análise Completa</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {analysis.fullAnalysis}
                            </p>
                          </div>

                          {/* Technical Levels */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium mb-2 text-red-600">Resistências</h4>
                              <div className="flex gap-2">
                                {analysis.resistances.map((level, index) => (
                                  <Badge key={index} variant="secondary">
                                    R$ {level.toFixed(2)}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2 text-green-600">Suportes</h4>
                              <div className="flex gap-2">
                                {analysis.supports.map((level, index) => (
                                  <Badge key={index} variant="secondary">
                                    R$ {level.toFixed(2)}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 pt-2">
                            {analysis.videoUrl && (
                              <Button variant="outline" size="sm">
                                <Play className="h-4 w-4 mr-2" />
                                Assistir Vídeo
                              </Button>
                            )}
                            {analysis.chartData && (
                              <Button variant="outline" size="sm">
                                <BarChart3 className="h-4 w-4 mr-2" />
                                Ver Gráfico
                              </Button>
                            )}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}