
-- Create subscribers table to track subscription status
CREATE TABLE public.subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  stripe_customer_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT,
  subscription_end TIMESTAMP WITH TIME ZONE,
  current_plan_slug TEXT,
  previous_plan_slug TEXT,
  pending_downgrade_to TEXT,
  pending_downgrade_date TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT subscribers_email_key UNIQUE (email),
  CONSTRAINT subscribers_user_id_key UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscription
CREATE POLICY "Users can view own subscription"
ON public.subscribers
FOR SELECT
USING (auth.uid() = user_id);

-- Service role can manage all subscriptions (for edge functions)
CREATE POLICY "Service role can manage subscriptions"
ON public.subscribers
FOR ALL
USING (true)
WITH CHECK (true);

-- Note: The above "all" policy is permissive but edge functions use service_role key
-- Let's make it restrictive: only allow users to read, service role handles writes

-- Drop the overly permissive policy
DROP POLICY "Service role can manage subscriptions" ON public.subscribers;

-- Allow insert/update only via service role (edge functions)
-- Users can only SELECT their own data
-- Edge functions using SUPABASE_SERVICE_ROLE_KEY bypass RLS entirely

-- Create index for faster lookups
CREATE INDEX idx_subscribers_user_id ON public.subscribers(user_id);
CREATE INDEX idx_subscribers_email ON public.subscribers(email);
CREATE INDEX idx_subscribers_stripe_customer_id ON public.subscribers(stripe_customer_id);

-- Add trigger for updated_at
CREATE TRIGGER update_subscribers_updated_at
  BEFORE UPDATE ON public.subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
