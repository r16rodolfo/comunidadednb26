-- ============================================================
-- SCRIPT DE VÍNCULO: Transformar seu usuário real em Admin
-- ============================================================
-- Execute DEPOIS de:
--   1. Criar sua conta via Sign Up no Preview
--   2. Ter rodado o seed_data.sql
-- ============================================================

-- PASSO 1: Descubra seu user_id real
-- Execute esta query e copie o "id" retornado:
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- PASSO 2: Substitua 'SEU_USER_ID_AQUI' pelo id copiado acima
-- e execute os comandos abaixo UM POR UM:

-- 2a. Atualizar/criar seu profile
UPDATE public.profiles
SET name = 'Seu Nome', email = 'seu@email.com'
WHERE user_id = 'SEU_USER_ID_AQUI';

-- Se não existir profile (raro, pois o trigger cria automaticamente):
-- INSERT INTO public.profiles (user_id, name, email)
-- VALUES ('SEU_USER_ID_AQUI', 'Seu Nome', 'seu@email.com');

-- 2b. Promover para admin
UPDATE public.user_roles
SET role = 'admin'
WHERE user_id = 'SEU_USER_ID_AQUI';

-- Se não existir registro de role:
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('SEU_USER_ID_AQUI', 'admin');

-- PASSO 3: Transferir dados do placeholder para seu usuário real
-- (Transfere metas, transações e profile do ID placeholder)

UPDATE public.trip_goals
SET user_id = 'SEU_USER_ID_AQUI'
WHERE user_id = '00000000-0000-0000-0000-000000000001';

UPDATE public.planner_transactions
SET user_id = 'SEU_USER_ID_AQUI'
WHERE user_id = '00000000-0000-0000-0000-000000000001';

-- Remover o profile e role placeholder (opcional)
DELETE FROM public.user_roles
WHERE user_id = '00000000-0000-0000-0000-000000000001';

DELETE FROM public.profiles
WHERE user_id = '00000000-0000-0000-0000-000000000001';

-- ✅ Pronto! Faça logout e login novamente para carregar o novo role.
