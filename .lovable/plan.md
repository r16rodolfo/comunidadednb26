

## Pagamento via PIX com AbacatePay

### Contexto

Atualmente, todo o fluxo de pagamento usa Stripe Checkout (cartao). A proposta e adicionar PIX como opcao de pagamento via AbacatePay, apresentando ao usuario um modal para escolher entre Cartao (Stripe) ou PIX (AbacatePay) antes de ser redirecionado.

### API do AbacatePay - Resumo

- **Endpoint**: `POST https://api.abacatepay.com/v1/billing/create`
- **Autenticacao**: `Bearer <ABACATEPAY_API_KEY>`
- **Metodo de pagamento**: `methods: ["PIX"]`
- **Preco**: em centavos (ex: 2990 = R$29,90)
- **Resposta**: retorna `{ data: { url: "https://pay.abacatepay.com/..." } }` - URL de pagamento hospedada pelo AbacatePay
- **Campos obrigatorios**: frequency, methods, products, returnUrl, completionUrl
- **Dados do cliente**: pode enviar inline (name, email, cellphone, taxId) ou customerId existente

### Fluxo proposto

```text
Usuario clica "Assinar"
        |
        v
  +---------------------+
  | Modal: Como pagar?  |
  |                     |
  | [Cartao de Credito] |  --> Stripe Checkout (fluxo atual)
  | [PIX]               |  --> AbacatePay billing URL
  +---------------------+
        |
        v
  Redirecionado para pagina de pagamento externa
        |
        v
  Retorna para /subscription?success=true (ou cancelled)
```

### Alteracoes necessarias

**1. Secret: ABACATEPAY_API_KEY**
- Solicitar ao usuario a chave de API do AbacatePay via ferramenta de secrets
- A chave sera acessivel nas Edge Functions via `Deno.env.get("ABACATEPAY_API_KEY")`

**2. Nova Edge Function: `create-pix-checkout`**
- Arquivo: `supabase/functions/create-pix-checkout/index.ts`
- Autentica o usuario via token JWT
- Busca o plano solicitado em `plan-config.ts` (reutiliza o mapeamento de precos)
- Chama `POST https://api.abacatepay.com/v1/billing/create` com:
  - `frequency: "ONE_TIME"` (pagamento unico por periodo)
  - `methods: ["PIX"]`
  - `products`: nome e preco do plano selecionado
  - `returnUrl`: URL de cancelamento
  - `completionUrl`: URL de sucesso (`/subscription?success=true&method=pix`)
  - `customer`: dados do usuario (name, email)
  - `metadata`: user_id e plan_id para reconciliacao
- Retorna a URL de pagamento do AbacatePay

**3. Nova Edge Function: `abacatepay-webhook`** (fase futura)
- Para confirmar pagamentos automaticamente, sera necessario um webhook do AbacatePay
- Por ora, o fluxo pode usar polling ou confirmacao manual pelo admin
- Documentacao de webhooks do AbacatePay precisa ser verificada para implementacao completa

**4. Atualizar `_shared/plan-config.ts`**
- Adicionar mapeamento de precos em centavos (BRL) para cada plano, para uso com AbacatePay
- Exemplo: `planPricesBRL: { 'premium-monthly': 2990, 'premium-quarterly': 7490, ... }`

**5. Novo componente: `PaymentMethodModal`**
- Arquivo: `src/components/subscription/PaymentMethodModal.tsx`
- Modal usando Dialog do Shadcn/UI
- Duas opcoes de pagamento apresentadas como cards clicaveis:
  - **Cartao de Credito**: icone de cartao, descricao "Visa, Mastercard, etc.", chama `createCheckout()` (Stripe)
  - **PIX**: icone PIX, descricao "Pagamento instantaneo", chama nova funcao `createPixCheckout()`
- Props: `open`, `onOpenChange`, `planSlug`, `onSelectStripe`, `onSelectPix`
- Loading state individual para cada botao

**6. Atualizar `src/hooks/useSubscription.ts`**
- Adicionar funcao `createPixCheckout(planSlug: string)` similar a `createCheckout`
- Chama a edge function `create-pix-checkout`
- Abre a URL retornada em nova aba
- Adicionar state `isPixCheckoutLoading`

**7. Atualizar `src/pages/Subscription.tsx`**
- Em vez de chamar `createCheckout(plan.slug)` diretamente no botao, abrir o `PaymentMethodModal`
- Guardar o `selectedPlanSlug` no state ao clicar
- Passar callbacks para o modal que delegam para Stripe ou PIX
- Tratar parametro `method=pix` na URL de retorno para feedback especifico

### Secao tecnica

**Estrutura da requisicao para AbacatePay:**
```json
{
  "frequency": "ONE_TIME",
  "methods": ["PIX"],
  "products": [{
    "externalId": "premium-monthly",
    "name": "Premium Mensal",
    "description": "Assinatura Premium Mensal",
    "quantity": 1,
    "price": 2990
  }],
  "returnUrl": "https://app.example.com/subscription?cancelled=true",
  "completionUrl": "https://app.example.com/subscription?success=true&method=pix",
  "customer": {
    "name": "Nome do Usuario",
    "email": "user@example.com"
  },
  "metadata": {
    "user_id": "uuid-do-usuario",
    "plan_id": "premium-monthly"
  }
}
```

**Resposta esperada:**
```json
{
  "data": {
    "id": "bill_123456",
    "url": "https://pay.abacatepay.com/bill-5678",
    "status": "PENDING"
  }
}
```

### Limitacao importante

O AbacatePay nao tem assinaturas recorrentes nativas como o Stripe. O PIX funcionara como pagamento unico por periodo. A confirmacao do pagamento e ativacao da assinatura no banco precisara de um webhook do AbacatePay ou verificacao manual. Na primeira versao, o admin podera confirmar manualmente, e o webhook sera implementado em uma fase posterior apos verificar a documentacao completa de webhooks.

### Configuracao no `supabase/config.toml`

```toml
[functions.create-pix-checkout]
verify_jwt = false
```

