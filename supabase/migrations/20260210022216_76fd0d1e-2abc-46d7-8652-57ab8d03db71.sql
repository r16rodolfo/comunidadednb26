
-- Create public storage bucket for platform assets
INSERT INTO storage.buckets (id, name, public) VALUES ('platform-assets', 'platform-assets', true);

-- Allow anyone to view platform assets
CREATE POLICY "Platform assets are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'platform-assets');

-- Only admins can upload/update/delete platform assets
CREATE POLICY "Admins can manage platform assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'platform-assets'
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can update platform assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'platform-assets'
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete platform assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'platform-assets'
  AND public.has_role(auth.uid(), 'admin')
);

-- Add login_bg_url column to home_config
ALTER TABLE public.home_config ADD COLUMN login_bg_url TEXT;
