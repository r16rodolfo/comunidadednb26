

## Fase 3 (atualizada) -- Cupons Premium com blur para usuarios gratuitos

Em vez de ocultar os cupons exclusivos, os usuarios gratuitos verao os cards com um efeito de blur no conteudo e um overlay com cadeado + CTA para assinar. Isso gera curiosidade e incentiva a conversao.

### Mudancas no banco de dados

- Adicionar coluna `is_premium_only boolean NOT NULL DEFAULT false` na tabela `coupons`
- Manter a RLS existente (todos os cupons continuam visiveis para usuarios autenticados -- a restricao e visual, nao de acesso aos dados)

### Arquivos alterados

**1. `src/types/coupons.ts`**
- Adicionar `isPremiumOnly: boolean` na interface `Coupon`
- Adicionar `isPremiumOnly?: boolean` na interface `CreateCouponData`

**2. `src/hooks/useCoupons.ts`**
- Mapear `is_premium_only` do banco para `isPremiumOnly` no objeto Coupon

**3. `src/components/coupons/CouponCard.tsx`**
- Receber nova prop `isUserPremium: boolean`
- Se `coupon.isPremiumOnly && !isUserPremium`:
  - Adicionar `overflow-hidden relative` no Card
  - Aplicar `blur-sm` nas secoes de titulo da oferta, descricao e botao (manter logo e nome do parceiro visiveis para gerar interesse)
  - Renderizar um overlay absoluto centralizado com icone de cadeado (Lock do Lucide), badge "Exclusivo Premium" e botao "Assinar para desbloquear" que redireciona para `/subscription`
  - Desabilitar o `onClick` do botao "PEGAR CUPOM"
- Se o cupom for premium (independente do usuario), exibir um badge "Premium" dourado no canto superior do card

**4. `src/components/coupons/CouponGrid.tsx`**
- Receber nova prop `isUserPremium: boolean` e repassar para cada `CouponCard`

**5. `src/pages/Coupons.tsx`**
- Importar `useSubscription` para verificar se o usuario e assinante
- Passar `isUserPremium={subscription?.subscribed}` para `CouponGrid`

**6. `src/components/admin/CreateCouponModal.tsx`**
- Adicionar toggle/switch "Cupom exclusivo Premium" no formulario

**7. `src/pages/admin/Coupons.tsx`**
- Exibir badge "Premium" na listagem admin para cupons marcados

### Efeito visual esperado

```text
+----------------------------+
|  [Logo]  Nome do Parceiro  |
|          Categoria         |
|                            |
|  ~~~~~~~~~~~~~~~~~~~~~~~~  |  <-- blur
|  ~~~ Titulo da oferta ~~~  |  <-- blur
|  ~~~ Descricao ~~~~~~~~~~~  |  <-- blur
|                            |
|     +------------------+   |
|     |  🔒 Exclusivo    |   |  <-- overlay
|     |    Premium       |   |
|     | [Assinar agora]  |   |
|     +------------------+   |
|                            |
+----------------------------+
```

O logo e nome do parceiro ficam visiveis para que o usuario saiba qual marca esta oferecendo o desconto, gerando desejo de desbloquear.
