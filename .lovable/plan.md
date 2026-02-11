

## Reorganizacao do Header do Layout

O header atual tem elementos dispersos sem agrupamento logico claro. A proposta e reorganizar em tres zonas bem definidas:

### Layout proposto

```text
[Menu(mobile)] Administracao        |  [Sino] [Ver como Usuario]  |  Nome / email  [Badge]  [Perfil] [Sair]
               Painel de controle   |                             |  
```

- **Esquerda**: Titulo da pagina (ja existente)
- **Centro-direita**: Acoes do sistema (notificacoes + toggle de visao)
- **Direita**: Identidade do usuario agrupada (nome, email, badge, botoes de perfil/logout)

### Remocao do indicador "Sistema ativo"

O indicador "Sistema ativo" nao agrega valor real ao usuario (e sempre ativo). Sera removido para liberar espaco e reduzir ruido visual.

### Alteracoes visuais

1. Agrupar notificacao e toggle "Ver como Usuario" com um separador visual (borda vertical) antes do bloco de usuario
2. Agrupar avatar, nome, email e badge dentro de um container unico com hover sutil
3. Botoes de perfil e logout ficam apos o bloco de identidade, separados por um divisor vertical fino

### Arquivo alterado

**`src/components/Layout.tsx`** (linhas 243-296 - secao direita do header)

- Remover o bloco "Sistema ativo" (linhas 292-295)
- Reorganizar a ordem: Notificacoes > Toggle View > Separator > User Info (nome + email + badge) > Separator > Perfil + Logout
- Adicionar separadores visuais (`border-l border-border h-6`) entre os grupos
- Envolver o bloco de usuario em um container com `rounded-lg hover:bg-muted/50 px-2 py-1` para feedback visual

### Detalhes tecnicos

- Nenhuma mudanca de logica, apenas reorganizacao de JSX e classes Tailwind
- Responsividade mantida: no mobile, apenas icones (perfil + logout) ficam visiveis; nome/email/badge continuam `hidden md:flex`
- O toggle "Ver como Usuario" continua `hidden md:flex` (so desktop)

