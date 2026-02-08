
-- ═══════════════════════════════════════════════
-- 1. HOME_CONFIG — singleton admin settings
-- ═══════════════════════════════════════════════
CREATE TABLE public.home_config (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  welcome_card jsonb NOT NULL DEFAULT '{}',
  banners jsonb NOT NULL DEFAULT '[]',
  step_cards jsonb NOT NULL DEFAULT '[]',
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.home_config ENABLE ROW LEVEL SECURITY;

-- Anyone (authenticated or not) can read the home config
CREATE POLICY "Anyone can read home config"
  ON public.home_config FOR SELECT
  USING (true);

-- Only admins can update
CREATE POLICY "Admins can update home config"
  ON public.home_config FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

-- Only admins can insert (for initial seed)
CREATE POLICY "Admins can insert home config"
  ON public.home_config FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_home_config_updated_at
  BEFORE UPDATE ON public.home_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default row
INSERT INTO public.home_config (welcome_card, banners, step_cards)
VALUES (
  '{"icon":"Plane","title":"Bem-vinda à Comunidade DNB!","subtitle":"Sua jornada financeira para viagens internacionais começa aqui","body":"Transforme seus sonhos de viagem em realidade com planejamento inteligente. Nossa plataforma oferece todas as ferramentas necessárias para otimizar suas compras de câmbio e garantir que você aproveite cada centavo da sua viagem.","ctaLabel":"Começar Planejamento","ctaUrl":"/planner"}'::jsonb,
  '[]'::jsonb,
  '[{"id":"step-1","number":"1","title":"Defina suas Metas","description":"Estabeleça objetivos claros para suas viagens e compras de câmbio"},{"id":"step-2","number":"2","title":"Acompanhe o Mercado","description":"Monitore cotações e tome decisões inteligentes no momento certo"},{"id":"step-3","number":"3","title":"Execute com Confiança","description":"Realize suas compras com base em análises e planejamento sólido"}]'::jsonb
);

-- ═══════════════════════════════════════════════
-- 2. TRIP_GOALS — per-user planning goal
-- ═══════════════════════════════════════════════
CREATE TABLE public.trip_goals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  target_amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  trip_date date NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.trip_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goals"
  ON public.trip_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own goals"
  ON public.trip_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON public.trip_goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON public.trip_goals FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can view all goals (for admin planner dashboard)
CREATE POLICY "Admins can view all goals"
  ON public.trip_goals FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_trip_goals_updated_at
  BEFORE UPDATE ON public.trip_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ═══════════════════════════════════════════════
-- 3. PLANNER_TRANSACTIONS — per-user currency purchases
-- ═══════════════════════════════════════════════
CREATE TABLE public.planner_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  goal_id uuid REFERENCES public.trip_goals(id) ON DELETE CASCADE,
  date date NOT NULL,
  location text NOT NULL DEFAULT '',
  amount numeric NOT NULL,
  rate numeric NOT NULL,
  total_paid numeric NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.planner_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON public.planner_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions"
  ON public.planner_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON public.planner_transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON public.planner_transactions FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can view all transactions (for admin planner dashboard)
CREATE POLICY "Admins can view all transactions"
  ON public.planner_transactions FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Index for fast per-user queries
CREATE INDEX idx_planner_transactions_user ON public.planner_transactions(user_id);
CREATE INDEX idx_planner_transactions_goal ON public.planner_transactions(goal_id);
CREATE INDEX idx_trip_goals_user ON public.trip_goals(user_id);
