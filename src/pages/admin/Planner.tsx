import Layout from "@/components/Layout";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Calculator, Users, Receipt, DollarSign, Target, TrendingUp } from "lucide-react";
import { useAdminPlanner } from "@/hooks/useAdminPlanner";
import { PlannerVolumeChart } from "@/components/admin/planner/PlannerVolumeChart";
import { PlannerCurrencyChart } from "@/components/admin/planner/PlannerCurrencyChart";
import { PlannerTopLocations } from "@/components/admin/planner/PlannerTopLocations";

const formatBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 });

const formatRate = (v: number) =>
  v.toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 });

export default function AdminPlanner() {
  const { stats, isLoading } = useAdminPlanner();

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <PageHeader
          icon={Calculator}
          title="Planner de Compras"
          description="Dados agregados das compras de câmbio dos usuários"
        />

        {/* Metrics Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard label="Usuários" value={stats.totalUsers} icon={Users} variant="info" />
            <StatCard label="Metas Ativas" value={stats.activGoals} icon={Target} variant="success" />
            <StatCard label="Transações" value={stats.totalTransactions} icon={Receipt} />
            <StatCard label="Volume (BRL)" value={formatBRL(stats.totalVolumeBRL)} icon={DollarSign} variant="success" />
            <StatCard label="Vol. Estrangeiro" value={stats.totalForeignVolume.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} icon={TrendingUp} variant="warning" />
            <StatCard label="Taxa Média" value={formatRate(stats.avgRate)} icon={DollarSign} variant="info" />
          </div>
        ) : null}

        {/* Charts Row */}
        {!isLoading && stats && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PlannerVolumeChart data={stats.volumeOverTime} />
            </div>
            <div className="lg:col-span-1">
              <PlannerCurrencyChart data={stats.currencyBreakdown} />
            </div>
          </div>
        )}

        {/* Top Locations */}
        {!isLoading && stats && (
          <PlannerTopLocations data={stats.topLocations} />
        )}
      </div>
    </Layout>
  );
}
