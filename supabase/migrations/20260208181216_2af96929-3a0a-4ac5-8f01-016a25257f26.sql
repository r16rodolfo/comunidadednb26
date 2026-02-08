
-- Create plans table
CREATE TABLE public.plans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  price_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'BRL',
  interval text NOT NULL CHECK (interval IN ('free', 'monthly', 'quarterly', 'semiannual', 'yearly')),
  interval_label text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  features text[] NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  popular boolean NOT NULL DEFAULT false,
  savings_percent integer,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Everyone can read active plans (public catalog)
CREATE POLICY "Anyone can view active plans"
  ON public.plans FOR SELECT
  USING (is_active = true);

-- Admins can view all plans (including inactive)
CREATE POLICY "Admins can view all plans"
  ON public.plans FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Admins can insert plans
CREATE POLICY "Admins can insert plans"
  ON public.plans FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Admins can update plans
CREATE POLICY "Admins can update plans"
  ON public.plans FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

-- Admins can delete plans
CREATE POLICY "Admins can delete plans"
  ON public.plans FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_plans_updated_at
  BEFORE UPDATE ON public.plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default plans
INSERT INTO public.plans (name, slug, price_cents, currency, interval, interval_label, description, features, is_active, popular, savings_percent, sort_order)
VALUES
  ('Gratuito', 'free', 0, 'BRL', 'free', '', 'Para começar sua jornada', ARRAY['10 transações no planner', 'Acesso limitado à academy', 'Cupons públicos', 'Suporte por email'], true, false, NULL, 0),
  ('Mensal', 'premium-monthly', 3000, 'BRL', 'monthly', '/mês', 'Acesso completo sem compromisso', ARRAY['Transações ilimitadas', 'Acesso completo à academy', 'Cupons exclusivos', 'Análise DNB', 'Relatórios avançados', 'Suporte prioritário'], true, false, NULL, 1),
  ('Trimestral', 'premium-quarterly', 6000, 'BRL', 'quarterly', '/trimestre', 'Economize com o plano trimestral', ARRAY['Transações ilimitadas', 'Acesso completo à academy', 'Cupons exclusivos', 'Análise DNB', 'Relatórios avançados', 'Suporte prioritário'], true, true, 33, 2),
  ('Semestral', 'premium-semiannual', 10500, 'BRL', 'semiannual', '/semestre', 'Economia de longo prazo', ARRAY['Transações ilimitadas', 'Acesso completo à academy', 'Cupons exclusivos', 'Análise DNB', 'Relatórios avançados', 'Suporte prioritário', 'Conteúdo exclusivo antecipado'], true, false, 42, 3),
  ('Anual', 'premium-yearly', 18500, 'BRL', 'yearly', '/ano', 'Melhor custo-benefício', ARRAY['Transações ilimitadas', 'Acesso completo à academy', 'Cupons exclusivos', 'Análise DNB', 'Relatórios avançados', 'Suporte prioritário', 'Conteúdo exclusivo antecipado', 'Bônus exclusivo anual'], true, false, 49, 4);
