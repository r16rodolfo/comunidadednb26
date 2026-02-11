
## Correcao do Fluxo de Upgrade/Downgrade

### Problemas Identificados

**1. Race condition no upgrade via Stripe**
Quando o upgrade via Stripe e executado, a funcao `change-plan` atualiza o banco de dados imediatamente. Porem, o `check-subscription` (que roda a cada 10 segundos) ou o webhook do Stripe tambem atualizam o banco. Se o usuario tenta outra mudanca logo depois, o `current_plan_slug` ja esta atualizado, causando comparacoes incorretas (ex: mesmo plano vs. mesmo plano = classificado como downgrade).

**2. Upgrade silencioso sem confirmacao do Stripe**
Para upgrades via Stripe, a funcao `change-plan` executa `subscriptions.update()` diretamente no servidor. Isso cobra o cartao do usuario sem nenhuma tela de confirmacao do Stripe, o que e uma preocupacao de seguranca e UX.

**3. Sem opcao de troca de metodo de pagamento**
Um usuario que assinou via cartao nao tem opcao de trocar para PIX (e vice-versa) ao mudar de plano.

### Solucao Proposta

**Estrategia: Usar Stripe Checkout Session para upgrades em vez de `subscriptions.update()`**

Em vez de alterar a assinatura diretamente no backend, vamos criar uma nova Checkout Session do Stripe com a nova price. O Stripe cuida da proration, confirmacao de pagamento e seguranca automaticamente. Isso resolve os 3 problemas de uma vez.

### Alteracoes

**1. Refatorar `change-plan/index.ts`**

Para o caminho **Stripe upgrade**:
- Em vez de chamar `stripe.subscriptions.update()`, criar uma nova `stripe.checkout.sessions.create()` com `mode: 'subscription'` e o novo `price`
- Passar `subscription` existente para que o Stripe faca a proration automaticamente
- Retornar o `clientSecret` para embedded checkout OU a `url` do checkout
- O webhook `invoice.paid` e `subscription.updated` ja cuidam de atualizar o banco

Para o caminho **Stripe downgrade**:
- Manter a logica de `subscriptionSchedules` (agendamento para fim do periodo) -- nao precisa de pagamento

Para o caminho **PIX**:
- Manter a logica atual (QR code para upgrade, agendamento para downgrade)

**2. Atualizar `PlanChangeConfirmModal.tsx`**

Para upgrades Stripe:
- Apos clicar "Confirmar Upgrade", receber um `clientSecret` de volta
- Renderizar o `StripeEmbeddedCheckout` dentro do modal (mesmo padrao do `PaymentMethodModal`)
- O usuario ve a tela segura do Stripe, confirma os dados do cartao, e o pagamento e processado

Para downgrades (Stripe e PIX):
- Manter o fluxo atual (confirmacao simples + agendamento)

Para upgrades PIX:
- Manter o fluxo atual (preview + QR code)

**3. Adicionar opcao de metodo de pagamento para upgrades**

No modal de confirmacao de upgrade, adicionar um passo intermediario onde o usuario pode escolher:
- Cartao de Credito (Stripe Embedded Checkout)
- PIX (QR Code com valor proporcional)

Isso funciona independente de como o usuario assinou originalmente.

**4. Ajustar `preview-plan-change/index.ts`**

- Para Stripe, o preview continua mostrando os valores de proration
- Adicionar campo `paymentMethod` retornando `'stripe'` ou `'pix'` baseado no estado atual
- O frontend usa isso para saber qual fluxo apresentar, mas o usuario pode escolher outro metodo

**5. Garantir que `check-subscription` e o webhook nao conflitem**

- A funcao `change-plan` NAO atualiza mais o banco diretamente para upgrades Stripe
- O webhook `invoice.paid` faz toda a atualizacao apos o pagamento ser confirmado
- Para downgrades, a funcao continua atualizando `pending_downgrade_to` diretamente

### Fluxo Final

```text
UPGRADE (qualquer metodo de pagamento original):
  1. Usuario clica "Upgrade"
  2. Modal mostra preview de proration (valores, credito)
  3. Usuario escolhe: Cartao ou PIX
  4. Cartao: Stripe Embedded Checkout dentro do modal
     PIX: QR Code com valor proporcional
  5. Apos pagamento confirmado:
     - Webhook atualiza o banco automaticamente (Stripe)
     - Polling confirma pagamento (PIX)

DOWNGRADE (qualquer metodo):
  1. Usuario clica "Downgrade"
  2. Modal mostra informacao de agendamento
  3. Usuario confirma
  4. Stripe: subscriptionSchedule agendado
     PIX: flag no banco (pending_downgrade_to)
  5. Mudanca efetiva ao fim do periodo
```

### Arquivos Modificados

- `supabase/functions/change-plan/index.ts` -- Stripe upgrade agora retorna `clientSecret` em vez de alterar assinatura diretamente
- `supabase/functions/preview-plan-change/index.ts` -- Ajustes menores para suportar escolha de metodo
- `src/components/subscription/PlanChangeConfirmModal.tsx` -- Adicionar passo de escolha de metodo + Stripe Embedded Checkout + PIX QR Code
- `src/pages/Subscription.tsx` -- Ajustes para callbacks do novo fluxo

### Secao Tecnica

**change-plan upgrade Stripe (novo fluxo):**
```typescript
// Em vez de stripe.subscriptions.update():
const session = await stripe.checkout.sessions.create({
  customer: subscriber.stripe_customer_id,
  line_items: [{ price: newPriceId, quantity: 1 }],
  mode: 'subscription',
  ui_mode: 'embedded',
  return_url: `${origin}/subscription?session_id={CHECKOUT_SESSION_ID}`,
  allow_promotion_codes: true,
  metadata: { user_id: user.id, plan_id: newPlanSlug, type: 'upgrade' },
});

return { success: true, type: 'upgrade', clientSecret: session.client_secret };
```

**PlanChangeConfirmModal (novo fluxo upgrade):**
```text
Etapa 1: Preview de proration (valores, credito)
Etapa 2: Escolha do metodo (Cartao ou PIX)
Etapa 3a: StripeEmbeddedCheckout (se cartao)
Etapa 3b: PixQrCodeCheckout (se PIX)
```
