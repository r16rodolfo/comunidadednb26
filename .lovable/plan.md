
# Ajustar Fluxo do Modal "Nova Compra"

## Mudanca
Alterar a ordem e logica dos campos no modal de Nova Compra para que o usuario informe:

1. **Quantidade (USD)** - quanto de moeda comprou
2. **Total Pago (R$)** - quanto pagou em reais
3. **Taxa (R$/USD)** - calculada automaticamente (Total Pago / Quantidade)

Atualmente o fluxo e: Quantidade -> Taxa -> Total Pago (calculado). O novo fluxo inverte: o usuario informa o total pago e a taxa e derivada.

## Detalhes Tecnicos

### Arquivo: `src/components/planner/AddTransactionModal.tsx`

**Logica de calculo:**
- Quando ambos `amount` e `totalPaid` estiverem preenchidos, calcular `rate = totalPaid / amount`
- O campo Taxa sera somente leitura (read-only) e exibira o valor calculado
- Remover a flag `autoCalculate` (nao sera mais necessaria)

**Ordem visual dos campos (apos Data e Local):**
1. Quantidade ({currency}) - input editavel
2. Total Pago (R$) - input editavel
3. Taxa (R$ por {currency}) - campo calculado, read-only, com indicacao visual de "calculado automaticamente"

**Validacao do submit:**
- Manter a exigencia de `location`, `amount` e `totalPaid` preenchidos
- A `rate` sera calculada, entao nao precisa ser validada como input do usuario
