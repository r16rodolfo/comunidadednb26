import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  Crown, 
  Check, 
  RefreshCw,
  Settings as SettingsIcon,
  Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
// Mock functions for now - will be replaced with Supabase integration later
const mockSupabase = {
  functions: {
    invoke: async (functionName: string, options?: any) => {
      console.log(`Mock call to ${functionName}:`, options);
      throw new Error('Supabase não conectado ainda');
    }
  }
};

export default function Subscription() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null
  });

  const plans = [
    {
      id: 'free',
      name: 'Gratuito',
      price: 'R$ 0',
      period: '/mês',
      description: 'Para começar sua jornada',
      features: [
        '10 transações no planner',
        'Acesso limitado à academy',
        'Suporte por email'
      ],
      color: 'bg-muted'
    },
    {
      id: 'premium-monthly',
      name: 'Premium Mensal',
      price: 'R$ 29,90',
      period: '/mês',
      description: 'Acesso completo mensal',
      features: [
        'Transações ilimitadas',
        'Acesso completo à academy',
        'Relatórios avançados',
        'Suporte prioritário',
        'Conteúdo exclusivo'
      ],
      color: 'bg-gradient-primary',
      popular: true
    },
    {
      id: 'premium-yearly',
      name: 'Premium Anual',
      price: 'R$ 299,90',
      period: '/ano',
      description: 'Melhor custo-benefício',
      features: [
        'Transações ilimitadas',
        'Acesso completo à academy',
        'Relatórios avançados',
        'Suporte prioritário',
        'Conteúdo exclusivo',
        'Desconto de 17%'
      ],
      color: 'bg-gradient-primary'
    }
  ];

  const checkSubscription = async () => {
    setIsLoading(true);
    try {
      // Mock implementation - will use Supabase later
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubscriptionData({
        subscribed: user?.role === 'premium',
        subscription_tier: user?.role === 'premium' ? 'Premium Mensal' : null,
        subscription_end: user?.role === 'premium' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null
      });
      toast({ title: 'Status da assinatura atualizado!' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: 'Erro ao verificar assinatura',
        description: message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createCheckout = async (planId: string) => {
    setIsLoading(true);
    try {
      // Mock implementation - will use Supabase later
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({ 
        title: 'Funcionalidade em desenvolvimento',
        description: 'Conecte ao Supabase para ativar pagamentos'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: 'Erro ao criar checkout',
        description: message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const manageSubscription = async () => {
    setIsLoading(true);
    try {
      // Mock implementation - will use Supabase later
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({ 
        title: 'Funcionalidade em desenvolvimento',
        description: 'Conecte ao Supabase para ativar gestão de assinaturas'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: 'Erro ao abrir portal de gestão',
        description: message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkSubscription();
    }
  }, [user]);

  const currentPlan = subscriptionData.subscribed 
    ? subscriptionData.subscription_tier 
    : 'Gratuito';

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Minha Assinatura</h1>
              <p className="text-muted-foreground">Gerencie seu plano e faturamento</p>
            </div>
          </div>
          <Button onClick={checkSubscription} disabled={isLoading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar Status
          </Button>
        </div>

        {/* Status Atual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Status da Assinatura
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold">Plano Atual: {currentPlan}</p>
                  <Badge variant={subscriptionData.subscribed ? 'default' : 'secondary'}>
                    {subscriptionData.subscribed ? 'Ativo' : 'Gratuito'}
                  </Badge>
                </div>
                {subscriptionData.subscription_end && (
                  <p className="text-sm text-muted-foreground">
                    Renovação: {new Date(subscriptionData.subscription_end).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
              {subscriptionData.subscribed && (
                <Button onClick={manageSubscription} disabled={isLoading}>
                  <SettingsIcon className="h-4 w-4 mr-2" />
                  Gerenciar Assinatura
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Planos Disponíveis */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Escolha seu Plano</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card key={plan.id} className={`relative ${plan.popular ? 'ring-2 ring-primary' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      <Star className="h-3 w-3 mr-1" />
                      Mais Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 ${plan.color} rounded-full mx-auto mb-4 flex items-center justify-center`}>
                    {plan.id === 'free' ? (
                      <Crown className="h-8 w-8 text-foreground" />
                    ) : (
                      <Crown className="h-8 w-8 text-white" />
                    )}
                  </div>
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="space-y-1">
                    <p className="text-3xl font-bold">{plan.price}</p>
                    <p className="text-sm text-muted-foreground">{plan.period}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-success" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Separator />
                  <Button 
                    className="w-full" 
                    variant={plan.id === 'free' ? 'outline' : 'default'}
                    disabled={plan.id === 'free' || isLoading}
                    onClick={() => plan.id !== 'free' && createCheckout(plan.id)}
                  >
                    {plan.id === 'free' ? 'Plano Atual' : 'Assinar Agora'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Benefícios Premium */}
        <Card>
          <CardHeader>
            <CardTitle>Por que assinar o Premium?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Planner Ilimitado</h3>
                <p className="text-sm text-muted-foreground">
                  Crie quantas transações quiser, organize suas finanças sem limites e tenha controle total sobre seus gastos.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold">Academy Completa</h3>
                <p className="text-sm text-muted-foreground">
                  Acesso a todos os cursos, vídeos exclusivos e conteúdo premium para acelerar seu aprendizado.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold">Cupons Exclusivos</h3>
                <p className="text-sm text-muted-foreground">
                  Acesse cupons exclusivos de parceiros e economize nas suas compras favoritas.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold">Suporte Prioritário</h3>
                <p className="text-sm text-muted-foreground">
                  Atendimento preferencial, resposta mais rápida e canal direto com nossa equipe.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}