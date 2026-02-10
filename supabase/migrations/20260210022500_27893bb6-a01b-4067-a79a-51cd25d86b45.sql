
-- Allow unauthenticated users to read home_config (needed for login page background)
CREATE POLICY "Anyone can read home config"
ON public.home_config
FOR SELECT
USING (true);
