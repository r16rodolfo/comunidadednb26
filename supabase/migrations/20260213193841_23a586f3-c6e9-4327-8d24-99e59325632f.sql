
-- Fix: Only increment clicks for active coupons
CREATE OR REPLACE FUNCTION public.increment_coupon_click(coupon_id UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  UPDATE public.coupons
  SET click_count = click_count + 1
  WHERE id = coupon_id AND is_active = true;
$$;
