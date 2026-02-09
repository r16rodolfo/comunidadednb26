import Layout from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreditCard, Download, Users, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { PlanManagementCard } from '@/components/admin/PlanManagementCard';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function AdminSubscriptions() {
  const { data: subscribers = [], isLoading } = useQuery({
    queryKey: ['admin-subscribers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscribers_safe')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const getStatusBadge = (sub: typeof subscribers[0]) => {
    if (sub.subscribed) {
      return <Badge className="bg-success/10 text-success border-success/20">Ativo</Badge>;
    }
    if (sub.cancel_at_period_end) {
      return <Badge variant="destructive">Cancelando</Badge>;
    }
    return <Badge variant="secondary">Gratuito</Badge>;
  };

  const stats = {
    total: subscribers.length,
    active: subscribers.filter(s => s.subscribed).length,
    cancelled: subscribers.filter(s => s.cancel_at_period_end).length,
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader icon={CreditCard} title="Gestão de Assinaturas" description="Gerencie todas as assinaturas da plataforma">
          <Button variant="outline"><Download className="h-4 w-4 mr-2" />Exportar Relatório</Button>
        </PageHeader>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard label="Total de Assinantes" value={stats.total} icon={Users} />
          <StatCard label="Assinaturas Ativas" value={stats.active} icon={CheckCircle} variant="success" />
          <StatCard label="Cancelando" value={stats.cancelled} icon={XCircle} variant="warning" />
        </div>

        {/* Plan Management */}
        <PlanManagementCard />

        {/* Subscribers Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lista de Assinantes</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : subscribers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CreditCard className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">Nenhum assinante encontrado.</p>
                <p className="text-xs mt-1">Os assinantes aparecerão aqui quando o sistema de pagamentos estiver ativo.</p>
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Válido até</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscribers.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{sub.email.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{sub.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{sub.current_plan_slug || 'Gratuito'}</span>
                        </TableCell>
                        <TableCell>{getStatusBadge(sub)}</TableCell>
                        <TableCell>
                          {sub.subscription_end
                            ? new Date(sub.subscription_end).toLocaleDateString('pt-BR')
                            : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
