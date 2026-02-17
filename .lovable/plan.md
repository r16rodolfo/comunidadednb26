

# Corrigir Botao Editar e Adicionar Alerta de Exclusao no Historico de Compras

## Problemas Identificados

1. **Botao Editar**: No `Planner.tsx`, o `onEdit` esta passando uma funcao vazia (`() => {}`), e no hook `usePlanner.ts` a funcao `updateTransaction` nao esta implementada (apenas exibe um `console.warn`).

2. **Botao Excluir**: A exclusao acontece imediatamente sem pedir confirmacao ao usuario, o que pode causar exclusoes acidentais.

## Solucao

### 1. Implementar `updateTransaction` no hook (`src/hooks/usePlanner.ts`)
- Criar uma mutation real que faz `UPDATE` na tabela `planner_transactions` pelo `id`
- Atualizar os campos `date`, `location`, `amount`, `rate`, `total_paid`
- Invalidar a query apos sucesso

### 2. Adicionar modo de edicao no modal (`src/components/planner/AddTransactionModal.tsx`)
- Aceitar uma prop opcional `editingTransaction` com os dados da transacao a editar
- Quando presente, pre-preencher os campos do formulario com os valores existentes
- Alterar titulo e botao de submit para refletir o modo de edicao
- Chamar `onEdit` em vez de `onSubmit` quando estiver editando

### 3. Conectar edicao na pagina (`src/pages/Planner.tsx`)
- Adicionar estado `editingTransaction` para controlar qual transacao esta sendo editada
- Ao clicar em "Editar" na tabela, abrir o modal com os dados da transacao
- Criar handler `handleEditTransaction` que chama `updateTransaction` do hook

### 4. Adicionar alerta de confirmacao para exclusao (`src/pages/Planner.tsx`)
- Usar o componente `AlertDialog` do shadcn/ui
- Ao clicar em "Excluir", exibir um dialogo pedindo confirmacao
- Somente excluir apos o usuario confirmar
- Adicionar estado `deletingId` para controlar qual transacao esta sendo excluida

## Detalhes Tecnicos

### `src/hooks/usePlanner.ts`
Substituir a funcao `updateTransaction` stub por uma mutation real:
```typescript
const updateTransactionMutation = useMutation({
  mutationFn: async ({ id, transaction }: { id: string; transaction: Omit<Transaction, 'id' | 'createdAt'> }) => {
    const { error } = await supabase.from('planner_transactions').update({
      date: transaction.date.toISOString().split('T')[0],
      location: transaction.location,
      amount: transaction.amount,
      rate: transaction.rate,
      total_paid: transaction.totalPaid,
    }).eq('id', id);
    if (error) throw error;
  },
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['planner-transactions', userId] }),
});
```

### `src/components/planner/AddTransactionModal.tsx`
- Adicionar props `editingTransaction?: Transaction` e `onEdit?: (id: string, transaction: ...) => void`
- Usar `useEffect` para popular os campos quando `editingTransaction` muda
- Titulo muda para "Editar Compra" quando editando

### `src/pages/Planner.tsx`
- Estado: `editingTransaction` (Transaction | null), `deletingId` (string | null)
- AlertDialog com mensagem "Tem certeza que deseja excluir esta transacao?" com botoes Cancelar/Excluir
- Handler de edicao abre o modal com dados pre-preenchidos

