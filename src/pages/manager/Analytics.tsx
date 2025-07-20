import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Eye, 
  MousePointer,
  BookOpen,
  ShoppingBag,
  Calendar
} from 'lucide-react';

// Mock data
const monthlyRevenue = [
  { month: 'Jan', revenue: 15420, users: 180 },
  { month: 'Fev', revenue: 18750, users: 220 },
  { month: 'Mar', revenue: 22150, users: 280 },
  { month: 'Abr', revenue: 19800, users: 250 },
  { month: 'Mai', revenue: 25600, users: 320 },
  { month: 'Jun', revenue: 28900, users: 390 }
];

const userActivity = [
  { day: 'Seg', logins: 145, newUsers: 12 },
  { day: 'Ter', logins: 189, newUsers: 18 },
  { day: 'Qua', logins: 167, newUsers: 15 },
  { day: 'Qui', logins: 203, newUsers: 22 },
  { day: 'Sex', logins: 178, newUsers: 16 },
  { day: 'Sáb', logins: 134, newUsers: 9 },
  { day: 'Dom', logins: 98, newUsers: 7 }
];

const contentPerformance = [
  { name: 'Fundamentos do Câmbio', views: 1250, completions: 890, engagement: 71 },
  { name: 'Estratégias Avançadas', views: 980, completions: 640, engagement: 65 },
  { name: 'Cartões Internacionais', views: 2100, completions: 1680, engagement: 80 },
  { name: 'Seguros de Viagem', views: 850, completions: 595, engagement: 70 }
];

const subscriptionTypes = [
  { name: 'Gratuito', value: 65, color: '#94a3b8' },
  { name: 'Premium', value: 35, color: '#10b981' }
];

const topProducts = [
  { name: 'Cartão Pré-pago', clicks: 2450, conversions: 89, revenue: 4450 },
  { name: 'Seguro Viagem', clicks: 1890, conversions: 67, revenue: 3350 },
  { name: 'App de Câmbio', clicks: 1650, conversions: 45, revenue: 2250 },
  { name: 'Conta Global', clicks: 1420, conversions: 38, revenue: 1900 }
];

const MetricCard = ({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon 
}: {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  icon: any;
}) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-bold">{value}</h3>
            <Badge variant={changeType === 'positive' ? 'default' : 'destructive'} className="text-xs">
              {changeType === 'positive' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {change}
            </Badge>
          </div>
        </div>
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
    </CardContent>
  </Card>
);

export default function Analytics() {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics e Relatórios</h1>
          <p className="text-muted-foreground">Acompanhe o desempenho da plataforma</p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Receita Mensal"
            value="R$ 28.900"
            change="+12.8%"
            changeType="positive"
            icon={DollarSign}
          />
          <MetricCard
            title="Usuários Ativos"
            value="1.245"
            change="+8.2%"
            changeType="positive"
            icon={Users}
          />
          <MetricCard
            title="Taxa de Conversão"
            value="3.6%"
            change="-2.1%"
            changeType="negative"
            icon={MousePointer}
          />
          <MetricCard
            title="Visualizações"
            value="45.680"
            change="+15.3%"
            changeType="positive"
            icon={Eye}
          />
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="content">Conteúdo</TabsTrigger>
            <TabsTrigger value="revenue">Receita</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Receita Mensal</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`R$ ${value.toLocaleString()}`, 'Receita']} />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="hsl(var(--primary))" 
                        fill="hsl(var(--primary))" 
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* User Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Usuários</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={subscriptionTypes}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="value"
                      >
                        {subscriptionTypes.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Porcentagem']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 mt-4">
                    {subscriptionTypes.map((entry) => (
                      <div key={entry.name} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-sm">{entry.name}: {entry.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* User Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Atividade Semanal</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={userActivity}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="logins" fill="hsl(var(--primary))" name="Logins" />
                      <Bar dataKey="newUsers" fill="hsl(var(--accent))" name="Novos Usuários" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* New Users Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Crescimento de Usuários</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="users" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        name="Usuários"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance do Conteúdo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contentPerformance.map((content, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{content.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {content.views} visualizações • {content.completions} conclusões
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {content.engagement}% engajamento
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Produtos - Achadinhos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {product.clicks} clicks • {product.conversions} conversões
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">R$ {product.revenue.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">
                          {((product.conversions / product.clicks) * 100).toFixed(1)}% conversão
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}