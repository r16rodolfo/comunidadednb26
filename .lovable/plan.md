

# Corrigir Flash de Imagem Antiga na Tela de Login

## Problema
Ao acessar `/login`, a imagem de fundo antiga (`src/assets/auth-bg.jpg`) aparece brevemente antes de ser substituida pela imagem configurada no banco de dados (`login_bg_url`). Isso acontece porque:

1. O hook `useLoginBg()` faz uma query assincrona ao banco
2. Enquanto a query carrega, o fallback estatico `auth-bg.jpg` e exibido
3. Quando a query resolve, a imagem troca — gerando o flash visual

## Solucao
Aguardar o carregamento da URL do banco antes de renderizar o background. Se a query ainda estiver pendente, exibir apenas um fundo escuro (sem imagem). A imagem so aparece apos a query resolver.

## Alteracoes

### 1. `src/hooks/useLoginBg.ts`
- Expor o estado `isLoading` da query para o componente consumidor saber quando a URL esta pronta

### 2. `src/components/auth/AuthPage.tsx`
- Consumir `isLoading` do hook
- Enquanto `isLoading` for `true`, usar apenas o fundo escuro (`bg-black`) sem imagem
- Apos a query resolver, exibir a imagem (dinamica ou fallback estatico)
- Adicionar transicao suave (`transition-opacity`) para que a imagem apareca gradualmente em vez de piscar

## Detalhes Tecnicos

No hook `useLoginBg.ts`:
```typescript
const { data, isLoading } = useQuery({ ... });
return { loginBgUrl: data ?? null, isLoading };
```

No componente `AuthPage.tsx`:
```typescript
const { loginBgUrl, isLoading } = useLoginBg();
const authBg = loginBgUrl || defaultAuthBg;

// Background div com transicao
<div
  className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500"
  style={{
    backgroundImage: isLoading ? 'none' : `url(${authBg})`,
    opacity: isLoading ? 0 : 1,
  }}
/>
```

O fundo escuro ja esta garantido pelo overlay `bg-black/40` existente, entao durante o carregamento o usuario vera apenas um fundo escuro limpo por uma fracao de segundo antes da imagem aparecer suavemente.
