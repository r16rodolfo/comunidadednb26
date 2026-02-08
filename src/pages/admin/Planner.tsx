import Layout from "@/components/Layout";
import { AdminPageHeader } from "@/components/shared/AdminPageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, Users, Receipt, DollarSign, TrendingUp, AlertTriangle, MapPin } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import {
  mockPlannerUsers,
  mockPlannerStats,
  mockVolumeByMonth,
  mockCurrencyDistribution,
  mockLocationAggregates,
  mockUnmatchedLocations,
} from "@/data/mock-planner-admin";
import { UserPlannerList } from "@/components/admin/planner/UserPlannerList";
import { UnmatchedLocationsCard } from "@/components/admin/planner/UnmatchedLocationsCard";
import { LocationRankingCard } from "@/components/admin/planner/LocationRankingCard";

const formatBRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export default function AdminPlanner() {
  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <AdminPageHeader
          icon={Calculator}
          title="Planner de Compras"
          description="Dados agregados das compras de câmbio dos usuários"
        />

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Usuários Ativos" value={mockPlannerStats.totalUsers} icon={Users} variant="info" />
          <StatCard label="Total de Transações" value={mockPlannerStats.totalTransactions} icon={Receipt} />
          <StatCard label="Volume Total (R$)" value={formatBRL(mockPlannerStats.totalVolumeBRL)} icon={DollarSign} variant="success" />
          <StatCard
            label="Locais Não Mapeados"
            value={mockPlannerStats.unmatchedLocations}
            icon={AlertTriangle}
            variant={mockPlannerStats.unmatchedLocations > 0 ? "warning" : "success"}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full sm:w-auto sm:inline-grid grid-cols-3 gap-1 text-xs sm:text-sm">
            <TabsTrigger value="overview">
              <TrendingUp className="h-4 w-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Por Usuário
            </TabsTrigger>
            <TabsTrigger value="locations">
              <MapPin className="h-4 w-4 mr-2" />
              Locais
            </TabsTrigger>
          </TabsList>

          {/* === Overview Tab === */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
              {/* Volume Chart */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Volume Mensal (R$)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={mockVolumeByMonth}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" className="text-xs" />
                        <YAxis className="text-xs" tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                        <Tooltip
                          formatter={(value: number) => [formatBRL(value), "Volume"]}
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="volumeBRL" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Currency Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Distribuição por Moeda</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={mockCurrencyDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          dataKey="value"
                          label={({ name, value }) => `${name} ${value}%`}
                        >
                          {mockCurrencyDistribution.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 mt-4">
                    <RateRow label="USD" rate={mockPlannerStats.averageRateUSD} />
                    <RateRow label="EUR" rate={mockPlannerStats.averageRateEUR} />
                    <RateRow label="GBP" rate={mockPlannerStats.averageRateGBP} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <QuickStat label="Média de Compras/Usuário" value={mockPlannerStats.averageTransactionsPerUser.toFixed(1)} />
              <QuickStat label="Metas Concluídas" value={`${mockPlannerStats.usersWithGoalComplete} de ${mockPlannerStats.totalUsers}`} />
              <QuickStat label="Volume USD" value={`$${mockPlannerStats.totalVolumeUSD.toLocaleString("pt-BR")}`} />
            </div>
          </TabsContent>

          {/* === Users Tab === */}
          <TabsContent value="users">
            <UserPlannerList users={mockPlannerUsers} />
          </TabsContent>

          {/* === Locations Tab === */}
          <TabsContent value="locations" className="space-y-6">
            {mockUnmatchedLocations.length > 0 && (
              <UnmatchedLocationsCard locations={mockUnmatchedLocations} />
            )}
            <LocationRankingCard locations={mockLocationAggregates} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

function RateRow({ label, rate }: { label: string; rate: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">Taxa Média {label}</span>
      <span className="font-semibold">
        R$ {rate.toFixed(4)}
      </span>
    </div>
  );
}

function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4 text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold mt-1">{value}</p>
      </CardContent>
    </Card>
  );
}
