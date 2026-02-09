
-- Drop the overly permissive update policy
DROP POLICY "Service role can update nox_payments" ON public.nox_payments;

-- No RLS UPDATE policy needed: the webhook edge function uses SUPABASE_SERVICE_ROLE_KEY
-- which bypasses RLS entirely. Regular users cannot update nox_payments.
