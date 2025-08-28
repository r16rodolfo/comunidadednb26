
# DNB (Dinheiro Não Basta) - Product Requirements Document

## Visão Geral do Produto

O **DNB (Dinheiro Não Basta)** é uma plataforma digital integrada focada em educação financeira e planejamento de viagens. O produto combina ferramentas de planejamento financeiro, educação através de conteúdo e uma experiência de descoberta de produtos para maximizar o valor das viagens.

### Missão
Democratizar o acesso a experiências de viagem através de educação financeira, planejamento inteligente e descoberta de oportunidades.

### Visão
Tornar-se a principal plataforma de referência para brasileiros que desejam viajar mais e melhor, combinando educação financeira com planejamento de viagens.

## Arquitetura do Sistema

### Stack Tecnológico
- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **UI Framework**: shadcn/ui com Radix UI
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Pagamentos**: Stripe
- **Deploy**: Lovable Platform
- **Gerenciamento de Estado**: Tanstack Query, React Context
- **Roteamento**: React Router DOM

### Estrutura de Módulos

```
DNB Platform
├── 🏠 Home (Landing Page)
├── 📊 Análise DNB (Calculadora Financeira)
├── 💰 Planner (Planejamento de Compras)
├── ✈️ Travel Planner (Planejamento de Viagens)
├── 🎓 Academy (Educação)
├── 🛍️ Achadinhos (Marketplace de Produtos)
└── 👤 Perfil & Subscrição
```

## Funcionalidades Implementadas

### 🏠 1. Landing Page & Layout
**Status**: ✅ Implementado
- Design responsivo com hero section
- Cards de ações rápidas
- Banner promocional
- Sistema de navegação lateral
- Integração com sistema de autenticação

### 📊 2. Análise DNB (Calculadora Financeira)
**Status**: ✅ Implementado
- **Funcionalidades**:
  - Calculadora de viabilidade financeira para viagens
  - Comparação USD vs EUR
  - Análise de perfil de compra (econômico, conforto, luxo)
  - Recomendações personalizadas baseadas em renda
  - Visualização gráfica dos resultados
- **Componentes**:
  - `DnbCalculator`: Formulário principal
  - `DnbResults`: Exibição de resultados
  - Gráficos com Recharts

### 💰 3. Planner (Planejamento de Compras)
**Status**: ✅ Implementado
- **Funcionalidades**:
  - Definição de metas de viagem
  - Tracking de compras de moeda
  - Cálculo de pace de compras (semanal, quinzenal, mensal)
  - Métricas de progresso
  - Histórico de transações
- **Componentes**:
  - `MetricsGrid`: Dashboard de métricas
  - `BuyingPaceCard`: Sugestões de ritmo
  - `TransactionTable`: Histórico
  - `AddTransactionModal`: Adicionar compras
  - `EditGoalModal`: Editar metas

### ✈️ 4. Travel Planner (Planejamento de Viagens)
**Status**: 🚧 Em Desenvolvimento (70% completo)

#### 4.1 Formulário de Criação de Planos ✅
- Seleção de destino principal e secundários
- Datas de viagem com calendário
- Perfil do viajante (solo, casal, família, amigos)
- Motivo da viagem (lazer, negócios, compras, híbrido)
- Estilo de viagem (econômico, conforto, luxo)
- Interesses principais (até 3)
- Transporte entre cidades

#### 4.2 Dashboard de Viagem ✅
- Visão geral do plano
- Métricas da viagem (dias restantes, duração)
- Cards de módulos (roteiro, logística, eventos, guias, clima)
- Sistema de monitoramento "Roteiro Vivo"
- Geração de PDF checklist

#### 4.3 Módulo Roteiro Dia a Dia ✅
- **Funcionalidades Implementadas**:
  - Roteiro cronológico detalhado
  - Horários específicos para cada atividade
  - Dicas de transporte e custos
  - Pontos instagramáveis
  - Sugestões de restaurantes
  - Hacks locais
  - Informações de trilhas e atividades

#### 4.4 Módulos Pendentes 🚧
- **Logística e Transporte** (não implementado)
- **Calendário de Eventos** (não implementado)  
- **Guias e Dicas** (não implementado)
- **Clima e Bagagem** (não implementado)

### 🎓 5. Academy (Educação)
**Status**: ✅ Implementado
- **Funcionalidades**:
  - Cursos estruturados com módulos
  - Player de vídeo integrado
  - Sistema de progresso
  - Navegação entre aulas
  - Controle de acesso baseado em subscrição
- **Integração**: Panda Video API

### 🛍️6. Achadinhos (Marketplace)
**Status**: ✅ Implementado
- **Funcionalidades**:
  - Grid de produtos com filtros
  - Categorias (eletrônicos, moda, casa, etc.)
  - Sistema de busca
  - Modal de detalhes do produto
  - Links de afiliados
  - Versão pública sem autenticação
- **Gestão**: Interface para managers adicionarem produtos

### 👤 7. Sistema de Autenticação & Perfis
**Status**: ✅ Implementado
- **Funcionalidades**:
  - Login/Registro via Supabase Auth
  - Perfis de usuário
  - Sistema de roles (user, manager, admin)
  - Rotas protegidas
- **Tipos de Usuário**:
  - **User**: Acesso básico às ferramentas
  - **Manager**: Gestão de conteúdo (Academy, Achadinhos)
  - **Admin**: Controle total do sistema

### 💳 8. Sistema de Subscrições
**Status**: ✅ Implementado
- **Funcionalidades**:
  - Integração com Stripe
  - Planos de assinatura
  - Portal do cliente
  - Controle de acesso baseado em plano
- **Edge Functions**: Webhook handlers para Stripe

## Backlog & Roadmap

### 🎯 Fase Atual: Travel Planner Enhancement
**Estimativa**: 2-3 semanas

#### Alta Prioridade
1. **Módulo Logística e Transporte**
   - Rotas de carro com custos detalhados
   - Informações de transporte público
   - Mapas integrados
   - Cálculo de pedágios e combustível

2. **Módulo Calendário de Eventos**
   - Integração com APIs de eventos locais
   - Festivais, shows, exposições
   - Sistema de compra de ingressos
   - Alertas personalizados

3. **Módulo Guias e Dicas**
   - Gastronomia local
   - Hacks de viagem
   - Alertas de segurança
   - Shopping guides
   - Cultura local

4. **Módulo Clima e Bagagem**
   - Previsão do tempo detalhada
   - Dados históricos climáticos
   - Checklist de bagagem inteligente
   - Recomendações de vestuário

#### Média Prioridade
5. **Sistema de Notificações Push**
   - Alertas do Roteiro Vivo
   - Lembretes de viagem
   - Atualizações de eventos

6. **Geração de PDF Avançada**
   - Checklist completo da viagem
   - Roteiro imprimível
   - Documentos de viagem

### 🚀 Roadmap Futuro (3-6 meses)

#### Q1 2024
1. **Mobile App (PWA)**
   - Versão mobile otimizada
   - Funcionalidades offline
   - Notificações push nativas

2. **Integração com APIs Externas**
   - Google Maps API
   - Booking.com API
   - Skyscanner API
   - APIs de clima avançadas

3. **AI/ML Features**
   - Recomendações personalizadas
   - Otimização automática de roteiros
   - Chatbot para suporte

#### Q2 2024
4. **Social Features**
   - Compartilhamento de roteiros
   - Reviews e avaliações
   - Comunidade de viajantes

5. **Marketplace Expansion**
   - Mais categorias de produtos
   - Sistema de reviews
   - Programa de afiliados avançado

6. **Advanced Analytics**
   - Dashboard de métricas
   - Relatórios de uso
   - Analytics de conversão

## Changelog Detalhado

### Sprint 1: Foundation (Semana 1)
**Commits Principais:**
- ✅ Setup inicial do projeto com Vite + React + TypeScript
- ✅ Configuração do Tailwind CSS e shadcn/ui
- ✅ Estrutura de layout e navegação
- ✅ Sistema de rotas com React Router
- ✅ Landing page com hero section e cards

### Sprint 2: Authentication & Core (Semana 2)
**Commits Principais:**
- ✅ Integração com Supabase Auth
- ✅ Sistema de roles e permissões
- ✅ Context de autenticação
- ✅ Rotas protegidas
- ✅ Páginas de login e perfil

### Sprint 3: Financial Tools (Semana 3)
**Commits Principais:**
- ✅ Implementação da Análise DNB
- ✅ Calculadora de viabilidade financeira
- ✅ Comparador USD vs EUR
- ✅ Gráficos e visualizações
- ✅ Sistema de recomendações

### Sprint 4: Planner Module (Semana 4)
**Commits Principais:**
- ✅ Criação do módulo Planner
- ✅ Definição de metas de viagem
- ✅ Sistema de tracking de compras
- ✅ Cálculo de pace de compras
- ✅ Dashboard de métricas
- ✅ Histórico de transações

### Sprint 5: Academy & Content (Semana 5)
**Commits Principais:**
- ✅ Módulo Academy com cursos
- ✅ Integração com Panda Video
- ✅ Player de vídeo customizado
- ✅ Sistema de progresso
- ✅ Navegação entre aulas
- ✅ Interface de gestão para managers

### Sprint 6: Marketplace (Semana 6)
**Commits Principais:**
- ✅ Módulo Achadinhos
- ✅ Grid de produtos com filtros
- ✅ Sistema de categorias
- ✅ Modal de detalhes
- ✅ Versão pública
- ✅ Interface de gestão de produtos

### Sprint 7: Subscriptions & Payments (Semana 7)
**Commits Principais:**
- ✅ Integração com Stripe
- ✅ Sistema de planos de assinatura
- ✅ Edge Functions para webhooks
- ✅ Portal do cliente
- ✅ Controle de acesso baseado em plano

### Sprint 8: Travel Planner Foundation (Semana 8)
**Commits Principais:**
- ✅ Estrutura base do Travel Planner
- ✅ Formulário de criação de planos
- ✅ Tipos TypeScript para viagens
- ✅ Sistema de persistência local
- ✅ Hook useTravel para gerenciamento de estado

### Sprint 9: Travel Dashboard (Semana 9)
**Commits Principais:**
- ✅ Dashboard principal de viagem
- ✅ Cards de resumo da viagem
- ✅ Módulos de navegação
- ✅ Sistema de monitoramento "Roteiro Vivo"
- ✅ Integração com geração de relatórios

### Sprint 10: Itinerary Module (Semana 10 - Atual)
**Commits Principais:**
- ✅ Módulo Roteiro Dia a Dia
- ✅ Estrutura cronológica detalhada
- ✅ Sistema de horários e atividades
- ✅ Dicas e hacks locais
- ✅ Pontos instagramáveis
- ✅ Correção de bugs de navegação

## Métricas e KPIs

### Métricas Técnicas
- **Performance**: Loading < 2s
- **SEO**: Score > 90
- **Acessibilidade**: WCAG 2.1 AA
- **Mobile**: 100% responsivo
- **Uptime**: 99.9%

### Métricas de Produto (Futuras)
- **User Acquisition**: CAC, LTV
- **Engagement**: DAU, MAU, Session Duration
- **Conversion**: Free → Paid, Feature Adoption
- **Retention**: Day 1, Day 7, Day 30

## Arquivos e Estrutura Técnica

### Hooks Principais
- `useTravel.ts`: Gerenciamento de planos de viagem (241 linhas)
- `usePlanner.ts`: Planejamento financeiro
- `useAcademy.ts`: Sistema de cursos
- `useAchadinhos.ts`: Marketplace
- `useDnb.ts`: Análise financeira

### Componentes Principais
- `TravelPlanForm.tsx`: Formulário de criação (334 linhas)
- `TravelDashboard.tsx`: Dashboard principal (247 linhas)
- `ItineraryModule.tsx`: Roteiro detalhado
- `Layout.tsx`: Layout principal com navegação

### Types & Interfaces
- `travel.ts`: Definições para sistema de viagens
- `planner.ts`: Types para planejamento financeiro
- `academy.ts`: Estruturas de cursos
- `auth.ts`: Sistema de autenticação

## Issues Conhecidos

### Bugs Atuais
1. ~~Calendar is not defined (RESOLVIDO)~~
2. ~~Página em branco no Roteiro Dia a Dia (RESOLVIDO)~~

### Melhorias Técnicas Pendentes
1. **Refatoração de Arquivos Grandes**:
   - `useTravel.ts` (241 linhas) → Quebrar em hooks menores
   - `TravelPlanForm.tsx` (334 linhas) → Componentes focados
   - `TravelDashboard.tsx` (247 linhas) → Módulos separados

2. **Performance**:
   - Implementar lazy loading para módulos
   - Otimização de imagens
   - Code splitting avançado

3. **Testes**:
   - Implementar testes unitários
   - Testes de integração
   - E2E testing

## Próximos Passos Imediatos

1. **Completar Travel Planner** (Próximas 2 semanas)
   - Implementar módulos restantes
   - Melhorar UX/UI
   - Testes completos

2. **Otimizações de Performance** (1 semana)
   - Refatoração de componentes grandes
   - Lazy loading
   - Otimização de bundle

3. **Deploy em Produção** (1 semana)
   - Configuração de domínio custom
   - Monitoramento de erros
   - Analytics

---

**Documento criado em**: Dezembro 2024  
**Última atualização**: Sprint 10 - Itinerary Module  
**Próxima revisão**: Após completar Travel Planner modules  
**Responsável**: Equipe DNB Platform
