import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type AnalyticsPeriod = '30d' | '90d' | '12m' | 'all';

export interface PlatformAnalytics {
  // Users
  totalUsers: number;
  newUsersInPeriod: number;
  roleBreakdown: { role: string; count: number }[];

  // Subscriptions / Revenue
  activeSubscribers: number;
  cancellingSubscribers: number;
  churnedSubscribers: number;
  planBreakdown: { plan: string; count: number }[];
  estimatedMRR: number;

  // Feature usage
  totalPlannerTransactions: number;
  totalLessonsCompleted: number;
  totalCouponClicks: number;
  totalAnalysesPublished: number;
  featureUsage: { feature: string; value: number }[];

  // Growth over time
  userGrowth: { month: string; count: number }[];
}

function getDateFrom(period: AnalyticsPeriod): string | null {
  if (period === 'all') return null;
  const now = new Date();
  if (period === '30d') now.setDate(now.getDate() - 30);
  else if (period === '90d') now.setDate(now.getDate() - 90);
  else if (period === '12m') now.setFullYear(now.getFullYear() - 1);
  return now.toISOString();
}

export function useAdminAnalytics(period: AnalyticsPeriod = 'all') {
  const dateFrom = getDateFrom(period);

  const { data: analytics, isLoading } = useQuery<PlatformAnalytics>({
    queryKey: ['admin-analytics', period],
    queryFn: async () => {
      // Fetch all data in parallel
      const [profilesRes, rolesRes, subscribersRes, plansRes, txRes, progressRes, couponsRes, analysesRes] = await Promise.all([
        supabase.from('profiles').select('id, created_at'),
        supabase.from('user_roles').select('role, user_id'),
        supabase.from('subscribers').select('*'),
        supabase.from('plans').select('slug, price_cents, interval').eq('is_active', true),
        supabase.from('planner_transactions').select('id, created_at'),
        supabase.from('lesson_progress').select('id, completed_at').eq('is_completed', true),
        supabase.from('coupons').select('id, click_count'),
        supabase.from('market_analyses').select('id, created_at'),
      ]);

      const profiles = profilesRes.data ?? [];
      const roles = rolesRes.data ?? [];
      const subscribers = subscribersRes.data ?? [];
      const plans = plansRes.data ?? [];
      const transactions = txRes.data ?? [];
      const progress = progressRes.data ?? [];
      const coupons = couponsRes.data ?? [];
      const analyses = analysesRes.data ?? [];

      // ── Users ──
      const totalUsers = profiles.length;
      const newUsersInPeriod = dateFrom
        ? profiles.filter(p => p.created_at >= dateFrom).length
        : totalUsers;

      // Role breakdown
      const roleMap = new Map<string, number>();
      for (const r of roles) {
        roleMap.set(r.role, (roleMap.get(r.role) ?? 0) + 1);
      }
      const roleLabels: Record<string, string> = { free: 'Free', premium: 'Premium', gestor: 'Gestor', admin: 'Admin' };
      const roleBreakdown = Array.from(roleMap.entries())
        .map(([role, count]) => ({ role: roleLabels[role] ?? role, count }))
        .sort((a, b) => b.count - a.count);

      // ── Subscriptions ──
      const activeSubscribers = subscribers.filter(s => s.subscribed && !s.cancel_at_period_end).length;
      const cancellingSubscribers = subscribers.filter(s => s.subscribed && s.cancel_at_period_end).length;
      const churnedSubscribers = subscribers.filter(s => !s.subscribed).length;

      // Plan breakdown
      const planMap = new Map<string, number>();
      for (const s of subscribers.filter(s => s.subscribed && s.current_plan_slug)) {
        const slug = s.current_plan_slug!;
        planMap.set(slug, (planMap.get(slug) ?? 0) + 1);
      }
      const planBreakdown = Array.from(planMap.entries())
        .map(([plan, count]) => ({ plan, count }))
        .sort((a, b) => b.count - a.count);

      // Estimated MRR
      const planPriceMap = new Map(plans.map(p => [p.slug, { cents: p.price_cents, interval: p.interval }]));
      let estimatedMRR = 0;
      for (const s of subscribers.filter(s => s.subscribed && s.current_plan_slug)) {
        const plan = planPriceMap.get(s.current_plan_slug!);
        if (!plan) continue;
        const monthly = plan.interval === 'year' ? plan.cents / 12
          : plan.interval === 'semester' ? plan.cents / 6
          : plan.interval === 'quarter' ? plan.cents / 3
          : plan.cents;
        estimatedMRR += monthly;
      }
      estimatedMRR = estimatedMRR / 100; // cents → BRL

      // ── Feature usage ──
      const totalPlannerTransactions = dateFrom
        ? transactions.filter(t => t.created_at >= dateFrom).length
        : transactions.length;

      const totalLessonsCompleted = dateFrom
        ? progress.filter(p => p.completed_at >= dateFrom).length
        : progress.length;

      const totalCouponClicks = coupons.reduce((s, c) => s + (c.click_count ?? 0), 0);

      const totalAnalysesPublished = dateFrom
        ? analyses.filter(a => a.created_at >= dateFrom).length
        : analyses.length;

      const featureUsage = [
        { feature: 'Compras de Câmbio', value: totalPlannerTransactions },
        { feature: 'Aulas Concluídas', value: totalLessonsCompleted },
        { feature: 'Cliques em Cupons', value: totalCouponClicks },
        { feature: 'Análises Publicadas', value: totalAnalysesPublished },
      ];

      // ── User growth over time (monthly) ──
      const monthMap = new Map<string, number>();
      for (const p of profiles) {
        const d = new Date(p.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthMap.set(key, (monthMap.get(key) ?? 0) + 1);
      }
      const userGrowth = Array.from(monthMap.entries())
        .map(([month, count]) => ({ month, count }))
        .sort((a, b) => a.month.localeCompare(b.month));

      // Apply period filter to growth chart
      const filteredGrowth = dateFrom
        ? userGrowth.filter(g => g.month >= dateFrom.slice(0, 7))
        : userGrowth;

      return {
        totalUsers,
        newUsersInPeriod,
        roleBreakdown,
        activeSubscribers,
        cancellingSubscribers,
        churnedSubscribers,
        planBreakdown,
        estimatedMRR,
        totalPlannerTransactions,
        totalLessonsCompleted,
        totalCouponClicks,
        totalAnalysesPublished,
        featureUsage,
        userGrowth: filteredGrowth,
      };
    },
  });

  return { analytics: analytics ?? null, isLoading };
}
