
## Remover pop-up de cupom e usar campo nativo do Stripe

O Stripe Checkout ja tem suporte nativo para codigos promocionais via `allow_promotion_codes: true`, que ja esta configurado no backend quando nenhum cupom e enviado. O pop-up intermediario e redundante.

### Mudancas

**1. `src/pages/Subscription.tsx`**
- Remover o estado `couponCode` e `checkoutPlanSlug`
- Remover o componente `Dialog` de cupom (linhas 397-435)
- Remover import de `Tag` do lucide-react
- Remover imports de `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter`
- Alterar o `onClick` dos botoes de plano para chamar `createCheckout(plan.slug)` diretamente, sem abrir modal

**2. `src/hooks/useSubscription.ts`**
- Remover o parametro `couponCode` da funcao `createCheckout` (ja que o cupom sera inserido diretamente no Stripe Checkout)

**3. `supabase/functions/create-checkout/index.ts`**
- Remover toda a logica de lookup de `couponCode` / `promotionCode`
- Sempre usar `allow_promotion_codes: true` para que o campo de cupom apareca nativamente no Stripe Checkout
- Remover `couponCode` do body parsing

### Resultado
O usuario clica em "Assinar" e vai direto para o Stripe Checkout, onde pode inserir o cupom de desconto no campo nativo do Stripe — sem etapas intermediarias.
