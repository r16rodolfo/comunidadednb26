-- ============================================================
-- DATABASE BACKUP DDL - Comunidade DNB
-- Gerado em: 2026-02-23
-- ============================================================

-- 1. ENUM
CREATE TYPE public.app_role AS ENUM ('free', 'premium', 'gestor', 'admin');

-- 2. FUNÇÕES
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id
  ORDER BY CASE role WHEN 'admin' THEN 1 WHEN 'gestor' THEN 2 WHEN 'premium' THEN 3 WHEN 'free' THEN 4 END
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, cellphone, cpf)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', ''), NEW.email, NEW.raw_user_meta_data->>'cellphone', NEW.raw_user_meta_data->>'cpf');
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'free');
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.increment_coupon_click(coupon_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path TO 'public' AS $$
  UPDATE public.coupons SET click_count = click_count + 1 WHERE id = coupon_id AND is_active = true;
$$;

-- 3. TABELAS

-- profiles
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  name text NOT NULL DEFAULT '',
  email text,
  cellphone text,
  cpf text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- user_roles
CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  role app_role NOT NULL DEFAULT 'free'
);

-- plans
CREATE TABLE public.plans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  price_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'BRL',
  "interval" text NOT NULL,
  interval_label text NOT NULL DEFAULT '',
  features text[] NOT NULL DEFAULT '{}',
  popular boolean NOT NULL DEFAULT false,
  savings_percent integer,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- subscribers
CREATE TABLE public.subscribers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  email text NOT NULL,
  subscribed boolean NOT NULL DEFAULT false,
  subscription_tier text,
  subscription_end timestamptz,
  current_plan_slug text,
  previous_plan_slug text,
  stripe_customer_id text,
  stripe_subscription_id text,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  pending_downgrade_to text,
  pending_downgrade_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- home_config
CREATE TABLE public.home_config (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  welcome_card jsonb NOT NULL DEFAULT '{}',
  step_cards jsonb NOT NULL DEFAULT '[]',
  banners jsonb NOT NULL DEFAULT '[]',
  login_bg_url text,
  bunny_library_id text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- notifications
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  icon text NOT NULL DEFAULT 'info',
  read boolean NOT NULL DEFAULT false,
  action_label text,
  action_href text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- coupon_categories
CREATE TABLE public.coupon_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- coupons
CREATE TABLE public.coupons (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_name text NOT NULL,
  partner_logo text NOT NULL DEFAULT '',
  offer_title text NOT NULL,
  description text NOT NULL DEFAULT '',
  code text NOT NULL,
  destination_url text NOT NULL,
  category_id uuid REFERENCES public.coupon_categories(id),
  is_active boolean NOT NULL DEFAULT true,
  is_premium_only boolean NOT NULL DEFAULT false,
  click_count integer NOT NULL DEFAULT 0,
  expiration_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- courses
CREATE TABLE public.courses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  is_published boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- modules
CREATE TABLE public.modules (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id uuid NOT NULL REFERENCES public.courses(id),
  title text NOT NULL,
  description text DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- lessons
CREATE TABLE public.lessons (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id uuid NOT NULL REFERENCES public.modules(id),
  title text NOT NULL,
  description text DEFAULT '',
  bunny_video_id text NOT NULL DEFAULT '',
  duration integer NOT NULL DEFAULT 0,
  is_free boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- lesson_progress
CREATE TABLE public.lesson_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  lesson_id uuid NOT NULL REFERENCES public.lessons(id),
  is_completed boolean NOT NULL DEFAULT true,
  completed_at timestamptz NOT NULL DEFAULT now()
);

-- market_analyses
CREATE TABLE public.market_analyses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date date NOT NULL,
  dollar_price numeric NOT NULL,
  dollar_variation numeric NOT NULL DEFAULT 0,
  euro_price numeric NOT NULL,
  euro_variation numeric NOT NULL DEFAULT 0,
  recommendation text NOT NULL,
  summary text NOT NULL,
  full_analysis text NOT NULL,
  supports numeric[] NOT NULL DEFAULT '{}',
  resistances numeric[] NOT NULL DEFAULT '{}',
  image_url text,
  video_url text,
  edited_by_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- trip_goals
CREATE TABLE public.trip_goals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  target_amount numeric NOT NULL,
  trip_date date NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- planner_transactions
CREATE TABLE public.planner_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  goal_id uuid REFERENCES public.trip_goals(id),
  date date NOT NULL,
  amount numeric NOT NULL,
  rate numeric NOT NULL,
  total_paid numeric NOT NULL,
  location text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. VIEW
CREATE OR REPLACE VIEW public.subscribers_safe AS
SELECT id, user_id, email, subscribed, subscription_tier, subscription_end,
       current_plan_slug, previous_plan_slug, cancel_at_period_end,
       pending_downgrade_to, pending_downgrade_date, created_at, updated_at
FROM public.subscribers;

-- 5. TRIGGER (auth.users -> profiles + user_roles)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. RLS - Habilitar em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.home_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planner_transactions ENABLE ROW LEVEL SECURITY;

-- 7. POLÍTICAS RLS

-- == profiles ==
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- == user_roles ==
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (has_role(auth.uid(), 'admin'));

-- == plans ==
CREATE POLICY "Anyone can view active plans" ON public.plans FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can view all plans" ON public.plans FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert plans" ON public.plans FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update plans" ON public.plans FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete plans" ON public.plans FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- == subscribers ==
CREATE POLICY "Users can view own subscription" ON public.subscribers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all subscribers" ON public.subscribers FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- == home_config ==
CREATE POLICY "Anyone can read home config" ON public.home_config FOR SELECT USING (true);
CREATE POLICY "Authenticated users can read home config" ON public.home_config FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can insert home config" ON public.home_config FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update home config" ON public.home_config FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- == notifications ==
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all notifications" ON public.notifications FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert notifications" ON public.notifications FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);

-- == coupon_categories ==
CREATE POLICY "Anyone can view active categories" ON public.coupon_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can view all categories" ON public.coupon_categories FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert categories" ON public.coupon_categories FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update categories" ON public.coupon_categories FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete categories" ON public.coupon_categories FOR DELETE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Gestors can view all categories" ON public.coupon_categories FOR SELECT USING (has_role(auth.uid(), 'gestor'));
CREATE POLICY "Gestors can insert categories" ON public.coupon_categories FOR INSERT WITH CHECK (has_role(auth.uid(), 'gestor'));
CREATE POLICY "Gestors can update categories" ON public.coupon_categories FOR UPDATE USING (has_role(auth.uid(), 'gestor'));
CREATE POLICY "Gestors can delete categories" ON public.coupon_categories FOR DELETE USING (has_role(auth.uid(), 'gestor'));

-- == coupons ==
CREATE POLICY "Anyone can view active coupons" ON public.coupons FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can view all coupons" ON public.coupons FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert coupons" ON public.coupons FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update coupons" ON public.coupons FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete coupons" ON public.coupons FOR DELETE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Gestors can view all coupons" ON public.coupons FOR SELECT USING (has_role(auth.uid(), 'gestor'));
CREATE POLICY "Gestors can insert coupons" ON public.coupons FOR INSERT WITH CHECK (has_role(auth.uid(), 'gestor'));
CREATE POLICY "Gestors can update coupons" ON public.coupons FOR UPDATE USING (has_role(auth.uid(), 'gestor'));
CREATE POLICY "Gestors can delete coupons" ON public.coupons FOR DELETE USING (has_role(auth.uid(), 'gestor'));

-- == courses ==
CREATE POLICY "Anyone can view published courses" ON public.courses FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can view all courses" ON public.courses FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert courses" ON public.courses FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update courses" ON public.courses FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete courses" ON public.courses FOR DELETE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Gestors can view all courses" ON public.courses FOR SELECT USING (has_role(auth.uid(), 'gestor'));
CREATE POLICY "Gestors can insert courses" ON public.courses FOR INSERT WITH CHECK (has_role(auth.uid(), 'gestor'));
CREATE POLICY "Gestors can update courses" ON public.courses FOR UPDATE USING (has_role(auth.uid(), 'gestor'));

-- == modules ==
CREATE POLICY "Anyone can view modules of published courses" ON public.modules FOR SELECT USING (EXISTS (SELECT 1 FROM courses WHERE courses.id = modules.course_id AND courses.is_published = true));
CREATE POLICY "Admins can view all modules" ON public.modules FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert modules" ON public.modules FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update modules" ON public.modules FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete modules" ON public.modules FOR DELETE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Gestors can view all modules" ON public.modules FOR SELECT USING (has_role(auth.uid(), 'gestor'));
CREATE POLICY "Gestors can insert modules" ON public.modules FOR INSERT WITH CHECK (has_role(auth.uid(), 'gestor'));
CREATE POLICY "Gestors can update modules" ON public.modules FOR UPDATE USING (has_role(auth.uid(), 'gestor'));

-- == lessons ==
CREATE POLICY "Anyone can view lessons of published courses" ON public.lessons FOR SELECT USING (EXISTS (SELECT 1 FROM modules m JOIN courses c ON c.id = m.course_id WHERE m.id = lessons.module_id AND c.is_published = true));
CREATE POLICY "Admins can view all lessons" ON public.lessons FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert lessons" ON public.lessons FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update lessons" ON public.lessons FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete lessons" ON public.lessons FOR DELETE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Gestors can view all lessons" ON public.lessons FOR SELECT USING (has_role(auth.uid(), 'gestor'));
CREATE POLICY "Gestors can insert lessons" ON public.lessons FOR INSERT WITH CHECK (has_role(auth.uid(), 'gestor'));
CREATE POLICY "Gestors can update lessons" ON public.lessons FOR UPDATE USING (has_role(auth.uid(), 'gestor'));

-- == lesson_progress ==
CREATE POLICY "Users can view own progress" ON public.lesson_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all progress" ON public.lesson_progress FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert own progress" ON public.lesson_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.lesson_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own progress" ON public.lesson_progress FOR DELETE USING (auth.uid() = user_id);

-- == market_analyses ==
CREATE POLICY "Anyone can view analyses" ON public.market_analyses FOR SELECT USING (true);
CREATE POLICY "Admins can insert analyses" ON public.market_analyses FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update analyses" ON public.market_analyses FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete analyses" ON public.market_analyses FOR DELETE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Gestors can insert analyses" ON public.market_analyses FOR INSERT WITH CHECK (has_role(auth.uid(), 'gestor'));
CREATE POLICY "Gestors can update analyses" ON public.market_analyses FOR UPDATE USING (has_role(auth.uid(), 'gestor'));
CREATE POLICY "Gestors can delete analyses" ON public.market_analyses FOR DELETE USING (has_role(auth.uid(), 'gestor'));

-- == trip_goals ==
CREATE POLICY "Users can view own goals" ON public.trip_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all goals" ON public.trip_goals FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can create own goals" ON public.trip_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON public.trip_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals" ON public.trip_goals FOR DELETE USING (auth.uid() = user_id);

-- == planner_transactions ==
CREATE POLICY "Users can view own transactions" ON public.planner_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all transactions" ON public.planner_transactions FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can create own transactions" ON public.planner_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON public.planner_transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions" ON public.planner_transactions FOR DELETE USING (auth.uid() = user_id);

-- 8. STORAGE
INSERT INTO storage.buckets (id, name, public) VALUES ('platform-assets', 'platform-assets', true) ON CONFLICT DO NOTHING;
CREATE POLICY "Public read access" ON storage.objects FOR SELECT USING (bucket_id = 'platform-assets');
CREATE POLICY "Admins can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'platform-assets' AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update" ON storage.objects FOR UPDATE USING (bucket_id = 'platform-assets' AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete" ON storage.objects FOR DELETE USING (bucket_id = 'platform-assets' AND has_role(auth.uid(), 'admin'));
