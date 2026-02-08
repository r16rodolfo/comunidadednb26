
-- ═══════════════════════════════════════════════════════════════
-- Coupon Categories
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE public.coupon_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.coupon_categories ENABLE ROW LEVEL SECURITY;

-- Anyone can read active categories
CREATE POLICY "Anyone can view active categories"
  ON public.coupon_categories FOR SELECT
  USING (is_active = true);

-- Admin / Gestor full access
CREATE POLICY "Admins can view all categories"
  ON public.coupon_categories FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Gestors can view all categories"
  ON public.coupon_categories FOR SELECT
  USING (has_role(auth.uid(), 'gestor'::app_role));

CREATE POLICY "Admins can insert categories"
  ON public.coupon_categories FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Gestors can insert categories"
  ON public.coupon_categories FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'gestor'::app_role));

CREATE POLICY "Admins can update categories"
  ON public.coupon_categories FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Gestors can update categories"
  ON public.coupon_categories FOR UPDATE
  USING (has_role(auth.uid(), 'gestor'::app_role));

CREATE POLICY "Admins can delete categories"
  ON public.coupon_categories FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Gestors can delete categories"
  ON public.coupon_categories FOR DELETE
  USING (has_role(auth.uid(), 'gestor'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_coupon_categories_updated_at
  BEFORE UPDATE ON public.coupon_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════
-- Coupons
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_name TEXT NOT NULL,
  partner_logo TEXT NOT NULL DEFAULT '',
  category_id UUID REFERENCES public.coupon_categories(id) ON DELETE SET NULL,
  offer_title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  code TEXT NOT NULL,
  destination_url TEXT NOT NULL,
  expiration_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  click_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Anyone can read active coupons
CREATE POLICY "Anyone can view active coupons"
  ON public.coupons FOR SELECT
  USING (is_active = true);

-- Admin / Gestor full access
CREATE POLICY "Admins can view all coupons"
  ON public.coupons FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Gestors can view all coupons"
  ON public.coupons FOR SELECT
  USING (has_role(auth.uid(), 'gestor'::app_role));

CREATE POLICY "Admins can insert coupons"
  ON public.coupons FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Gestors can insert coupons"
  ON public.coupons FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'gestor'::app_role));

CREATE POLICY "Admins can update coupons"
  ON public.coupons FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Gestors can update coupons"
  ON public.coupons FOR UPDATE
  USING (has_role(auth.uid(), 'gestor'::app_role));

CREATE POLICY "Admins can delete coupons"
  ON public.coupons FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Gestors can delete coupons"
  ON public.coupons FOR DELETE
  USING (has_role(auth.uid(), 'gestor'::app_role));

-- Allow any authenticated user to increment click count
CREATE POLICY "Authenticated users can increment clicks"
  ON public.coupons FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Trigger for updated_at
CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for category lookup
CREATE INDEX idx_coupons_category_id ON public.coupons(category_id);
CREATE INDEX idx_coupons_is_active ON public.coupons(is_active);

-- ═══════════════════════════════════════════════════════════════
-- RPC: increment click count (safe for any authenticated user)
-- ═══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.increment_coupon_click(coupon_id UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  UPDATE public.coupons
  SET click_count = click_count + 1
  WHERE id = coupon_id;
$$;

-- ═══════════════════════════════════════════════════════════════
-- Seed: Categories
-- ═══════════════════════════════════════════════════════════════
INSERT INTO public.coupon_categories (name) VALUES
  ('Tecnologia'),
  ('Moda'),
  ('Viagens'),
  ('Alimentação'),
  ('Casa e Jardim'),
  ('Saúde e Beleza');

-- ═══════════════════════════════════════════════════════════════
-- Seed: Coupons
-- ═══════════════════════════════════════════════════════════════
INSERT INTO public.coupons (partner_name, partner_logo, category_id, offer_title, description, code, destination_url, expiration_date, is_active, click_count)
VALUES
  ('Amazon',
   'https://images.unsplash.com/photo-1557821552-17105176677c?w=100&h=100&fit=crop&crop=center',
   (SELECT id FROM public.coupon_categories WHERE name = 'Tecnologia'),
   '10% de desconto em eletrônicos',
   'Válido para compras acima de R$ 200. Não cumulativo com outras promoções. Válido apenas na primeira compra.',
   'TECH10',
   'https://amazon.com.br',
   '2026-12-31',
   true, 245),
  ('Nike',
   'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop&crop=center',
   (SELECT id FROM public.coupon_categories WHERE name = 'Moda'),
   'R$ 50 OFF em compras acima de R$ 300',
   'Desconto aplicável em toda linha de tênis e roupas esportivas. Válido até o final do mês.',
   'NIKE50',
   'https://nike.com.br',
   '2026-10-31',
   true, 189),
  ('Booking.com',
   'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=100&h=100&fit=crop&crop=center',
   (SELECT id FROM public.coupon_categories WHERE name = 'Viagens'),
   '15% de desconto em hotéis',
   'Válido para reservas de hotéis nacionais e internacionais. Mínimo de 2 diárias.',
   'HOTEL15',
   'https://booking.com',
   '2026-11-30',
   true, 123),
  ('iFood',
   'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=100&h=100&fit=crop&crop=center',
   (SELECT id FROM public.coupon_categories WHERE name = 'Alimentação'),
   'Frete grátis + 20% OFF',
   'Aplicável em pedidos acima de R$ 35. Válido para novos usuários.',
   'FOOD20',
   'https://ifood.com.br',
   NULL,
   false, 67);
