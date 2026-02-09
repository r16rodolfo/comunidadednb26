# 🧪 Plano de Testes — Comunidade DNB

> **Versão:** 1.0  
> **Data:** 2026-02-09  
> **Objetivo:** Verificar a qualidade, segurança e funcionamento completo da plataforma Comunidade DNB antes do lançamento.

---

## 📋 Índice

1. [Estratégia de Testes](#1-estratégia-de-testes)
2. [Pré-requisitos](#2-pré-requisitos)
3. [Módulo 1 — Autenticação & Controle de Acesso](#3-módulo-1--autenticação--controle-de-acesso)
4. [Módulo 2 — Home & Navegação](#4-módulo-2--home--navegação)
5. [Módulo 3 — Planner de Compras](#5-módulo-3--planner-de-compras)
6. [Módulo 4 — Análise de Mercado](#6-módulo-4--análise-de-mercado)
7. [Módulo 5 — Cupons de Parceiros](#7-módulo-5--cupons-de-parceiros)
8. [Módulo 6 — DNB Academy](#8-módulo-6--dnb-academy)
9. [Módulo 7 — Assinaturas & Pagamentos](#9-módulo-7--assinaturas--pagamentos)
10. [Módulo 8 — Perfil do Usuário](#10-módulo-8--perfil-do-usuário)
11. [Módulo 9 — Painel Administrativo](#11-módulo-9--painel-administrativo)
12. [Módulo 10 — Segurança & RLS](#12-módulo-10--segurança--rls)
13. [Módulo 11 — Responsividade & UI](#13-módulo-11--responsividade--ui)
14. [Módulo 12 — Edge Functions & Backend](#14-módulo-12--edge-functions--backend)
15. [Checklist de Aprovação Final](#15-checklist-de-aprovação-final)

---

## 1. Estratégia de Testes

### Tipos de Teste

| Tipo | Descrição | Ferramenta |
|------|-----------|------------|
| **Manual E2E** | Testes de fluxo completo via interface | Browser (Chrome/Safari/Mobile) |
| **Segurança** | Verificação de RLS, autenticação e autorização | SQL direto + DevTools |
| **Responsividade** | Verificação em diferentes tamanhos de tela | DevTools + dispositivos reais |
| **Performance** | Tempo de carregamento e fluidez | Lighthouse + observação manual |

### Perfis de Teste Necessários

| Perfil | Role | Descrição |
|--------|------|-----------|
| **Teste Free** | `free` | Usuário recém-cadastrado, sem assinatura |
| **Teste Premium** | `premium` | Usuário com assinatura ativa |
| **Teste Gestor** | `gestor` | Curador de conteúdo e cupons |
| **Teste Admin** | `admin` | Administrador com acesso total |

### Convenção de Status

- ✅ **Passou** — Funcionalidade opera conforme esperado
- ⚠️ **Parcial** — Funciona com ressalvas ou bugs cosméticos
- ❌ **Falhou** — Funcionalidade quebrada ou com erro crítico
- ⏭️ **Não testado** — Não foi possível testar (dependência externa, etc.)

---

## 2. Pré-requisitos

Antes de iniciar os testes, garantir que:

- [ ] Existem contas de teste para os 4 perfis (free, premium, gestor, admin)
- [ ] O banco de dados tem dados de exemplo: pelo menos 1 curso publicado com módulos e aulas, 3+ cupons ativos, 2+ análises de mercado, 1+ plano ativo
- [ ] O sistema de pagamentos Stripe está configurado (modo teste)
- [ ] O ambiente está acessível via URL de preview
- [ ] Console do navegador está aberto para monitorar erros

---

## 3. Módulo 1 — Autenticação & Controle de Acesso

### 3.1 Registro de Novo Usuário

| # | Caso de Teste | Passos | Resultado Esperado | Status |
|---|---------------|--------|--------------------|--------|
| 1.1 | Registro com dados válidos | Acessar `/login` → Aba "Criar conta" → Preencher nome, email, senha → Submeter | Mensagem de confirmação exibida. Perfil criado no banco com role `free` | ⏭️ |
| 1.2 | Registro com email duplicado | Tentar registrar com email já existente | Mensagem de erro amigável: "Este e-mail já está cadastrado" | ⏭️ |
| 1.3 | Registro com senha fraca | Usar senha com menos de 6 caracteres | Validação impede o envio e mostra erro | ⏭️ |
| 1.4 | Campos obrigatórios vazios | Submeter formulário sem preencher campos | Validação no formulário impede envio | ⏭️ |

### 3.2 Login

| # | Caso de Teste | Passos | Resultado Esperado | Status |
|---|---------------|--------|--------------------|--------|
| 1.5 | Login com credenciais válidas | Inserir email e senha corretos → Submeter | Redirecionamento para Home (`/`). Nome e role visíveis no header | ⏭️ |
| 1.6 | Login com credenciais inválidas | Inserir senha errada | Mensagem de erro clara, sem expor detalhes técnicos | ⏭️ |
| 1.7 | Persistência de sessão | Fazer login → Fechar aba → Reabrir a URL | Sessão mantida, usuário permanece logado | ⏭️ |
| 1.8 | Logout | Clicar no botão de logout no header | Redirecionamento para `/login`. Sessão encerrada | ⏭️ |

### 3.3 Recuperação de Senha

| # | Caso de Teste | Passos | Resultado Esperado | Status |
|---|---------------|--------|--------------------|--------|
| 1.9 | Solicitar reset de senha | Clicar "Esqueceu a senha?" → Inserir email → Submeter | Mensagem de confirmação. Email enviado (verificar inbox) | ⏭️ |
| 1.10 | Reset com email inexistente | Inserir email não cadastrado | Mensagem genérica (sem revelar se email existe) | ⏭️ |

### 3.4 Controle de Acesso (RBAC)

| # | Caso de Teste | Passos | Resultado Esperado | Status |
|---|---------------|--------|--------------------|--------|
| 1.11 | Free acessa rota admin | Logado como `free` → Navegar para `/admin/dashboard` | Redirecionamento para `/unauthorized` | ⏭️ |
| 1.12 | Free acessa rotas públicas | Logado como `free` → Navegar por Home, Planner, Academy, Cupons, Análise, Assinatura | Todas as páginas carregam normalmente | ⏭️ |
| 1.13 | Admin acessa rotas admin | Logado como `admin` → Navegar por todas as rotas `/admin/*` | Todas as páginas carregam com dados | ⏭️ |
| 1.14 | Admin "Ver como Usuário" | Admin clica "Ver como Usuário" no header | Sidebar muda para navegação de usuário. Botão "Voltar ao Admin" visível | ⏭️ |
| 1.15 | Não autenticado acessa rota protegida | Sem login → Navegar para `/planner` | Redirecionamento para `/login` | ⏭️ |

---

## 4. Módulo 2 — Home & Navegação

| # | Caso de Teste | Passos | Resultado Esperado | Status |
|---|---------------|--------|--------------------|--------|
| 2.1 | Home carrega conteúdo dinâmico | Login → Acessar `/` | Welcome Card, Step Cards e Banners carregam do banco | ⏭️ |
| 2.2 | Navegação sidebar (Desktop) | Clicar em cada item do menu lateral | Cada link navega para a rota correta. Item ativo fica destacado | ⏭️ |
| 2.3 | Navegação sidebar (Mobile) | Em viewport mobile → Abrir menu hamburger → Navegar | Sheet abre com menu. Navegar fecha o sheet automaticamente | ⏭️ |
| 2.4 | Badge de role no header | Verificar badge ao lado do nome do usuário | Badge corresponde ao role atual (Gratuito, Premium, Gestor, Admin) | ⏭️ |
| 2.5 | Notificações (Admin) | Logado como admin → Verificar ícone de notificações no header | Ícone visível. Clicar abre lista de notificações | ⏭️ |

---

## 5. Módulo 3 — Planner de Compras

### 5.1 Meta de Viagem

| # | Caso de Teste | Passos | Resultado Esperado | Status |
|---|---------------|--------|--------------------|--------|
| 3.1 | Criar meta de viagem | Acessar `/planner` → Criar/editar meta com valor, moeda e data | Meta salva no banco. Métricas atualizam | ⏭️ |
| 3.2 | Editar meta existente | Clicar em editar meta → Alterar valores → Salvar | Dados atualizados. Métricas recalculam | ⏭️ |

### 5.2 Transações

| # | Caso de Teste | Passos | Resultado Esperado | Status |
|---|---------------|--------|--------------------|--------|
| 3.3 | Adicionar transação | Clicar "Adicionar Compra" → Preencher valor, taxa, local, data → Salvar | Transação aparece na tabela. Métricas atualizam (total comprado, taxa média) | ⏭️ |
| 3.4 | Excluir transação | Clicar no botão de excluir em uma transação | Transação removida. Métricas recalculam | ⏭️ |
| 3.5 | Isolamento de dados | Logar com outro usuário → Verificar `/planner` | Não deve ver transações/metas de outros usuários | ⏭️ |

### 5.3 Métricas e Visualização

| # | Caso de Teste | Passos | Resultado Esperado | Status |
|---|---------------|--------|--------------------|--------|
| 3.6 | Grid de métricas | Verificar cards de métricas no topo | Total comprado, taxa média, progresso e ritmo calculados corretamente | ⏭️ |
| 3.7 | Ritmo de compras | Verificar card de ritmo de compras | Indica se está adiantado/atrasado em relação à meta | ⏭️ |

---

## 6. Módulo 4 — Análise de Mercado

| # | Caso de Teste | Passos | Resultado Esperado | Status |
|---|---------------|--------|--------------------|--------|
| 4.1 | Hero com última análise | Acessar `/analise` | Hero exibe a análise mais recente com cotações USD/EUR, variações e recomendação | ⏭️ |
| 4.2 | Badge de recomendação | Verificar badge na análise | Cor corresponde ao tipo (Ideal=verde, Alerta=amarelo, etc.) | ⏭️ |
| 4.3 | Feed de análises | Scroll abaixo do hero | Lista de análises anteriores em cards | ⏭️ |
| 4.4 | Modal de detalhes | Clicar em uma análise do feed | Modal abre com análise completa: resumo, suportes/resistências, cotações | ⏭️ |
| 4.5 | Vídeo de análise | Se análise tem `video_url` → Verificar player | Player de vídeo carrega e reproduz | ⏭️ |
| 4.6 | Sem análises | Se banco estiver vazio | Mensagem amigável informando que não há análises disponíveis | ⏭️ |

---

## 7. Módulo 5 — Cupons de Parceiros

| # | Caso de Teste | Passos | Resultado Esperado | Status |
|---|---------------|--------|--------------------|--------|
| 5.1 | Listagem de cupons | Acessar `/coupons` | Grid de cupons ativos com logo, nome, título e código | ⏭️ |
| 5.2 | Filtro por categoria | Selecionar uma categoria no filtro | Apenas cupons da categoria selecionada são exibidos | ⏭️ |
| 5.3 | Busca por texto | Digitar no campo de busca | Cupons filtrados por nome/título/código | ⏭️ |
| 5.4 | Copiar código do cupom | Clicar no botão de copiar código | Código copiado para clipboard. Toast de confirmação | ⏭️ |
| 5.5 | Clique no cupom incrementa contador | Clicar em "Usar Cupom" → Verificar no banco | `click_count` incrementa via função `increment_coupon_click` | ⏭️ |
| 5.6 | Link de destino | Clicar em "Usar Cupom" | Abre `destination_url` em nova aba | ⏭️ |
| 5.7 | Cupom expirado | Se `expiration_date` < hoje | Cupom não aparece na listagem (ou aparece como expirado) | ⏭️ |

---

## 8. Módulo 6 — DNB Academy

| # | Caso de Teste | Passos | Resultado Esperado | Status |
|---|---------------|--------|--------------------|--------|
| 6.1 | Lista de cursos | Acessar `/academy` | Cursos publicados exibidos com título e descrição | ⏭️ |
| 6.2 | Navegação de módulos | Selecionar um curso → Expandir módulos | Módulos listados em ordem. Aulas dentro de cada módulo | ⏭️ |
| 6.3 | Player de vídeo | Clicar em uma aula | Player carrega com vídeo do Bunny.net (`bunny_video_id`) | ⏭️ |
| 6.4 | Marcar aula como concluída | Assistir/clicar para marcar aula concluída | `lesson_progress` atualiza. Checkbox/indicador visual muda | ⏭️ |
| 6.5 | Progresso persistente | Marcar aula → Sair → Voltar | Progresso mantido. Aulas concluídas continuam marcadas | ⏭️ |
| 6.6 | Aula gratuita vs paga | Verificar aulas com `is_free: true` vs `false` | Aulas gratuitas acessíveis por todos. Pagas requerem premium (ou exibem bloqueio) | ⏭️ |
| 6.7 | Curso não publicado | Curso com `is_published: false` | Não aparece na listagem para usuários normais | ⏭️ |

---

## 9. Módulo 7 — Assinaturas & Pagamentos

### 9.1 Página de Assinatura

| # | Caso de Teste | Passos | Resultado Esperado | Status |
|---|---------------|--------|--------------------|--------|
| 7.1 | Lista de planos | Acessar `/subscription` | Planos ativos exibidos com preço, features e badge "Popular" | ⏭️ |
| 7.2 | Plano destacado | Verificar plano com `popular: true` | Card visualmente destacado | ⏭️ |
| 7.3 | Economia exibida | Planos com `savings_percent` | Porcentagem de economia visível | ⏭️ |

### 9.2 Checkout

| # | Caso de Teste | Passos | Resultado Esperado | Status |
|---|---------------|--------|--------------------|--------|
| 7.4 | Iniciar checkout | Clicar "Assinar" em um plano | Edge function `create-checkout` chamada. URL do Stripe retornada. Nova aba abre | ⏭️ |
| 7.5 | Checkout sem login | Tentar assinar sem estar logado | Mensagem: "Faça login para assinar" | ⏭️ |

### 9.3 Gestão de Assinatura

| # | Caso de Teste | Passos | Resultado Esperado | Status |
|---|---------------|--------|--------------------|--------|
| 7.6 | Portal do cliente | Assinante ativo clica "Gerenciar Assinatura" | Edge function `customer-portal` retorna URL do Stripe. Portal abre | ⏭️ |
| 7.7 | Status de assinatura | Verificar informações exibidas na página | Plano atual, data de renovação, status corretos | ⏭️ |
| 7.8 | Cancelar downgrade | Se há downgrade pendente → Clicar "Cancelar Downgrade" | Edge function `cancel-downgrade` chamada. Estado atualiza | ⏭️ |
| 7.9 | Webhook Stripe | Completar pagamento no Stripe (modo teste) | Webhook processa. `subscribers` atualiza. Role muda para `premium` | ⏭️ |

---

## 10. Módulo 8 — Perfil do Usuário

| # | Caso de Teste | Passos | Resultado Esperado | Status |
|---|---------------|--------|--------------------|--------|
| 8.1 | Visualizar perfil | Acessar `/profile` | Nome, email, role e data de criação exibidos | ⏭️ |
| 8.2 | Editar nome | Alterar nome → Salvar | Nome atualiza no banco e no header imediatamente | ⏭️ |
| 8.3 | Editar avatar | Alterar URL do avatar → Salvar | Avatar atualiza no perfil | ⏭️ |
| 8.4 | Informações de assinatura | Verificar seção de assinatura no perfil | Plano atual e status exibidos corretamente | ⏭️ |

---

## 11. Módulo 9 — Painel Administrativo

### 11.1 Dashboard (`/admin/dashboard`)

| # | Caso de Teste | Passos | Resultado Esperado | Status |
|---|---------------|--------|--------------------|--------|
| 9.1 | Aba Visão Geral | Clicar na aba "Visão Geral" | StatCards com total de usuários, assinantes ativos, premium. Usuários recentes listados | ⏭️ |
| 9.2 | Aba Plataforma | Clicar na aba "Plataforma" | Configurações da plataforma visíveis | ⏭️ |
| 9.3 | Aba Página Inicial | Clicar na aba "Página Inicial" | Editor de Welcome Card, Step Cards e Banners | ⏭️ |
| 9.4 | Aba Faturamento | Clicar na aba "Faturamento" | Tabela de assinantes com status, plano, gateway e validade | ⏭️ |
| 9.5 | Aba Segurança | Clicar na aba "Segurança" | Informações de configuração de segurança | ⏭️ |
| 9.6 | Links rápidos | Clicar nos cards de acesso rápido na Visão Geral | Cada link navega para a rota correta | ⏭️ |

### 11.2 Gestão de Usuários (`/admin/users`)

| # | Caso de Teste | Passos | Resultado Esperado | Status |
|---|---------------|--------|--------------------|--------|
| 9.7 | Lista de usuários | Acessar `/admin/users` | Tabela com todos os usuários, roles e datas | ⏭️ |
| 9.8 | Busca de usuários | Digitar no campo de busca | Filtragem por nome/email | ⏭️ |
| 9.9 | Filtros avançados | Filtrar por role/status/plano | Lista atualiza conforme filtros | ⏭️ |
| 9.10 | Editar role do usuário | Alterar role de um usuário → Salvar | Role atualiza no banco. Badge muda | ⏭️ |

### 11.3 Gestão de Conteúdo (`/admin/content`)

| # | Caso de Teste | Passos | Resultado Esperado | Status |
|---|---------------|--------|--------------------|--------|
| 9.11 | CRUD de cursos | Criar, editar, publicar/despublicar curso | Operações refletem no banco e na Academy | ⏭️ |
| 9.12 | CRUD de módulos | Adicionar/editar módulos dentro de um curso | Módulos salvos com ordem correta | ⏭️ |
| 9.13 | CRUD de aulas | Adicionar/editar aulas com Bunny Video ID | Aulas salvas. Player funciona com o ID inserido | ⏭️ |

### 11.4 Gestão de Cupons (`/admin/coupons`)

| # | Caso de Teste | Passos | Resultado Esperado | Status |
|---|---------------|--------|--------------------|--------|
| 9.14 | CRUD de cupons | Criar, editar, ativar/desativar cupom | Operações refletem na página de cupons do usuário | ⏭️ |
| 9.15 | Gestão de categorias | Criar/editar categorias de cupons | Categorias disponíveis no filtro do usuário | ⏭️ |
| 9.16 | Estatísticas de cliques | Verificar `click_count` na listagem admin | Contadores refletem cliques reais dos usuários | ⏭️ |

### 11.5 Gestão de Análises (`/admin/analyses`)

| # | Caso de Teste | Passos | Resultado Esperado | Status |
|---|---------------|--------|--------------------|--------|
| 9.17 | Criar análise | Preencher formulário completo (cotações, recomendação, resumo, análise completa, suportes, resistências) → Salvar | Análise aparece no feed do `/analise` | ⏭️ |
| 9.18 | Editar análise | Alterar dados de análise existente → Salvar | Dados atualizados em tempo real | ⏭️ |
| 9.19 | Associar vídeo/imagem | Inserir URL de vídeo/imagem na análise | Mídia exibe corretamente no modal de detalhes | ⏭️ |

### 11.6 Analytics (`/admin/analytics`)

| # | Caso de Teste | Passos | Resultado Esperado | Status |
|---|---------------|--------|--------------------|--------|
| 9.20 | Métricas gerais | Acessar `/admin/analytics` | Total de usuários, MRR estimado, uso de features exibidos | ⏭️ |
| 9.21 | Filtro por período | Alternar entre 30d, 90d, 12m, Todos | Dados filtram corretamente. Gráficos atualizam | ⏭️ |
| 9.22 | Gráfico de crescimento | Verificar gráfico de crescimento de usuários | Barras/linhas com dados mensais corretos | ⏭️ |
| 9.23 | Distribuição de roles/planos | Verificar gráficos de distribuição | Pie/bar charts com dados corretos | ⏭️ |

### 11.7 Gestão de Assinaturas (`/admin/subscriptions`)

| # | Caso de Teste | Passos | Resultado Esperado | Status |
|---|---------------|--------|--------------------|--------|
| 9.24 | Lista de assinantes | Acessar `/admin/subscriptions` | Tabela com email, plano, status e validade | ⏭️ |
| 9.25 | Gestão de planos | Editar preço, features, status de planos | Alterações refletem na página `/subscription` | ⏭️ |
| 9.26 | StatCards corretos | Verificar contadores no topo | Total, ativos e cancelando com números corretos | ⏭️ |

### 11.8 Planner Admin (`/admin/planner`)

| # | Caso de Teste | Passos | Resultado Esperado | Status |
|---|---------------|--------|--------------------|--------|
| 9.27 | Visão geral do planner | Acessar `/admin/planner` | Métricas agregadas de todas as transações de usuários | ⏭️ |
| 9.28 | Gráficos de volume/moeda | Verificar gráficos | Dados de transações agregados corretamente | ⏭️ |

---

## 12. Módulo 10 — Segurança & RLS

### 12.1 Row Level Security

| # | Caso de Teste | Passos | Resultado Esperado | Status |
|---|---------------|--------|--------------------|--------|
| 10.1 | Profiles isolados | Logado como User A → Consultar `profiles` | Apenas o próprio perfil retornado | ⏭️ |
| 10.2 | Transações isoladas | Logado como User A → Consultar `planner_transactions` | Apenas transações próprias retornadas | ⏭️ |
| 10.3 | Metas isoladas | Logado como User A → Consultar `trip_goals` | Apenas metas próprias retornadas | ⏭️ |
| 10.4 | Notificações isoladas | Logado como User A → Consultar `notifications` | Apenas notificações próprias retornadas | ⏭️ |
| 10.5 | Progresso isolado | Logado como User A → Consultar `lesson_progress` | Apenas progresso próprio retornado | ⏭️ |
| 10.6 | Subscribers seguros | Logado como User A → Consultar `subscribers_safe` | Apenas dados próprios. Sem `stripe_customer_id` ou `stripe_subscription_id` | ⏭️ |
| 10.7 | Admin vê tudo | Logado como admin → Consultar `profiles` | Todos os perfis retornados | ⏭️ |
| 10.8 | Home config restrita | Não autenticado → Consultar `home_config` | Nenhum dado retornado (requer autenticação) | ⏭️ |

### 12.2 Proteção de Roles

| # | Caso de Teste | Passos | Resultado Esperado | Status |
|---|---------------|--------|--------------------|--------|
| 10.9 | Não-admin não altera roles | Logado como free → Tentar INSERT em `user_roles` | Operação bloqueada por RLS | ⏭️ |
| 10.10 | Função has_role segura | Verificar que `has_role` é SECURITY DEFINER | Função não permite bypass de RLS | ⏭️ |

### 12.3 Proteção de Dados Sensíveis

| # | Caso de Teste | Passos | Resultado Esperado | Status |
|---|---------------|--------|--------------------|--------|
| 10.11 | Stripe IDs ocultos | Consultar `subscribers_safe` como usuário | Campos `stripe_customer_id` e `stripe_subscription_id` ausentes | ⏭️ |
| 10.12 | Cupons sem UPDATE direto | Logado como free → Tentar UPDATE em `coupons` | Operação bloqueada. Incremento só via `increment_coupon_click()` | ⏭️ |
| 10.13 | Sem dados no console | Inspecionar console durante navegação | Nenhuma credencial, token ou dado sensível logado | ⏭️ |

---

## 13. Módulo 11 — Responsividade & UI

| # | Caso de Teste | Viewport | Resultado Esperado | Status |
|---|---------------|----------|--------------------|--------|
| 11.1 | Desktop (1920px) | 1920×1080 | Layout completo com sidebar visível. Sem overflow horizontal | ⏭️ |
| 11.2 | Laptop (1366px) | 1366×768 | Layout adapta. Sidebar visível. Conteúdo não quebra | ⏭️ |
| 11.3 | Tablet (768px) | 768×1024 | Sidebar vira hamburger menu. Tabelas com scroll horizontal | ⏭️ |
| 11.4 | Mobile (390px) | 390×844 | Menu hamburger. Cards empilhados. Texto legível sem zoom | ⏭️ |
| 11.5 | Mobile pequeno (320px) | 320×568 | Layout mínimo funcional. Sem elementos cortados | ⏭️ |
| 11.6 | Tabelas responsivas | Mobile → Página com tabela | Tabelas com scroll horizontal. Headers visíveis | ⏭️ |
| 11.7 | Modais responsivos | Mobile → Abrir qualquer modal | Modal ocupa largura adequada. Campos não cortados | ⏭️ |
| 11.8 | Gráficos responsivos | Mobile → Página com gráficos | Gráficos redimensionam. Legendas legíveis | ⏭️ |

---

## 14. Módulo 12 — Edge Functions & Backend

| # | Caso de Teste | Método | Resultado Esperado | Status |
|---|---------------|--------|--------------------|--------|
| 12.1 | `check-subscription` | GET via app | Retorna estado atual da assinatura do usuário logado | ⏭️ |
| 12.2 | `create-checkout` | POST com `planId` | Retorna URL do Stripe Checkout Session | ⏭️ |
| 12.3 | `customer-portal` | POST via app | Retorna URL do Stripe Customer Portal | ⏭️ |
| 12.4 | `cancel-downgrade` | POST com `subscriptionId` | Cancela agendamento de downgrade no Stripe | ⏭️ |
| 12.5 | `billing-check` | Execução automática/manual | Verifica assinaturas expiradas e atualiza status | ⏭️ |
| 12.6 | `stripe-webhook` | POST do Stripe | Processa eventos (checkout.completed, subscription.updated, etc.) | ⏭️ |
| 12.7 | Auth em Edge Functions | Chamar function sem token | Retorna 401 Unauthorized | ⏭️ |

---

## 15. Checklist de Aprovação Final

### Funcionalidade Core

- [ ] Registro e login funcionam corretamente
- [ ] RBAC impede acesso não autorizado a todas as rotas protegidas
- [ ] Planner salva e isola dados por usuário
- [ ] Academy reproduz vídeos e rastreia progresso
- [ ] Cupons exibem, filtram e contam cliques
- [ ] Análises de mercado exibem no feed e modal
- [ ] Assinatura cria checkout e gerencia planos
- [ ] Perfil edita e persiste dados
- [ ] Painel admin gerencia todos os módulos

### Segurança

- [ ] RLS ativa em todas as tabelas com dados de usuário
- [ ] Dados isolados entre usuários (testado com 2+ contas)
- [ ] Stripe IDs ocultos na view `subscribers_safe`
- [ ] Nenhum dado sensível exposto no console/rede
- [ ] Edge Functions protegidas por autenticação
- [ ] Leaked Password Protection habilitada

### Qualidade

- [ ] Sem erros no console durante navegação normal
- [ ] Todas as páginas carregam em menos de 3 segundos
- [ ] Feedback visual para todas as ações (loading, success, error)
- [ ] Mensagens de erro amigáveis (sem stack traces)
- [ ] Responsivo em 5 viewports testados
- [ ] Estados vazios tratados em todas as listagens

### Infraestrutura

- [ ] Webhook do Stripe configurado e processando eventos
- [ ] Edge Functions deployadas e respondendo
- [ ] Secrets configuradas (Stripe, etc.)
- [ ] Banco de dados com dados de teste adequados

---

## 📝 Registro de Execução

| Data | Testador | Módulos Testados | Bugs Encontrados | Status Geral |
|------|----------|------------------|------------------|--------------|
| _____| _________| _________________| _________________| ____________ |

---

> **Nota:** Este plano deve ser executado na seguinte ordem de prioridade:
> 1. Autenticação & RBAC (Módulo 1)
> 2. Segurança & RLS (Módulo 10)
> 3. Assinaturas & Pagamentos (Módulo 7)
> 4. Módulos de funcionalidades (3-6, 8)
> 5. Painel Administrativo (Módulo 9)
> 6. Responsividade (Módulo 11)
> 7. Edge Functions (Módulo 12)
