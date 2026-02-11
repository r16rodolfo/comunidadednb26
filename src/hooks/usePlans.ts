import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  price_cents: number;
  currency: string;
  interval: 'free' | 'monthly' | 'quarterly' | 'semiannual' | 'yearly';
  interval_label: string;
  features: string[];
  is_active: boolean;
  popular: boolean;
  description: string;
  savings_percent: number | null;
  sort_order: number;
}

export function usePlans() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return (data ?? []) as SubscriptionPlan[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ planId, updates }: { planId: string; updates: Partial<SubscriptionPlan> }) => {
      const { error } = await supabase
        .from('plans')
        .update(updates)
        .eq('id', planId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast({ title: 'Plano atualizado com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao atualizar plano', description: error.message, variant: 'destructive' });
    },
  });

  const updatePlan = useCallback((planId: string, updates: Partial<SubscriptionPlan>) => {
    updateMutation.mutate({ planId, updates });
  }, [updateMutation]);

  const togglePlanActive = useCallback((planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;
    if (plan.interval === 'free') {
      toast({ title: 'O plano Gratuito não pode ser desativado', variant: 'destructive' });
      return;
    }
    updatePlan(planId, { is_active: !plan.is_active });
  }, [plans, updatePlan, toast]);

  const activePlans = plans.filter(p => p.is_active);
  const paidPlans = plans.filter(p => p.interval !== 'free');

  return {
    plans,
    activePlans,
    paidPlans,
    isLoading,
    updatePlan,
    togglePlanActive,
  };
}

// Utility functions
export const formatPrice = (priceCents: number): string => {
  if (priceCents === 0) return 'R$ 0';
  return `R$ ${(priceCents / 100).toFixed(2).replace('.', ',')}`;
};

export const getMonthlyEquivalent = (plan: SubscriptionPlan): number => {
  switch (plan.interval) {
    case 'free': return 0;
    case 'monthly': return plan.price_cents;
    case 'quarterly': return Math.round(plan.price_cents / 3);
    case 'semiannual': return Math.round(plan.price_cents / 6);
    case 'yearly': return Math.round(plan.price_cents / 12);
  }
};

export const formatMonthlyEquivalent = (plan: SubscriptionPlan): string => {
  const monthly = getMonthlyEquivalent(plan);
  if (monthly === 0) return 'R$ 0';
  return `R$ ${(monthly / 100).toFixed(2).replace('.', ',')}`;
};

/** Maps a plan slug to its display name using the plans array. Falls back to 'Gratuito' if not found. */
export const getPlanDisplayName = (slug: string | null | undefined, plans: SubscriptionPlan[]): string => {
  if (!slug) return 'Gratuito';
  const plan = plans.find(p => p.slug === slug);
  return plan?.name ?? slug;
};
