
## Gestao Completa de Usuarios (/admin/users)

### Problemas Identificados

1. **Sem e-mail na listagem** -- A tabela `profiles` nao tem e-mail. O e-mail so existe em `auth.users` (inacessivel pelo client) e parcialmente em `subscribers_safe` (so para assinantes).
2. **Sem dados de assinatura** -- A tabela nao mostra se o usuario e assinante, qual plano, ou status.
3. **Cargo efetivo incorreto** -- Usuarios com role "free" mas assinatura ativa aparecem como "Gratuito" em vez de "Premium".
4. **Visualizacao limitada** -- O modal de detalhes so mostra nome, cargo e data de cadastro. Faltam: e-mail, telefone, CPF, avatar, dados de assinatura.
5. **Sem edicao** -- Nao e possivel editar o cargo de um usuario.
6. **Sem exclusao** -- Nao e possivel excluir usuarios.
7. **Filtros nao funcionam** -- O botao "Filtros" nao faz nada.

### Solucao

**1. Armazenar e-mail no perfil durante criacao**

O trigger `handle_new_user` ja cria o perfil, mas nao salva o e-mail. Vamos:
- Adicionar coluna `email` na tabela `profiles`
- Atualizar o trigger para salvar `NEW.email` no perfil
- Atualizar a edge function `admin-create-user` para tambem salvar o e-mail no perfil
- Preencher e-mails dos usuarios existentes com dados de `auth.users` via migracao

**2. Criar Edge Function `admin-manage-user`**

Uma edge function para operacoes administrativas:
- **Editar cargo**: Atualiza `user_roles.role`
- **Excluir usuario**: Remove via `auth.admin.deleteUser()` (cascata para profiles e user_roles)
- Validacao de admin no servidor

**3. Enriquecer a listagem com dados de assinatura**

A query vai juntar `profiles` + `user_roles` + `subscribers_safe` para mostrar:
- Nome, e-mail, cargo efetivo, plano atual, status da assinatura, data de cadastro

**4. Cargo efetivo**

Priorizar o status de assinatura ativa sobre o cargo estatico:
- Se `subscribers_safe.subscribed = true` -> cargo efetivo = "premium"
- Senao -> usar `user_roles.role`

**5. Modal de detalhes completo**

Exibir todos os dados disponiveis:
- Nome, e-mail, telefone, CPF (mascarado), avatar
- Cargo, plano atual, status da assinatura, data de validade
- Data de cadastro

**6. Edicao de cargo inline**

No dropdown de acoes, adicionar opcao "Editar Cargo" que abre um modal com Select para escolher o novo cargo.

**7. Exclusao com confirmacao**

No dropdown, adicionar "Excluir" que abre AlertDialog de confirmacao antes de chamar a edge function.

**8. Filtros funcionais**

Substituir o botao decorativo por selects funcionais:
- Filtro por cargo (Todos, Free, Premium, Gestor, Admin)
- Filtro por status de assinatura (Todos, Ativo, Inativo)

### Arquivos Modificados

- **Migracao SQL**: Adicionar coluna `email` em `profiles`, atualizar trigger `handle_new_user`
- **`supabase/functions/admin-manage-user/index.ts`** (novo): Edge function para editar cargo e excluir usuario
- **`supabase/functions/admin-create-user/index.ts`**: Salvar e-mail no perfil apos criacao
- **`src/pages/admin/Users.tsx`**: Refatorar completamente com dados enriquecidos, filtros funcionais, modal de detalhes completo, edicao de cargo e exclusao

### Secao Tecnica

**Migracao SQL:**
```sql
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;

-- Preencher emails existentes
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.user_id = u.id AND p.email IS NULL;

-- Atualizar trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public' AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, cellphone, cpf)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    NEW.raw_user_meta_data->>'cellphone',
    NEW.raw_user_meta_data->>'cpf'
  );
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'free');
  RETURN NEW;
END;
$$;
```

**Edge Function `admin-manage-user`:**
```typescript
// Endpoints:
// POST { action: 'update_role', user_id, role }
// POST { action: 'delete_user', user_id }
```

**Query enriquecida no frontend:**
```typescript
const { data: profiles } = await supabase
  .from('profiles')
  .select('user_id, name, email, cellphone, cpf, avatar_url, created_at');

const { data: roles } = await supabase
  .from('user_roles')
  .select('user_id, role');

const { data: subs } = await supabase
  .from('subscribers_safe')
  .select('user_id, subscribed, current_plan_slug, subscription_end, cancel_at_period_end');
```

**Cargo efetivo:**
```typescript
function getEffectiveRole(role: string, sub?: SubscriberInfo): string {
  if (sub?.subscribed) return 'premium';
  return role;
}
```
