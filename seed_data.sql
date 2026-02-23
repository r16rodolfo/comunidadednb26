-- ============================================================
-- SEED DATA - Comunidade DNB
-- Execute no SQL Editor do Supabase externo
-- ⚠️ NÃO insere em auth.users. Crie seu usuário via Sign Up.
-- ============================================================

-- ID placeholder para o "dono" dos dados.
-- Após criar seu usuário real, substitua este ID ou rode o script de vínculo.
DO $$
DECLARE
  v_user_id uuid := '00000000-0000-0000-0000-000000000001';
  v_course1 uuid;
  v_course2 uuid;
  v_mod1a uuid;
  v_mod1b uuid;
  v_mod2a uuid;
  v_mod2b uuid;
  v_goal1 uuid;
  v_goal2 uuid;
  v_cat1 uuid;
  v_cat2 uuid;
BEGIN

  -- ============================================================
  -- 1. PROFILE (placeholder - será substituído depois)
  -- ============================================================
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (v_user_id, 'Admin Demo', 'admin@demo.com')
  ON CONFLICT DO NOTHING;

  -- Role admin para o placeholder
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'admin')
  ON CONFLICT DO NOTHING;

  -- ============================================================
  -- 2. ACADEMY - Cursos, Módulos e Aulas
  -- ============================================================

  -- Curso 1
  INSERT INTO public.courses (id, title, description, is_published, sort_order)
  VALUES (gen_random_uuid(), 'Curso DNB Básico', 'Aprenda os fundamentos do mercado de câmbio e como operar com segurança.', true, 1)
  RETURNING id INTO v_course1;

  -- Curso 2
  INSERT INTO public.courses (id, title, description, is_published, sort_order)
  VALUES (gen_random_uuid(), 'Masterclass Câmbio Avançado', 'Estratégias avançadas para maximizar seus resultados em operações cambiais.', true, 2)
  RETURNING id INTO v_course2;

  -- Módulos do Curso 1
  INSERT INTO public.modules (id, course_id, title, description, sort_order)
  VALUES (gen_random_uuid(), v_course1, 'Introdução ao Câmbio', 'Conceitos fundamentais do mercado de câmbio.', 1)
  RETURNING id INTO v_mod1a;

  INSERT INTO public.modules (id, course_id, title, description, sort_order)
  VALUES (gen_random_uuid(), v_course1, 'Onde e Como Comprar', 'Melhores práticas para compra de moeda estrangeira.', 2)
  RETURNING id INTO v_mod1b;

  -- Módulos do Curso 2
  INSERT INTO public.modules (id, course_id, title, description, sort_order)
  VALUES (gen_random_uuid(), v_course2, 'Análise Técnica', 'Leitura de gráficos e indicadores.', 1)
  RETURNING id INTO v_mod2a;

  INSERT INTO public.modules (id, course_id, title, description, sort_order)
  VALUES (gen_random_uuid(), v_course2, 'Gestão de Risco', 'Como proteger seu capital em operações cambiais.', 2)
  RETURNING id INTO v_mod2b;

  -- Aulas do Módulo 1A
  INSERT INTO public.lessons (module_id, title, description, duration, sort_order, is_free, bunny_video_id) VALUES
  (v_mod1a, 'O que é câmbio?', 'Entenda o mercado de câmbio do zero.', 720, 1, true, ''),
  (v_mod1a, 'Tipos de moeda', 'Dólar, Euro, Libra — diferenças e quando usar cada uma.', 600, 2, false, '');

  -- Aulas do Módulo 1B
  INSERT INTO public.lessons (module_id, title, description, duration, sort_order, is_free, bunny_video_id) VALUES
  (v_mod1b, 'Casas de câmbio vs Bancos', 'Comparativo de taxas e conveniência.', 540, 1, false, ''),
  (v_mod1b, 'Comprando online', 'Passo a passo para comprar câmbio digital.', 480, 2, false, '');

  -- Aulas do Módulo 2A
  INSERT INTO public.lessons (module_id, title, description, duration, sort_order, is_free, bunny_video_id) VALUES
  (v_mod2a, 'Lendo gráficos de câmbio', 'Candlesticks, suportes e resistências.', 900, 1, true, ''),
  (v_mod2a, 'Indicadores essenciais', 'Média móvel, RSI e MACD aplicados ao câmbio.', 780, 2, false, '');

  -- Aulas do Módulo 2B
  INSERT INTO public.lessons (module_id, title, description, duration, sort_order, is_free, bunny_video_id) VALUES
  (v_mod2b, 'Stop loss no câmbio', 'Proteja-se de oscilações bruscas.', 660, 1, false, ''),
  (v_mod2b, 'Diversificação cambial', 'Como distribuir em múltiplas moedas.', 600, 2, false, '');

  -- ============================================================
  -- 3. PLANNER - Metas e Transações
  -- ============================================================

  INSERT INTO public.trip_goals (id, user_id, target_amount, trip_date, currency)
  VALUES (gen_random_uuid(), v_user_id, 3000, (CURRENT_DATE + interval '90 days')::date, 'USD')
  RETURNING id INTO v_goal1;

  INSERT INTO public.trip_goals (id, user_id, target_amount, trip_date, currency)
  VALUES (gen_random_uuid(), v_user_id, 2000, (CURRENT_DATE + interval '120 days')::date, 'EUR')
  RETURNING id INTO v_goal2;

  -- 15 transações distribuídas no último mês
  INSERT INTO public.planner_transactions (user_id, goal_id, amount, rate, total_paid, date, location) VALUES
  (v_user_id, v_goal1, 200, 5.12, 1024.00, (CURRENT_DATE - interval '28 days')::date, 'Wise'),
  (v_user_id, v_goal1, 150, 5.08, 762.00,  (CURRENT_DATE - interval '26 days')::date, 'Banco do Brasil'),
  (v_user_id, v_goal2, 100, 5.55, 555.00,  (CURRENT_DATE - interval '25 days')::date, 'Wise'),
  (v_user_id, v_goal1, 300, 5.15, 1545.00, (CURRENT_DATE - interval '22 days')::date, 'Remessa Online'),
  (v_user_id, v_goal2, 200, 5.60, 1120.00, (CURRENT_DATE - interval '20 days')::date, 'Banco Itaú'),
  (v_user_id, v_goal1, 100, 5.05, 505.00,  (CURRENT_DATE - interval '18 days')::date, 'Wise'),
  (v_user_id, v_goal1, 250, 5.10, 1275.00, (CURRENT_DATE - interval '15 days')::date, 'Western Union'),
  (v_user_id, v_goal2, 150, 5.58, 837.00,  (CURRENT_DATE - interval '13 days')::date, 'Remessa Online'),
  (v_user_id, v_goal1, 180, 5.20, 936.00,  (CURRENT_DATE - interval '11 days')::date, 'Banco do Brasil'),
  (v_user_id, v_goal2, 120, 5.52, 662.40,  (CURRENT_DATE - interval '9 days')::date, 'Wise'),
  (v_user_id, v_goal1, 350, 5.18, 1813.00, (CURRENT_DATE - interval '7 days')::date, 'Remessa Online'),
  (v_user_id, v_goal2, 80,  5.65, 452.00,  (CURRENT_DATE - interval '5 days')::date, 'Banco Itaú'),
  (v_user_id, v_goal1, 200, 5.22, 1044.00, (CURRENT_DATE - interval '4 days')::date, 'Western Union'),
  (v_user_id, v_goal2, 250, 5.50, 1375.00, (CURRENT_DATE - interval '2 days')::date, 'Wise'),
  (v_user_id, v_goal1, 170, 5.25, 892.50,  CURRENT_DATE::date, 'Banco do Brasil');

  -- ============================================================
  -- 4. DNB ANALYSIS - 4 Análises de mercado
  -- ============================================================

  INSERT INTO public.market_analyses (date, dollar_price, dollar_variation, euro_price, euro_variation, recommendation, summary, full_analysis, supports, resistances, edited_by_name) VALUES
  ((CURRENT_DATE - interval '3 days')::date, 5.18, -0.35, 5.62, -0.20, 'Compra',
   'Dólar recua com dados de emprego nos EUA abaixo do esperado.',
   'O dólar comercial recuou 0,35% nesta sessão após dados de emprego nos EUA virem abaixo das expectativas do mercado. O payroll não-agrícola registrou 150 mil vagas contra 180 mil esperadas, aliviando a pressão sobre o Fed para manter juros elevados. No cenário doméstico, o fluxo cambial segue positivo com entrada de capitais estrangeiros no mercado de renda fixa. A perspectiva de cortes graduais na Selic também contribui para a valorização do real. Recomendamos aproveitar a janela de compra para quem planeja viagens nos próximos 3 meses.',
   ARRAY[5.05, 4.95], ARRAY[5.25, 5.35], 'Analista DNB'),

  ((CURRENT_DATE - interval '2 days')::date, 5.22, 0.77, 5.65, 0.53, 'Aguardar',
   'Dólar sobe com tensões geopolíticas e busca por segurança.',
   'O dólar avançou 0,77% impulsionado pela aversão ao risco global. Tensões geopolíticas no Oriente Médio elevaram a demanda por ativos de segurança, beneficiando o dólar. O euro também subiu, porém em menor intensidade. No Brasil, declarações do BC sobre câmbio flutuante mantiveram o mercado cauteloso. Sugerimos aguardar estabilização antes de novas compras, especialmente para quem não tem urgência.',
   ARRAY[5.15, 5.08], ARRAY[5.30, 5.40], 'Analista DNB'),

  ((CURRENT_DATE - interval '1 day')::date, 5.15, -1.34, 5.58, -1.24, 'Compra Forte',
   'Real se fortalece com entrada recorde de investimentos estrangeiros.',
   'O real teve um dos melhores dias do mês, com o dólar recuando 1,34%. A entrada de US$ 2,3 bilhões em investimentos estrangeiros no mercado de capitais brasileiro foi o principal driver. Dados de inflação (IPCA) dentro das expectativas reforçaram a tese de corte gradual da Selic, atraindo carry trade. Para viajantes, este é um excelente momento de compra, com o dólar próximo dos suportes técnicos mais relevantes do trimestre.',
   ARRAY[5.05, 4.98], ARRAY[5.22, 5.30], 'Analista DNB'),

  (CURRENT_DATE::date, 5.20, 0.97, 5.61, 0.54, 'Neutro',
   'Dólar opera estável aguardando decisão do Fed nesta semana.',
   'O mercado opera em compasso de espera antes da decisão de juros do Federal Reserve, prevista para quarta-feira. A expectativa majoritária é de manutenção da taxa entre 5,25% e 5,50%, mas o comunicado será crucial para definir a trajetória futura. O real está relativamente estável com leve viés de alta do dólar. Para quem precisa comprar, sugerimos fracionar as compras entre hoje e após a decisão do Fed para diluir o risco de volatilidade.',
   ARRAY[5.10, 5.02], ARRAY[5.28, 5.38], 'Analista DNB');

  -- ============================================================
  -- 5. COUPONS - Categorias e Cupons
  -- ============================================================

  INSERT INTO public.coupon_categories (id, name, is_active)
  VALUES (gen_random_uuid(), 'Câmbio', true)
  RETURNING id INTO v_cat1;

  INSERT INTO public.coupon_categories (id, name, is_active)
  VALUES (gen_random_uuid(), 'Viagem', true)
  RETURNING id INTO v_cat2;

  INSERT INTO public.coupons (category_id, code, offer_title, partner_name, description, destination_url, is_active, is_premium_only, expiration_date) VALUES
  (v_cat1, 'DNB10', '10% OFF na taxa de câmbio', 'Wise', 'Desconto exclusivo para membros da comunidade DNB na primeira transferência.', 'https://wise.com', true, false, (CURRENT_DATE + interval '60 days')::date),
  (v_cat2, 'VIAGEM20', 'R$20 OFF no seguro viagem', 'Seguros Promo', 'Cupom exclusivo para seguro viagem internacional com cobertura completa.', 'https://segurospromo.com.br', true, false, (CURRENT_DATE + interval '90 days')::date),
  (v_cat1, 'PREMIUM5', '5% OFF câmbio turismo', 'Remessa Online', 'Desconto especial para membros Premium na compra de dólar turismo.', 'https://remessaonline.com.br', true, true, (CURRENT_DATE + interval '45 days')::date);

  -- ============================================================
  -- 6. HOME CONFIG (configuração padrão)
  -- ============================================================
  INSERT INTO public.home_config (id, welcome_card, step_cards, banners)
  VALUES (
    gen_random_uuid(),
    '{"title": "Bem-vindo à Comunidade DNB!", "subtitle": "Sua jornada no mercado de câmbio começa aqui.", "cta_label": "Explorar", "cta_href": "/analises"}'::jsonb,
    '[{"title": "Análises", "description": "Veja as análises diárias do mercado", "icon": "trending-up", "href": "/analises"}, {"title": "Academy", "description": "Aprenda com nossos cursos", "icon": "graduation-cap", "href": "/academy"}, {"title": "Planner", "description": "Planeje suas compras de câmbio", "icon": "calculator", "href": "/planner"}]'::jsonb,
    '[]'::jsonb
  )
  ON CONFLICT DO NOTHING;

END $$;
