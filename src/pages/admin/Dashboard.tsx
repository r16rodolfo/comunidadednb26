
import Layout from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  BookOpen, 
  ShoppingBag, 
  TrendingUp, 
  UserPlus,
  DollarSign,
  Activity,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ManagerDashboard() {
  const stats = {
    totalUsers: 1234,
    activeUsers: 567,
    newUsersThisMonth: 89,
    totalCourses: 45,
    totalProducts: 156,
    monthlyRevenue: 25678
  };

  const recentUsers = [
    { id: '1', name: 'João Silva', email: 'joao@email.com', role: 'premium', joinedAt: '2024-01-15' },
    { id: '2', name: 'Maria Santos', email: 'maria@email.com', role: 'free', joinedAt: '2024-01-14' },
    { id: '3', name: 'Pedro Costa', email: 'pedro@email.com', role: 'premium', joinedAt: '2024-01-13' }
  ];

  const recentActivity = [
    { action: 'Novo usuário cadastrado', user: 'Ana Oliveira', time: '2 min atrás' },
    { action: 'Aula "Câmbio Básico" assistida', user: 'Carlos Lima', time: '5 min atrás' },
    { action: 'Produto adicionado aos favoritos', user: 'Lucia Ferreira', time: '10 min atrás' }
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard Administrativo</h1>
            <p className="text-muted-foreground">Visão geral da plataforma</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to="/admin/users">
                <Users className="h-4 w-4 mr-2" />
                Gerenciar Usuários
              </Link>
            </Button>
            <Button asChild>
              <Link to="/admin/content">
                <BookOpen className="h-4 w-4 mr-2" />
                Gerenciar Conteúdo
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Usuários</p>
                  <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Usuários Ativos</p>
                  <p className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</p>
                </div>
                <Activity className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Novos Usuários</p>
                  <p className="text-2xl font-bold">+{stats.newUsersThisMonth}</p>
                </div>
                <UserPlus className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Receita Mensal</p>
                  <p className="text-2xl font-bold">R$ {stats.monthlyRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Usuários Recentes</CardTitle>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/admin/users">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Todos
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={user.role === 'premium' ? 'default' : 'outline'}>
                        {user.role === 'premium' ? 'Premium' : 'Gratuito'}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(user.joinedAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.user} • {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Gerenciar Aulas</h3>
                  <p className="text-sm text-muted-foreground">
                    {stats.totalCourses} aulas cadastradas
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Gerenciar Produtos</h3>
                  <p className="text-sm text-muted-foreground">
                    {stats.totalProducts} produtos cadastrados
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Analytics</h3>
                  <p className="text-sm text-muted-foreground">
                    Relatórios e métricas
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
