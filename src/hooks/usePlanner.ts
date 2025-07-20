import { useState, useEffect, useMemo } from 'react';
import { TripGoal, Transaction, PlannerMetrics, BuyingPace } from '@/types/planner';

const STORAGE_KEYS = {
  TRIP_GOAL: 'dnb_trip_goal',
  TRANSACTIONS: 'dnb_transactions',
};

export function usePlanner() {
  const [tripGoal, setTripGoal] = useState<TripGoal | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedGoal = localStorage.getItem(STORAGE_KEYS.TRIP_GOAL);
    const savedTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);

    if (savedGoal) {
      const goal = JSON.parse(savedGoal);
      goal.tripDate = new Date(goal.tripDate);
      goal.createdAt = new Date(goal.createdAt);
      setTripGoal(goal);
    }

    if (savedTransactions) {
      const trans = JSON.parse(savedTransactions);
      const parsedTransactions = trans.map((t: any) => ({
        ...t,
        date: new Date(t.date),
        createdAt: new Date(t.createdAt),
      }));
      setTransactions(parsedTransactions);
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (tripGoal) {
      localStorage.setItem(STORAGE_KEYS.TRIP_GOAL, JSON.stringify(tripGoal));
    }
  }, [tripGoal]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  // Calculate metrics
  const metrics = useMemo((): PlannerMetrics | null => {
    if (!tripGoal) return null;

    const totalPurchased = transactions.reduce((sum, t) => sum + t.amount, 0);
    const remaining = tripGoal.targetAmount - totalPurchased;
    const totalPaid = transactions.reduce((sum, t) => sum + t.totalPaid, 0);
    const averageRate = totalPurchased > 0 ? totalPaid / totalPurchased : 0;
    const progressPercentage = (totalPurchased / tripGoal.targetAmount) * 100;
    const daysUntilTrip = Math.ceil((tripGoal.tripDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    return {
      targetAmount: tripGoal.targetAmount,
      totalPurchased,
      remaining: Math.max(0, remaining),
      averageRate,
      progressPercentage: Math.min(100, progressPercentage),
      daysUntilTrip: Math.max(0, daysUntilTrip),
    };
  }, [tripGoal, transactions]);

  // Calculate buying pace suggestions
  const buyingPace = useMemo((): BuyingPace | null => {
    if (!metrics || metrics.remaining <= 0 || metrics.daysUntilTrip <= 0) return null;

    const weeksUntilTrip = metrics.daysUntilTrip / 7;
    const weekly = metrics.remaining / weeksUntilTrip;
    const biweekly = weekly * 2;
    const monthly = weekly * 4.33; // Average weeks in a month

    let urgencyLevel: BuyingPace['urgencyLevel'] = 'low';
    if (metrics.daysUntilTrip < 30) urgencyLevel = 'high';
    else if (metrics.daysUntilTrip < 90) urgencyLevel = 'medium';

    return {
      weekly,
      biweekly,
      monthly,
      urgencyLevel,
    };
  }, [metrics]);

  const createGoal = (goal: Omit<TripGoal, 'id' | 'createdAt'>) => {
    const newGoal: TripGoal = {
      ...goal,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setTripGoal(newGoal);
  };

  const updateGoal = (goal: Omit<TripGoal, 'id' | 'createdAt'>) => {
    if (!tripGoal) return;
    setTripGoal({
      ...tripGoal,
      ...goal,
    });
  };

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const updateTransaction = (id: string, transaction: Partial<Transaction>) => {
    setTransactions(prev => 
      prev.map(t => t.id === id ? { ...t, ...transaction } : t)
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const clearAllData = () => {
    setTripGoal(null);
    setTransactions([]);
    localStorage.removeItem(STORAGE_KEYS.TRIP_GOAL);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
  };

  return {
    tripGoal,
    transactions,
    metrics,
    buyingPace,
    createGoal,
    updateGoal,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    clearAllData,
  };
}