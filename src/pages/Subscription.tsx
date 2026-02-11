import { useEffect, useMemo, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Crown,
  Check,
  RefreshCw,
  Settings as SettingsIcon,
  Star,
  TrendingDown,
  TrendingUp as TrendingUpIcon,
  AlertTriangle,
  XCircle,
  Undo2,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  X,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { usePlans, formatPrice, formatMonthlyEquivalent, SubscriptionPlan } from '@/hooks/usePlans';
import { useSubscription } from '@/hooks/useSubscription';
import { PageHeader } from '@/components/shared/PageHeader';
import { PaymentMethodModal } from '@/components/subscription/PaymentMethodModal';
import { PlanChangeConfirmModal } from '@/components/subscription/PlanChangeConfirmModal';

export default function Subscription() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { activePlans } = usePlans();
  const {
    subscription,
    isLoading,
    isCheckoutLoading,
    isPixCheckoutLoading,
    isPortalLoading,
    isCancelDowngradeLoading,
    stripeClientSecret,
    pixQrData,
    checkSubscription,
    createEmbeddedCheckout,
    createPixQrCode,
    openCustomerPortal,
    cancelDowngrade,
    resetEmbeddedState,
  } = useSubscription();
  const [searchParams, setSearchParams] = useSearchParams();
  const [stripeResult, setStripeResult] = useState<'success' | 'cancelled' | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPlanSlug, setSelectedPlanSlug] = useState<string | null>(null);
  const [planChangeModalOpen, setPlanChangeModalOpen] = useState(false);
  const [planChangeIsUpgrade, setPlanChangeIsUpgrade] = useState(false);

  // Handle checkout success/cancel
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setStripeResult('success');
      checkSubscription();
      // Clean URL params
      setSearchParams({}, { replace: true });
    } else if (searchParams.get('cancelled') === 'true') {
      setStripeResult('cancelled');
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams, checkSubscription]);

  const currentPlan = subscription.subscribed
    ? subscription.subscription_tier
    : 'Gratuito';

  const handleSelectStripe = useCallback(() => {
    if (selectedPlanSlug) {
      createEmbeddedCheckout(selectedPlanSlug);
    }
  }, [selectedPlanSlug, createEmbeddedCheckout]);

  const handleSelectPix = useCallback(() => {
    if (selectedPlanSlug) {
      createPixQrCode(selectedPlanSlug);
    }
  }, [selectedPlanSlug, createPixQrCode]);

  const handleStripeComplete = useCallback(() => {
    setPaymentModalOpen(false);
    resetEmbeddedState();
    toast({ title: 'Assinatura realizada com sucesso! 🎉' });
    checkSubscription();
  }, [resetEmbeddedState, toast, checkSubscription]);

  const handlePixPaid = useCallback(() => {
    setPaymentModalOpen(false);
    resetEmbeddedState();
    toast({ title: 'Pagamento PIX confirmado! 🎉' });
    checkSubscription();
  }, [resetEmbeddedState, toast, checkSubscription]);

  const handleModalClose = useCallback((open: boolean) => {
    setPaymentModalOpen(open);
    if (!open) resetEmbeddedState();
  }, [resetEmbeddedState]);

  const selectedPlanName = useMemo(() => {
    if (!selectedPlanSlug) return '';
    const plan = activePlans.find(p => p.slug === selectedPlanSlug);
    return plan?.name ?? selectedPlanSlug;
  }, [selectedPlanSlug, activePlans]);

  const freePlan = activePlans.find(p => p.interval === 'free');
  const paidPlans = activePlans.filter(p => p.interval !== 'free');

  // Build a sort-order map for plan comparison (lower = cheaper)
  const planSortMap = useMemo(() => {
    const map: Record<string, number> = {};
    activePlans.forEach(p => { map[p.slug] = p.sort_order; });
    return map;
  }, [activePlans]);

  const currentPlanSort = subscription.current_plan_slug ? (planSortMap[subscription.current_plan_slug] ?? -1) : -1;

  const handlePlanClick = useCallback((planSlug: string) => {
    setSelectedPlanSlug(planSlug);

    if (subscription.subscribed && subscription.current_plan_slug && subscription.current_plan_slug !== planSlug) {
      const thisPlanSort = planSortMap[planSlug] ?? 0;
      setPlanChangeIsUpgrade(thisPlanSort > currentPlanSort);
      setPlanChangeModalOpen(true);
    } else {
      setPaymentModalOpen(true);
    }
  }, [subscription.subscribed, subscription.current_plan_slug, planSortMap, currentPlanSort]);

  const handlePlanChangeConfirmed = useCallback(() => {
    setPlanChangeModalOpen(false);
    toast({ title: planChangeIsUpgrade ? 'Upgrade realizado com sucesso! 🎉' : 'Downgrade agendado com sucesso!' });
    checkSubscription();
  }, [planChangeIsUpgrade, toast, checkSubscription]);

  const getButtonProps = (plan: typeof paidPlans[0]) => {
    const isCurrentPlan = subscription.current_plan_slug === plan.slug;
    if (isCurrentPlan) return { label: 'Plano Atual', icon: Check, disabled: true, variant: 'outline' as const };

    if (!subscription.subscribed) {
      return { label: 'Assinar', icon: Crown, disabled: false, variant: plan.popular ? 'default' as const : 'outline' as const };
    }

    const thisPlanSort = planSortMap[plan.slug] ?? 0;
    if (thisPlanSort > currentPlanSort) {
      return { label: 'Upgrade', icon: ArrowUp, disabled: false, variant: 'default' as const };
    }
    return { label: 'Downgrade', icon: ArrowDown, disabled: false, variant: 'outline' as const };
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <PageHeader icon={Crown} title="Minha Assinatura" description="Gerencie seu plano e faturamento">
          <Button onClick={checkSubscription} disabled={isLoading} variant="outline" size="sm" className="self-start sm:self-auto">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar Status
          </Button>
        </PageHeader>

        {/* Stripe return feedback */}
        {stripeResult === 'success' && (
          <Alert className="border-success/50 bg-success/10">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <AlertTitle className="text-success font-semibold">Assinatura realizada com sucesso! 🎉</AlertTitle>
            <AlertDescription className="text-muted-foreground">
              Seu plano foi ativado. Pode levar alguns segundos para refletir aqui — clique em "Atualizar Status" se necessário.
            </AlertDescription>
            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => setStripeResult(null)}>
              <X className="h-4 w-4" />
            </Button>
          </Alert>
        )}
        {stripeResult === 'cancelled' && (
          <Alert className="border-warning/50 bg-warning/10">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <AlertTitle className="text-warning font-semibold">Checkout cancelado</AlertTitle>
            <AlertDescription className="text-muted-foreground">
              Você cancelou o processo de pagamento. Nenhuma cobrança foi realizada. Você pode tentar novamente quando quiser.
            </AlertDescription>
            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => setStripeResult(null)}>
              <X className="h-4 w-4" />
            </Button>
          </Alert>
        )}

        {/* Status Atual */}
        {isLoading ? (
          <Card>
            <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-5 w-64" />
              <Skeleton className="h-4 w-40" />
            </CardContent>
          </Card>
        ) : (
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
                      Seu plano será alterado para <strong>{activePlans.find(p => p.slug === subscription.pending_downgrade_to)?.name ?? subscription.pending_downgrade_to}</strong>{' '}
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
        )}

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
                      {(() => {
                        const bp = getButtonProps(plan);
                        const Icon = bp.icon;
                        return (
                          <Button
                            className="w-full"
                            variant={bp.variant}
                            disabled={(isCheckoutLoading || isPixCheckoutLoading) || bp.disabled}
                            onClick={() => handlePlanClick(plan.slug)}
                          >
                            <Icon className="h-4 w-4 mr-2" />
                            {(isCheckoutLoading || isPixCheckoutLoading) && !bp.disabled ? 'Aguarde...' : bp.label}
                          </Button>
                        );
                      })()}
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

        <PaymentMethodModal
          open={paymentModalOpen}
          onOpenChange={handleModalClose}
          planName={selectedPlanName}
          onSelectStripe={handleSelectStripe}
          onSelectPix={handleSelectPix}
          isStripeLoading={isCheckoutLoading}
          isPixLoading={isPixCheckoutLoading}
          stripeClientSecret={stripeClientSecret}
          pixQrData={pixQrData}
          onStripeComplete={handleStripeComplete}
          onPixPaid={handlePixPaid}
        />

        {selectedPlanSlug && (
          <PlanChangeConfirmModal
            open={planChangeModalOpen}
            onOpenChange={setPlanChangeModalOpen}
            currentPlanName={subscription.subscription_tier || 'Atual'}
            newPlanSlug={selectedPlanSlug}
            newPlanName={selectedPlanName}
            isUpgrade={planChangeIsUpgrade}
            onConfirmed={handlePlanChangeConfirmed}
          />
        )}
    </Layout>
  );
}
