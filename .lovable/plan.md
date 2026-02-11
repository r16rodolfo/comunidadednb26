
## Corrigir o fluxo de pagamento PIX que nao abre a pagina de pagamento

### Problema identificado

A edge function `create-pix-checkout` retorna status 200 mas com `{ url: undefined }`. Nos logs aparece `AbacatePay billing created - {}`, indicando que os campos `data.id` e `data.url` nao existem na resposta real da API. O frontend recebe `{ url: undefined }` e como o hook so abre nova aba quando `data?.url` e verdadeiro, nada acontece.

### Causa raiz

A resposta do AbacatePay provavelmente tem uma estrutura diferente da esperada (`data.url`). Como nao conseguimos acessar a documentacao oficial do endpoint de billing, precisamos logar a resposta completa da API para descobrir a estrutura correta.

### Plano de correcao (2 passos)

**Passo 1: Logar a resposta completa da API**

No arquivo `supabase/functions/create-pix-checkout/index.ts`, linha 99, alterar o log para incluir toda a resposta:

```typescript
// Antes (so loga id e url, que sao undefined):
logStep("AbacatePay billing created", { id: abacateData.data?.id, url: abacateData.data?.url });

// Depois (loga resposta completa):
logStep("AbacatePay billing created", abacateData);
```

**Passo 2: Extrair a URL correta da resposta**

Alterar a linha 102 para tentar caminhos alternativos para a URL:

```typescript
const paymentUrl = abacateData?.data?.url || abacateData?.url || abacateData?.data?.payment_url;

if (!paymentUrl) {
  logStep("ERROR: No payment URL found in response", abacateData);
  throw new Error("AbacatePay did not return a payment URL");
}

return new Response(
  JSON.stringify({ url: paymentUrl }),
  { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
);
```

Isso garante que:
1. Se a URL nao for encontrada, retornamos erro 500 (em vez de 200 com url vazia)
2. O log completo nos permite ver a estrutura real e ajustar o caminho correto
3. O frontend mostrara a mensagem de erro do toast em vez de falhar silenciosamente

### Arquivo alterado

- `supabase/functions/create-pix-checkout/index.ts` (linhas 99-103)

### Secao tecnica

A correcao e simples: logar tudo e tentar multiplos caminhos. Apos deploy, basta testar o PIX novamente e verificar nos logs a estrutura real da resposta para confirmar qual campo contem a URL de pagamento.
