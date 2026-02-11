import { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, Plus, MoreHorizontal, Edit, Trash2, TrendingUp, TrendingDown, AlertTriangle, Clock, Video, ImageIcon, BarChart3 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { CreateAnalysisModal } from '@/components/admin/CreateAnalysisModal';
import { MarketAnalysis } from '@/types/dnb';
import { useAdminDnb } from '@/hooks/useAdminDnb';
import { recommendations } from '@/hooks/useDnb';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { parseLocalDate } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const iconMap = {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
};

const badgeStyles: Record<string, string> = {
  ideal: 'bg-green-100 text-green-800 border-green-300',
  alert: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'not-ideal': 'bg-red-100 text-red-800 border-red-300',
  wait: 'bg-blue-100 text-blue-800 border-blue-300',
};

export default function AdminAnalyses() {
  const { analyses, isLoading, createAnalysis, updateAnalysis, deleteAnalysis } = useAdminDnb();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAnalysis, setEditingAnalysis] = useState<MarketAnalysis | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MarketAnalysis | null>(null);

  const filteredAnalyses = searchTerm
    ? analyses.filter(a =>
        a.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.date.includes(searchTerm)
      )
    : analyses;

  const stats = {
    total: analyses.length,
    withVideo: analyses.filter(a => a.videoUrl).length,
    withImage: analyses.filter(a => a.imageUrl).length,
    thisMonth: analyses.filter(a => {
      const d = parseLocalDate(a.date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length,
  };

  const handleSave = (analysis: MarketAnalysis) => {
    const isEditing = !!editingAnalysis;
    if (isEditing) {
      updateAnalysis.mutate(analysis);
    } else {
      createAnalysis.mutate(analysis);
    }
    setEditingAnalysis(null);
    setShowModal(false);
  };

  const handleEdit = (analysis: MarketAnalysis) => {
    setEditingAnalysis(analysis);
    setShowModal(true);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteAnalysis.mutate(deleteTarget.id);
    setDeleteTarget(null);
  };

  const handleOpenNew = () => {
    setEditingAnalysis(null);
    setShowModal(true);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader icon={TrendingUp} title="Análises de Mercado" description="Gerencie as análises diárias do mercado cambial">
          <Button onClick={handleOpenNew}>
            <Plus className="h-4 w-4 mr-2" />Nova Análise
          </Button>
        </PageHeader>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Total de Análises" value={stats.total} icon={BarChart3} />
          <StatCard label="Com Vídeo" value={stats.withVideo} icon={Video} variant="info" />
          <StatCard label="Com Gráfico" value={stats.withImage} icon={ImageIcon} variant="success" />
          <StatCard label="Este Mês" value={stats.thisMonth} icon={TrendingUp} variant="warning" />
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por resumo ou data..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Análises ({filteredAnalyses.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3 animate-pulse">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 bg-muted rounded" />
                ))}
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Recomendação</TableHead>
                      <TableHead>USD/BRL</TableHead>
                      <TableHead>EUR/BRL</TableHead>
                      <TableHead>Resumo</TableHead>
                      <TableHead>Mídias</TableHead>
                      <TableHead className="w-[50px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAnalyses.map(analysis => {
                      const rec = recommendations[analysis.recommendation];
                      const Icon = iconMap[rec?.icon as keyof typeof iconMap];

                      return (
                        <TableRow key={analysis.id}>
                          <TableCell className="font-medium whitespace-nowrap">
                            {format(parseLocalDate(analysis.date), "dd/MM/yyyy", { locale: ptBR })}
                          </TableCell>
                          <TableCell>
                            <Badge className={`${badgeStyles[analysis.recommendation]} border text-xs`}>
                              {Icon && <Icon className="h-3 w-3 mr-1" />}
                              {rec?.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <span className="font-medium">R$ {analysis.dollarPrice.toFixed(2)}</span>
                              <span className={`ml-1 text-xs ${analysis.dollarVariation >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {analysis.dollarVariation >= 0 ? '+' : ''}{analysis.dollarVariation}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <span className="font-medium">R$ {analysis.euroPrice.toFixed(2)}</span>
                              <span className={`ml-1 text-xs ${analysis.euroVariation >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {analysis.euroVariation >= 0 ? '+' : ''}{analysis.euroVariation}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground line-clamp-1 max-w-[200px]">
                              {analysis.summary}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              {analysis.videoUrl && (
                                <Badge variant="outline" className="text-xs gap-1 px-1.5">
                                  <Video className="h-3 w-3" />
                                </Badge>
                              )}
                              {analysis.imageUrl && (
                                <Badge variant="outline" className="text-xs gap-1 px-1.5">
                                  <ImageIcon className="h-3 w-3" />
                                </Badge>
                              )}
                              {!analysis.videoUrl && !analysis.imageUrl && (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-popover">
                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleEdit(analysis)}>
                                  <Edit className="mr-2 h-4 w-4" />Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => setDeleteTarget(analysis)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {filteredAnalyses.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          Nenhuma análise encontrada
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal */}
        <CreateAnalysisModal
          open={showModal}
          onOpenChange={setShowModal}
          onSave={handleSave}
          editingAnalysis={editingAnalysis}
        />

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir análise?</AlertDialogTitle>
              <AlertDialogDescription>
                A análise de {deleteTarget && format(parseLocalDate(deleteTarget.date), "dd/MM/yyyy")} será excluída permanentemente. Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
