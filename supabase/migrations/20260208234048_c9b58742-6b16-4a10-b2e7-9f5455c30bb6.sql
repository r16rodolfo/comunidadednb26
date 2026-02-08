-- Allow admins to view all subscriber records
CREATE POLICY "Admins can view all subscribers"
ON public.subscribers
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));
