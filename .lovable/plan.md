

## Adicionar CPF e Telefone ao cadastro para pagamento PIX

### Contexto

A API do AbacatePay exige 4 campos obrigatorios no objeto `customer` para criar cobranças:
- `name` (ja temos)
- `email` (ja temos via auth)
- `cellphone` (NAO temos)
- `taxId` / CPF (NAO temos)

Sem esses dados, o pagamento PIX nao funciona. O plano e coletar essas informacoes no cadastro do usuario, salva-las no banco e usa-las na edge function de checkout.

### Alteracoes

**1. Adicionar colunas na tabela `profiles`**

Migration SQL para adicionar:
- `cellphone` (text, nullable) — telefone do usuario
- `cpf` (text, nullable) — CPF ou CNPJ do usuario

Nullable porque usuarios existentes nao tem esses dados.

**2. Atualizar o formulario de cadastro (`AuthPage.tsx`)**

Adicionar dois campos ao formulario de signup:
- **CPF**: campo com mascara (xxx.xxx.xxx-xx), validacao de 11 digitos
- **Telefone**: campo com mascara ((xx) xxxxx-xxxx), validacao de 10-11 digitos

Atualizar o schema Zod de signup para incluir validacao desses campos.

**3. Salvar os novos campos no registro**

Atualizar `AuthContext.tsx` para enviar `cpf` e `cellphone` como `user_metadata` no `signUp`. Atualizar o trigger `handle_new_user` no banco para copiar esses dados para a tabela `profiles`.

**4. Atualizar a edge function `create-pix-checkout`**

Buscar `cellphone` e `cpf` da tabela `profiles` e incluir o objeto `customer` na requisicao ao AbacatePay:

```typescript
customer: {
  name: profile.name,
  email: user.email,
  cellphone: profile.cellphone,
  taxId: profile.cpf,
},
```

**5. Permitir edicao no perfil (`Profile.tsx`)**

Adicionar campos de CPF e Telefone na aba "Perfil" para que usuarios existentes possam preencher esses dados antes de assinar.

**6. Atualizar `updateProfile` no `AuthContext.tsx`**

Incluir `cellphone` e `cpf` nos campos salvos ao atualizar o perfil.

### Secao tecnica

**Migration SQL:**
```sql
ALTER TABLE public.profiles
  ADD COLUMN cellphone text,
  ADD COLUMN cpf text;
```

**Trigger atualizado (`handle_new_user`):**
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, name, cellphone, cpf)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'cellphone',
    NEW.raw_user_meta_data->>'cpf'
  );
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'free');
  RETURN NEW;
END;
$function$;
```

**Arquivos alterados:**
- `supabase/functions/create-pix-checkout/index.ts` — adicionar customer com dados do perfil
- `src/components/auth/AuthPage.tsx` — campos CPF e telefone no signup
- `src/contexts/AuthContext.tsx` — enviar metadata no signUp, salvar no updateProfile
- `src/pages/Profile.tsx` — campos de edicao CPF e telefone
- `src/types/auth.ts` — adicionar cpf e cellphone ao RegisterData

