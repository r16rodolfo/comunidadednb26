

## Melhorar o Card Principal (Hero) em /analise

Baseado na imagem de referencia, o Hero precisa de ajustes visuais para ficar mais limpo e com melhor hierarquia.

### Mudancas no AnalysisHero.tsx

**1. Cotacoes com simbolo de moeda em circulo ($ e EUR)**
- Substituir o icone generico `DollarSign` por circulos com simbolo da moeda: `$` para USD e `€` para EUR
- Circulos com fundo cinza claro e texto escuro, como na referencia
- Aumentar o tamanho do preco para `text-xl font-bold`

**2. Layout das cotacoes lado a lado sem card de fundo**
- Remover o `bg-background/60 backdrop-blur-sm rounded-lg` dos PriceIndicators
- Deixar as cotacoes mais "abertas" dentro do card principal, separadas por espaco
- Variacao abaixo do preco (nao ao lado)

**3. Botoes maiores e mais proeminentes**
- "Ver analise completa" como botao `default` com tamanho `default` (nao `sm`)
- "Assistir Video" como botao `outline` com tamanho `default`
- Ambos com largura igual usando flex-1 dentro de um container flex

**4. Data com formatacao mais destacada**
- Data em negrito: "11 de fevereiro, 2026"
- "Publicado as HH:mm" e "Editado por..." abaixo, em texto menor
- Manter alinhamento a direita

**5. Remover icone do card de preco**
- O `DollarSign` do lucide sera substituido por um circulo com o simbolo da moeda inline

### Detalhes Tecnicos

**PriceIndicator redesenhado:**
```tsx
function PriceIndicator({ label, symbol, price, variation }) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
        <span className="text-sm font-semibold text-muted-foreground">{symbol}</span>
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <span className="text-xl font-bold">R$ {price.toFixed(2)}</span>
        <span className={`text-xs font-semibold block ${colorClass}`}>
          {variation >= 0 ? '+' : ''}{variation}%
        </span>
      </div>
    </div>
  );
}
```

**Botoes com tamanho igual:**
```tsx
<div className="flex items-center gap-3 flex-wrap">
  <Button variant="default" onClick={onViewDetail} className="gap-2 flex-1 min-w-[180px]">
    <FileText className="h-4 w-4" />
    Ver analise completa
  </Button>
  {analysis.videoUrl && (
    <Button variant="outline" onClick={onViewVideo} className="gap-2 flex-1 min-w-[180px]">
      <Play className="h-4 w-4" />
      Assistir Video
    </Button>
  )}
</div>
```

### Arquivo Modificado

- **`src/components/dnb/AnalysisHero.tsx`** -- Redesign do PriceIndicator com simbolos de moeda em circulo, botoes maiores, layout mais limpo
