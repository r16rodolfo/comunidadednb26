
## Correcao do Fluxo Academy: Publicacao Imediata e Acesso Premium

### Problemas Identificados

**1. Aulas nao aparecem para usuarios apos publicacao**
Quando o admin publica um curso em `/admin/content`, as mutations invalidam apenas a query key `admin-academy-courses`. As queries do usuario (`academy-published-courses` e `academy-course`) tem `staleTime` de 5 minutos, entao o usuario so ve as mudancas apos esse tempo ou ao recarregar a pagina. Alem disso, nao ha invalidacao cruzada entre admin e usuario.

**2. Usuarios premium nao conseguem assistir aulas premium**
A pagina `Academy.tsx` nunca passa `isPremiumUser` para os componentes `VideoPlayer` e `CourseNavigation`. O valor padrao e `false`, entao todas as aulas nao-gratuitas mostram o cadeado "Aula Premium" mesmo para assinantes.

**3. Bunny Library ID depende de localStorage**
Se o admin nao configurou o Library ID na aba Plataforma, ou se o usuario esta em outro navegador/dispositivo, `localStorage` nao tera o valor e os videos nao serao reproduzidos. Esse dado deveria vir do banco de dados ou de uma configuracao global.

### Solucao

**1. Invalidar cache do usuario apos mudancas no admin**

No hook `useAdminAcademy`, apos cada mutation bem-sucedida (create, update, delete, togglePublish), invalidar tambem as queries do lado do usuario:
- `academy-published-courses`
- `academy-course`

Isso garante que, se o admin estiver logado e navegar para a pagina Academy, vera os dados atualizados imediatamente. Para outros usuarios logados simultaneamente, reduzir o `staleTime` das queries do usuario de 5 minutos para 30 segundos.

**2. Passar `isPremiumUser` baseado na assinatura**

Em `Academy.tsx`:
- Importar `useSubscription` para verificar se o usuario e assinante
- Derivar `isPremiumUser` a partir de `subscription.subscribed` ou do role do usuario (admin/gestor tambem tem acesso)
- Passar essa prop para `VideoPlayer` e `CourseNavigation`

**3. Buscar Bunny Library ID do banco de dados**

Em vez de depender exclusivamente de `localStorage`, buscar o `bunny_library_id` de uma fonte persistente. A abordagem mais simples: o admin ja salva configuracoes em `localStorage` na aba Plataforma, mas vamos tambem salvar na tabela `home_config` e ler de la no `VideoPlayer` como fallback. Alternativamente, podemos criar uma query dedicada que le do `localStorage` com fallback para o banco.

Para manter a simplicidade e compatibilidade com o fluxo atual (que ja usa `localStorage`), vamos:
- Garantir que a aba Plataforma salve o `bunny_library_id` no banco (`home_config`)
- O `VideoPlayer` le primeiro do `localStorage`, e se nao encontrar, busca do `home_config`

### Arquivos Modificados

- **`src/hooks/useAdminAcademy.ts`** -- Invalidar queries do usuario apos mutations admin
- **`src/hooks/useAcademy.ts`** -- Reduzir `staleTime` para 30 segundos
- **`src/pages/Academy.tsx`** -- Passar `isPremiumUser` para VideoPlayer e CourseNavigation
- **`src/components/academy/VideoPlayer.tsx`** -- Buscar Bunny Library ID do banco como fallback
- **`src/components/admin/tabs/PlatformTab.tsx`** -- Persistir `bunny_library_id` no banco ao salvar

### Secao Tecnica

**Invalidacao cruzada (useAdminAcademy):**
```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['admin-academy-courses'] });
  // Invalidar cache do usuario tambem
  queryClient.invalidateQueries({ queryKey: ['academy-published-courses'] });
  queryClient.invalidateQueries({ queryKey: ['academy-course'] });
},
```

**isPremiumUser (Academy.tsx):**
```typescript
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';

const { subscription } = useSubscription();
const { roles } = useAuth();
const isPremiumUser = subscription?.subscribed || roles.includes('admin') || roles.includes('gestor');

// Passar para ambos os componentes:
<VideoPlayer isPremiumUser={isPremiumUser} ... />
<CourseNavigation isPremiumUser={isPremiumUser} ... />
```

**Bunny Library ID fallback (VideoPlayer):**
```typescript
// Usar hook ou query para buscar do home_config como fallback
const getBunnyLibraryId = () => {
  const local = localStorage.getItem('bunny_library_id');
  if (local) return local;
  // fallback sera injetado via prop ou context
  return '';
};
```

**Persistir no banco (PlatformTab onSave):**
```typescript
// Ao salvar configuracoes, persistir bunny_library_id no home_config
await supabase.from('home_config').update({
  bunny_library_id: platformConfig.integrations.bunnyLibraryId
}).eq('id', configId);
```

Nota: Para persistir `bunny_library_id` no banco, sera necessario adicionar a coluna na tabela `home_config` via migracao SQL.
