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
  Star,
  TrendingDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePlans } from '@/hooks/usePlans';
import { formatPrice, formatMonthlyEquivalent } from '@/data/mock-plans';

export default function Subscription() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { activePlans, isLoading: plansLoading } = usePlans();
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState({
    subscribed: false,
    subscription_tier: null as string | null,
    subscription_end: null as string | null,
  });

  const checkSubscription = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubscriptionData({
        subscribed: user?.role === 'premium',
        subscription_tier: user?.role === 'premium' ? 'Premium Mensal' : null,
        subscription_end: user?.role === 'premium' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null
      });
      toast({ title: 'Status da assinatura atualizado!' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({ title: 'Erro ao verificar assinatura', description: message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const createCheckout = async (planSlug: string) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({ 
        title: 'Funcionalidade em desenvolvimento',
        description: 'Conecte ao Lovable Cloud para ativar pagamentos'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({ title: 'Erro ao criar checkout', description: message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const manageSubscription = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({ 
        title: 'Funcionalidade em desenvolvimento',
        description: 'Conecte ao Lovable Cloud para ativar gestão de assinaturas'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({ title: 'Erro ao abrir portal de gestão', description: message, variant: 'destructive' });
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

  const freePlan = activePlans.find(p => p.interval === 'free');
  const paidPlans = activePlans.filter(p => p.interval !== 'free');

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
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

        {/* Planos */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Escolha seu Plano</h2>
          
          {/* Plano Gratuito */}
          {freePlan && (
            <Card className="border-dashed">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      <Crown className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold">{freePlan.name}</p>
                      <p className="text-sm text-muted-foreground">{freePlan.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold">R$ 0</p>
                      <p className="text-xs text-muted-foreground">para sempre</p>
                    </div>
                    <Button variant="outline" disabled>
                      {!subscriptionData.subscribed ? 'Plano Atual' : 'Plano Básico'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Planos Pagos */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {paidPlans.map((plan) => (
              <Card key={plan.id} className={`relative flex flex-col ${plan.popular ? 'ring-2 ring-primary shadow-lg' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-primary text-primary-foreground">
                      <Star className="h-3 w-3 mr-1" />
                      Mais Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <div className="w-14 h-14 bg-gradient-primary rounded-full mx-auto mb-3 flex items-center justify-center">
                    <Crown className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <div className="space-y-1">
                    <p className="text-3xl font-bold">{formatPrice(plan.priceCents)}</p>
                    <p className="text-sm text-muted-foreground">{plan.intervalLabel}</p>
                  </div>
                  {plan.savingsPercent && (
                    <Badge variant="secondary" className="mt-1 mx-auto">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      {plan.savingsPercent}% de economia
                    </Badge>
                  )}
                  {plan.interval !== 'monthly' && (
                    <p className="text-xs text-muted-foreground mt-1">
                      ≈ {formatMonthlyEquivalent(plan)}/mês
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">{plan.description}</p>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-success mt-0.5 shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div>
                    <Separator className="mb-4" />
                    <Button 
                      className="w-full" 
                      variant={plan.popular ? 'default' : 'outline'}
                      disabled={isLoading}
                      onClick={() => createCheckout(plan.slug)}
                    >
                      Assinar Agora
                    </Button>
                  </div>
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
