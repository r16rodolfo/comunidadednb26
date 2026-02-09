
-- =============================================
-- FIX 1: profiles — restringir SELECT para próprio perfil + admin
-- =============================================

-- Remover política pública atual
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Criar política: usuário vê apenas seu próprio perfil
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Criar política: admin vê todos os perfis
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- =============================================
-- FIX 2: subscribers — criar view segura sem campos Stripe
-- =============================================

-- Criar view que oculta stripe_customer_id e stripe_subscription_id
CREATE OR REPLACE VIEW public.subscribers_safe
WITH (security_invoker = on) AS
  SELECT
    id,
    user_id,
    email,
    subscribed,
    subscription_tier,
    subscription_end,
    current_plan_slug,
    previous_plan_slug,
    cancel_at_period_end,
    pending_downgrade_to,
    pending_downgrade_date,
    created_at,
    updated_at
  FROM public.subscribers;

-- =============================================
-- FIX 3: home_config — restringir para autenticados
-- =============================================

-- Remover política pública atual
DROP POLICY IF EXISTS "Anyone can read home config" ON public.home_config;

-- Criar política: somente autenticados podem ler
CREATE POLICY "Authenticated users can read home config"
  ON public.home_config
  FOR SELECT
  USING (auth.uid() IS NOT NULL);
