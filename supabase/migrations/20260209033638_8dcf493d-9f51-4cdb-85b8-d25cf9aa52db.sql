
-- =============================================
-- FIX: coupons — remover política UPDATE permissiva
-- =============================================
-- A política "Authenticated users can increment clicks" permite qualquer
-- usuário autenticado fazer UPDATE em QUALQUER coluna de qualquer cupom.
-- A função increment_coupon_click() é SECURITY DEFINER e já faz o
-- incremento sem depender dessa política. Removê-la fecha essa brecha.

DROP POLICY IF EXISTS "Authenticated users can increment clicks" ON public.coupons;
