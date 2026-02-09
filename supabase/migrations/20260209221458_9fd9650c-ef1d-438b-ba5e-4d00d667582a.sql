
-- Table to track NoxPay PIX payments
CREATE TABLE public.nox_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_slug TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  txid TEXT UNIQUE,
  code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'WAITING_PAYMENT',
  qr_code TEXT,
  qr_code_text TEXT,
  noxpay_id BIGINT,
  receipt_name TEXT,
  receipt_cpf_cnpj TEXT,
  pix_end2end_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.nox_payments ENABLE ROW LEVEL SECURITY;

-- Users can view their own payments
CREATE POLICY "Users can view own nox_payments"
  ON public.nox_payments FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own payments
CREATE POLICY "Users can create own nox_payments"
  ON public.nox_payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Service role can update (for webhook)
CREATE POLICY "Service role can update nox_payments"
  ON public.nox_payments FOR UPDATE
  USING (true);

-- Timestamp trigger
CREATE TRIGGER update_nox_payments_updated_at
  BEFORE UPDATE ON public.nox_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for txid lookups (webhook)
CREATE INDEX idx_nox_payments_txid ON public.nox_payments(txid);
CREATE INDEX idx_nox_payments_user_status ON public.nox_payments(user_id, status);
