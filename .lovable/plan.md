

## Checkout Embutido: Stripe + PIX Inline

### Objetivo

Substituir os redirecionamentos externos por experiencias de pagamento embutidas na plataforma:
- **Stripe**: usar `@stripe/react-stripe-js` com Embedded Checkout (EmbeddedCheckoutProvider + EmbeddedCheckout)
- **PIX**: gerar QR Code via endpoint `/v1/pixQrCode/create` do AbacatePay e exibir inline

O usuario nunca sai da plataforma para pagar.

### Fluxo atual vs. novo

```text
ATUAL:
  Usuario clica "Assinar" -> Modal escolhe metodo -> Redireciona para URL externa

NOVO:
  Usuario clica "Assinar" -> Modal escolhe metodo -> Modal expande com checkout embutido
    - Cartao: formulario Stripe renderizado dentro do modal
    - PIX: QR Code + codigo copia-e-cola renderizado dentro do modal
```

### Alteracoes

**1. Instalar dependencia `@stripe/react-stripe-js`**

Adicionar o pacote `@stripe/react-stripe-js` (que inclui `@stripe/stripe-js` como peer dependency). Necessario para renderizar o Embedded Checkout do Stripe no frontend.

**2. Criar edge function `create-embedded-checkout` (nova)**

Arquivo: `supabase/functions/create-embedded-checkout/index.ts`

Semelhante a `create-checkout`, mas retorna o `client_secret` da sessao ao inves da URL:

- Autentica o usuario
- Resolve o `priceId` via `planPriceIds`
- Cria sessao Stripe com `mode: "subscription"` e `ui_mode: "embedded"`
- Configura `return_url` com `{CHECKOUT_SESSION_ID}` placeholder
- Retorna `{ clientSecret: session.client_secret }`

Registrar em `supabase/config.toml` com `verify_jwt = false`.

**3. Criar edge function `create-pix-qrcode` (nova)**

Arquivo: `supabase/functions/create-pix-qrcode/index.ts`

- Autentica o usuario
- Busca dados do perfil (CPF, telefone) na tabela `profiles`
- Busca dados do plano na tabela `plans`
- Chama `POST https://api.abacatepay.com/v1/pixQrCode/create` com o valor e dados do cliente
- Retorna `{ qrCode, qrCodeBase64, brCode, expiresAt }` para renderizacao no frontend

Registrar em `supabase/config.toml` com `verify_jwt = false`.

**4. Refatorar `PaymentMethodModal` em fluxo multi-etapa**

Arquivo: `src/components/subscription/PaymentMethodModal.tsx`

Transformar o modal em 3 estados:
- **Etapa 1 - Escolha**: botoes "Cartao" e "PIX" (igual hoje)
- **Etapa 2a - Stripe Embedded**: carrega `EmbeddedCheckoutProvider` + `EmbeddedCheckout` com o `clientSecret` obtido da nova edge function. O modal expande para acomodar o formulario.
- **Etapa 2b - PIX Inline**: exibe imagem do QR Code, codigo `brCode` para copiar, timer de expiracao e botao "Copiar codigo"

Adicionar botao "Voltar" para retornar a etapa 1.

**5. Criar componente `StripeEmbeddedCheckout`**

Arquivo: `src/components/subscription/StripeEmbeddedCheckout.tsx`

- Inicializa `loadStripe` com a chave publica do Stripe (variavel `VITE_STRIPE_PUBLISHABLE_KEY` ou hardcoded)
- Recebe `clientSecret` como prop
- Renderiza `EmbeddedCheckoutProvider` + `EmbeddedCheckout`
- Trata `onComplete` para fechar o modal, exibir toast de sucesso e disparar `checkSubscription`

**6. Criar componente `PixQrCodeCheckout`**

Arquivo: `src/components/subscription/PixQrCodeCheckout.tsx`

- Recebe `qrCode` (base64 da imagem), `brCode` (texto copiavel) e `expiresAt`
- Renderiza a imagem do QR Code centralizada
- Exibe campo com o codigo `brCode` e botao "Copiar"
- Mostra countdown de expiracao
- Polling opcional: a cada 5s chama `check-subscription` para detectar pagamento confirmado e fechar o modal automaticamente

**7. Atualizar `useSubscription` hook**

Arquivo: `src/hooks/useSubscription.ts`

- Adicionar funcao `createEmbeddedCheckout(planSlug)` que chama a nova edge function e retorna `clientSecret`
- Adicionar funcao `createPixQrCode(planSlug)` que chama a nova edge function e retorna dados do QR Code
- Manter funcoes antigas (`createCheckout`, `createPixCheckout`) como fallback

**8. Adicionar chave publica do Stripe ao frontend**

A chave publica do Stripe (pk_live_... ou pk_test_...) e necessaria no frontend para inicializar o `loadStripe`. Sera armazenada como `VITE_STRIPE_PUBLISHABLE_KEY` no `.env` ou, preferencialmente, como constante no codigo (chaves publicaveis sao seguras no frontend).

**9. Atualizar `Subscription.tsx`**

Passar as novas funcoes do hook para o `PaymentMethodModal` refatorado, de modo que ao escolher o metodo de pagamento, o modal transite para a etapa correspondente sem sair da pagina.

### Secao tecnica

**Edge function `create-embedded-checkout` (resumo):**
```typescript
const session = await stripe.checkout.sessions.create({
  customer: customerId,
  customer_email: customerId ? undefined : user.email,
  line_items: [{ price: priceId, quantity: 1 }],
  mode: "subscription",
  ui_mode: "embedded",
  return_url: `${origin}/subscription?session_id={CHECKOUT_SESSION_ID}`,
  allow_promotion_codes: true,
  metadata: { user_id: user.id, plan_id: planId },
});

return Response.json({ clientSecret: session.client_secret });
```

**Edge function `create-pix-qrcode` (resumo):**
```typescript
const response = await fetch("https://api.abacatepay.com/v1/pixQrCode/create", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    amount: plan.price_cents,
    expiresIn: 1800, // 30 minutos
    description: `Assinatura ${plan.name}`,
  }),
});

const data = await response.json();
return Response.json({
  qrCode: data.data.qrCodeBase64,
  brCode: data.data.brCode,
  expiresAt: data.data.expiresAt,
});
```

**Componente Stripe Embedded (resumo):**
```typescript
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";

const stripePromise = loadStripe("pk_live_...");

function StripeEmbeddedCheckout({ clientSecret, onComplete }) {
  return (
    <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret, onComplete }}>
      <EmbeddedCheckout />
    </EmbeddedCheckoutProvider>
  );
}
```

**Arquivos criados:**
- `supabase/functions/create-embedded-checkout/index.ts`
- `supabase/functions/create-pix-qrcode/index.ts`
- `src/components/subscription/StripeEmbeddedCheckout.tsx`
- `src/components/subscription/PixQrCodeCheckout.tsx`

**Arquivos alterados:**
- `supabase/config.toml` — registrar novas edge functions
- `src/components/subscription/PaymentMethodModal.tsx` — fluxo multi-etapa
- `src/hooks/useSubscription.ts` — novas funcoes
- `src/pages/Subscription.tsx` — integrar novas props
- `package.json` — adicionar `@stripe/react-stripe-js`

