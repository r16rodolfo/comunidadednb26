import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowUp, ArrowDown, AlertTriangle, Loader2, CreditCard, QrCode } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/hooks/usePlans';
import { PixQrCodeCheckout } from '@/components/subscription/PixQrCodeCheckout';
import { StripeEmbeddedCheckout } from '@/components/subscription/StripeEmbeddedCheckout';

export interface PlanChangePreview {
  amountDue: number;
  credit: number;
  total: number;
  currency: string;
  newPlanName: string;
  newPlanSlug: string;
  effectiveDate: string;
  paymentMethod?: 'stripe' | 'pix';
  daysRemaining?: number;
  currentPlanPrice?: number;
  newPlanPrice?: number;
}

interface PixUpgradeData {
  id: string;
  brCode: string;
  qrCodeBase64: string;
  expiresAt: string;
}

interface PlanChangeConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlanName: string;
  newPlanSlug: string;
  newPlanName: string;
  isUpgrade: boolean;
  onConfirmed: () => void;
}

type Step = 'preview' | 'payment-method' | 'stripe-checkout' | 'pix-payment';

export function PlanChangeConfirmModal({
  open,
  onOpenChange,
  currentPlanName,
  newPlanSlug,
  newPlanName,
  isUpgrade,
  onConfirmed,
}: PlanChangeConfirmModalProps) {
  const [preview, setPreview] = useState<PlanChangePreview | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pixUpgradeData, setPixUpgradeData] = useState<PixUpgradeData | null>(null);
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [step, setStep] = useState<Step>('preview');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'stripe' | 'pix'>('stripe');

  useEffect(() => {
    if (!open || !newPlanSlug) return;
    setPreview(null);
    setError(null);
    setPixUpgradeData(null);
    setStripeClientSecret(null);
    setStep('preview');
    setSelectedPaymentMethod('stripe');

    if (isUpgrade) {
      setIsLoadingPreview(true);
      supabase.functions
        .invoke('preview-plan-change', { body: { newPlanSlug } })
        .then(({ data, error: fnError }) => {
          if (fnError || data?.error) {
            setError(data?.error || fnError?.message || 'Erro ao carregar preview');
          } else {
            setPreview(data);
          }
        })
        .finally(() => setIsLoadingPreview(false));
    }
  }, [open, newPlanSlug, isUpgrade]);

  const handleConfirmUpgrade = async () => {
    // For upgrades, go to payment method selection
    setStep('payment-method');
  };

  const handleConfirmDowngrade = async () => {
    setIsConfirming(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('change-plan', {
        body: { newPlanSlug },
      });
      if (fnError || data?.error) {
        setError(data?.error || fnError?.message || 'Erro ao alterar plano');
        return;
      }
      onConfirmed();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro desconhecido');
    } finally {
      setIsConfirming(false);
    }
  };

  const handlePaymentMethodConfirm = async () => {
    setIsConfirming(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('change-plan', {
        body: { newPlanSlug, paymentMethod: selectedPaymentMethod },
      });
      if (fnError || data?.error) {
        setError(data?.error || fnError?.message || 'Erro ao processar upgrade');
        setIsConfirming(false);
        return;
      }

      if (data?.paymentMethod === 'stripe' && data?.clientSecret) {
        setStripeClientSecret(data.clientSecret);
        setStep('stripe-checkout');
      } else if (data?.paymentMethod === 'pix' && data?.pixData) {
        setPixUpgradeData(data.pixData);
        setStep('pix-payment');
      } else {
        // Direct upgrade completed (shouldn't happen with new flow, but fallback)
        onConfirmed();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro desconhecido');
    } finally {
      setIsConfirming(false);
    }
  };

  const handlePixPaid = useCallback(() => {
    onConfirmed();
  }, [onConfirmed]);

  const handleStripeComplete = useCallback(() => {
    onConfirmed();
  }, [onConfirmed]);

  const getDialogTitle = () => {
    switch (step) {
      case 'payment-method': return 'Escolha a Forma de Pagamento';
      case 'stripe-checkout': return 'Pagamento via Cartão';
      case 'pix-payment': return 'Pagamento via PIX';
      default: return isUpgrade ? 'Upgrade de Plano' : 'Downgrade de Plano';
    }
  };

  const getDialogDescription = () => {
    switch (step) {
      case 'payment-method': return 'Selecione como deseja pagar o upgrade.';
      case 'stripe-checkout': return 'Complete o pagamento com cartão de crédito.';
      case 'pix-payment': return 'Escaneie o QR Code para concluir o upgrade.';
      default: return isUpgrade
        ? 'Você receberá acesso imediato ao novo plano.'
        : 'A mudança será aplicada ao final do período atual.';
    }
  };

  const maxWidth = step === 'stripe-checkout' ? 'sm:max-w-2xl' : 'sm:max-w-md';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={maxWidth}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isUpgrade ? (
              <ArrowUp className="h-5 w-5 text-primary" />
            ) : (
              <ArrowDown className="h-5 w-5 text-warning" />
            )}
            {getDialogTitle()}
          </DialogTitle>
          <DialogDescription>{getDialogDescription()}</DialogDescription>
        </DialogHeader>

        {/* Step: Stripe Checkout */}
        {step === 'stripe-checkout' && stripeClientSecret && (
          <StripeEmbeddedCheckout
            clientSecret={stripeClientSecret}
            onComplete={handleStripeComplete}
          />
        )}

        {/* Step: PIX Payment */}
        {step === 'pix-payment' && pixUpgradeData && (
          <PixQrCodeCheckout
            brCode={pixUpgradeData.brCode}
            qrCodeBase64={pixUpgradeData.qrCodeBase64}
            expiresAt={pixUpgradeData.expiresAt}
            pixId={pixUpgradeData.id}
            planName={newPlanName}
            onPaid={handlePixPaid}
          />
        )}

        {/* Step: Payment Method Selection */}
        {step === 'payment-method' && (
          <div className="space-y-4">
            <RadioGroup
              value={selectedPaymentMethod}
              onValueChange={(v) => setSelectedPaymentMethod(v as 'stripe' | 'pix')}
              className="gap-3"
            >
              <div className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${selectedPaymentMethod === 'stripe' ? 'border-primary bg-primary/5' : 'border-border'}`}
                onClick={() => setSelectedPaymentMethod('stripe')}
              >
                <RadioGroupItem value="stripe" id="pm-stripe" />
                <Label htmlFor="pm-stripe" className="flex items-center gap-3 cursor-pointer flex-1">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Cartão de Crédito</p>
                    <p className="text-xs text-muted-foreground">Pagamento seguro via Stripe</p>
                  </div>
                </Label>
              </div>
              <div className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${selectedPaymentMethod === 'pix' ? 'border-primary bg-primary/5' : 'border-border'}`}
                onClick={() => setSelectedPaymentMethod('pix')}
              >
                <RadioGroupItem value="pix" id="pm-pix" />
                <Label htmlFor="pm-pix" className="flex items-center gap-3 cursor-pointer flex-1">
                  <QrCode className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">PIX</p>
                    <p className="text-xs text-muted-foreground">Pagamento instantâneo via QR Code</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>

            {preview && (
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex justify-between font-semibold text-sm">
                  <span>Total a pagar</span>
                  <span className="text-primary">{formatPrice(preview.amountDue)}</span>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep('preview')} disabled={isConfirming}>
                Voltar
              </Button>
              <Button className="flex-1" onClick={handlePaymentMethodConfirm} disabled={isConfirming}>
                {isConfirming ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processando...</>
                ) : (
                  'Continuar'
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step: Preview */}
        {step === 'preview' && (
          <div className="space-y-4">
            {/* Plan comparison */}
            <div className="flex items-center justify-between gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="text-center flex-1">
                <p className="text-xs text-muted-foreground">Plano Atual</p>
                <p className="font-semibold text-sm">{currentPlanName}</p>
              </div>
              <div className="shrink-0">
                {isUpgrade ? (
                  <ArrowUp className="h-5 w-5 text-primary" />
                ) : (
                  <ArrowDown className="h-5 w-5 text-warning" />
                )}
              </div>
              <div className="text-center flex-1">
                <p className="text-xs text-muted-foreground">Novo Plano</p>
                <p className="font-semibold text-sm">{newPlanName}</p>
              </div>
            </div>

            <Separator />

            {/* Upgrade: proration details */}
            {isUpgrade && (
              <div className="space-y-3">
                {isLoadingPreview ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-6 w-40" />
                  </div>
                ) : preview ? (
                  <>
                    {preview.credit > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Crédito do plano atual</span>
                        <span className="text-success font-medium">
                          - {formatPrice(preview.credit)}
                        </span>
                      </div>
                    )}
                    {preview.daysRemaining !== undefined && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Dias restantes no plano atual</span>
                        <span>{preview.daysRemaining} dias</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Valor do novo plano</span>
                      <span>{formatPrice(preview.newPlanPrice || preview.total)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total a pagar agora</span>
                      <span className="text-primary">{formatPrice(preview.amountDue)}</span>
                    </div>
                  </>
                ) : null}
              </div>
            )}

            {/* Downgrade: info */}
            {!isUpgrade && (
              <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 flex gap-3">
                <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Mudança agendada</p>
                  <p className="text-muted-foreground">
                    Você manterá acesso ao plano atual até o final do período de cobrança.
                    Após isso, seu plano será alterado para <strong>{newPlanName}</strong>.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
                disabled={isConfirming}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={isUpgrade ? handleConfirmUpgrade : handleConfirmDowngrade}
                disabled={isConfirming || (isUpgrade && isLoadingPreview)}
              >
                {isConfirming ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processando...</>
                ) : isUpgrade ? (
                  'Escolher Pagamento'
                ) : (
                  'Confirmar Downgrade'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
