
# Adicionar Rodape Fixo Discreto

## O que sera feito
Adicionar um rodape fixo na parte inferior da area de conteudo principal do Layout, exibindo de forma discreta quem desenvolveu a plataforma.

## Detalhes

### Arquivo: `src/components/Layout.tsx`

Adicionar um elemento `<footer>` logo apos o `<main>`, ainda dentro da coluna `flex-col` do conteudo. O rodape tera:

- Texto pequeno e discreto (ex: `text-xs text-muted-foreground`)
- Centralizado
- Exemplo de texto: "Desenvolvido por McKinley Avenue" (ou o nome que voce preferir)
- Padding leve (`py-3`) e borda superior sutil (`border-t border-border`)
- O rodape ficara sempre visivel na parte inferior da pagina, empurrado pelo conteudo graas ao layout `flex-col` com `min-h-screen`

### Posicionamento no codigo
O footer sera inserido entre o fechamento da `<main>` (linha 306) e o fechamento da `<div>` do conteudo (linha 307):

```
</main>

<footer className="py-3 px-4 text-center border-t border-border">
  <p className="text-xs text-muted-foreground">
    Desenvolvido por McKinley Avenue
  </p>
</footer>
```

Como o layout ja usa `flex-1` no main e `min-h-screen` no container, o rodape ficara naturalmente fixo na base da pagina quando o conteudo for curto, e abaixo do conteudo quando for longo.
