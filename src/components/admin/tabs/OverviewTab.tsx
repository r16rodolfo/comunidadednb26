import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Activity, UserPlus, DollarSign, BookOpen, Eye, Ticket, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatCard } from '@/components/shared/StatCard';
import { adminStats, recentUsers, recentActivity } from '@/data/mock-admin';

function QuickLink({ to, icon: Icon, label, description }: {
  to: string; icon: React.ElementType; label: string; description: string;
}) {
  return (
    <Link to={to}>
      <Card className="hover:border-primary/40 hover:shadow-md transition-all duration-200 cursor-pointer group h-full">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-primary/10 p-3 group-hover:bg-primary/15 transition-colors">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{label}</h3>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function OverviewTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total de Usuários" value={adminStats.totalUsers.toLocaleString()} icon={Users} />
        <StatCard label="Usuários Ativos" value={adminStats.activeUsers.toLocaleString()} icon={Activity} variant="success" />
        <StatCard label="Novos este Mês" value={`+${adminStats.newUsersThisMonth}`} icon={UserPlus} variant="info" />
        <StatCard label="Receita Mensal" value={`R$ ${adminStats.monthlyRevenue.toLocaleString()}`} icon={DollarSign} variant="success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Usuários Recentes</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link to="/admin/users"><Eye className="h-4 w-4 mr-1.5" />Ver Todos</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant={user.role === 'premium' ? 'default' : 'outline'} className="text-xs">
                      {user.role === 'premium' ? 'Premium' : 'Gratuito'}
                    </Badge>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(user.joinedAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-1.5 shrink-0"></div>
                  <div>
                    <p className="text-sm">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.user} • {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Acesso Rápido</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickLink to="/admin/users" icon={Users} label="Usuários" description={`${adminStats.totalUsers} cadastrados`} />
          <QuickLink to="/admin/content" icon={BookOpen} label="Conteúdo" description={`${adminStats.totalCourses} aulas`} />
          <QuickLink to="/admin/coupons" icon={Ticket} label="Cupons" description="Gerenciar cupons" />
          <QuickLink to="/admin/subscriptions" icon={CreditCard} label="Assinaturas" description="Planos e receita" />
        </div>
      </div>
    </div>
  );
}
