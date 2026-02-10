import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface SubscriptionState {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
  current_plan_slug: string | null;
  cancel_at_period_end: boolean;
  pending_downgrade_to: string | null;
  pending_downgrade_date: string | null;
  stripe_subscription_id: string | null;
}

const defaultState: SubscriptionState = {
  subscribed: false,
  subscription_tier: null,
  subscription_end: null,
  current_plan_slug: null,
  cancel_at_period_end: false,
  pending_downgrade_to: null,
  pending_downgrade_date: null,
  stripe_subscription_id: null,
};

export function useSubscription() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<SubscriptionState>(defaultState);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [isCancelDowngradeLoading, setIsCancelDowngradeLoading] = useState(false);

  const checkSubscription = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;
      setSubscription({
        subscribed: data.subscribed ?? false,
        subscription_tier: data.subscription_tier ?? null,
        subscription_end: data.subscription_end ?? null,
        current_plan_slug: data.current_plan_slug ?? null,
        cancel_at_period_end: data.cancel_at_period_end ?? false,
        pending_downgrade_to: data.pending_downgrade_to ?? null,
        pending_downgrade_date: data.pending_downgrade_date ?? null,
        stripe_subscription_id: data.stripe_subscription_id ?? null,
      });
    } catch (error: unknown) {
      console.error('Error checking subscription:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const createCheckout = useCallback(async (planSlug: string, couponCode?: string) => {
    if (!isAuthenticated) {
      toast({ title: 'Faça login para assinar', variant: 'destructive' });
      return;
    }
    setIsCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planId: planSlug, couponCode: couponCode || undefined },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({ title: 'Erro ao criar checkout', description: message, variant: 'destructive' });
    } finally {
      setIsCheckoutLoading(false);
    }
  }, [isAuthenticated, toast]);

  const openCustomerPortal = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({ title: 'Erro ao abrir portal', description: message, variant: 'destructive' });
    } finally {
      setIsPortalLoading(false);
    }
  }, [isAuthenticated, toast]);

  const cancelDowngrade = useCallback(async () => {
    if (!subscription.stripe_subscription_id) return;
    setIsCancelDowngradeLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('cancel-downgrade', {
        body: { subscriptionId: subscription.stripe_subscription_id },
      });
      if (error) throw error;
      toast({ title: 'Downgrade cancelado!', description: 'Seu plano atual foi mantido.' });
      // Refresh subscription state
      await checkSubscription();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({ title: 'Erro ao cancelar downgrade', description: message, variant: 'destructive' });
    } finally {
      setIsCancelDowngradeLoading(false);
    }
  }, [subscription.stripe_subscription_id, toast, checkSubscription]);

  // Check subscription on mount and auth change
  useEffect(() => {
    if (isAuthenticated) {
      checkSubscription();
    } else {
      setSubscription(defaultState);
    }
  }, [isAuthenticated, checkSubscription]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated, checkSubscription]);

  return {
    subscription,
    isLoading,
    isCheckoutLoading,
    isPortalLoading,
    isCancelDowngradeLoading,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
    cancelDowngrade,
  };
}
