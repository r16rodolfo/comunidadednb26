import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  TrendingDown,
  AlertTriangle,
  XCircle,
  Undo2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePlans, formatPrice, formatMonthlyEquivalent, SubscriptionPlan } from '@/hooks/usePlans';
import { useSubscription } from '@/hooks/useSubscription';
import { PageHeader } from '@/components/shared/PageHeader';

export default function Subscription() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { activePlans } = usePlans();
  const {
    subscription,
    isLoading,
    isCheckoutLoading,
    isPortalLoading,
    isCancelDowngradeLoading,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
    cancelDowngrade,
  } = useSubscription();

  const [searchParams] = useSearchParams();

  // Handle checkout success/cancel
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast({ title: '🎉 Assinatura realizada com sucesso!' });
      checkSubscription();
    } else if (searchParams.get('cancelled') === 'true') {
      toast({ title: 'Checkout cancelado', variant: 'destructive' });
    }
  }, [searchParams]);

  const currentPlan = subscription.subscribed
    ? subscription.subscription_tier
    : 'Gratuito';

  const freePlan = activePlans.find(p => p.interval === 'free');
  const paidPlans = activePlans.filter(p => p.interval !== 'free');

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <PageHeader icon={CreditCard} title="Minha Assinatura" description="Gerencie seu plano e faturamento">
          <Button onClick={checkSubscription} disabled={isLoading} variant="outline" size="sm" className="self-start sm:self-auto">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar Status
          </Button>
        </PageHeader>

        {/* Status Atual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Status da Assinatura
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-base sm:text-lg font-semibold">Plano Atual: {currentPlan}</p>
                  <Badge variant={subscription.subscribed ? 'default' : 'secondary'}>
                    {subscription.subscribed ? 'Ativo' : 'Gratuito'}
                  </Badge>
                  {subscription.cancel_at_period_end && (
                    <Badge variant="destructive" className="gap-1">
                      <XCircle className="h-3 w-3" />
                      Cancelamento Agendado
                    </Badge>
                  )}
                </div>
                {subscription.subscription_end && (
                  <p className="text-sm text-muted-foreground">
                    {subscription.cancel_at_period_end ? 'Acesso até' : 'Renovação'}:{' '}
                    {new Date(subscription.subscription_end).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
              {subscription.subscribed && (
                <Button onClick={openCustomerPortal} disabled={isPortalLoading} size="sm" className="self-start sm:self-auto">
                  <SettingsIcon className="h-4 w-4 mr-2" />
                  {isPortalLoading ? 'Abrindo...' : 'Gerenciar'}
                </Button>
              )}
            </div>

            {/* Pending Downgrade Banner */}
            {subscription.pending_downgrade_to && (
              <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Downgrade agendado</p>
                    <p className="text-sm text-muted-foreground">
                      Seu plano será alterado para <strong>{subscription.pending_downgrade_to}</strong>{' '}
                      em {subscription.pending_downgrade_date
                        ? new Date(subscription.pending_downgrade_date).toLocaleDateString('pt-BR')
                        : 'data pendente'
                      }.
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={cancelDowngrade}
                  disabled={isCancelDowngradeLoading}
                  className="self-start sm:self-auto gap-2"
                >
                  <Undo2 className="h-4 w-4" />
                  {isCancelDowngradeLoading ? 'Cancelando...' : 'Manter Plano Atual'}
                </Button>
              </div>
            )}

            {/* Cancel at period end banner */}
            {subscription.cancel_at_period_end && !subscription.pending_downgrade_to && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Cancelamento agendado</p>
                    <p className="text-sm text-muted-foreground">
                      Seu plano será cancelado ao final do período atual. Você mantém acesso até{' '}
                      {subscription.subscription_end
                        ? new Date(subscription.subscription_end).toLocaleDateString('pt-BR')
                        : 'o fim do período'
                      }.
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={cancelDowngrade}
                  disabled={isCancelDowngradeLoading}
                  className="self-start sm:self-auto gap-2"
                >
                  <Undo2 className="h-4 w-4" />
                  {isCancelDowngradeLoading ? 'Reativando...' : 'Reativar Assinatura'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Planos */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Escolha seu Plano</h2>

          {/* Plano Gratuito */}
          {freePlan && (
            <Card className="border-dashed">
              <CardContent className="py-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center shrink-0">
                      <Crown className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold">{freePlan.name}</p>
                      <p className="text-sm text-muted-foreground">{freePlan.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="text-left sm:text-right">
                      <p className="text-xl sm:text-2xl font-bold">R$ 0</p>
                      <p className="text-xs text-muted-foreground">para sempre</p>
                    </div>
                    <Button variant="outline" disabled size="sm">
                      {!subscription.subscribed ? 'Plano Atual' : 'Plano Básico'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Planos Pagos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {paidPlans.map((plan) => {
              const isCurrentPlan = subscription.current_plan_slug === plan.slug;
              return (
                <Card key={plan.id} className={`relative flex flex-col ${plan.popular ? 'ring-2 ring-primary shadow-lg' : ''} ${isCurrentPlan ? 'ring-2 ring-success' : ''}`}>
                  {plan.popular && !isCurrentPlan && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <Badge className="bg-primary text-primary-foreground">
                        <Star className="h-3 w-3 mr-1" />
                        Mais Popular
                      </Badge>
                    </div>
                  )}
                  {isCurrentPlan && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <Badge className="bg-success text-white">
                        <Check className="h-3 w-3 mr-1" />
                        Seu Plano
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-2">
                    <div className="w-14 h-14 bg-gradient-primary rounded-full mx-auto mb-3 flex items-center justify-center">
                      <Crown className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <div className="space-y-1">
                      <p className="text-3xl font-bold">{formatPrice(plan.price_cents)}</p>
                      <p className="text-sm text-muted-foreground">{plan.interval_label}</p>
                    </div>
                    {plan.savings_percent && (
                      <Badge variant="secondary" className="mt-1 mx-auto">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        {plan.savings_percent}% de economia
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
                    <div className="space-y-2">
                      <Separator className="mb-4" />
                      <Button
                        className="w-full"
                        variant={isCurrentPlan ? 'outline' : plan.popular ? 'default' : 'outline'}
                        disabled={isCheckoutLoading || isCurrentPlan}
                        onClick={() => createCheckout(plan.slug)}
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        {isCurrentPlan ? 'Plano Atual' : isCheckoutLoading ? 'Aguarde...' : 'Cartão de Crédito'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
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
