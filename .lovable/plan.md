
## Correcao Completa do Modulo de Analises de Mercado

### Problemas Identificados

**1. Modal de edicao nao carrega dados existentes**
O `CreateAnalysisModal` usa `useState` (linha 53) em vez de `useEffect` para resetar o formulario quando `editingAnalysis` muda. O `useState` com callback so executa na montagem inicial, entao ao clicar em "Editar" o formulario aparece vazio como se fosse uma nova analise.

**2. Video abre em nova aba em vez de modal**
Em `DnbAnalysis.tsx` (linha 119), o clique em "Assistir Video" executa `window.open(url, '_blank')`. No `AnalysisDetailModal`, os botoes de video/imagem nem possuem `onClick`. Deveria abrir um modal com o player Bunny.net embutido.

**3. Informacoes nao aparecem no /analise e historico**
O tipo `MarketAnalysis` nao inclui `created_at` nem `updated_at`, entao os timestamps nao sao exibidos. Alem disso, a data mostrada e apenas o campo `date` (data da analise), sem horario de publicacao.

**4. Sem indicacao de edicao**
Nao ha tracking de quem editou ou quando. O campo `updated_at` existe no banco mas nao e mapeado no frontend. Falta um campo `edited_by_name` para registrar o nome do editor.

### Solucao

**1. Corrigir reset do formulario no modal**
Substituir o `useState` incorreto (linha 53) por um `useEffect` que observa `open` e `editingAnalysis`, resetando todos os campos corretamente.

**2. Player de video em modal (Bunny.net)**
Criar um componente `VideoPlayerModal` que renderiza um iframe do Bunny Stream. Quando a URL do video for um GUID do Bunny, montar a URL do iframe automaticamente. Para URLs externas (YouTube, etc.), embutir como iframe generico. Usar esse modal no Hero, no FeedCard e no DetailModal.

**3. Mapear timestamps no tipo e exibir na UI**
- Adicionar `created_at` e `updated_at` ao tipo `MarketAnalysis`
- Mapear esses campos nos hooks `useDnb` e `useAdminDnb`
- Exibir horario de publicacao no Hero e nos FeedCards (ex: "Publicado em 11/02/2026 as 14:30")

**4. Tracking de edicao**
- Adicionar coluna `edited_by_name` (text, nullable) na tabela `market_analyses` via migracao SQL
- No hook `useAdminDnb`, ao atualizar uma analise, preencher `edited_by_name` com o nome do usuario logado
- Na UI, exibir discretamente "Editado por [nome] em [data/hora]" quando `updated_at` diferir de `created_at`

### Migracao SQL

Adicionar coluna para tracking de edicao:

```sql
ALTER TABLE public.market_analyses
ADD COLUMN edited_by_name text;
```

### Arquivos Modificados

- **`src/types/dnb.ts`** -- Adicionar `createdAt`, `updatedAt`, `editedByName` ao tipo
- **`src/hooks/useDnb.ts`** -- Mapear novos campos no `mapRow`
- **`src/hooks/useAdminDnb.ts`** -- Mapear novos campos; enviar `edited_by_name` no update
- **`src/components/admin/CreateAnalysisModal.tsx`** -- Corrigir reset com `useEffect`; proteger modal contra fechamento acidental
- **`src/components/dnb/AnalysisHero.tsx`** -- Exibir horario de publicacao e indicador de edicao; abrir video em modal
- **`src/components/dnb/AnalysisFeedCard.tsx`** -- Exibir timestamp e indicador de edicao
- **`src/components/dnb/AnalysisDetailModal.tsx`** -- Adicionar onClick nos botoes de video/imagem; exibir timestamps; player embutido
- **`src/pages/DnbAnalysis.tsx`** -- Substituir `window.open` por estado de modal de video
- **`src/components/dnb/VideoPlayerModal.tsx`** (novo) -- Modal com iframe do Bunny player

### Detalhes Tecnicos

**Correcao do reset do formulario:**
```typescript
// ANTES (incorreto - useState nao re-executa)
useState(() => { if (open && editingAnalysis) { ... } });

// DEPOIS (correto - useEffect observa mudancas)
useEffect(() => {
  if (open && editingAnalysis) {
    setForm({ ...editingAnalysis fields... });
    setSupports(editingAnalysis.supports.map(String));
    setResistances(editingAnalysis.resistances.map(String));
  } else if (open && !editingAnalysis) {
    // Reset para valores padrao (nova analise)
    setForm({ date: today, recommendation: '', ... });
    setSupports(['']);
    setResistances(['']);
  }
}, [open, editingAnalysis]);
```

**VideoPlayerModal (Bunny embed):**
```typescript
// Detectar se e GUID do Bunny ou URL externa
const isBunnyGuid = /^[a-f0-9-]{36}$/.test(videoUrl);
const embedUrl = isBunnyGuid
  ? `https://iframe.mediadelivery.net/embed/${libraryId}/${videoUrl}`
  : videoUrl; // URL externa como YouTube embed

// Renderizar iframe responsivo dentro de um Dialog
<iframe
  src={embedUrl}
  className="w-full aspect-video rounded-lg"
  allow="autoplay; fullscreen"
  allowFullScreen
/>
```

**Timestamp e indicador de edicao:**
```typescript
// No Hero e FeedCard
const wasEdited = analysis.updatedAt && analysis.createdAt
  && new Date(analysis.updatedAt).getTime() - new Date(analysis.createdAt).getTime() > 60000;

// Exibir
<span className="text-xs text-muted-foreground">
  Publicado em {format(new Date(analysis.createdAt), "dd/MM 'as' HH:mm")}
</span>
{wasEdited && (
  <span className="text-[10px] text-muted-foreground/60 italic">
    Editado {analysis.editedByName ? `por ${analysis.editedByName}` : ''} em {format(...)}
  </span>
)}
```

**Update mutation com nome do editor:**
```typescript
// useAdminDnb - updateAnalysis
const { data: profile } = await supabase
  .from('profiles')
  .select('name')
  .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
  .single();

await supabase.from('market_analyses').update({
  ...fields,
  edited_by_name: profile?.name || 'Admin',
}).eq('id', analysis.id);
```
