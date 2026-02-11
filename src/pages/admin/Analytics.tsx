import { useState } from 'react';
import Layout from '@/components/Layout';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { Skeleton } from '@/components/ui/skeleton';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  TrendingUp, Users, UserPlus, CreditCard, DollarSign,
  UserMinus, XCircle,
} from 'lucide-react';
import { useAdminAnalytics, AnalyticsPeriod } from '@/hooks/useAdminAnalytics';
import { UserGrowthChart } from '@/components/admin/analytics/UserGrowthChart';
import { DistributionCharts } from '@/components/admin/analytics/DistributionCharts';
import { FeatureUsageChart } from '@/components/admin/analytics/FeatureUsageChart';

const PERIOD_OPTIONS: { value: AnalyticsPeriod; label: string }[] = [
  { value: '30d', label: '30 dias' },
  { value: '90d', label: '90 dias' },
  { value: '12m', label: '12 meses' },
  { value: 'all', label: 'Tudo' },
];

const formatBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

export default function Analytics() {
  const [period, setPeriod] = useState<AnalyticsPeriod>('all');
  const { analytics, isLoading } = useAdminAnalytics(period);

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <PageHeader
          icon={TrendingUp}
          title="Analytics e Relatórios"
          description="Acompanhe o desempenho da plataforma"
        >
          <ToggleGroup
            type="single"
            value={period}
            onValueChange={(v) => v && setPeriod(v as AnalyticsPeriod)}
            className="border border-border rounded-lg p-1 bg-muted/40"
          >
            {PERIOD_OPTIONS.map((opt) => (
              <ToggleGroupItem
                key={opt.value}
                value={opt.value}
                className="text-xs sm:text-sm px-3 py-1.5 rounded-md text-muted-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-sm transition-colors"
              >
                {opt.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </PageHeader>

        {/* Key Metrics */}
        {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-lg" />
            ))}
          </div>
        ) : analytics ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <StatCard label="Total Usuários" value={analytics.totalUsers} icon={Users} variant="info" />
            <StatCard
              label={period === 'all' ? 'Novos (total)' : 'Novos no período'}
              value={analytics.newUsersInPeriod}
              icon={UserPlus}
              variant="success"
            />
            <StatCard label="Assinantes Ativos" value={analytics.activeSubscribers} icon={CreditCard} variant="success" />
            <StatCard label="Cancelando" value={analytics.cancellingSubscribers} icon={UserMinus} variant="warning" />
            <StatCard label="Cancelados" value={analytics.churnedSubscribers} icon={XCircle} />
            <StatCard label="MRR Estimado" value={formatBRL(analytics.estimatedMRR)} icon={DollarSign} variant="success" />
            <StatCard
              label="Taxa Retenção"
              value={
                analytics.totalUsers > 0
                  ? `${Math.round((analytics.activeSubscribers / Math.max(1, analytics.activeSubscribers + analytics.churnedSubscribers)) * 100)}%`
                  : '—'
              }
              icon={TrendingUp}
              variant="info"
            />
          </div>
        ) : null}

        {/* User Growth Chart */}
        {!isLoading && analytics && (
          <UserGrowthChart data={analytics.userGrowth} />
        )}

        {/* Distribution Charts */}
        {!isLoading && analytics && (
          <DistributionCharts
            roleData={analytics.roleBreakdown}
            planData={analytics.planBreakdown}
          />
        )}

        {/* Feature Usage */}
        {!isLoading && analytics && (
          <FeatureUsageChart data={analytics.featureUsage} />
        )}
      </div>
    </Layout>
  );
}
