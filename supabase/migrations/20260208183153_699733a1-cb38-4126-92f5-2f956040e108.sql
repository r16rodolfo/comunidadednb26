
-- =============================================
-- ACADEMY MODULE: courses, modules, lessons, lesson_progress
-- =============================================

-- Courses table
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  is_published BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Anyone can read published courses
CREATE POLICY "Anyone can view published courses"
  ON public.courses FOR SELECT
  USING (is_published = true);

-- Admins & gestors can view all courses (including drafts)
CREATE POLICY "Admins can view all courses"
  ON public.courses FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Gestors can view all courses"
  ON public.courses FOR SELECT
  USING (public.has_role(auth.uid(), 'gestor'));

-- Admins can full CRUD courses
CREATE POLICY "Admins can insert courses"
  ON public.courses FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update courses"
  ON public.courses FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete courses"
  ON public.courses FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Gestors can create/edit (not delete) courses
CREATE POLICY "Gestors can insert courses"
  ON public.courses FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'gestor'));

CREATE POLICY "Gestors can update courses"
  ON public.courses FOR UPDATE
  USING (public.has_role(auth.uid(), 'gestor'));

-- Updated_at trigger
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- Modules table
-- =============================================
CREATE TABLE public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

-- Anyone can read modules of published courses
CREATE POLICY "Anyone can view modules of published courses"
  ON public.modules FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.courses WHERE courses.id = modules.course_id AND courses.is_published = true
  ));

-- Admins/gestors can view all modules
CREATE POLICY "Admins can view all modules"
  ON public.modules FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Gestors can view all modules"
  ON public.modules FOR SELECT
  USING (public.has_role(auth.uid(), 'gestor'));

-- Admins full CRUD
CREATE POLICY "Admins can insert modules"
  ON public.modules FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update modules"
  ON public.modules FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete modules"
  ON public.modules FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Gestors can create/edit
CREATE POLICY "Gestors can insert modules"
  ON public.modules FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'gestor'));

CREATE POLICY "Gestors can update modules"
  ON public.modules FOR UPDATE
  USING (public.has_role(auth.uid(), 'gestor'));

-- =============================================
-- Lessons table
-- =============================================
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  duration INTEGER NOT NULL DEFAULT 0,
  bunny_video_id TEXT NOT NULL DEFAULT '',
  is_free BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Anyone can read lessons of published courses
CREATE POLICY "Anyone can view lessons of published courses"
  ON public.lessons FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.modules m
    JOIN public.courses c ON c.id = m.course_id
    WHERE m.id = lessons.module_id AND c.is_published = true
  ));

-- Admins/gestors can view all lessons
CREATE POLICY "Admins can view all lessons"
  ON public.lessons FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Gestors can view all lessons"
  ON public.lessons FOR SELECT
  USING (public.has_role(auth.uid(), 'gestor'));

-- Admins full CRUD
CREATE POLICY "Admins can insert lessons"
  ON public.lessons FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update lessons"
  ON public.lessons FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete lessons"
  ON public.lessons FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Gestors can create/edit
CREATE POLICY "Gestors can insert lessons"
  ON public.lessons FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'gestor'));

CREATE POLICY "Gestors can update lessons"
  ON public.lessons FOR UPDATE
  USING (public.has_role(auth.uid(), 'gestor'));

-- =============================================
-- Lesson Progress (per-user tracking)
-- =============================================
CREATE TABLE public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  is_completed BOOLEAN NOT NULL DEFAULT true,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);

ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

-- Users can CRUD their own progress
CREATE POLICY "Users can view own progress"
  ON public.lesson_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON public.lesson_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON public.lesson_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress"
  ON public.lesson_progress FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can read all progress
CREATE POLICY "Admins can view all progress"
  ON public.lesson_progress FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Indexes for performance
CREATE INDEX idx_modules_course_id ON public.modules(course_id);
CREATE INDEX idx_lessons_module_id ON public.lessons(module_id);
CREATE INDEX idx_lesson_progress_user_id ON public.lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_lesson_id ON public.lesson_progress(lesson_id);

-- =============================================
-- Seed mock data
-- =============================================

-- Course 1: Fundamentos do Câmbio (published)
INSERT INTO public.courses (id, title, description, is_published, sort_order) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Fundamentos do Câmbio', 'Curso completo sobre mercado de câmbio para viajantes', true, 1),
  ('a1000000-0000-0000-0000-000000000002', 'Estratégias Avançadas de Câmbio', 'Técnicas avançadas para otimizar suas operações de câmbio', false, 2);

-- Modules for Course 1
INSERT INTO public.modules (id, course_id, title, description, sort_order) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Introdução ao Câmbio', 'Conceitos básicos do mercado de câmbio', 1),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Estratégias de Compra', 'Como otimizar suas compras de moeda estrangeira', 2);

-- Modules for Course 2
INSERT INTO public.modules (id, course_id, title, description, sort_order) VALUES
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002', 'Análise de Mercado', 'Ferramentas e técnicas para analisar o mercado', 1),
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', 'Operações Avançadas', 'Técnicas para maximizar seus ganhos', 2);

-- Lessons for Module 1 (Introdução ao Câmbio)
INSERT INTO public.lessons (id, module_id, title, description, sort_order, duration, bunny_video_id, is_free) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'O que é câmbio?', 'Entenda os conceitos fundamentais do mercado de câmbio e como ele afeta o dia a dia dos viajantes.', 1, 480, '', true),
  ('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'Como funciona o mercado', 'Fatores que influenciam as cotações de moedas estrangeiras e como acompanhar as variações.', 2, 600, '', true),
  ('c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', 'Tipos de moeda', 'Diferenças entre papel-moeda, cartão pré-pago e transferências internacionais.', 3, 720, '', false),
  ('c1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000001', 'Documentação necessária', 'O que você precisa para comprar moeda estrangeira de forma legal e segura.', 4, 540, '', false);

-- Lessons for Module 2 (Estratégias de Compra)
INSERT INTO public.lessons (id, module_id, title, description, sort_order, duration, bunny_video_id, is_free) VALUES
  ('c1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000002', 'Quando comprar moeda', 'Identificando o melhor momento para comprar moeda e como usar indicadores a seu favor.', 1, 900, '', false),
  ('c1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000002', 'Planejamento de compras', 'Estratégias para comprar ao longo do tempo e reduzir o impacto da volatilidade.', 2, 780, '', false);

-- Lessons for Module 3 (Análise de Mercado)
INSERT INTO public.lessons (id, module_id, title, description, sort_order, duration, bunny_video_id, is_free) VALUES
  ('c1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000003', 'Leitura de gráficos', 'Como interpretar gráficos de cotação e identificar tendências.', 1, 840, '', true),
  ('c1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000003', 'Indicadores econômicos', 'Principais indicadores que impactam o câmbio e como acompanhá-los.', 2, 960, '', false);

-- Lessons for Module 4 (Operações Avançadas)
INSERT INTO public.lessons (id, module_id, title, description, sort_order, duration, bunny_video_id, is_free) VALUES
  ('c1000000-0000-0000-0000-000000000009', 'b1000000-0000-0000-0000-000000000004', 'Arbitragem de câmbio', 'Como aproveitar diferenças de preço entre casas de câmbio.', 1, 720, '', false),
  ('c1000000-0000-0000-0000-000000000010', 'b1000000-0000-0000-0000-000000000004', 'Hedge cambial', 'Estratégias de proteção contra variações desfavoráveis.', 2, 660, '', false);
