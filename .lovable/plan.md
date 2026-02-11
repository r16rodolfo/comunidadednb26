

## Correcao de Datas, Dados Ausentes e UI/UX do Modulo de Analises

### Problemas Identificados

**1. Datas incompativeis (timezone bug)**
O campo `date` no banco e `"2026-02-11"` (string sem timezone). Ao usar `new Date("2026-02-11")`, o JavaScript interpreta como UTC meia-noite. No Brasil (UTC-3), isso vira 10/02 as 21h. Por isso o admin mostra "10/02/2026" quando deveria ser "11/02/2026". Esse bug afeta todos os componentes: admin table, Hero, FeedCard, DetailModal e filtros de periodo.

**2. Informacoes cadastradas nao aparecem no /analise**
- O Hero nao tem botao para abrir a analise completa. O usuario ve apenas o resumo, cotacoes e botao de video -- sem acesso a analise completa, suportes e resistencias.
- O historico mostra "Nenhuma analise encontrada" porque o codigo filtra a analise mais recente para o Hero (`historyAnalyses = analyses.filter(a => a.id !== latestAnalysis?.id)`), e quando so existe 1 analise, o historico fica vazio.

**3. UI pesada (amarelao)**
O gradiente `alert` usa `from-warning/20 to-warning/5` com `--warning: 38 92% 50%` (laranja saturado). Em area grande como o Hero, o resultado e um fundo amarelo/laranja intenso que dificulta a leitura. Os textos `text-foreground/80` e `text-muted-foreground` perdem contraste sobre esse fundo.

**4. Legibilidade e acessibilidade**
- Textos pequenos (10px, 11px) sobre fundos coloridos nao atendem WCAG AA.
- O resumo usa `text-foreground/80` que perde contraste sobre gradientes saturados.
- Nao ha hierarquia visual clara entre resumo e dados tecnicos.

### Solucao

**1. Corrigir parsing de datas**
Criar uma funcao utilitaria `parseLocalDate(dateStr)` que evita o bug de timezone:

```typescript
// Interpreta "2026-02-11" como data LOCAL (nao UTC)
export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}
```

Usar essa funcao em todos os pontos que fazem `new Date(analysis.date)`:
- `AnalysisHero.tsx` (linha 71)
- `AnalysisFeedCard.tsx` (linha 52)
- `AnalysisDetailModal.tsx` (linha 58)
- `DnbAnalysis.tsx` (linha 50 -- filtro de periodo)
- `Analyses.tsx` (admin table, linhas 62, 161, 260)

**2. Adicionar acesso a analise completa no Hero**
Adicionar um botao "Ver analise completa" no Hero que abre o DetailModal. Isso requer:
- Nova prop `onViewDetail` no `AnalysisHero`
- Em `DnbAnalysis.tsx`, ao clicar, setar `setSelectedAnalysis(latestAnalysis)`

**3. Corrigir historico vazio**
Quando so ha 1 analise, nao filtrar ela do historico. Em vez disso, mostrar o historico incluindo todas as analises (a mais recente ja aparece no Hero como destaque, mas tambem deve aparecer na lista para consistencia). Alternativamente, exibir uma mensagem mais informativa quando nao ha historico alem da analise atual.

**4. Redesign dos gradientes e estilos (UX/Acessibilidade)**
Reduzir a intensidade dos gradientes do Hero para melhorar legibilidade:

```typescript
// ANTES (pesado)
alert: 'from-warning/20 to-warning/5 border-warning/30',

// DEPOIS (leve e elegante)
alert: 'from-warning/8 to-warning/3 border-warning/20',
ideal: 'from-success/8 to-success/3 border-success/20',
'not-ideal': 'from-destructive/8 to-destructive/3 border-destructive/20',
wait: 'from-info/8 to-info/3 border-info/20',
```

Melhorar contraste dos textos no Hero:
- Resumo: `text-foreground` em vez de `text-foreground/80`
- Timestamps: `text-muted-foreground` em vez de `/70` e `/50`
- Texto editado: minimo `text-muted-foreground/70` em vez de `/50`

### Arquivos Modificados

- **`src/lib/utils.ts`** -- Adicionar funcao `parseLocalDate`
- **`src/lib/recommendation-styles.ts`** -- Reduzir opacidade dos gradientes
- **`src/components/dnb/AnalysisHero.tsx`** -- Usar `parseLocalDate`; adicionar botao "Ver analise completa"; melhorar contraste dos textos
- **`src/components/dnb/AnalysisFeedCard.tsx`** -- Usar `parseLocalDate`
- **`src/components/dnb/AnalysisDetailModal.tsx`** -- Usar `parseLocalDate`
- **`src/pages/DnbAnalysis.tsx`** -- Usar `parseLocalDate` nos filtros; passar `onViewDetail` ao Hero; ajustar logica do historico
- **`src/pages/admin/Analyses.tsx`** -- Usar `parseLocalDate` na tabela e nos stats

### Detalhes Tecnicos

**parseLocalDate (evita timezone shift):**
```typescript
export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}
```

**Hero com botao de detalhe:**
```tsx
interface AnalysisHeroProps {
  analysis: MarketAnalysis;
  recommendation: MarketRecommendation;
  onViewVideo?: () => void;
  onViewImage?: () => void;
  onViewDetail?: () => void;  // NOVO
}

// No final do Hero, apos os botoes de midia:
<Button variant="link" size="sm" onClick={onViewDetail} className="gap-1 text-xs">
  Ver analise completa
</Button>
```

**Historico inclusivo:**
```typescript
// Em DnbAnalysis.tsx, nao excluir a ultima do historico
// Apenas deixar o Hero como destaque e o historico como lista completa
const historyAnalyses = analyses.length > 1
  ? analyses.filter((a) => a.id !== latestAnalysis?.id)
  : []; // Se so tem 1, nao duplicar -- hero ja mostra
```

**Gradientes suaves:**
```typescript
export const recommendationGradientStyles: Record<string, string> = {
  ideal: 'from-success/8 to-success/3 border-success/20',
  alert: 'from-warning/8 to-warning/3 border-warning/20',
  'not-ideal': 'from-destructive/8 to-destructive/3 border-destructive/20',
  wait: 'from-info/8 to-info/3 border-info/20',
};
```

