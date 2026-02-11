import { useState } from 'react';
import { CreditCard, QrCode, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface PaymentMethodModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planName: string;
  onSelectStripe: () => void;
  onSelectPix: () => void;
  isStripeLoading: boolean;
  isPixLoading: boolean;
}

export function PaymentMethodModal({
  open,
  onOpenChange,
  planName,
  onSelectStripe,
  onSelectPix,
  isStripeLoading,
  isPixLoading,
}: PaymentMethodModalProps) {
  const isAnyLoading = isStripeLoading || isPixLoading;

  return (
    <Dialog open={open} onOpenChange={isAnyLoading ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Como deseja pagar?</DialogTitle>
          <DialogDescription>
            Escolha a forma de pagamento para o plano <strong>{planName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 mt-2">
          {/* Cartão de Crédito - Stripe */}
          <button
            onClick={onSelectStripe}
            disabled={isAnyLoading}
            className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              {isStripeLoading ? (
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
              ) : (
                <CreditCard className="h-6 w-6 text-primary" />
              )}
            </div>
            <div>
              <p className="font-semibold text-sm">Cartão de Crédito</p>
              <p className="text-xs text-muted-foreground">
                Visa, Mastercard, Amex e outros
              </p>
            </div>
          </button>

          {/* PIX - AbacatePay */}
          <button
            onClick={onSelectPix}
            disabled={isAnyLoading}
            className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center shrink-0">
              {isPixLoading ? (
                <Loader2 className="h-6 w-6 text-success animate-spin" />
              ) : (
                <QrCode className="h-6 w-6 text-success" />
              )}
            </div>
            <div>
              <p className="font-semibold text-sm">PIX</p>
              <p className="text-xs text-muted-foreground">
                Pagamento instantâneo via QR Code
              </p>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
