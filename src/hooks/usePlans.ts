import { useState, useEffect, useCallback } from 'react';
import { SubscriptionPlan, defaultPlans } from '@/data/mock-plans';
import { useToast } from '@/hooks/use-toast';

const PLANS_STORAGE_KEY = 'dnb_plans';

export function usePlans() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem(PLANS_STORAGE_KEY);
    if (stored) {
      try {
        setPlans(JSON.parse(stored));
      } catch {
        setPlans(defaultPlans);
        localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(defaultPlans));
      }
    } else {
      setPlans(defaultPlans);
      localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(defaultPlans));
    }
    setIsLoading(false);
  }, []);

  const savePlans = useCallback((updatedPlans: SubscriptionPlan[]) => {
    setPlans(updatedPlans);
    localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(updatedPlans));
  }, []);

  const updatePlan = useCallback((planId: string, updates: Partial<SubscriptionPlan>) => {
    const updatedPlans = plans.map(p => 
      p.id === planId ? { ...p, ...updates } : p
    );
    savePlans(updatedPlans);
    toast({ title: 'Plano atualizado com sucesso!' });
  }, [plans, savePlans, toast]);

  const togglePlanActive = useCallback((planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;
    if (plan.interval === 'free') {
      toast({ title: 'O plano Gratuito não pode ser desativado', variant: 'destructive' });
      return;
    }
    updatePlan(planId, { isActive: !plan.isActive });
  }, [plans, updatePlan, toast]);

  const resetToDefaults = useCallback(() => {
    savePlans(defaultPlans);
    toast({ title: 'Planos restaurados para os valores padrão' });
  }, [savePlans, toast]);

  const activePlans = plans.filter(p => p.isActive);
  const paidPlans = plans.filter(p => p.interval !== 'free');

  return {
    plans,
    activePlans,
    paidPlans,
    isLoading,
    updatePlan,
    togglePlanActive,
    resetToDefaults,
  };
}
