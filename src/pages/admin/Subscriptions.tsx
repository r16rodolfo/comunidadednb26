import { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreditCard, Search, Filter, Download, Eye, Ban, CheckCircle, Users, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { StatCard } from '@/components/shared/StatCard';
import { AdminPageHeader } from '@/components/shared/AdminPageHeader';
import { PlanManagementCard } from '@/components/admin/PlanManagementCard';
import { mockSubscriptions } from '@/data/mock-admin';

export default function AdminSubscriptions() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [subscriptions, setSubscriptions] = useState(mockSubscriptions);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success/10 text-success border-success/20">Ativo</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelado</Badge>;
      case 'free':
        return <Badge variant="secondary">Gratuito</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    try {
      setSubscriptions(prev =>
        prev.map(sub =>
          sub.id === subscriptionId ? { ...sub, status: 'cancelled', nextBilling: null } : sub
        )
      );
      toast({ title: 'Assinatura cancelada com sucesso' });
    } catch {
      toast({ title: 'Erro ao cancelar assinatura', variant: 'destructive' });
    }
  };

  const handleReactivateSubscription = async (subscriptionId: string) => {
    try {
      setSubscriptions(prev =>
        prev.map(sub =>
          sub.id === subscriptionId ? { ...sub, status: 'active', nextBilling: '2024-03-15' } : sub
        )
      );
      toast({ title: 'Assinatura reativada com sucesso' });
    } catch {
      toast({ title: 'Erro ao reativar assinatura', variant: 'destructive' });
    }
  };

  const filteredSubscriptions = subscriptions.filter(subscription =>
    subscription.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subscription.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subscription.plan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: subscriptions.length,
    active: subscriptions.filter(s => s.status === 'active').length,
    cancelled: subscriptions.filter(s => s.status === 'cancelled').length,
    revenue: subscriptions
      .filter(s => s.status === 'active')
      .reduce((acc, s) => acc + parseFloat(s.amount.replace('R$ ', '').replace(',', '.')), 0),
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        <AdminPageHeader icon={CreditCard} title="Gestão de Assinaturas" description="Gerencie todas as assinaturas da plataforma">
          <Button variant="outline"><Download className="h-4 w-4 mr-2" />Exportar Relatório</Button>
        </AdminPageHeader>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total de Usuários" value={stats.total} icon={Users} />
          <StatCard label="Assinaturas Ativas" value={stats.active} icon={CheckCircle} variant="success" />
          <StatCard label="Canceladas" value={stats.cancelled} icon={XCircle} variant="warning" />
          <StatCard label="Receita Mensal" value={`R$ ${stats.revenue.toFixed(2)}`} icon={CreditCard} variant="info" />
        </div>

        {/* Plan Management */}
        <PlanManagementCard />

        {/* Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3">
              <CardTitle className="text-base">Lista de Assinaturas</CardTitle>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Buscar usuário ou plano..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
                <Button variant="outline" size="sm"><Filter className="h-4 w-4 mr-2" />Filtros</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Início</TableHead>
                    <TableHead>Próximo Pagamento</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscriptions.map((subscription) => (
                    <TableRow key={subscription.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={subscription.user.avatar} />
                            <AvatarFallback>{subscription.user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{subscription.user.name}</p>
                            <p className="text-sm text-muted-foreground">{subscription.user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{subscription.plan}</p>
                        {subscription.stripeId && <p className="text-xs text-muted-foreground">{subscription.stripeId}</p>}
                      </TableCell>
                      <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                      <TableCell className="font-medium">{subscription.amount}</TableCell>
                      <TableCell>{new Date(subscription.startDate).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>{subscription.nextBilling ? new Date(subscription.nextBilling).toLocaleDateString('pt-BR') : '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                          {subscription.status === 'active' ? (
                            <Button variant="ghost" size="sm" onClick={() => handleCancelSubscription(subscription.id)}><Ban className="h-4 w-4" /></Button>
                          ) : subscription.status === 'cancelled' ? (
                            <Button variant="ghost" size="sm" onClick={() => handleReactivateSubscription(subscription.id)}><CheckCircle className="h-4 w-4" /></Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
