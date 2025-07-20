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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  Calendar,
  DollarSign,
  Play,
  BarChart3,
  Info,
  Eye,
  Filter,
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
  } = useDnb();

  const [selectedAnalysis, setSelectedAnalysis] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);

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
      <div className="space-y-8 animate-fade-in">
        {/* Header with integrated filters */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Análise de Mercado DNB
            </h1>
            <p className="text-muted-foreground">
              Análises diárias do mercado cambial com recomendações de nossa equipe
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
          </div>
        </div>

        {/* Collapsible Filters */}
        {showFilters && (
          <Card className="border-primary/20 bg-primary/5 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date-filter">A partir da data</Label>
                  <Input
                    id="date-filter"
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recommendation-filter">Tipo de recomendação</Label>
                  <Select value={recommendationFilter} onValueChange={setRecommendationFilter}>
                    <SelectTrigger className="bg-background/50">
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
        )}

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Current Recommendation */}
          {latestRecommendation && latestAnalysis && (
            <Card className={`border-2 ${latestRecommendation.color} shadow-lg hover-scale transition-all duration-300`}>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="flex items-center space-x-2">
                  {(() => {
                    const IconComponent = iconMap[latestRecommendation.icon as keyof typeof iconMap];
                    return IconComponent ? <IconComponent className="h-5 w-5 text-primary" /> : null;
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
            <Card className="shadow-lg hover-scale transition-all duration-300">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <Calendar className="h-5 w-5 text-primary" />
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
            <Card className="shadow-lg hover-scale transition-all duration-300">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <CardTitle className="text-sm font-medium ml-2">
                  Cotações Atuais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">USD/BRL</span>
                    <div className="text-right">
                      <div className="font-bold">R$ {latestAnalysis.dollarPrice.toFixed(2)}</div>
                      <div className={`text-xs font-semibold ${latestAnalysis.dollarVariation >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {latestAnalysis.dollarVariation >= 0 ? '+' : ''}{latestAnalysis.dollarVariation}%
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">EUR/BRL</span>
                    <div className="text-right">
                      <div className="font-bold">R$ {latestAnalysis.euroPrice.toFixed(2)}</div>
                      <div className={`text-xs font-semibold ${latestAnalysis.euroVariation >= 0 ? 'text-green-500' : 'text-red-500'}`}>
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
        <Alert className="border-red-200 bg-red-50/80 backdrop-blur-sm text-red-800 dark:border-red-800/30 dark:bg-red-950/20 dark:text-red-300 shadow-sm">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Disclaimer:</strong> As análises apresentadas são baseadas em estudos técnicos e fundamentalistas, 
            mas o mercado financeiro está sujeito a variações e influências políticas e econômicas imprevisíveis. 
            As recomendações não constituem verdade absoluta e devem ser consideradas como opinião técnica.
          </AlertDescription>
        </Alert>

        {/* Analysis Table */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Histórico de Análises
            </CardTitle>
            <CardDescription>
              Confira todas as análises realizadas pela nossa equipe
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analyses.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma análise encontrada com os filtros aplicados</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b-2">
                      <TableHead className="font-semibold">Data</TableHead>
                      <TableHead className="font-semibold">Resumo</TableHead>
                      <TableHead className="font-semibold">Recomendação</TableHead>
                      <TableHead className="font-semibold">Preço USD</TableHead>
                      <TableHead className="font-semibold text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analyses.map((analysis) => {
                      const recommendation = getRecommendationConfig(analysis.recommendation);
                      const IconComponent = iconMap[recommendation.icon as keyof typeof iconMap];
                      
                      return (
                        <TableRow key={analysis.id} className="hover:bg-muted/50 transition-colors">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {IconComponent && <IconComponent className="h-4 w-4 text-primary" />}
                              {format(new Date(analysis.date), 'dd/MM/yyyy', { locale: ptBR })}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <p className="truncate text-sm">{analysis.summary}</p>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${recommendation.color} font-medium`}>
                              {recommendation.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-right">
                              <div className="font-bold">R$ {analysis.dollarPrice.toFixed(2)}</div>
                              <div className={`text-xs font-semibold ${analysis.dollarVariation >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {analysis.dollarVariation >= 0 ? '+' : ''}{analysis.dollarVariation}%
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedAnalysis(analysis)}
                                className="h-8 w-8 p-0 hover:bg-primary/10"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {analysis.chartData && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-primary/10"
                                >
                                  <BarChart3 className="h-4 w-4" />
                                </Button>
                              )}
                              {analysis.videoUrl && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-primary/10"
                                >
                                  <Play className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analysis Detail Modal */}
        <Dialog open={!!selectedAnalysis} onOpenChange={() => setSelectedAnalysis(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-xl">
                    Análise de {selectedAnalysis && format(new Date(selectedAnalysis.date), 'dd/MM/yyyy', { locale: ptBR })}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedAnalysis?.summary}
                  </DialogDescription>
                </div>
                {selectedAnalysis && (
                  <Badge className={`${getRecommendationConfig(selectedAnalysis.recommendation).color} font-medium`}>
                    {getRecommendationConfig(selectedAnalysis.recommendation).label}
                  </Badge>
                )}
              </div>
            </DialogHeader>
            
            {selectedAnalysis && (
              <div className="space-y-6">
                {/* Price Info */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">USD/BRL</p>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-bold">R$ {selectedAnalysis.dollarPrice.toFixed(2)}</p>
                      <span className={`text-sm font-semibold ${selectedAnalysis.dollarVariation >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {selectedAnalysis.dollarVariation >= 0 ? '+' : ''}{selectedAnalysis.dollarVariation}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">EUR/BRL</p>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-bold">R$ {selectedAnalysis.euroPrice.toFixed(2)}</p>
                      <span className={`text-sm font-semibold ${selectedAnalysis.euroVariation >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {selectedAnalysis.euroVariation >= 0 ? '+' : ''}{selectedAnalysis.euroVariation}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Full Analysis */}
                <div>
                  <h4 className="font-semibold mb-3 text-primary">Análise Completa</h4>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {selectedAnalysis.fullAnalysis}
                  </p>
                </div>

                {/* Technical Levels */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 border border-red-200 rounded-lg bg-red-50/50">
                    <h4 className="font-semibold mb-3 text-red-600 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Resistências
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedAnalysis.resistances.map((level: number, index: number) => (
                        <Badge key={index} variant="secondary" className="bg-red-100 text-red-700">
                          R$ {level.toFixed(2)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 border border-green-200 rounded-lg bg-green-50/50">
                    <h4 className="font-semibold mb-3 text-green-600 flex items-center gap-2">
                      <TrendingDown className="h-4 w-4" />
                      Suportes
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedAnalysis.supports.map((level: number, index: number) => (
                        <Badge key={index} variant="secondary" className="bg-green-100 text-green-700">
                          R$ {level.toFixed(2)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  {selectedAnalysis.videoUrl && (
                    <Button variant="outline" className="flex items-center gap-2">
                      <Play className="h-4 w-4" />
                      Assistir Vídeo
                    </Button>
                  )}
                  {selectedAnalysis.chartData && (
                    <Button variant="outline" className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Ver Gráfico
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}