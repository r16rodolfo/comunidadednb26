import { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface PixQrCodeCheckoutProps {
  brCode: string;
  qrCodeBase64?: string;
  expiresAt?: string;
  onPaid?: () => void;
  planName: string;
}

export function PixQrCodeCheckout({
  brCode,
  qrCodeBase64,
  expiresAt,
  onPaid,
  planName,
}: PixQrCodeCheckoutProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');

  // Countdown timer
  useEffect(() => {
    if (!expiresAt) return;
    const update = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft('Expirado');
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${mins}:${secs.toString().padStart(2, '0')}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(brCode);
      setCopied(true);
      toast({ title: 'Código copiado!' });
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast({ title: 'Erro ao copiar', variant: 'destructive' });
    }
  }, [brCode, toast]);

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <p className="text-sm text-muted-foreground text-center">
        Escaneie o QR Code ou copie o código para pagar <strong>{planName}</strong>
      </p>

      {/* QR Code Image */}
      {qrCodeBase64 ? (
        <div className="bg-white p-4 rounded-lg">
          <img
            src={qrCodeBase64.startsWith('data:') ? qrCodeBase64 : `data:image/png;base64,${qrCodeBase64}`}
            alt="QR Code PIX"
            className="w-48 h-48"
          />
        </div>
      ) : (
        <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Timer */}
      {expiresAt && timeLeft && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{timeLeft === 'Expirado' ? 'QR Code expirado' : `Expira em ${timeLeft}`}</span>
        </div>
      )}

      {/* Copy code */}
      <div className="w-full space-y-2">
        <p className="text-xs text-muted-foreground text-center">Código copia e cola:</p>
        <div className="flex gap-2">
          <input
            readOnly
            value={brCode}
            className="flex-1 text-xs bg-muted rounded-md px-3 py-2 font-mono truncate border border-border"
          />
          <Button variant="outline" size="sm" onClick={handleCopy} className="shrink-0">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Após o pagamento, sua assinatura será ativada automaticamente.
      </p>
    </div>
  );
}
