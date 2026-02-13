# PRD — Comunidade DNB (Dólar na Bagagem)

## 1. Visão Geral do Produto

- **Nome**: Comunidade DNB (Dólar na Bagagem)
- **Missão**: Ecossistema digital para brasileiros focado em planejamento financeiro de viagens internacionais e otimização de câmbio.
- **Público-alvo**: Brasileiros que planejam viagens internacionais e desejam comprar moeda estrangeira de forma estratégica.

---

## 2. Arquitetura Técnica

| Camada | Tecnologia |
|---|---|
| **Frontend** | React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui (Radix UI) |
| **Estado** | TanStack Query (React Query) + React Context (AuthContext) |
| **Roteamento** | React Router DOM v6 |
| **Backend** | Lovable Cloud (Supabase — PostgreSQL, Auth, Storage, Edge Functions) |
| **Pagamentos** | Stripe (cartão) + AbacatePay (PIX) |
| **Vídeos** | Bunny.net Stream (iframe) |
| **E-mails** | Resend + React Email |
| **Gráficos** | Recharts |
| **Formulários** | React Hook Form + Zod |
| **Ícones** | Lucide React |
| **Datas** | date-fns |

---

## 3. Sistema de Autenticação e RBAC

- Autenticação via Supabase Auth (email/senha com confirmação de e-mail).
- 4 níveis de acesso: `free`, `premium`, `gestor`, `admin`.
- Tabela `user_roles` separada com enum `app_role` (nunca no perfil).
- Função `has_role(_user_id, _role)` — `SECURITY DEFINER` — usada em todas as políticas RLS.
- Função `get_user_role(_user_id)` — retorna cargo respeitando hierarquia.
- Trigger `handle_new_user()` — auto-cria perfil em `profiles` + cargo `free` em `user_roles`.
- Componente `ProtectedRoute` com verificação de role no frontend.
- Funcionalidade "Ver como Usuário" para admin/gestor alternar visão.
- **Cargo efetivo**: em listagens admin, prioriza assinatura ativa (`subscribers_safe`) sobre registro estático de `user_roles`.

---

## 4. Módulos da Plataforma

### 4.1 Home (`/`)

- `WelcomeCard` configurável via painel admin.
- `PromoBanner` com banners dinâmicos (imagem, link, ordem).
- `StepCards` configuráveis (ícone, título, descrição).
- Dados carregados da tabela singleton `home_config` (leitura pública para funcionar antes do login).
- Hook: `useHomeConfig`.

### 4.2 Planner de Compras (`/planner`)

- Definição de meta de viagem: moeda alvo (`USD`, `EUR`, etc.), valor, data.
- Registro de transações de compra de câmbio (valor, taxa, local, data).
- Métricas de progresso: % concluído, média de taxa, total comprado, total pago em BRL.
- Ritmo de compras (semanal/quinzenal/mensal) com card `BuyingPaceCard`.
- Edição/exclusão de metas e transações.
- **Tabelas**: `trip_goals`, `planner_transactions`.
- **Hook**: `usePlanner`.

### 4.3 Análise de Mercado (`/analise`)

- Hero card com análise mais recente (cotações USD/EUR, variações, recomendação).
- Feed histórico com filtros: período, data específica, tipo de recomendação.
- 4 tipos de recomendação: **Momento Ideal**, **Alerta**, **Não Ideal**, **Aguardar** — cada um com estilo visual próprio (`recommendation-styles.ts`).
- Modal de detalhes: análise completa, suportes/resistências, imagem.
- Player de vídeo Bunny.net em modal (`VideoPlayerModal`).
- Acesso restrito a Premium: paywall visual com blur para usuários `free`.
- **Tabela**: `market_analyses`.
- **Hook**: `useDnb`.

### 4.4 Cursos — DNB Academy (`/academy`)

- Hierarquia: **Curso → Módulo → Aula**.
- Seletor de cursos quando há múltiplos publicados.
- Player de vídeo Bunny.net Stream (iframe com Library ID configurável via `home_config.bunny_library_id`).
- Progresso por aula: marcação manual de conclusão (`lesson_progress`).
- Controle de acesso: aulas `is_free` para gratuitos; todas para premium/admin/gestor.
- Navegação lateral com busca por título de aula.
- Invalidação de cache ao publicar conteúdo (staleTime: 30s).
- **Tabelas**: `courses`, `modules`, `lessons`, `lesson_progress`.
- **Hook**: `useAcademy`.

### 4.5 Cupons de Parceiros (`/coupons`)

- Grid de cupons com filtros: categoria, busca textual, status (ativo/expirado).
- Modal de detalhes: cópia de código, link de afiliado com `window.open(url, '_blank', 'noopener,noreferrer')`.
- Teaser premium: cupons `is_premium_only` exibidos com blur para gratuitos.
- Contador de cliques via RPC `increment_coupon_click` (verifica `is_active = true`).
- Categorias dinâmicas gerenciadas via admin.
- **Tabelas**: `coupons`, `coupon_categories`.
- **Hook**: `useCoupons`.

### 4.6 Assinatura (`/subscription`)

- Exibição de planos ativos da tabela `plans` (ordenados por `sort_order`).
- Plano gratuito + 4 planos pagos: mensal, trimestral, semestral, anual.
- **Checkout embutido** (sem redirecionamento):
  - **Cartão**: Stripe Embedded Checkout (`@stripe/react-stripe-js` com `EmbeddedCheckoutProvider`).
  - **PIX**: QR Code inline via AbacatePay (`/v1/pixQrCode/create`).
- Upgrade com proration automática (Stripe) ou cálculo proporcional (PIX).
- Downgrade agendado para fim do ciclo atual.
- Cancelamento de downgrade pendente.
- Portal do cliente Stripe para gestão de método de pagamento.
- Feedback visual: banners de sucesso/cancelamento via query params.
- **Tabelas**: `plans`, `subscribers`.
- **Hooks**: `usePlans`, `useSubscription`.

### 4.7 Perfil (`/profile`)

- 4 abas: **Perfil**, **Segurança**, **Assinatura**, **Preferências**.
- Edição de nome, email, CPF (com validação), telefone.
- Alteração de senha.
- Visualização de status de assinatura atual.
- Gestão via Customer Portal Stripe.
- **Tabela**: `profiles`.

---

## 5. Painel Administrativo

### 5.1 Dashboard (`/admin/dashboard`)

- 6 abas: **Visão Geral**, **Faturamento**, **Página Inicial**, **Plataforma**, **E-mails**, **Segurança**.
- **Visão Geral** (`OverviewTab`): métricas resumidas.
- **Faturamento** (`BillingTab`): monitoramento de assinaturas e ciclos de renovação.
- **Página Inicial** (`HomeTab`): editor de WelcomeCard, banners e StepCards.
- **Plataforma** (`PlatformTab`): configuração de branding (logo, background login via Storage bucket `platform-assets`, Bunny Library ID).
- **E-mails** (`EmailTemplatesTab`): preview em tempo real dos 10 templates transacionais com dados simulados e renderização via iframe.
- **Segurança** (`SecurityTab`): configurações de segurança.

### 5.2 Analytics (`/admin/analytics`)

- Métricas: total usuários, novos, assinantes ativos, cancelando, MRR, retenção.
- Gráficos: crescimento de usuários (`UserGrowthChart`), distribuição de cargos/planos (`DistributionCharts`), uso de features (`FeatureUsageChart`).
- Filtro por período: 30d, 90d, 12m, tudo.
- **Hook**: `useAdminAnalytics`.

### 5.3 Gestão de Usuários (`/admin/users`)

- Listagem com filtros: nome, email, cargo, status de assinatura.
- Visualização detalhada de usuário.
- Criação de usuário via Edge Function `admin-create-user`.
- Edição de cargo via Edge Function `admin-manage-user`.
- Exclusão de usuário via Edge Function `admin-manage-user`.
- Cargo efetivo calculado (prioriza `subscribers_safe.subscribed` sobre `user_roles.role`).

### 5.4 Gestão de Cursos (`/admin/content`)

- CRUD completo de cursos com modal de edição (`CourseModal`).
- Gestão de módulos e aulas: reordenação, diffing para detectar alterações.
- Publicar/despublicar cursos.
- Estatísticas: total cursos, aulas, publicados, aulas gratuitas.
- **Hook**: `useAdminAcademy`.

### 5.5 Gestão de Análises (`/admin/analyses`)

- CRUD de análises de mercado via `CreateAnalysisModal`.
- Campos: data, cotações (USD/EUR), variações, recomendação, resumo, análise completa, suportes, resistências, vídeo URL, imagem URL.
- Registro de autor e horário de edição (`edited_by_name`).
- **Hook**: `useAdminDnb`.

### 5.6 Gestão de Cupons (`/admin/coupons`)

- CRUD de cupons via `CreateCouponModal`.
- Gestão de categorias (`CategoryManagement`): adicionar, renomear, ativar/desativar, excluir.
- Filtros por categoria, status.
- Estatísticas: total, ativos, expirados, cliques.

### 5.7 Gestão de Assinaturas (`/admin/subscriptions`)

- Edição de planos: preços, features, status ativo, badge "popular", economia.
- Listagem de assinantes via view `subscribers_safe` (sem Stripe IDs).
- Estatísticas: total, ativos, cancelando.
- Card de gestão: `PlanManagementCard`.

### 5.8 Planner Admin (`/admin/planner`)

- Dados agregados de todos os usuários.
- Métricas: total usuários com metas, total metas, total transações, volume BRL, volume moeda estrangeira, taxa média ponderada.
- Gráficos: volume ao longo do tempo (`PlannerVolumeChart`), distribuição por moeda (`PlannerCurrencyChart`).
- Top locais de compra (`PlannerTopLocations`).
- **Hook**: `useAdminPlanner`.

---

## 6. Edge Functions (Backend)

| Função | Descrição |
|---|---|
| `check-subscription` | Verifica status de assinatura do usuário autenticado |
| `create-embedded-checkout` | Cria sessão Stripe Embedded Checkout para cartão |
| `create-checkout` | Cria sessão Stripe Checkout com redirecionamento (legacy) |
| `create-pix-qrcode` | Gera QR Code PIX inline via AbacatePay |
| `create-pix-checkout` | Cria checkout PIX redirect via AbacatePay (legacy) |
| `check-pix-status` | Verifica status de pagamento PIX pendente |
| `stripe-webhook` | Processa webhooks do Stripe: ativação, cancelamento, upgrade, downgrade |
| `customer-portal` | Gera URL do portal do cliente Stripe |
| `change-plan` | Processa upgrade/downgrade de plano com proration |
| `preview-plan-change` | Calcula preview de mudança de plano (valores proporcionais) |
| `cancel-downgrade` | Cancela downgrade agendado |
| `billing-check` | Motor de automação (pg_cron): downgrades automáticos, alertas de expiração |
| `send-email` | Despacho de e-mails via Resend (protegido: service_role ou admin autenticado) |
| `admin-create-user` | Criação de usuário pelo admin (com perfil e cargo) |
| `admin-manage-user` | Gestão de usuário pelo admin (editar cargo, excluir) |

**Módulos compartilhados** (`_shared/`):
- `email-sender.ts` — cliente Resend e lógica de envio.
- `email-templates.ts` — 10 templates HTML alinhados à marca.
- `plan-config.ts` — mapeamento de slugs de planos para Stripe Price IDs.

---

## 7. Banco de Dados

| Tabela/View | Tipo | Descrição |
|---|---|---|
| `profiles` | Tabela | Dados do usuário: nome, email, CPF, telefone, avatar_url |
| `user_roles` | Tabela | Cargos dos usuários (enum: `free`, `premium`, `gestor`, `admin`) |
| `plans` | Tabela | Planos de assinatura: nome, slug, preço, features, intervalo, economia |
| `subscribers` | Tabela | Dados de assinatura: Stripe IDs, status, datas, downgrade pendente |
| `subscribers_safe` | View | View segura sem Stripe IDs para listagens e analytics |
| `trip_goals` | Tabela | Metas de viagem: moeda alvo, valor, data |
| `planner_transactions` | Tabela | Transações de câmbio: valor, taxa, local, total pago |
| `courses` | Tabela | Cursos da Academy: título, descrição, publicação, ordem |
| `modules` | Tabela | Módulos dos cursos: título, descrição, ordem |
| `lessons` | Tabela | Aulas: título, vídeo Bunny ID, duração, is_free, ordem |
| `lesson_progress` | Tabela | Progresso do usuário nas aulas: conclusão |
| `market_analyses` | Tabela | Análises diárias: cotações, variações, recomendação, suportes/resistências |
| `coupons` | Tabela | Cupons de parceiros: código, URL destino, logo, premium_only, cliques |
| `coupon_categories` | Tabela | Categorias dos cupons: nome, is_active |
| `notifications` | Tabela | Notificações do sistema: título, mensagem, tipo, ação |
| `home_config` | Tabela | Configuração da página inicial (singleton): welcome_card, banners, step_cards, login_bg_url, bunny_library_id |

### Funções do Banco

| Função | Descrição |
|---|---|
| `has_role(_user_id, _role)` | Verifica se usuário possui cargo (SECURITY DEFINER, sem recursão RLS) |
| `get_user_role(_user_id)` | Retorna cargo do usuário respeitando hierarquia |
| `increment_coupon_click(coupon_id)` | Incrementa contador de cliques (verifica `is_active = true`) |
| `handle_new_user()` | Trigger: auto-cria perfil + cargo `free` ao registrar novo usuário |

---

## 8. Segurança

- **RLS ativo** em todas as tabelas sem exceção.
- Função `has_role()` com `SECURITY DEFINER` para verificação de cargos sem recursão infinita em RLS.
- Cargos armazenados em tabela separada `user_roles` — nunca no perfil.
- Edge Functions validam autenticação e cargos server-side (JWT decode + RPC `has_role`).
- Secrets gerenciados via backend (nunca expostos no frontend).
- `increment_coupon_click` verifica `is_active = true` antes de incrementar.
- `send-email` protegido: aceita apenas chamadas com `service_role` JWT ou admin autenticado.
- Links externos abertos com `window.open(url, '_blank', 'noopener,noreferrer')`.
- View `subscribers_safe` oculta Stripe IDs sensíveis em listagens.
- Políticas RLS restritivas: `profiles` visível apenas ao próprio dono (exceto admins).
- `home_config` com leitura pública para assets de login/branding.

---

## 9. Integrações Externas

| Serviço | Uso |
|---|---|
| **Stripe** | Embedded Checkout, webhooks (ativação/cancelamento/upgrade), Customer Portal, proration |
| **AbacatePay** | PIX QR Code inline, checkout PIX redirect (legacy) |
| **Bunny.net Stream** | Hospedagem de vídeos (iframe com Library ID configurável via admin) |
| **Resend** | E-mails transacionais (10 templates, remetente: `comunidade@dolarnabagagem.com.br`) |

---

## 10. Comunicação Transacional

- **10 templates de e-mail** alinhados à identidade visual "Dólar na Bagagem" (verde característico).
- **Remetente**: `comunidade@dolarnabagagem.com.br`.
- **Jornadas cobertas**:
  - Autenticação: boas-vindas, confirmação de e-mail, recuperação de senha.
  - Assinaturas: ativação, renovação, cancelamento, downgrade, expiração, alerta de vencimento.
- Preview em tempo real no painel admin (aba E-mails) com dados simulados e renderização isolada via iframe.

---

## 11. Estrutura de Arquivos

```
src/
├── components/
│   ├── academy/          # VideoPlayer, CourseNavigation
│   ├── admin/            # CourseModal, CreateAnalysisModal, CreateCouponModal, CategoryManagement, PlanManagementCard
│   │   ├── analytics/    # UserGrowthChart, DistributionCharts, FeatureUsageChart
│   │   ├── planner/      # PlannerVolumeChart, PlannerCurrencyChart, PlannerTopLocations
│   │   └── tabs/         # OverviewTab, BillingTab, HomeTab, PlatformTab, EmailTemplatesTab, SecurityTab
│   ├── auth/             # AuthPage, LoginForm, ProtectedRoute
│   ├── coupons/          # CouponCard, CouponFilters, CouponGrid, CouponModal
│   ├── dnb/              # AnalysisHero, AnalysisFeedCard, AnalysisDetailModal, VideoPlayerModal
│   ├── planner/          # MetricsGrid, TransactionTable, AddTransactionModal, EditGoalModal, BuyingPaceCard
│   ├── shared/           # PageHeader, StatCard
│   ├── subscription/     # PaymentMethodModal, PixQrCodeCheckout, StripeEmbeddedCheckout, PlanChangeConfirmModal
│   └── ui/               # shadcn/ui components
├── contexts/             # AuthContext
├── hooks/                # useAcademy, useCoupons, useDnb, usePlanner, usePlans, useSubscription, useAdminAcademy, useAdminAnalytics, useAdminDnb, useAdminPlanner, useHomeConfig, useLoginBg, useNotifications
├── lib/                  # utils, roles, recommendation-styles
├── pages/                # Index, Academy, Coupons, DnbAnalysis, Planner, Profile, Subscription, Login, NotFound, Unauthorized
│   └── admin/            # Dashboard, Analytics, Users, Content, Analyses, Coupons, Subscriptions, Planner
├── types/                # academy, admin, auth, coupons, dnb, planner
└── data/                 # defaults.ts (fallbacks)

supabase/
└── functions/
    ├── _shared/          # email-sender, email-templates, plan-config
    ├── admin-create-user/
    ├── admin-manage-user/
    ├── billing-check/
    ├── cancel-downgrade/
    ├── change-plan/
    ├── check-pix-status/
    ├── check-subscription/
    ├── create-checkout/
    ├── create-embedded-checkout/
    ├── create-pix-checkout/
    ├── create-pix-qrcode/
    ├── customer-portal/
    ├── preview-plan-change/
    ├── send-email/
    └── stripe-webhook/
```

---

**Documento atualizado**: Fevereiro 2026
**Versão**: 3.0 — Documentação completa e precisa do estado atual da plataforma
