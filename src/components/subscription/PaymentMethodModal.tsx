import { useState } from 'react';
import { CreditCard, QrCode, Loader2, ArrowLeft } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StripeEmbeddedCheckout } from './StripeEmbeddedCheckout';
import { PixQrCodeCheckout } from './PixQrCodeCheckout';

type Step = 'choose' | 'stripe' | 'pix';

export interface PixQrData {
  id: string;
  brCode: string;
  qrCodeBase64?: string;
  expiresAt?: string;
}

interface PaymentMethodModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planName: string;
  onSelectStripe: () => void;
  onSelectPix: () => void;
  isStripeLoading: boolean;
  isPixLoading: boolean;
  // Embedded checkout props
  stripeClientSecret?: string | null;
  pixQrData?: PixQrData | null;
  onStripeComplete?: () => void;
  onPixPaid?: () => void;
}

export function PaymentMethodModal({
  open,
  onOpenChange,
  planName,
  onSelectStripe,
  onSelectPix,
  isStripeLoading,
  isPixLoading,
  stripeClientSecret,
  pixQrData,
  onStripeComplete,
  onPixPaid,
}: PaymentMethodModalProps) {
  const [step, setStep] = useState<Step>('choose');
  const isAnyLoading = isStripeLoading || isPixLoading;

  // Determine current step based on data
  const currentStep = (() => {
    if (step === 'stripe' && stripeClientSecret) return 'stripe';
    if (step === 'pix' && pixQrData) return 'pix';
    if (step === 'stripe' && isStripeLoading) return 'stripe';
    if (step === 'pix' && isPixLoading) return 'pix';
    return 'choose';
  })();

  const handleClose = (value: boolean) => {
    if (isAnyLoading) return;
    if (!value) setStep('choose');
    onOpenChange(value);
  };

  const handleBack = () => {
    setStep('choose');
  };

  const handleSelectStripe = () => {
    setStep('stripe');
    onSelectStripe();
  };

  const handleSelectPix = () => {
    setStep('pix');
    onSelectPix();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={currentStep === 'stripe' ? 'sm:max-w-2xl max-h-[90vh] overflow-y-auto' : 'sm:max-w-md'}>
        <DialogHeader>
          {currentStep !== 'choose' && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-4 h-8 w-8"
              onClick={handleBack}
              disabled={isAnyLoading}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <DialogTitle>
            {currentStep === 'choose' && 'Como deseja pagar?'}
            {currentStep === 'stripe' && 'Pagamento com Cartão'}
            {currentStep === 'pix' && 'Pagamento via PIX'}
          </DialogTitle>
          <DialogDescription>
            {currentStep === 'choose' && (
              <>Escolha a forma de pagamento para o plano <strong>{planName}</strong>.</>
            )}
            {currentStep === 'stripe' && (
              <>Finalize sua assinatura do plano <strong>{planName}</strong>.</>
            )}
            {currentStep === 'pix' && (
              <>Pague via PIX para ativar o plano <strong>{planName}</strong>.</>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Choose payment method */}
        {currentStep === 'choose' && (
          <div className="grid gap-3 mt-2">
            <button
              onClick={handleSelectStripe}
              disabled={isAnyLoading}
              className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Cartão de Crédito</p>
                <p className="text-xs text-muted-foreground">Visa, Mastercard, Amex e outros</p>
              </div>
            </button>

            <button
              onClick={handleSelectPix}
              disabled={isAnyLoading}
              className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                <QrCode className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="font-semibold text-sm">PIX</p>
                <p className="text-xs text-muted-foreground">Pagamento instantâneo via QR Code</p>
              </div>
            </button>
          </div>
        )}

        {/* Step 2a: Stripe Embedded Checkout */}
        {currentStep === 'stripe' && (
          <div className="mt-2">
            {isStripeLoading && !stripeClientSecret ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-sm text-muted-foreground">Carregando checkout...</span>
              </div>
            ) : stripeClientSecret ? (
              <StripeEmbeddedCheckout
                clientSecret={stripeClientSecret}
                onComplete={onStripeComplete}
              />
            ) : null}
          </div>
        )}

        {/* Step 2b: PIX QR Code */}
        {currentStep === 'pix' && (
          <div className="mt-2">
            {isPixLoading && !pixQrData ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-success" />
                <span className="ml-3 text-sm text-muted-foreground">Gerando QR Code...</span>
              </div>
            ) : pixQrData ? (
              <PixQrCodeCheckout
                brCode={pixQrData.brCode}
                qrCodeBase64={pixQrData.qrCodeBase64}
                expiresAt={pixQrData.expiresAt}
                onPaid={onPixPaid}
                planName={planName}
              />
            ) : null}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
