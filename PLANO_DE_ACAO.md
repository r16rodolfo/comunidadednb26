
# 🚀 Plano de Ação — Sistema de Roles, Assinaturas & Backend

> **Projeto**: DNB (Dinheiro Não Basta)  
> **Data**: Fevereiro 2025  
> **Objetivo**: Migrar de dados mockados para um backend real com autenticação, sistema de roles (4 perfis) e integração com Stripe para assinaturas.

---

## 📌 Resumo Executivo

A plataforma DNB opera atualmente com dados mockados e persistência em `localStorage`. Este plano documenta a migração para um backend completo usando Lovable Cloud (Supabase), implementando:

1. **4 perfis de usuário** com permissões granulares
2. **Autenticação real** com Supabase Auth
3. **Sistema de assinaturas** com Stripe (3 planos)
4. **Controle de acesso** baseado em roles com RLS

---

## 🏗️ Fase 1 — Infraestrutura & Autenticação

### 1.1 Ativar Lovable Cloud
- [ ] Ativar Cloud no projeto (provisiona banco PostgreSQL, Auth, Storage, Edge Functions)
- [ ] Verificar configuração do cliente Supabase em `src/integrations/supabase/`

### 1.2 Estrutura de Roles no Banco de Dados
- [ ] Criar enum `app_role` com 4 valores: `free`, `premium`, `gestor`, `admin`
- [ ] Criar tabela `user_roles` com RLS habilitado
- [ ] Criar função `has_role()` como `SECURITY DEFINER` (evita recursão em RLS)
- [ ] Criar políticas RLS usando `has_role()`

```sql
-- Enum de roles
CREATE TYPE public.app_role AS ENUM ('free', 'premium', 'gestor', 'admin');

-- Tabela de roles (separada do perfil — segurança)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'free',
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Função SECURITY DEFINER para evitar recursão
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Políticas RLS
CREATE POLICY "Usuários podem ver seus próprios roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins podem gerenciar todos os roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
```

### 1.3 Tabela de Perfis
- [ ] Criar tabela `profiles` com trigger automático no signup
- [ ] Definir políticas RLS para perfis

```sql
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    avatar_url TEXT,
    preferences JSONB DEFAULT '{"theme": "light", "notifications": true, "language": "pt-BR"}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Trigger para criar perfil + role automaticamente no signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'free');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 1.4 Migrar Autenticação
- [ ] Atualizar `UserRole` enum em `src/types/auth.ts` para incluir `GESTOR`
- [ ] Reescrever `AuthContext` para usar Supabase Auth real
- [ ] Atualizar `src/lib/roles.ts` com label e badge do Gestor
- [ ] Remover `src/data/mock-auth.ts`
- [ ] Atualizar `ProtectedRoute` para verificar roles do banco
- [ ] Implementar fluxo de signup com `emailRedirectTo`
- [ ] Configurar `onAuthStateChange` corretamente (sem async no callback)

---

## 🏗️ Fase 2 — Perfis de Usuário & Permissões

### 2.1 Hierarquia de Perfis

| Role | Label UI | Badge | Descrição |
|------|----------|-------|-----------|
| `free` | Assinante Gratuito | `outline` | Acesso limitado às ferramentas |
| `premium` | Assinante Premium | `secondary` | Acesso completo via assinatura |
| `gestor` | Gestor | `default` (amarelo) | Gestão de conteúdo e cupons |
| `admin` | Administrador | `destructive` | Controle total do sistema |

### 2.2 Matriz de Permissões Detalhada

#### Módulos de Usuário

| Funcionalidade | Gratuito | Premium | Gestor | Admin |
|----------------|----------|---------|--------|-------|
| **Planner** — Criar metas | ✅ Até 2 metas | ✅ Ilimitado | ✅ Ilimitado | ✅ |
| **Planner** — Transações | ✅ Até 10 | ✅ Ilimitado | ✅ Ilimitado | ✅ |
| **Academy** — Cursos básicos | ✅ | ✅ | ✅ | ✅ |
| **Academy** — Cursos premium | ❌ | ✅ | ✅ | ✅ |
| **Análise DNB** — Acesso | ❌ | ✅ | ✅ | ✅ |
| **Cupons** — Cupons públicos | ✅ | ✅ | ✅ | ✅ |
| **Cupons** — Cupons exclusivos | ❌ | ✅ | ✅ | ✅ |

#### Módulos Administrativos

| Funcionalidade | Gratuito | Premium | Gestor | Admin |
|----------------|----------|---------|--------|-------|
| **Dashboard Admin** | ❌ | ❌ | ❌ | ✅ |
| **Gestão de Usuários** — Visualizar | ❌ | ❌ | ✅ (somente leitura) | ✅ |
| **Gestão de Usuários** — CRUD | ❌ | ❌ | ❌ | ✅ |
| **Gestão de Conteúdo** — Visualizar | ❌ | ❌ | ✅ | ✅ |
| **Gestão de Conteúdo** — Criar/Editar | ❌ | ❌ | ✅ | ✅ |
| **Gestão de Conteúdo** — Excluir | ❌ | ❌ | ❌ | ✅ |
| **Gestão de Cupons** — Visualizar | ❌ | ❌ | ✅ | ✅ |
| **Gestão de Cupons** — Criar/Editar | ❌ | ❌ | ✅ | ✅ |
| **Gestão de Cupons** — Excluir | ❌ | ❌ | ❌ | ✅ |
| **Analytics** | ❌ | ❌ | ✅ (leitura) | ✅ |
| **Assinaturas/Faturamento** | ❌ | ❌ | ❌ | ✅ |
| **Configurações da Plataforma** | ❌ | ❌ | ❌ | ✅ |
| **Segurança & Logs** | ❌ | ❌ | ❌ | ✅ |
| **Visualizar como Usuário** | ❌ | ❌ | ✅ | ✅ |

### 2.3 Navegação por Perfil

**Gestor** terá acesso a um subconjunto das rotas admin:
- `/admin/content` — Gestão de conteúdo (Academy)
- `/admin/coupons` — Gestão de cupons
- `/admin/analytics` — Analytics (somente leitura)
- `/admin/users` — Usuários (somente leitura)

**Admin** tem acesso a tudo, incluindo:
- `/admin/dashboard` — Painel principal
- `/admin/subscriptions` — Gestão de assinaturas
- Todas as rotas do Gestor

---

## 🏗️ Fase 3 — Sistema de Assinaturas (Stripe)

### 3.1 Produtos e Preços

| Produto | ID Stripe | Preço | Ciclo | Role Atribuído |
|---------|-----------|-------|-------|----------------|
| Gratuito | — | R$ 0,00 | — | `free` |
| Premium Mensal | `prod_xxx` | R$ 29,90 | Mensal | `premium` |
| Premium Anual | `prod_yyy` | R$ 299,90 | Anual | `premium` |

> **Nota**: O role `gestor` é atribuído **manualmente** pelo Admin, **não** vinculado a assinaturas.

### 3.2 Edge Functions

| Função | Endpoint | Descrição |
|--------|----------|-----------|
| `create-checkout` | `POST` | Cria sessão de checkout do Stripe |
| `customer-portal` | `POST` | Redireciona para portal do cliente |
| `check-subscription` | `POST` | Verifica status da assinatura |
| `stripe-webhook` | `POST` (público) | Processa eventos do Stripe |

### 3.3 Fluxo de Assinatura

```
Usuário → Página de Planos → Seleciona Plano
  ↓
create-checkout (Edge Function) → Stripe Checkout Session
  ↓
Stripe → Pagamento → Webhook
  ↓
stripe-webhook (Edge Function) → Atualiza user_roles (free → premium)
  ↓
Frontend → checkSubscription() → Atualiza UI
```

### 3.4 Eventos do Webhook

| Evento Stripe | Ação no Backend |
|---------------|-----------------|
| `checkout.session.completed` | Adiciona role `premium` ao usuário |
| `customer.subscription.updated` | Verifica status e atualiza role |
| `customer.subscription.deleted` | Remove role `premium`, mantém `free` |
| `invoice.payment_failed` | Notifica usuário, mantém acesso temporário |

---

## 🏗️ Fase 4 — Migração de Dados & Frontend

### 4.1 Migrar Dados Mockados para Banco

| Módulo | Dados Mock Atual | Tabela Supabase |
|--------|------------------|-----------------|
| Academy | `src/data/mock-academy.ts` | `courses`, `modules`, `lessons` |
| Cupons | `src/data/mock-coupons.ts` | `coupons` |
| DNB | `src/data/mock-dnb.ts` | Pode manter client-side (cálculos) |
| Planner | Hooks locais | `goals`, `transactions` |

### 4.2 Atualizar Hooks

- [ ] `useAcademy.ts` → Buscar cursos do Supabase
- [ ] `useCoupons.ts` → Buscar cupons do Supabase
- [ ] `usePlanner.ts` → Persistir metas e transações no Supabase
- [ ] `useDnb.ts` → Manter client-side (cálculos puros)

### 4.3 Atualizar Componentes

- [ ] `ProtectedRoute` → Verificar roles via `has_role()`
- [ ] `Layout` (Sidebar) → Mostrar/ocultar itens baseado no role
- [ ] Páginas admin → Verificar permissões granulares do Gestor
- [ ] `Profile` → Buscar/atualizar dados do Supabase

---

## 🏗️ Fase 5 — Segurança & Testes

### 5.1 Checklist de Segurança

- [ ] Roles armazenados em tabela separada (NUNCA no perfil)
- [ ] Função `has_role()` como `SECURITY DEFINER`
- [ ] RLS habilitado em TODAS as tabelas
- [ ] Validação server-side em Edge Functions
- [ ] Webhook do Stripe com verificação de assinatura
- [ ] Sem credenciais hardcoded no frontend
- [ ] Sem verificação de admin via `localStorage`
- [ ] API keys do Stripe apenas em secrets (Edge Functions)

### 5.2 Testes End-to-End

- [ ] Fluxo de signup → login → verificação de role
- [ ] Upgrade de plano: free → premium (Stripe Checkout)
- [ ] Downgrade/cancelamento → volta para free
- [ ] Gestor: acesso a conteúdo e cupons, sem acesso a dashboard
- [ ] Admin: acesso total, atribuição de roles
- [ ] Rotas protegidas: redirecionamento correto por role

---

## 📅 Cronograma Estimado

| Fase | Duração | Dependências |
|------|---------|-------------|
| **Fase 1** — Infraestrutura & Auth | 2-3 dias | Ativação do Cloud |
| **Fase 2** — Roles & Permissões | 1-2 dias | Fase 1 |
| **Fase 3** — Stripe & Assinaturas | 2-3 dias | Fase 1 + Stripe API Key |
| **Fase 4** — Migração de Dados | 2-3 dias | Fase 1 |
| **Fase 5** — Segurança & Testes | 1-2 dias | Fases 1-4 |
| **Total** | ~8-13 dias | — |

---

## 📐 Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND (React)                  │
│                                                      │
│  AuthContext ←→ Supabase Client ←→ ProtectedRoute    │
│       ↓              ↓                    ↓          │
│  user + role    RLS queries         Role check       │
│       ↓              ↓                    ↓          │
│  UI adapta      Dados filtrados    Rota permitida    │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│              LOVABLE CLOUD (Supabase)                │
│                                                      │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │   Auth   │  │  PostgreSQL  │  │ Edge Functions │  │
│  │          │  │              │  │                │  │
│  │ - Login  │  │ - profiles   │  │ - checkout     │  │
│  │ - Signup │  │ - user_roles │  │ - portal       │  │
│  │ - OAuth  │  │ - courses    │  │ - webhook      │  │
│  │          │  │ - coupons    │  │ - check-sub    │  │
│  │          │  │ - goals      │  │                │  │
│  │          │  │ - etc.       │  │                │  │
│  └──────────┘  └──────────────┘  └───────┬───────┘  │
└──────────────────────────────────────────┼──────────┘
                                           │
                                           ▼
                                    ┌──────────────┐
                                    │    STRIPE     │
                                    │              │
                                    │ - Products   │
                                    │ - Prices     │
                                    │ - Webhooks   │
                                    │ - Portal     │
                                    └──────────────┘
```

---

## ⚠️ Decisões Importantes

1. **Roles em tabela separada**: `user_roles` nunca no `profiles` — previne privilege escalation
2. **Gestor é atribuição manual**: Apenas Admin pode promover um usuário a Gestor
3. **Um usuário pode ter múltiplos roles**: A tabela suporta isso (ex: `premium` + `gestor`)
4. **Cálculos DNB ficam client-side**: Não há necessidade de persistir no banco
5. **Webhook do Stripe gerencia roles automaticamente**: Sem intervenção manual para assinaturas

---

**Documento criado**: Fevereiro 2025  
**Status**: 📋 Planejamento  
**Próximo passo**: Ativar Lovable Cloud e iniciar Fase 1
