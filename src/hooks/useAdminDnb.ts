import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MarketAnalysis } from '@/types/dnb';
import { useToast } from '@/hooks/use-toast';

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
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    editedByName: row.edited_by_name || undefined,
  };
}

export function useAdminDnb() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

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

  const createAnalysis = useMutation({
    mutationFn: async (analysis: Omit<MarketAnalysis, 'id'>) => {
      const { error } = await supabase.from('market_analyses').insert({
        date: analysis.date,
        recommendation: analysis.recommendation,
        dollar_price: analysis.dollarPrice,
        dollar_variation: analysis.dollarVariation,
        euro_price: analysis.euroPrice,
        euro_variation: analysis.euroVariation,
        summary: analysis.summary,
        full_analysis: analysis.fullAnalysis,
        video_url: analysis.videoUrl || null,
        image_url: analysis.imageUrl || null,
        supports: analysis.supports,
        resistances: analysis.resistances,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market-analyses'] });
      toast({ title: 'Análise criada com sucesso!' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao criar análise', description: error.message, variant: 'destructive' });
    },
  });

  const updateAnalysis = useMutation({
    mutationFn: async (analysis: MarketAnalysis) => {
      // Fetch current user's name for edit tracking
      const { data: userData } = await supabase.auth.getUser();
      let editorName = 'Admin';
      if (userData?.user?.id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('user_id', userData.user.id)
          .single();
        if (profile?.name) editorName = profile.name;
      }

      const { error } = await supabase
        .from('market_analyses')
        .update({
          date: analysis.date,
          recommendation: analysis.recommendation,
          dollar_price: analysis.dollarPrice,
          dollar_variation: analysis.dollarVariation,
          euro_price: analysis.euroPrice,
          euro_variation: analysis.euroVariation,
          summary: analysis.summary,
          full_analysis: analysis.fullAnalysis,
          video_url: analysis.videoUrl || null,
          image_url: analysis.imageUrl || null,
          supports: analysis.supports,
          resistances: analysis.resistances,
          edited_by_name: editorName,
        } as any)
        .eq('id', analysis.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market-analyses'] });
      toast({ title: 'Análise atualizada com sucesso!' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao atualizar análise', description: error.message, variant: 'destructive' });
    },
  });

  const deleteAnalysis = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('market_analyses')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market-analyses'] });
      toast({ title: 'Análise excluída com sucesso!' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao excluir análise', description: error.message, variant: 'destructive' });
    },
  });

  return {
    analyses,
    isLoading,
    createAnalysis,
    updateAnalysis,
    deleteAnalysis,
  };
}
