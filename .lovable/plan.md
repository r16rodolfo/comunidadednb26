

# Gerar PRD.md Atualizado e Completo

## Objetivo
Substituir o arquivo `PRD.md` existente (desatualizado, ainda referencia modulos removidos como "Calculadora Financeira" e "Panda Video") por um documento completo e preciso que reflita o estado atual da plataforma "Dolar na Bagagem / Comunidade DNB".

## Estrutura do Novo PRD.md

O documento sera organizado nas seguintes secoes:

### 1. Visao Geral do Produto
- Nome: Comunidade DNB (Dolar na Bagagem)
- Missao: ecossistema digital para brasileiros focado em planejamento financeiro de viagens internacionais e otimizacao de cambio
- Publico-alvo: brasileiros que planejam viagens internacionais

### 2. Arquitetura Tecnica
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui (Radix UI)
- **Estado**: TanStack Query (React Query) + React Context (AuthContext)
- **Roteamento**: React Router DOM v6
- **Backend**: Lovable Cloud (Supabase - PostgreSQL, Auth, Storage, Edge Functions)
- **Pagamentos**: Stripe (cartao) + AbacatePay (PIX)
- **Videos**: Bunny.net Stream (iframe)
- **E-mails**: Resend + React Email
- **Graficos**: Recharts
- **Formularios**: React Hook Form + Zod

### 3. Sistema de Autenticacao e RBAC
- Autenticacao via Supabase Auth (email/senha com confirmacao)
- 4 niveis de acesso: `free`, `premium`, `gestor`, `admin`
- Tabela `user_roles` separada com enum `app_role`
- Funcao `has_role()` (SECURITY DEFINER) para RLS
- Funcao `get_user_role()` para hierarquia de cargos
- Trigger `handle_new_user()` para auto-criacao de perfil + cargo `free`
- ProtectedRoute com verificacao de role
- "Ver como Usuario" para admin/gestor

### 4. Modulos da Plataforma

#### 4.1 Home (/)
- WelcomeCard configuravel via admin
- PromoBanner com banners dinamicos
- StepCards configuravies
- Dados carregados da tabela `home_config`

#### 4.2 Planner de Compras (/planner)
- Definicao de meta de viagem (moeda alvo, valor, data)
- Registro de transacoes de compra de cambio
- Metricas de progresso (% concluido, media de taxa, total comprado)
- Ritmo de compras (semanal/quinzenal/mensal)
- Tabelas: `trip_goals`, `planner_transactions`

#### 4.3 Analise de Mercado (/analise)
- Hero card com analise mais recente (cotacoes USD/EUR, recomendacao)
- Historico com filtros (periodo, data especifica, recomendacao)
- 4 tipos de recomendacao: Momento Ideal, Alerta, Nao Ideal, Aguardar
- Modal de detalhes com analise completa, suportes/resistencias
- Player de video Bunny.net (modal)
- Acesso restrito a Premium (paywall visual para free)
- Tabela: `market_analyses`

#### 4.4 Cursos - DNB Academy (/academy)
- Hierarquia: Curso > Modulo > Aula
- Seletor de cursos quando ha multiplos
- Player de video Bunny.net Stream (iframe)
- Progresso por aula (marcacao manual)
- Controle de acesso: aulas `is_free` para gratuitos, todas para premium/admin/gestor
- Navegacao lateral com busca
- Tabelas: `courses`, `modules`, `lessons`, `lesson_progress`

#### 4.5 Cupons de Parceiros (/coupons)
- Grid de cupons com filtros (categoria, busca, status)
- Modal de detalhes com copia de codigo e link de afiliado
- Teaser premium: cupons `is_premium_only` com blur para gratuitos
- Contador de cliques via RPC `increment_coupon_click`
- Categorias dinamicas
- Tabelas: `coupons`, `coupon_categories`

#### 4.6 Assinatura (/subscription)
- Exibicao de planos ativos da tabela `plans`
- Plano gratuito + 4 planos pagos (mensal, trimestral, semestral, anual)
- Checkout embutido: Stripe Embedded Checkout (cartao) ou QR Code PIX inline (AbacatePay)
- Upgrade com proration automatica (Stripe) ou calculo proporcional (PIX)
- Downgrade agendado para fim do ciclo
- Cancelamento de downgrade
- Portal do cliente Stripe
- Feedback visual (banners sucesso/cancelamento)

#### 4.7 Perfil (/profile)
- 4 abas: Perfil, Seguranca, Assinatura, Preferencias
- Edicao de nome, email, CPF (com validacao), telefone
- Alteracao de senha
- Visualizacao de status de assinatura
- Gestao via Customer Portal Stripe

### 5. Painel Administrativo

#### 5.1 Dashboard (/admin/dashboard)
- 6 abas: Visao Geral, Faturamento, Pagina Inicial, Plataforma, E-mails, Seguranca
- Configuracao de branding (logo, background login, Bunny Library ID)
- Editor da Pagina Inicial (WelcomeCard, banners, StepCards)
- Preview de templates de e-mail transacionais
- Monitoramento de faturamento

#### 5.2 Analytics (/admin/analytics)
- Metricas: total usuarios, novos, assinantes ativos, cancelando, MRR, retencao
- Graficos: crescimento de usuarios, distribuicao de cargos/planos, uso de features
- Filtro por periodo (30d, 90d, 12m, tudo)

#### 5.3 Gestao de Usuarios (/admin/users)
- Listagem com filtros (nome, email, cargo, assinatura)
- Visualizacao detalhada de usuario
- Criacao de usuario (via Edge Function `admin-create-user`)
- Edicao de cargo (via Edge Function `admin-manage-user`)
- Exclusao de usuario
- Cargo efetivo calculado (prioriza assinatura ativa)

#### 5.4 Gestao de Cursos (/admin/content)
- CRUD completo de cursos com modal de edicao
- Gestao de modulos e aulas (drag & reorder, diffing)
- Publicar/despublicar cursos
- Estatisticas: total cursos, aulas, publicados, aulas gratuitas

#### 5.5 Gestao de Analises (/admin/analyses)
- CRUD de analises de mercado
- Campos: data, cotacoes, variacoes, recomendacao, resumo, analise completa, suportes, resistencias, video, imagem
- Autor e horario de edicao

#### 5.6 Gestao de Cupons (/admin/coupons)
- CRUD de cupons com categorias
- Gestao de categorias (adicionar, renomear, ativar/desativar, excluir)
- Filtros por categoria, status
- Estatisticas: total, ativos, expirados, cliques

#### 5.7 Gestao de Assinaturas (/admin/subscriptions)
- Edicao de planos (precos, features, status)
- Listagem de assinantes via view `subscribers_safe`
- Estatisticas: total, ativos, cancelando

#### 5.8 Planner Admin (/admin/planner)
- Dados agregados de todos os usuarios
- Metricas: usuarios, metas, transacoes, volume BRL/estrangeiro, taxa media
- Graficos: volume ao longo do tempo, distribuicao por moeda
- Top locais de compra

### 6. Edge Functions (Backend)

| Funcao | Descricao |
|---|---|
| `check-subscription` | Verifica status de assinatura do usuario autenticado |
| `create-embedded-checkout` | Cria sessao Stripe Embedded Checkout |
| `create-checkout` | Cria sessao Stripe Checkout (legacy redirect) |
| `create-pix-qrcode` | Gera QR Code PIX via AbacatePay |
| `create-pix-checkout` | Cria checkout PIX redirect (legacy) |
| `check-pix-status` | Verifica status de pagamento PIX |
| `stripe-webhook` | Processa webhooks do Stripe (ativacao, cancelamento, upgrade) |
| `customer-portal` | Gera URL do portal do cliente Stripe |
| `change-plan` | Processa upgrade/downgrade de plano |
| `preview-plan-change` | Calcula preview de mudanca de plano (proration) |
| `cancel-downgrade` | Cancela downgrade agendado |
| `billing-check` | Motor de automacao (pg_cron): downgrades automaticos, alertas de expiracao |
| `send-email` | Despacho de e-mails via Resend (protegido: service_role ou admin) |
| `admin-create-user` | Criacao de usuario pelo admin |
| `admin-manage-user` | Gestao de usuario pelo admin (editar cargo, excluir) |

### 7. Banco de Dados

| Tabela | Descricao |
|---|---|
| `profiles` | Dados do usuario (nome, email, cpf, telefone, avatar) |
| `user_roles` | Cargos dos usuarios (enum: free, premium, gestor, admin) |
| `plans` | Planos de assinatura (precos, features, intervalos) |
| `subscribers` | Dados de assinatura (Stripe IDs, status, datas) |
| `subscribers_safe` | View segura sem Stripe IDs para listagens |
| `trip_goals` | Metas de viagem dos usuarios |
| `planner_transactions` | Transacoes de compra de cambio |
| `courses` | Cursos da Academy |
| `modules` | Modulos dos cursos |
| `lessons` | Aulas dos modulos |
| `lesson_progress` | Progresso do usuario nas aulas |
| `market_analyses` | Analises diarias do mercado cambial |
| `coupons` | Cupons de parceiros |
| `coupon_categories` | Categorias dos cupons |
| `notifications` | Notificacoes do sistema |
| `home_config` | Configuracao da pagina inicial (singleton) |

### 8. Seguranca
- RLS ativo em todas as tabelas
- Funcao `has_role()` SECURITY DEFINER para verificacao de cargos sem recursao
- Roles armazenados em tabela separada (nunca no perfil)
- Edge Functions validam autenticacao e cargos server-side
- Secrets gerenciados via backend (nunca expostos no frontend)
- `increment_coupon_click` verifica `is_active = true`
- `send-email` protegido (service_role ou admin autenticado)
- `window.open` com `noopener,noreferrer`

### 9. Integracoes Externas
- **Stripe**: checkout, webhooks, customer portal, proration
- **AbacatePay**: PIX QR Code, checkout PIX
- **Bunny.net Stream**: hospedagem de videos (iframe com Library ID configuravel)
- **Resend**: e-mails transacionais (10 templates)

### 10. Comunicacao Transacional
- 10 templates de e-mail alinhados a marca
- Remetente: comunidade@dolarnabagagem.com.br
- Jornadas cobertas: autenticacao, assinaturas
- Preview em tempo real no painel admin

## Mudanca Planejada
- Substituir o conteudo completo do arquivo `PRD.md` por este documento atualizado e preciso

