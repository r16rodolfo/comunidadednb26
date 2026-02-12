
## Redesign do Modal de Analise Completa (Inspirado no Layout de Referencia)

### Objetivo

Reorganizar o `AnalysisDetailModal` para seguir o layout de 3 colunas mostrado na imagem de referencia, com cards visuais distintos e hierarquia clara.

### Layout Proposto

```text
+----------------------------------------------------------+
| Analise de 11 de Fevereiro, 2026   [Momento nao ideal]  X |
| Publicado em 11/02/2026 as 10:30                          |
+----------------------------------------------------------+
| +----------------+ +------------------+ +---------------+ |
| | Assista nossa  | | Cotacao na       | | Niveis de     | |
| | analise        | | Publicacao       | | Negociacao    | |
| |                | |                  | |               | |
| | [Video thumb]  | | USD/BRL          | | Resistencia   | |
| | [> Play]       | | 5.0234 +0.45%   | | R$ 5.10       | |
| |                | | EUR/BRL          | |               | |
| | [Ver Grafico]  | | 5.3412 +0.28%   | | Suporte       | |
| +----------------+ +------------------+ | R$ 4.95       | |
|                                         +---------------+ |
+----------------------------------------------------------+
| Analise do Especialista                                   |
| [texto completo da analise...]                            |
+----------------------------------------------------------+
```

### Mudancas no AnalysisDetailModal

**Header**: Manter titulo com data, badge de recomendacao e timestamps (publicacao/edicao). Remover o summary do `DialogDescription` -- ele sera parte do texto da analise.

**Secao de cards (grid 3 colunas no desktop, empilhado no mobile)**:

1. **Card "Assista nossa analise"** (esquerda)
   - Thumbnail do video com botao play overlay
   - Se houver imagem (`imageUrl`), botao secundario "Ver Grafico" abaixo
   - Se nao houver video, mostrar apenas o botao de grafico

2. **Card "Cotacao na Publicacao"** (centro)
   - Bandeira dos EUA + USD/BRL com preco grande e variacao colorida
   - Bandeira da UE + EUR/BRL com preco grande e variacao colorida
   - Usar emojis de bandeira para simplicidade

3. **Card "Niveis de Negociacao"** (direita)
   - Resistencias com icone TrendingUp e valores em cards individuais
   - Suportes com icone TrendingDown e valores em cards individuais
   - Suportar multiplos valores (listar todos, nao apenas o primeiro)

**Secao "Analise do Especialista"** (full-width):
   - Card separado abaixo do grid
   - Titulo "Analise do Especialista"
   - Texto completo (`fullAnalysis`) com `whitespace-pre-line`

### Arquivo Modificado

- **`src/components/dnb/AnalysisDetailModal.tsx`** -- Redesign completo do layout interno do modal

### Detalhes Tecnicos

**Grid responsivo:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
  {/* Card Video */}
  <div className="rounded-xl border bg-card p-4">...</div>
  {/* Card Cotacoes */}
  <div className="rounded-xl border bg-card p-4">...</div>
  {/* Card Niveis */}
  <div className="rounded-xl border bg-card p-4">...</div>
</div>
```

**Card de video com thumbnail overlay:**
```tsx
<div className="relative rounded-lg overflow-hidden bg-muted aspect-video cursor-pointer"
     onClick={() => setShowVideo(true)}>
  {analysis.imageUrl ? (
    <img src={analysis.imageUrl} className="w-full h-full object-cover" />
  ) : (
    <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/20" />
  )}
  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
    <Play className="h-10 w-10 text-white fill-white/80" />
  </div>
</div>
```

**Card de niveis com multiplos valores:**
```tsx
{analysis.resistances.map((level, i) => (
  <div key={i} className="flex items-center justify-between p-2 rounded-lg border bg-destructive/5 border-destructive/15">
    <span className="text-xs font-medium text-muted-foreground">Resistencia</span>
    <div className="flex items-center gap-1">
      <span className="text-sm font-bold">R$ {level.toFixed(2)}</span>
      <TrendingUp className="h-3.5 w-3.5 text-destructive" />
    </div>
  </div>
))}
```

**Cotacoes com bandeiras:**
```tsx
<div className="flex items-center gap-2 mb-1">
  <span className="text-base">🇺🇸</span>
  <span className="text-xs text-muted-foreground font-medium">USD/BRL</span>
</div>
<div className="flex items-baseline gap-2">
  <span className="text-2xl font-bold tracking-tight">{analysis.dollarPrice.toFixed(4)}</span>
  <span className={`text-xs font-semibold ${getVariationColorClass(variation)}`}>
    {arrow} {variation}%
  </span>
</div>
```
