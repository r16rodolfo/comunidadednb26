import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Activity, UserPlus, DollarSign, BookOpen, Eye, Ticket, CreditCard, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatCard } from '@/components/shared/StatCard';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-overview-stats'],
    queryFn: async () => {
      const [profilesRes, subscribersRes, rolesRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('subscribers').select('id', { count: 'exact', head: true }).eq('subscribed', true),
        supabase.from('user_roles').select('id', { count: 'exact', head: true }).eq('role', 'premium'),
      ]);

      return {
        totalUsers: profilesRes.count ?? 0,
        activeSubscribers: subscribersRes.count ?? 0,
        premiumUsers: rolesRes.count ?? 0,
      };
    },
  });

  const { data: recentUsers = [] } = useQuery({
    queryKey: ['admin-recent-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, name, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      // Get roles for these users
      const userIds = (data || []).map(u => u.user_id);
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      const roleMap = new Map((roles || []).map(r => [r.user_id, r.role]));

      return (data || []).map(u => ({
        id: u.user_id,
        name: u.name || 'Sem nome',
        role: roleMap.get(u.user_id) || 'free',
        joinedAt: u.created_at,
      }));
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Total de Usuários" value={stats?.totalUsers ?? 0} icon={Users} />
        <StatCard label="Assinantes Ativos" value={stats?.activeSubscribers ?? 0} icon={Activity} variant="success" />
        <StatCard label="Usuários Premium" value={stats?.premiumUsers ?? 0} icon={UserPlus} variant="info" />
      </div>

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
          {recentUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum usuário cadastrado ainda.</p>
          ) : (
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{user.name}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant={user.role === 'premium' || user.role === 'admin' ? 'default' : 'outline'} className="text-xs">
                      {user.role === 'premium' ? 'Premium' : user.role === 'admin' ? 'Admin' : user.role === 'gestor' ? 'Gestor' : 'Gratuito'}
                    </Badge>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(user.joinedAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Acesso Rápido</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickLink to="/admin/users" icon={Users} label="Usuários" description="Gerenciar usuários" />
          <QuickLink to="/admin/content" icon={BookOpen} label="Conteúdo" description="Gerenciar cursos" />
          <QuickLink to="/admin/coupons" icon={Ticket} label="Cupons" description="Gerenciar cupons" />
          <QuickLink to="/admin/subscriptions" icon={CreditCard} label="Assinaturas" description="Planos e receita" />
        </div>
      </div>
    </div>
  );
}
