

## Corrigir precos do PIX para usar valores do banco de dados

### Problema identificado

Os precos usados no pagamento PIX estao **hardcoded** no arquivo `plan-config.ts` e nao correspondem aos valores configurados pelo admin em `/admin/subscriptions`.

Valores no banco (configurados pelo admin):
- Mensal: R$ 30,00 (3000 centavos)
- Trimestral: R$ 60,00 (6000 centavos)
- Semestral: R$ 105,00 (10500 centavos)
- Anual: R$ 185,00 (18500 centavos)

Valores hardcoded no `plan-config.ts`:
- Mensal: R$ 29,90 (2990 centavos)
- Trimestral: R$ 74,90 (7490 centavos)
- Semestral: R$ 139,90 (13990 centavos)
- Anual: R$ 249,90 (24990 centavos)

Alem disso, a API do AbacatePay esta funcionando corretamente segundo a documentacao oficial. A estrutura da resposta e `{ data: { url: "..." } }`, que ja esta coberta pelo codigo atual. Se a URL ainda esta vindo vazia, pode ser um problema com a chave de API (modo dev vs producao).

### Plano de correcao

**Alterar `supabase/functions/create-pix-checkout/index.ts`**

Em vez de usar o mapeamento hardcoded `planPricesBRL`, a edge function deve buscar o preco diretamente da tabela `plans` no banco de dados, usando o `slug` do plano. Isso garante que qualquer alteracao feita pelo admin em `/admin/subscriptions` seja refletida automaticamente no pagamento PIX.

Mudancas:
1. Remover o import de `planPricesBRL`
2. Criar um cliente Supabase com a service role key para acessar a tabela `plans`
3. Buscar o plano pelo slug na tabela `plans` (campos: `name`, `price_cents`, `slug`)
4. Usar `price_cents` do banco como valor do produto enviado ao AbacatePay
5. Usar `name` do banco como nome do produto

**Manter `plan-config.ts` inalterado** — o mapeamento `planPricesBRL` pode ser removido futuramente, mas por ora basta nao usa-lo na edge function de PIX.

### Secao tecnica

Trecho principal da alteracao na edge function:

```typescript
// Antes: usa hardcoded
const planInfo = planPricesBRL[planId];

// Depois: busca do banco
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

const { data: plan, error: planError } = await supabaseAdmin
  .from("plans")
  .select("name, price_cents, slug")
  .eq("slug", planId)
  .eq("is_active", true)
  .single();

if (planError || !plan) throw new Error(`Plan not found: ${planId}`);
```

E no body da requisicao ao AbacatePay:

```typescript
products: [{
  externalId: plan.slug,
  name: plan.name,
  description: `Assinatura ${plan.name}`,
  quantity: 1,
  price: plan.price_cents,
}],
```

### Arquivos alterados

- `supabase/functions/create-pix-checkout/index.ts` — buscar preco do banco em vez de usar hardcoded
