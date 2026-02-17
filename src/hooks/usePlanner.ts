import { useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { TripGoal, Transaction, PlannerMetrics, BuyingPace } from '@/types/planner';

export function usePlanner() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;

  // ── Fetch trip goal ──
  const { data: tripGoal = null, isLoading: isGoalLoading } = useQuery({
    queryKey: ['trip-goal', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('trip_goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        id: data.id,
        targetAmount: Number(data.target_amount),
        currency: data.currency,
        tripDate: new Date(data.trip_date),
        createdAt: new Date(data.created_at),
      } as TripGoal;
    },
    enabled: !!userId,
  });

  // ── Fetch transactions ──
  const { data: transactions = [], isLoading: isTransLoading } = useQuery({
    queryKey: ['planner-transactions', userId, tripGoal?.id],
    queryFn: async () => {
      if (!userId || !tripGoal?.id) return [];
      const { data, error } = await supabase
        .from('planner_transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('goal_id', tripGoal.id)
        .order('date', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(t => ({
        id: t.id,
        date: new Date(t.date),
        location: t.location,
        amount: Number(t.amount),
        rate: Number(t.rate),
        totalPaid: Number(t.total_paid),
        createdAt: new Date(t.created_at),
      })) as Transaction[];
    },
    enabled: !!userId && !!tripGoal?.id,
  });

  // ── Mutations ──
  const createGoalMutation = useMutation({
    mutationFn: async (goal: Omit<TripGoal, 'id' | 'createdAt'>) => {
      if (!userId) throw new Error('Não autenticado');
      const { error } = await supabase.from('trip_goals').insert({
        user_id: userId,
        target_amount: goal.targetAmount,
        currency: goal.currency,
        trip_date: goal.tripDate.toISOString().split('T')[0],
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trip-goal', userId] }),
  });

  const updateGoalMutation = useMutation({
    mutationFn: async (goal: Omit<TripGoal, 'id' | 'createdAt'>) => {
      if (!userId || !tripGoal) throw new Error('Sem meta ativa');
      const { error } = await supabase.from('trip_goals').update({
        target_amount: goal.targetAmount,
        currency: goal.currency,
        trip_date: goal.tripDate.toISOString().split('T')[0],
      }).eq('id', tripGoal.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trip-goal', userId] }),
  });

  const addTransactionMutation = useMutation({
    mutationFn: async (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
      if (!userId || !tripGoal) throw new Error('Sem meta ativa');
      const { error } = await supabase.from('planner_transactions').insert({
        user_id: userId,
        goal_id: tripGoal.id,
        date: transaction.date.toISOString().split('T')[0],
        location: transaction.location,
        amount: transaction.amount,
        rate: transaction.rate,
        total_paid: transaction.totalPaid,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['planner-transactions', userId] }),
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('planner_transactions')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['planner-transactions', userId] }),
  });

  const clearAllMutation = useMutation({
    mutationFn: async () => {
      if (!userId) return;
      // Delete transactions first (FK constraint)
      await supabase.from('planner_transactions').delete().eq('user_id', userId);
      await supabase.from('trip_goals').delete().eq('user_id', userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip-goal', userId] });
      queryClient.invalidateQueries({ queryKey: ['planner-transactions', userId] });
    },
  });

  // ── Computed metrics (client-side, same logic as before) ──
  const metrics = useMemo((): PlannerMetrics | null => {
    if (!tripGoal) return null;
    const totalPurchased = transactions.reduce((sum, t) => sum + t.amount, 0);
    const remaining = tripGoal.targetAmount - totalPurchased;
    const totalPaid = transactions.reduce((sum, t) => sum + t.totalPaid, 0);
    const averageRate = totalPurchased > 0 ? totalPaid / totalPurchased : 0;
    const progressPercentage = (totalPurchased / tripGoal.targetAmount) * 100;
    const daysUntilTrip = Math.ceil((tripGoal.tripDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return {
      targetAmount: tripGoal.targetAmount,
      totalPurchased,
      remaining: Math.max(0, remaining),
      averageRate,
      progressPercentage: Math.min(100, progressPercentage),
      daysUntilTrip: Math.max(0, daysUntilTrip),
    };
  }, [tripGoal, transactions]);

  const buyingPace = useMemo((): BuyingPace | null => {
    if (!metrics || metrics.remaining <= 0 || metrics.daysUntilTrip <= 0) return null;
    const weeksUntilTrip = metrics.daysUntilTrip / 7;
    const weekly = metrics.remaining / weeksUntilTrip;
    const biweekly = weekly * 2;
    const monthly = weekly * 4.33;
    let urgencyLevel: BuyingPace['urgencyLevel'] = 'low';
    if (metrics.daysUntilTrip < 30) urgencyLevel = 'high';
    else if (metrics.daysUntilTrip < 90) urgencyLevel = 'medium';
    return { weekly, biweekly, monthly, urgencyLevel };
  }, [metrics]);

  // ── Stable callbacks ──
  const createGoal = useCallback((goal: Omit<TripGoal, 'id' | 'createdAt'>) => {
    createGoalMutation.mutate(goal);
  }, [createGoalMutation]);

  const updateGoal = useCallback((goal: Omit<TripGoal, 'id' | 'createdAt'>) => {
    updateGoalMutation.mutate(goal);
  }, [updateGoalMutation]);

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    addTransactionMutation.mutate(transaction);
  }, [addTransactionMutation]);

  const updateTransactionMutation = useMutation({
    mutationFn: async ({ id, transaction }: { id: string; transaction: Omit<Transaction, 'id' | 'createdAt'> }) => {
      const { error } = await supabase.from('planner_transactions').update({
        date: transaction.date.toISOString().split('T')[0],
        location: transaction.location,
        amount: transaction.amount,
        rate: transaction.rate,
        total_paid: transaction.totalPaid,
      }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['planner-transactions', userId] }),
  });

  const updateTransaction = useCallback((id: string, transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    updateTransactionMutation.mutate({ id, transaction });
  }, [updateTransactionMutation]);

  const deleteTransaction = useCallback((id: string) => {
    deleteTransactionMutation.mutate(id);
  }, [deleteTransactionMutation]);

  const clearAllData = useCallback(() => {
    clearAllMutation.mutate();
  }, [clearAllMutation]);

  return {
    tripGoal,
    transactions,
    metrics,
    buyingPace,
    isLoading: isGoalLoading || isTransLoading,
    createGoal,
    updateGoal,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    clearAllData,
  };
}
