
# 🚀 Plano de Ação — Sistema de Roles, Assinaturas & Backend

> **Projeto**: DNB (Dinheiro Não Basta)  
> **Data**: Fevereiro 2025  
> **Objetivo**: Migrar de dados mockados para um backend real com autenticação, sistema de roles (4 perfis) e integração com gateway duplo (Stripe + NoxPay) para assinaturas.

---

## 📌 Resumo Executivo

A plataforma DNB opera atualmente com dados mockados e persistência em `localStorage`. Este plano documenta a migração para um backend completo usando Lovable Cloud (Supabase), implementando:

1. **4 perfis de usuário** com permissões granulares
2. **Autenticação real** com Supabase Auth
3. **Sistema de assinaturas** com gateway duplo: **Stripe** (cartão de crédito) + **NoxPay** (PIX)
4. **Motor de faturamento interno** com carência de 3 dias para pagamentos pendentes
5. **Controle de acesso** baseado em roles com RLS

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

## 🏗️ Fase 3 — Sistema de Pagamentos (Gateway Duplo)

### 3.1 Arquitetura de Gateway Duplo

```
┌──────────────────────────────────────────────────────────────┐
│                    CHECKOUT DO USUÁRIO                        │
│                                                              │
│  ┌─────────────────┐          ┌─────────────────────┐        │
│  │  💳 Cartão de   │          │  📱 PIX             │        │
│  │  Crédito        │          │  (Pagamento          │        │
│  │  (Recorrente)   │          │   Instantâneo)       │        │
│  └────────┬────────┘          └──────────┬──────────┘        │
└───────────┼──────────────────────────────┼───────────────────┘
            │                              │
            ▼                              ▼
     ┌──────────────┐              ┌──────────────┐
     │   STRIPE     │              │   NOXPAY     │
     │              │              │              │
     │ • Checkout   │              │ • API V2     │
     │ • Recorrência│              │ • QR Code    │
     │   automática │              │ • Webhook    │
     │ • Portal     │              │              │
     └──────┬───────┘              └──────┬───────┘
            │                              │
            ▼                              ▼
     ┌─────────────────────────────────────────────┐
     │        MOTOR DE FATURAMENTO INTERNO          │
     │                                              │
     │  • Registra pagamento na tabela `payments`   │
     │  • Atualiza status da `subscription`         │
     │  • Gerencia ciclos de renovação              │
     │  • Aplica carência de 3 dias                 │
     │  • Processa downgrades automáticos           │
     └─────────────────────────────────────────────┘
```

### 3.2 Produtos e Preços

| Plano | Preço | Ciclo | Gateway(s) | Role |
|-------|-------|-------|------------|------|
| Gratuito | R$ 0,00 | — | — | `free` |
| Premium Mensal | R$ 30,00 | Mensal | Stripe / NoxPay | `premium` |
| Premium Trimestral | R$ 60,00 | Trimestral (3 meses) | Stripe / NoxPay | `premium` |
| Premium Semestral | R$ 105,00 | Semestral (6 meses) | Stripe / NoxPay | `premium` |
| Premium Anual | R$ 185,00 | Anual | Stripe / NoxPay | `premium` |

> **Nota**: O role `gestor` é atribuído **manualmente** pelo Admin, **não** vinculado a assinaturas.
> **Nota**: Os preços dos planos podem ser alterados pelo Admin no painel administrativo (/admin/subscriptions).

### 3.3 Tabelas do Sistema de Pagamentos

```sql
-- Planos disponíveis
CREATE TABLE public.plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,                        -- 'Mensal', 'Trimestral', 'Semestral', 'Anual'
    slug TEXT UNIQUE NOT NULL,                 -- 'premium-monthly', 'premium-quarterly', etc.
    price_cents INTEGER NOT NULL,              -- 3000, 6000, 10500, 18500
    currency TEXT NOT NULL DEFAULT 'BRL',
    interval TEXT NOT NULL CHECK (interval IN ('monthly', 'quarterly', 'semiannual', 'yearly')),
    interval_count INTEGER NOT NULL DEFAULT 1, -- Número de meses (1, 3, 6, 12)
    stripe_price_id TEXT,                      -- price_xxx do Stripe
    role_granted app_role NOT NULL DEFAULT 'premium',
    is_active BOOLEAN NOT NULL DEFAULT true,
    description TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    savings_percent INTEGER,                   -- Percentual de economia vs mensal
    popular BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Assinaturas ativas
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plan_id UUID REFERENCES public.plans(id) NOT NULL,
    status TEXT NOT NULL CHECK (status IN (
        'active', 'past_due', 'grace_period', 'cancelled', 'expired'
    )) DEFAULT 'active',
    gateway TEXT NOT NULL CHECK (gateway IN ('stripe', 'noxpay')),
    
    -- IDs externos
    stripe_subscription_id TEXT,               -- sub_xxx (Stripe)
    stripe_customer_id TEXT,                   -- cus_xxx (Stripe)
    noxpay_customer_id TEXT,                   -- ID do cliente NoxPay
    
    -- Ciclo de faturamento
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
    current_period_end TIMESTAMPTZ NOT NULL,
    grace_period_end TIMESTAMPTZ,              -- current_period_end + 3 dias
    
    -- Controle
    cancel_at_period_end BOOLEAN DEFAULT false,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE (user_id)  -- Um usuário = uma assinatura ativa
);

-- Histórico de pagamentos
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plan_id UUID REFERENCES public.plans(id) NOT NULL,
    
    -- Detalhes do pagamento
    amount_cents INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'BRL',
    status TEXT NOT NULL CHECK (status IN (
        'pending', 'processing', 'paid', 'failed', 'refunded', 'expired'
    )) DEFAULT 'pending',
    gateway TEXT NOT NULL CHECK (gateway IN ('stripe', 'noxpay')),
    
    -- IDs externos
    stripe_payment_intent_id TEXT,             -- pi_xxx
    stripe_invoice_id TEXT,                    -- in_xxx
    noxpay_txid TEXT,                          -- TXid do PIX
    noxpay_transaction_id TEXT,                -- ID da transação NoxPay
    
    -- PIX específico
    pix_qr_code TEXT,                          -- QR Code para pagamento
    pix_qr_code_url TEXT,                      -- URL da imagem do QR Code
    pix_expiration TIMESTAMPTZ,                -- Expiração do QR Code
    
    -- Metadados
    paid_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    failure_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Planos: leitura pública (planos ativos)
CREATE POLICY "Qualquer usuário pode ver planos ativos"
ON public.plans FOR SELECT
TO authenticated
USING (is_active = true);

-- Assinaturas: usuário vê a própria, admin vê todas
CREATE POLICY "Usuário vê própria assinatura"
ON public.subscriptions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins gerenciam todas as assinaturas"
ON public.subscriptions FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Pagamentos: usuário vê os próprios, admin vê todos
CREATE POLICY "Usuário vê próprios pagamentos"
ON public.payments FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins gerenciam todos os pagamentos"
ON public.payments FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
```

### 3.4 Edge Functions — Gateway Duplo

| Função | Método | Auth | Descrição |
|--------|--------|------|-----------|
| `create-checkout` | `POST` | ✅ | Cria sessão de checkout Stripe (cartão) |
| `create-pix-payment` | `POST` | ✅ | Gera cobrança PIX via NoxPay |
| `check-pix-status` | `POST` | ✅ | Consulta status de pagamento PIX |
| `customer-portal` | `POST` | ✅ | Redireciona para portal Stripe |
| `check-subscription` | `POST` | ✅ | Verifica status da assinatura do usuário |
| `stripe-webhook` | `POST` | ❌ (público) | Processa eventos do Stripe |
| `noxpay-webhook` | `POST` | ❌ (público) | Processa callbacks da NoxPay |
| `billing-check` | `POST` | ❌ (cron) | Verifica renovações e aplica downgrades |

### 3.5 Fluxo de Pagamento — Stripe (Cartão)

```
Usuário → Seleciona Plano → Escolhe "Cartão de Crédito"
  ↓
create-checkout → Stripe Checkout Session (com success_url e cancel_url)
  ↓
Stripe → Pagamento processado → Webhook disparado
  ↓
stripe-webhook:
  • checkout.session.completed → Cria subscription + payment + adiciona role 'premium'
  • invoice.payment_succeeded → Registra payment, renova período
  • invoice.payment_failed → Marca subscription como 'past_due', inicia carência 3 dias
  • customer.subscription.deleted → Remove role 'premium'
  ↓
Frontend → checkSubscription() → Atualiza UI
```

### 3.6 Fluxo de Pagamento — NoxPay (PIX)

```
Usuário → Seleciona Plano → Escolhe "PIX"
  ↓
create-pix-payment → NoxPay API V2 (POST /api/v2/pix/qrcode)
  ↓
Retorna QR Code + txid + expiration
  ↓
Frontend exibe QR Code → Usuário paga via app bancário
  ↓
Duas formas de confirmação:
  1. noxpay-webhook (callback da NoxPay) → Confirma pagamento
  2. Polling: check-pix-status (a cada 5s) → Consulta status via API NoxPay
  ↓
Ao confirmar pagamento:
  • Cria/atualiza subscription
  • Registra payment (status: 'paid')
  • Adiciona role 'premium' ao user_roles
  ↓
Frontend → checkSubscription() → Atualiza UI
```

### 3.7 NoxPay — Detalhes Técnicos

**API Base**: `https://api2.noxpay.io`  
**Payment Link API**: `https://paglink.noxpay.io`  
**Autenticação**: Header `api-key: {NOXPAY_API_KEY}`

**Endpoints utilizados:**

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/v2/pix/qrcode` | `POST` | Gera cobrança PIX (QR Code) |
| `/api/v2/pix/qrcode/{txid}` | `GET` | Consulta status do pagamento |
| `/api/v2/pix/qrcode/{txid}` | `DELETE` | Cancela cobrança PIX |

**Payload de criação (PIX):**
```json
{
  "value": 29.90,
  "webhook_url": "https://<project>.supabase.co/functions/v1/noxpay-webhook",
  "external_id": "sub_user123_monthly_20250207",
  "payer": {
    "name": "João Silva",
    "document": "12345678900"
  }
}
```

**Validação de Webhook:**
```typescript
// Validar X-Signature header
const signature = req.headers.get('X-Signature');
const payload = await req.text();
const expectedSignature = btoa(
  String.fromCharCode(
    ...new Uint8Array(
      await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(payload + NOXPAY_SECRET)
      )
    )
  )
);
const isValid = signature === expectedSignature;
```

### 3.8 Motor de Faturamento — Carência de 3 Dias

O motor de faturamento é executado via **cron job** (`billing-check`) e gerencia o ciclo de vida das assinaturas:

```
┌─────────────────────────────────────────────────────────┐
│              CICLO DE VIDA DA ASSINATURA                 │
│                                                          │
│  ACTIVE ──────────────────────────────────────────────── │
│    │   (período ativo, pagamento em dia)                 │
│    │                                                     │
│    ▼ (vencimento do período)                             │
│  PAST_DUE ───────────────────────────────────────────── │
│    │   (tentativa de cobrança falhou)                    │
│    │   → Stripe: retry automático                        │
│    │   → NoxPay: gera novo QR Code PIX                   │
│    │   → Notifica usuário via e-mail/app                 │
│    │                                                     │
│    ▼ (inicia carência de 3 dias)                         │
│  GRACE_PERIOD ───────────────────────────────────────── │
│    │   (3 dias para regularizar)                         │
│    │   → Usuário mantém acesso premium                   │
│    │   → Banner de alerta no app                         │
│    │   → Notificações diárias                            │
│    │                                                     │
│    ├── Pagou? → volta para ACTIVE ✅                     │
│    │                                                     │
│    ▼ (3 dias expirados sem pagamento)                    │
│  EXPIRED ────────────────────────────────────────────── │
│    │   → Remove role 'premium'                           │
│    │   → Adiciona role 'free'                            │
│    │   → Cancela assinatura nos gateways                 │
│    │   → Notifica usuário do downgrade                   │
│    │                                                     │
│  CANCELLED ──────────────────────────────────────────── │
│      (cancelamento voluntário pelo usuário)              │
│      → Mantém acesso até current_period_end              │
│      → Depois: mesmo fluxo de EXPIRED                    │
└─────────────────────────────────────────────────────────┘
```

**Lógica do Cron Job (`billing-check`):**

```
A cada 1 hora:

1. Buscar assinaturas com status 'active' e current_period_end < now()
   → Marcar como 'past_due'
   → Definir grace_period_end = now() + 3 dias
   → Se gateway = 'noxpay': gerar novo QR Code PIX
   → Se gateway = 'stripe': Stripe faz retry automático

2. Buscar assinaturas com status 'grace_period' e grace_period_end < now()
   → Marcar como 'expired'
   → Remover role 'premium' do user_roles
   → Garantir role 'free' está presente
   → Cancelar no gateway (Stripe: cancel subscription / NoxPay: nada)

3. Buscar assinaturas com cancel_at_period_end = true e current_period_end < now()
   → Marcar como 'cancelled' → 'expired'
   → Mesmo fluxo de downgrade acima
```

### 3.9 Secrets Necessários

| Secret | Descrição | Usado em |
|--------|-----------|----------|
| `STRIPE_SECRET_KEY` | Chave secreta do Stripe | Edge Functions (checkout, webhook, portal) |
| `STRIPE_WEBHOOK_SECRET` | Secret do endpoint de webhook Stripe | `stripe-webhook` |
| `NOXPAY_API_KEY` | API Key da NoxPay | Edge Functions (PIX) |
| `NOXPAY_SECRET` | Secret para validação de webhook | `noxpay-webhook` |

### 3.10 Componentes Frontend — Checkout

```
┌─────────────────────────────────────────────────┐
│           PÁGINA DE ASSINATURA                   │
│                                                  │
│  ┌────────────────┐  ┌────────────────────────┐  │
│  │  Plano Mensal   │  │  Plano Anual          │  │
│  │  R$ 29,90/mês   │  │  R$ 299,90/ano        │  │
│  │                 │  │  (economia de 16%)     │  │
│  │  [Assinar]      │  │  [Assinar]             │  │
│  └────────────────┘  └────────────────────────┘  │
│                                                  │
│  Ao clicar "Assinar":                            │
│                                                  │
│  ┌──────────────────────────────────────────────┐│
│  │  SELETOR DE MÉTODO DE PAGAMENTO              ││
│  │                                              ││
│  │  ┌──────────────┐  ┌─────────────────────┐  ││
│  │  │ 💳 Cartão    │  │ 📱 PIX              │  ││
│  │  │ de Crédito   │  │ Pagamento            │  ││
│  │  │              │  │ Instantâneo          │  ││
│  │  │ Recorrência  │  │                      │  ││
│  │  │ automática   │  │ Renovação manual     │  ││
│  │  │              │  │ (lembrete por email)  │  ││
│  │  └──────────────┘  └─────────────────────┘  ││
│  └──────────────────────────────────────────────┘│
│                                                  │
│  Se PIX selecionado:                             │
│                                                  │
│  ┌──────────────────────────────────────────────┐│
│  │  CHECKOUT PIX                                ││
│  │                                              ││
│  │  ┌──────────────────┐                        ││
│  │  │                  │  Escaneie o QR Code    ││
│  │  │   [QR CODE]      │  com o app do seu      ││
│  │  │                  │  banco                  ││
│  │  └──────────────────┘                        ││
│  │                                              ││
│  │  Ou copie o código:                          ││
│  │  ┌──────────────────────────────┐            ││
│  │  │ 00020126580014br.gov...     │ [Copiar]   ││
│  │  └──────────────────────────────┘            ││
│  │                                              ││
│  │  ⏰ Expira em: 29:45                        ││
│  │  🔄 Verificando pagamento...                ││
│  │                                              ││
│  │  Status: ⏳ Aguardando pagamento             ││
│  └──────────────────────────────────────────────┘│
└─────────────────────────────────────────────────┘
```

**Componentes a criar:**
- `PaymentMethodSelector` — Escolha entre Cartão e PIX
- `PixCheckout` — Exibe QR Code, código copia-e-cola, timer de expiração
- `PixStatusPolling` — Hook que faz polling do status a cada 5s
- `SubscriptionStatus` — Badge mostrando status atual da assinatura
- `GracePeriodBanner` — Banner de alerta quando em carência

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
- [ ] Webhook do Stripe com verificação de assinatura (`stripe-webhook-secret`)
- [ ] Webhook da NoxPay com verificação de `X-Signature` (SHA256)
- [ ] Sem credenciais hardcoded no frontend
- [ ] Sem verificação de admin via `localStorage`
- [ ] API keys (Stripe + NoxPay) apenas em secrets (Edge Functions)
- [ ] Carência de 3 dias implementada server-side (não no frontend)

### 5.2 Testes End-to-End

- [ ] Fluxo de signup → login → verificação de role
- [ ] Upgrade via Stripe: free → premium (Checkout cartão)
- [ ] Upgrade via NoxPay: free → premium (PIX)
- [ ] Renovação automática (Stripe) e manual (NoxPay/PIX)
- [ ] Fluxo de carência: past_due → grace_period → expired → downgrade
- [ ] Cancelamento voluntário → mantém acesso até fim do período
- [ ] Gestor: acesso a conteúdo e cupons, sem acesso a dashboard financeiro
- [ ] Admin: acesso total, atribuição de roles
- [ ] Rotas protegidas: redirecionamento correto por role

---

## 📅 Cronograma Estimado

| Fase | Duração | Dependências |
|------|---------|-------------|
| **Fase 1** — Infraestrutura & Auth | 2-3 dias | Ativação do Cloud |
| **Fase 2** — Roles & Permissões | 1-2 dias | Fase 1 |
| **Fase 3** — Gateway Duplo (Stripe + NoxPay) | 3-5 dias | Fase 1 + API Keys |
| **Fase 4** — Migração de Dados | 2-3 dias | Fase 1 |
| **Fase 5** — Segurança & Testes | 1-2 dias | Fases 1-4 |
| **Total** | ~9-15 dias | — |

---

## 📐 Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                       FRONTEND (React)                           │
│                                                                  │
│  AuthContext ←→ Supabase Client ←→ ProtectedRoute                │
│       ↓              ↓                    ↓                      │
│  user + role    RLS queries         Role check                   │
│       ↓              ↓                    ↓                      │
│  UI adapta      Dados filtrados    Rota permitida                │
│                                                                  │
│  PaymentMethodSelector → PixCheckout (QR) / Stripe Checkout      │
│  GracePeriodBanner → Alerta de carência (3 dias)                 │
│  SubscriptionStatus → Badge com status atual                     │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                   LOVABLE CLOUD (Supabase)                       │
│                                                                  │
│  ┌──────────┐  ┌──────────────────┐  ┌────────────────────────┐ │
│  │   Auth   │  │    PostgreSQL    │  │    Edge Functions      │ │
│  │          │  │                  │  │                        │ │
│  │ - Login  │  │ - profiles       │  │ - create-checkout      │ │
│  │ - Signup │  │ - user_roles     │  │ - create-pix-payment   │ │
│  │ - OAuth  │  │ - plans          │  │ - check-pix-status     │ │
│  │          │  │ - subscriptions  │  │ - customer-portal      │ │
│  │          │  │ - payments       │  │ - check-subscription   │ │
│  │          │  │ - courses        │  │ - stripe-webhook       │ │
│  │          │  │ - coupons        │  │ - noxpay-webhook       │ │
│  │          │  │ - goals          │  │ - billing-check (cron) │ │
│  └──────────┘  └──────────────────┘  └─────────┬──────────────┘ │
└──────────────────────────────────────────────── ┼───────────────┘
                                                  │
                            ┌─────────────────────┴───────────────┐
                            │                                     │
                            ▼                                     ▼
                     ┌──────────────┐                      ┌──────────────┐
                     │    STRIPE    │                      │   NOXPAY     │
                     │              │                      │              │
                     │ • Checkout   │                      │ • PIX API V2 │
                     │ • Recorrência│                      │ • QR Code    │
                     │ • Portal     │                      │ • Webhook    │
                     │ • Webhooks   │                      │              │
                     └──────────────┘                      └──────────────┘
```

---

## ⚠️ Decisões Importantes

1. **Roles em tabela separada**: `user_roles` nunca no `profiles` — previne privilege escalation
2. **Gestor é atribuição manual**: Apenas Admin pode promover um usuário a Gestor
3. **Um usuário pode ter múltiplos roles**: A tabela suporta isso (ex: `premium` + `gestor`)
4. **Cálculos DNB ficam client-side**: Não há necessidade de persistir no banco
5. **Webhook do Stripe gerencia roles automaticamente**: Sem intervenção manual para assinaturas
6. **Gateway duplo**: Stripe para cartão (recorrência automática) + NoxPay para PIX (renovação via cron)
7. **Carência de 3 dias**: Aplica-se a ambos os gateways antes do downgrade automático
8. **PIX não tem recorrência nativa**: O motor de faturamento gera novas cobranças e notifica o usuário
9. **Stripe é fonte de verdade para cartão**: O Stripe gerencia a recorrência, nosso backend sincroniza
10. **NoxPay requer CPF**: O checkout PIX deve coletar nome e CPF do pagador

---

## 🔎 Auditoria de Código — Fevereiro 2026

### Status Atual de Implementação

| Componente | Status | Observações |
|------------|--------|-------------|
| **Lovable Cloud** | ✅ Ativo | Backend configurado e operacional |
| **Auth (email/senha)** | ✅ Produção | Login, signup, reset de senha, RBAC real |
| **Tabelas base** | ✅ Criadas | `profiles`, `user_roles`, `subscribers` com RLS |
| **Tabela `plans`** | ✅ Banco | Migrado de localStorage para PostgreSQL |
| **Tabela `home_config`** | ✅ Banco | Migrado de localStorage, singleton com RLS |
| **Tabelas `trip_goals` / `planner_transactions`** | ✅ Banco | Planner migrado para dados persistentes por usuário |
| **Stripe (cartão)** | ✅ Produção | 4 produtos/preços criados, checkout funcional |
| **Edge Functions** | ✅ Deployed | `create-checkout`, `check-subscription`, `customer-portal`, `cancel-downgrade`, `stripe-webhook` |
| **Price ID centralizado** | ✅ Feito | `_shared/plan-config.ts` com mapeamento slug↔price |
| **Troca de senha** | ✅ Real | `supabase.auth.updateUser()` implementado no Profile |
| **NoxPay (PIX)** | ❌ Pendente | Credenciais e edge functions não implementadas |
| **Academy** | ✅ Banco | Tabelas `courses`, `modules`, `lessons`, `lesson_progress` com RLS |
| **Cupons** | ✅ Banco | Tabelas `coupons`, `coupon_categories` com RLS + RPC `increment_coupon_click` |
| **Análise DNB** | ✅ Banco | Tabela `market_analyses` com RLS + admin/gestor CRUD |
| **Notificações** | ✅ Banco | Tabela `notifications` com RLS + Realtime + hook persistente |
| **Motor de Faturamento (cron)** | ❌ Pendente | `billing-check` não implementado |

### ⚠️ Problema Crítico Identificado

**Trigger `on_auth_user_created` ausente no banco de dados.**
A função `handle_new_user()` existe, mas o trigger que a dispara ao criar um novo usuário **não está ativo**. Isso significa que novos cadastros podem não receber automaticamente o perfil e o role `free`. O usuário admin foi criado manualmente via edge function temporária, contornando este problema.

**Ação necessária:** Recriar o trigger:
```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

### Etapas de Correção — Status Atualizado

```
ETAPA 1 — Bugs Críticos (P0) ✅ CONCLUÍDA
├── ✅ 1.1 Fix useAcademy useState → useEffect (corrigido)
├── ✅ 1.2 Implementar troca de senha real no Profile (supabase.auth.updateUser)
├── ✅ 1.3 Unificar estado de assinatura (subscription removido de UserProfile)
├── ✅ 1.4 Conectar useSubscription ao Profile.tsx aba Assinatura
└── ✅ 1.5 Remover checkSubscription vazio do AuthContext

ETAPA 2 — Limpeza de Código Morto (P1) ✅ CONCLUÍDA
├── ✅ 2.1 Deletar mock-auth.ts
├── ✅ 2.2 Remover signInWithGoogle do AuthContext
├── ✅ 2.3 Limpar UserProfile.subscription type
└── ⏳ 2.4 Atualizar Stripe SDK nas edge functions (verificar versão atual)

ETAPA 3 — Infraestrutura de Dados (P1) ✅ CONCLUÍDA
├── ✅ 3.1 Criar tabela plans no banco (5 planos seedados com RLS)
├── ✅ 3.2 Centralizar mapeamento de price IDs (_shared/plan-config.ts)
├── ✅ 3.3 Migrar usePlans para ler do banco (React Query)
└── ✅ 3.4 Migrar useHomeConfig para banco (tabela home_config)

ETAPA 4 — Migração de Módulos (P1-P2) ✅ CONCLUÍDA (5/5)
├── ✅ 4.1 Academy → tabelas courses/modules/lessons/lesson_progress (migrado + admin CRUD)
├── ✅ 4.2 Cupons → tabelas coupons/coupon_categories (migrado + admin CRUD + RPC clicks)
├── ✅ 4.3 Planner → tabelas trip_goals/planner_transactions (migrado)
├── ✅ 4.4 Análise DNB → tabela market_analyses (migrado + admin CRUD)
└── ✅ 4.5 Notificações → tabela notifications (persistente + Realtime)

ETAPA 5 — Integração NoxPay (P1) ❌ PENDENTE
├── ❌ 5.1 Configurar credenciais NoxPay
├── ❌ 5.2 Edge function create-pix-payment
├── ❌ 5.3 Edge function noxpay-webhook
├── ❌ 5.4 Modal PIX no frontend
└── ❌ 5.5 Motor de faturamento (billing-check cron)

ETAPA 6 — Qualidade & Polish (P2) ❌ PENDENTE
├── ❌ 6.1 Substituir cores hardcoded por tokens semânticos
├── ❌ 6.2 Extrair localStorage do render do Layout
├── ❌ 6.3 Simplificar useCoupons (remover estado duplicado)
└── ❌ 6.4 Testes end-to-end
```

### 🛠️ Ação Urgente: Recriar Trigger de Signup

O trigger `on_auth_user_created` está ausente. Sem ele, novos usuários não recebem perfil nem role automaticamente. Deve ser recriado antes de qualquer novo cadastro.

---

**Documento criado**: Fevereiro 2025  
**Última atualização**: 8 de Fevereiro de 2026, 19:45 (BRT)  
**Status**: ✅ Etapas 1-4 Concluídas — Próxima: Etapa 5 (NoxPay)  
**Próximo passo**: Iniciar Etapa 5 — Integração NoxPay (PIX)
