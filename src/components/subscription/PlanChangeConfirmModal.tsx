import { useState, useEffect, useCallback, useRef } from 'react';
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
import { ArrowUp, ArrowDown, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/hooks/usePlans';
import { PixQrCodeCheckout } from '@/components/subscription/PixQrCodeCheckout';

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
  const [step, setStep] = useState<'preview' | 'pix-payment'>('preview');

  useEffect(() => {
    if (!open || !newPlanSlug) return;
    setPreview(null);
    setError(null);
    setPixUpgradeData(null);
    setStep('preview');

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

  const handleConfirm = async () => {
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

      // If PIX upgrade, show QR code step
      if (data?.paymentMethod === 'pix' && data?.pixData) {
        setPixUpgradeData(data.pixData);
        setStep('pix-payment');
        return;
      }

      onConfirmed();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro desconhecido');
    } finally {
      setIsConfirming(false);
    }
  };

  const handlePixPaid = useCallback(() => {
    // After PIX is confirmed, update the subscriber DB via check-pix-status polling
    // The billing-check or manual process will activate the new plan
    onConfirmed();
  }, [onConfirmed]);

  const isPix = preview?.paymentMethod === 'pix';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isUpgrade ? (
              <ArrowUp className="h-5 w-5 text-primary" />
            ) : (
              <ArrowDown className="h-5 w-5 text-warning" />
            )}
            {step === 'pix-payment'
              ? 'Pagar Upgrade via PIX'
              : isUpgrade ? 'Upgrade de Plano' : 'Downgrade de Plano'}
          </DialogTitle>
          <DialogDescription>
            {step === 'pix-payment'
              ? 'Escaneie o QR Code para concluir o upgrade.'
              : isUpgrade
                ? 'Você receberá acesso imediato ao novo plano.'
                : 'A mudança será aplicada ao final do período atual.'}
          </DialogDescription>
        </DialogHeader>

        {step === 'pix-payment' && pixUpgradeData ? (
          <PixQrCodeCheckout
            brCode={pixUpgradeData.brCode}
            qrCodeBase64={pixUpgradeData.qrCodeBase64}
            expiresAt={pixUpgradeData.expiresAt}
            pixId={pixUpgradeData.id}
            planName={newPlanName}
            onPaid={handlePixPaid}
          />
        ) : (
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
                    {isPix && preview.daysRemaining !== undefined && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Dias restantes no plano atual</span>
                        <span>{preview.daysRemaining} dias</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {isPix ? 'Valor do novo plano' : 'Valor proporcional do novo plano'}
                      </span>
                      <span>{formatPrice(isPix ? (preview.newPlanPrice || preview.total) : (preview.total + preview.credit))}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total a pagar agora</span>
                      <span className="text-primary">{formatPrice(preview.amountDue)}</span>
                    </div>
                    {isPix && (
                      <p className="text-xs text-muted-foreground">
                        O pagamento será via PIX. Um QR Code será gerado na próxima etapa.
                      </p>
                    )}
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
                onClick={handleConfirm}
                disabled={isConfirming || (isUpgrade && isLoadingPreview)}
              >
                {isConfirming ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  `Confirmar ${isUpgrade ? 'Upgrade' : 'Downgrade'}`
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
