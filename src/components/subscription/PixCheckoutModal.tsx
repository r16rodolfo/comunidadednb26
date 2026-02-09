import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Copy, Check, QrCode, Loader2, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

interface PixCheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planSlug: string;
  planName: string;
  amountCents: number;
  onSuccess: () => void;
}

type PixState = 'loading' | 'waiting' | 'paid' | 'error' | 'cancelled';

export function PixCheckoutModal({
  open,
  onOpenChange,
  planSlug,
  planName,
  amountCents,
  onSuccess,
}: PixCheckoutModalProps) {
  const { toast } = useToast();
  const [state, setState] = useState<PixState>('loading');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrCodeText, setQrCodeText] = useState<string | null>(null);
  const [txid, setTxid] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const amount = amountCents / 100;

  const createPixPayment = useCallback(async () => {
    setState('loading');
    try {
      const { data, error } = await supabase.functions.invoke('noxpay-create-pix', {
        body: { planSlug, amount },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setQrCode(data.qrCode);
      setQrCodeText(data.qrCodeText);
      setTxid(data.txid);
      setState('waiting');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar pagamento PIX';
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      setState('error');
    }
  }, [planSlug, amount, toast]);

  // Start polling when waiting for payment
  useEffect(() => {
    if (state !== 'waiting' || !txid) return;

    pollingRef.current = setInterval(async () => {
      try {
        const { data, error } = await supabase.functions.invoke('noxpay-check-status', {
          body: { txid },
        });
        if (error) return;

        if (data?.status === 'PAID') {
          setState('paid');
          if (pollingRef.current) clearInterval(pollingRef.current);
          toast({ title: '🎉 Pagamento confirmado!' });
          setTimeout(() => {
            onSuccess();
            onOpenChange(false);
          }, 2000);
        } else if (data?.status === 'CANCELED') {
          setState('cancelled');
          if (pollingRef.current) clearInterval(pollingRef.current);
        }
      } catch {
        // Silent - polling will retry
      }
    }, 5000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [state, txid, onSuccess, onOpenChange, toast]);

  // Create payment when modal opens
  useEffect(() => {
    if (open && planSlug) {
      createPixPayment();
    } else {
      // Reset on close
      setState('loading');
      setQrCode(null);
      setQrCodeText(null);
      setTxid(null);
      setCopied(false);
      if (pollingRef.current) clearInterval(pollingRef.current);
    }
  }, [open, planSlug, createPixPayment]);

  const copyToClipboard = async () => {
    if (!qrCodeText) return;
    await navigator.clipboard.writeText(qrCodeText);
    setCopied(true);
    toast({ title: 'Código copiado!' });
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Pagamento via PIX
          </DialogTitle>
          <DialogDescription>
            {planName} — R$ {amount.toFixed(2).replace('.', ',')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {state === 'loading' && (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Gerando QR Code...</p>
            </div>
          )}

          {state === 'waiting' && (
            <>
              {/* QR Code */}
              {qrCode && (
                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-lg">
                    <img
                      src={`data:image/png;base64,${qrCode}`}
                      alt="QR Code PIX"
                      className="w-48 h-48"
                    />
                  </div>
                </div>
              )}

              {/* Copy and Paste */}
              {qrCodeText && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-center">Ou copie o código PIX:</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={qrCodeText}
                      readOnly
                      className="flex-1 text-xs bg-muted px-3 py-2 rounded-md border truncate"
                    />
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )}

              {/* Status indicator */}
              <div className="flex items-center justify-center gap-2 py-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Aguardando pagamento...</p>
              </div>
            </>
          )}

          {state === 'paid' && (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <CheckCircle2 className="h-12 w-12 text-success" />
              <p className="text-lg font-semibold">Pagamento Confirmado!</p>
              <p className="text-sm text-muted-foreground">Sua assinatura será ativada em instantes.</p>
            </div>
          )}

          {state === 'cancelled' && (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <XCircle className="h-12 w-12 text-destructive" />
              <p className="text-lg font-semibold">Pagamento Expirado</p>
              <p className="text-sm text-muted-foreground">O código PIX expirou. Tente novamente.</p>
              <Button onClick={createPixPayment} variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Gerar Novo QR Code
              </Button>
            </div>
          )}

          {state === 'error' && (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <XCircle className="h-12 w-12 text-destructive" />
              <p className="text-lg font-semibold">Erro ao gerar PIX</p>
              <p className="text-sm text-muted-foreground">Tente novamente ou use outro método de pagamento.</p>
              <Button onClick={createPixPayment} variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Tentar Novamente
              </Button>
            </div>
          )}

          {/* Payment method badge */}
          <div className="flex justify-center">
            <Badge variant="secondary" className="text-xs">
              Processado por NoxPay • Pagamento instantâneo
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
