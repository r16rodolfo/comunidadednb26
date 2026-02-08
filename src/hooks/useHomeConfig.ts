import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { HomeConfig } from '@/types/admin';
import { defaultHomeConfig } from '@/data/mock-admin';
import type { Json } from '@/integrations/supabase/types';

export function useHomeConfig() {
  const queryClient = useQueryClient();

  const { data: config = defaultHomeConfig, isLoading } = useQuery({
    queryKey: ['home-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('home_config')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!data) return defaultHomeConfig;

      return {
        welcomeCard: data.welcome_card as unknown as HomeConfig['welcomeCard'],
        banners: (data.banners as unknown as HomeConfig['banners']) ?? [],
        stepCards: (data.step_cards as unknown as HomeConfig['stepCards']) ?? [],
      } satisfies HomeConfig;
    },
    staleTime: 5 * 60 * 1000,
  });

  const mutation = useMutation({
    mutationFn: async (next: HomeConfig) => {
      const payload = {
        welcome_card: next.welcomeCard as unknown as Json,
        banners: next.banners as unknown as Json,
        step_cards: next.stepCards as unknown as Json,
      };

      // Get the existing row id
      const { data: existing } = await supabase
        .from('home_config')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('home_config')
          .update(payload)
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('home_config')
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home-config'] });
    },
  });

  const saveConfig = useCallback((next: HomeConfig) => {
    mutation.mutate(next);
  }, [mutation]);

  return { config, saveConfig, isLoading };
}
