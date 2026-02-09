import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AdminPlannerStats {
  totalUsers: number;
  totalTransactions: number;
  totalVolumeBRL: number;
  totalForeignVolume: number;
  avgRate: number;
  activGoals: number;
  currencyBreakdown: { currency: string; volume: number; count: number }[];
  topLocations: { location: string; count: number; volume: number }[];
  volumeOverTime: { month: string; volume: number; count: number }[];
}

export function useAdminPlanner() {
  const { data: stats, isLoading } = useQuery<AdminPlannerStats>({
    queryKey: ['admin-planner-stats'],
    queryFn: async () => {
      // Fetch all transactions and goals in parallel (admin has RLS access to all)
      const [txRes, goalsRes] = await Promise.all([
        supabase.from('planner_transactions').select('*'),
        supabase.from('trip_goals').select('*'),
      ]);

      if (txRes.error) throw txRes.error;
      if (goalsRes.error) throw goalsRes.error;

      const transactions = txRes.data ?? [];
      const goals = goalsRes.data ?? [];

      // Unique users
      const uniqueUserIds = new Set(transactions.map(t => t.user_id));
      const goalUserIds = new Set(goals.map(g => g.user_id));
      goalUserIds.forEach(id => uniqueUserIds.add(id));

      // Totals
      const totalVolumeBRL = transactions.reduce((s, t) => s + Number(t.total_paid), 0);
      const totalForeignVolume = transactions.reduce((s, t) => s + Number(t.amount), 0);
      const avgRate = totalForeignVolume > 0 ? totalVolumeBRL / totalForeignVolume : 0;

      // Currency breakdown via goals
      const goalMap = new Map(goals.map(g => [g.id, g.currency]));
      const currencyMap = new Map<string, { volume: number; count: number }>();
      for (const t of transactions) {
        const currency = goalMap.get(t.goal_id ?? '') ?? 'USD';
        const entry = currencyMap.get(currency) || { volume: 0, count: 0 };
        entry.volume += Number(t.amount);
        entry.count += 1;
        currencyMap.set(currency, entry);
      }
      const currencyBreakdown = Array.from(currencyMap.entries())
        .map(([currency, d]) => ({ currency, ...d }))
        .sort((a, b) => b.volume - a.volume);

      // Top locations
      const locationMap = new Map<string, { count: number; volume: number }>();
      for (const t of transactions) {
        const loc = t.location || 'Não informado';
        const entry = locationMap.get(loc) || { count: 0, volume: 0 };
        entry.count += 1;
        entry.volume += Number(t.total_paid);
        locationMap.set(loc, entry);
      }
      const topLocations = Array.from(locationMap.entries())
        .map(([location, d]) => ({ location, ...d }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Volume over time (monthly)
      const monthMap = new Map<string, { volume: number; count: number }>();
      for (const t of transactions) {
        const d = new Date(t.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const entry = monthMap.get(key) || { volume: 0, count: 0 };
        entry.volume += Number(t.total_paid);
        entry.count += 1;
        monthMap.set(key, entry);
      }
      const volumeOverTime = Array.from(monthMap.entries())
        .map(([month, d]) => ({ month, ...d }))
        .sort((a, b) => a.month.localeCompare(b.month));

      return {
        totalUsers: uniqueUserIds.size,
        totalTransactions: transactions.length,
        totalVolumeBRL,
        totalForeignVolume,
        avgRate,
        activGoals: goals.length,
        currencyBreakdown,
        topLocations,
        volumeOverTime,
      };
    },
  });

  return { stats: stats ?? null, isLoading };
}
