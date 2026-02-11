

## Upgrade e Downgrade com Proration via Stripe

### Contexto

Todos os planos sao "Premium" com intervalos diferentes (mensal, trimestral, semestral, anual). O Stripe oferece proration nativo via `stripe.subscriptions.update()`, eliminando a necessidade de calculos manuais.

### Estrategia de negocios

```text
UPGRADE (plano mais barato -> mais caro):
  - Mudanca imediata
  - Stripe calcula credito pelo tempo nao usado do plano atual
  - Cobra a diferenca proporcional do novo plano
  - Usuario recebe acesso imediato ao novo ciclo

DOWNGRADE (plano mais caro -> mais barato):
  - Mudanca agendada para o fim do periodo atual
  - Usuario mantem acesso ate o fim do que ja pagou
  - Na renovacao, o novo plano (mais barato) entra em vigor
  - Credito do valor restante e aplicado automaticamente

CANCELAMENTO:
  - Acesso mantido ate o fim do periodo pago
  - Sem reembolso parcial
```

### Exemplo pratico

Um usuario assina o **Trimestral** (R$60/3 meses = R$20/mes). Apos 1 mes, quer fazer **upgrade para Anual** (R$185/ano = ~R$15,42/mes):

1. Stripe calcula credito: 2 meses restantes = ~R$40 de credito
2. Stripe calcula custo proporcional do Anual para o periodo restante
3. Cobra a diferenca (novo custo - credito)
4. Novo ciclo anual comeca imediatamente

### Alteracoes necessarias

**1. Criar edge function `change-plan` (nova)**

Arquivo: `supabase/functions/change-plan/index.ts`

Logica central:
- Recebe `newPlanSlug` do frontend
- Autentica o usuario e busca seu `stripe_subscription_id` na tabela `subscribers`
- Recupera a assinatura atual do Stripe
- Compara `sort_order` dos planos para determinar se e upgrade ou downgrade
- **Upgrade**: chama `stripe.subscriptions.update()` com `proration_behavior: 'always_invoice'` para cobrar imediatamente
- **Downgrade**: cria um `subscriptionSchedule` para agendar a mudanca no fim do periodo, usando `stripe.subscriptionSchedules.create()` a partir da assinatura existente
- Atualiza a tabela `subscribers` com o novo estado (ou `pending_downgrade_to` para downgrades)
- Retorna `{ success, type: 'upgrade' | 'downgrade', prorationAmount?, effectiveDate? }`

**2. Criar edge function `preview-plan-change` (nova)**

Arquivo: `supabase/functions/preview-plan-change/index.ts`

Antes de confirmar a mudanca, mostrar ao usuario quanto sera cobrado/creditado:
- Recebe `newPlanSlug` do frontend
- Chama `stripe.invoices.createPreview()` com os itens da assinatura atual e os novos, usando `subscription_proration_behavior`
- Retorna `{ amountDue, credit, effectiveDate, newPlanName }` para exibicao no frontend

**3. Atualizar o frontend: adicionar modal de confirmacao**

Criar componente `PlanChangeConfirmModal` em `src/components/subscription/PlanChangeConfirmModal.tsx`:
- Ao clicar em "Upgrade" ou "Downgrade", abre um modal com:
  - Nome do plano atual e do novo plano
  - Para upgrades: valor a ser cobrado agora (proration preview)
  - Para downgrades: data em que a mudanca entrara em vigor
  - Botao "Confirmar mudanca" e "Cancelar"

**4. Atualizar `Subscription.tsx`**

- Alterar o `handlePlanClick` para diferenciar entre:
  - Nova assinatura (sem plano ativo): abre `PaymentMethodModal` como hoje
  - Mudanca de plano (ja assinante): abre `PlanChangeConfirmModal` com preview
- Integrar chamadas a `preview-plan-change` e `change-plan`

**5. Atualizar `useSubscription.ts`**

Adicionar funcoes:
- `previewPlanChange(newPlanSlug)`: chama `preview-plan-change` e retorna dados do preview
- `changePlan(newPlanSlug)`: chama `change-plan` e atualiza o estado

**6. Atualizar webhook `stripe-webhook/index.ts`**

O webhook ja trata `customer.subscription.updated` e detecta schedules pendentes. Verificar que o fluxo de upgrade (mudanca imediata de price) atualiza corretamente o `current_plan_slug` e `subscription_tier` na tabela `subscribers`.

**7. Registrar novas edge functions em `config.toml`**

Adicionar:
```toml
[functions.change-plan]
verify_jwt = false

[functions.preview-plan-change]
verify_jwt = false
```

### Secao tecnica

**Edge function `change-plan` (logica principal):**
```typescript
// Determinar tipo de mudanca
const currentSortOrder = planSortOrders[currentPlanSlug];
const newSortOrder = planSortOrders[newPlanSlug];
const isUpgrade = newSortOrder > currentSortOrder;

if (isUpgrade) {
  // Upgrade: mudanca imediata com cobranca proporcional
  await stripe.subscriptions.update(subscriptionId, {
    items: [{ id: subscriptionItemId, price: newPriceId }],
    proration_behavior: 'always_invoice',
  });
} else {
  // Downgrade: agendar para o fim do periodo
  const schedule = await stripe.subscriptionSchedules.create({
    from_subscription: subscriptionId,
  });
  await stripe.subscriptionSchedules.update(schedule.id, {
    phases: [
      { // Fase atual
        items: [{ price: currentPriceId, quantity: 1 }],
        start_date: schedule.phases[0].start_date,
        end_date: schedule.phases[0].end_date,
      },
      { // Proxima fase (downgrade)
        items: [{ price: newPriceId, quantity: 1 }],
        iterations: 1,
      },
    ],
  });
}
```

**Edge function `preview-plan-change` (logica principal):**
```typescript
const preview = await stripe.invoices.createPreview({
  customer: customerId,
  subscription: subscriptionId,
  subscription_items: [{ id: subscriptionItemId, price: newPriceId }],
  subscription_proration_behavior: 'always_invoice',
});

return {
  amountDue: preview.amount_due, // em centavos
  credit: preview.lines.data
    .filter(l => l.amount < 0)
    .reduce((sum, l) => sum + l.amount, 0),
  total: preview.total,
  currency: preview.currency,
};
```

**Arquivos criados:**
- `supabase/functions/change-plan/index.ts`
- `supabase/functions/preview-plan-change/index.ts`
- `src/components/subscription/PlanChangeConfirmModal.tsx`

**Arquivos alterados:**
- `supabase/config.toml` -- registrar novas edge functions
- `src/hooks/useSubscription.ts` -- novas funcoes `previewPlanChange` e `changePlan`
- `src/pages/Subscription.tsx` -- integrar fluxo de mudanca de plano
- `supabase/functions/_shared/plan-config.ts` -- adicionar mapa de sort_order para uso no backend

