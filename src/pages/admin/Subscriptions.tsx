import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  CreditCard, 
  Search, 
  Filter, 
  Download,
  Eye,
  Ban,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminSubscriptions() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [subscriptions, setSubscriptions] = useState([
    {
      id: '1',
      user: {
        name: 'Ana Silva',
        email: 'ana@example.com',
        avatar: ''
      },
      plan: 'Premium Mensal',
      status: 'active',
      amount: 'R$ 29,90',
      startDate: '2024-01-15',
      nextBilling: '2024-02-15',
      stripeId: 'sub_1234567890'
    },
    {
      id: '2',
      user: {
        name: 'Carlos Santos',
        email: 'carlos@example.com',
        avatar: ''
      },
      plan: 'Premium Anual',
      status: 'active',
      amount: 'R$ 299,90',
      startDate: '2023-12-01',
      nextBilling: '2024-12-01',
      stripeId: 'sub_0987654321'
    },
    {
      id: '3',
      user: {
        name: 'Maria Oliveira',
        email: 'maria@example.com',
        avatar: ''
      },
      plan: 'Premium Mensal',
      status: 'cancelled',
      amount: 'R$ 29,90',
      startDate: '2024-01-01',
      nextBilling: null,
      stripeId: 'sub_1122334455'
    },
    {
      id: '4',
      user: {
        name: 'João Costa',
        email: 'joao@example.com',
        avatar: ''
      },
      plan: 'Gratuito',
      status: 'free',
      amount: 'R$ 0,00',
      startDate: '2024-01-20',
      nextBilling: null,
      stripeId: null
    }
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
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
      // Mock cancellation
      setSubscriptions(prev => 
        prev.map(sub => 
          sub.id === subscriptionId 
            ? { ...sub, status: 'cancelled', nextBilling: null }
            : sub
        )
      );
      toast({ title: 'Assinatura cancelada com sucesso' });
    } catch (error) {
      toast({
        title: 'Erro ao cancelar assinatura',
        variant: 'destructive'
      });
    }
  };

  const handleReactivateSubscription = async (subscriptionId: string) => {
    try {
      // Mock reactivation
      setSubscriptions(prev => 
        prev.map(sub => 
          sub.id === subscriptionId 
            ? { ...sub, status: 'active', nextBilling: '2024-03-15' }
            : sub
        )
      );
      toast({ title: 'Assinatura reativada com sucesso' });
    } catch (error) {
      toast({
        title: 'Erro ao reativar assinatura',
        variant: 'destructive'
      });
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
      .reduce((acc, s) => acc + parseFloat(s.amount.replace('R$ ', '').replace(',', '.')), 0)
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Gestão de Assinaturas</h1>
              <p className="text-muted-foreground">Gerencie todas as assinaturas da plataforma</p>
            </div>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total de Usuários</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                <p className="text-sm text-muted-foreground">Assinaturas Ativas</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
                <p className="text-sm text-muted-foreground">Canceladas</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold">R$ {stats.revenue.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Receita Mensal</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Busca */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Lista de Assinaturas</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar usuário ou plano..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
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
                          <AvatarFallback>
                            {subscription.user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{subscription.user.name}</p>
                          <p className="text-sm text-muted-foreground">{subscription.user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{subscription.plan}</p>
                      {subscription.stripeId && (
                        <p className="text-xs text-muted-foreground">{subscription.stripeId}</p>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                    <TableCell className="font-medium">{subscription.amount}</TableCell>
                    <TableCell>
                      {new Date(subscription.startDate).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      {subscription.nextBilling ? 
                        new Date(subscription.nextBilling).toLocaleDateString('pt-BR') : 
                        '-'
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {subscription.status === 'active' ? (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleCancelSubscription(subscription.id)}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        ) : subscription.status === 'cancelled' ? (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleReactivateSubscription(subscription.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}