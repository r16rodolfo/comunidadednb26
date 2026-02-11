
## Correcao do Modal de Cupons: Preview do Logo, Crop e Protecao contra Fechamento Acidental

### Problemas Identificados

1. **Logo nao exibe preview**: O upload gera uma URL fake do Unsplash em vez de realmente fazer upload do arquivo. O preview mostra uma imagem quebrada porque a URL nao existe.

2. **Sem controle de tamanho/crop**: O usuario precisa enviar imagens ja no tamanho correto, sem nenhum ajuste automatico.

3. **Modal fecha ao clicar fora**: Um clique acidental fora do modal descarta todo o formulario sem aviso.

### Analise: Rascunho vs Protecao Simples

Para o problema do fechamento acidental, avaliamos duas abordagens:

- **Rascunho automatico (draft)**: Salvaria os dados no banco conforme o usuario preenche. Complexo de implementar (requer estado "draft" na tabela, limpeza periodica, logica de merge). Excessivo para o caso de uso.

- **Protecao simples (recomendado)**: Bloquear o clique fora do modal e, ao clicar em "Cancelar" com dados preenchidos, exibir um dialogo de confirmacao. Simples, eficaz e padrao de UX consolidado.

Optamos pela protecao simples.

### Solucao

**1. Upload real do logo para o storage**

Substituir a URL fake por upload real ao bucket `platform-assets` (ja existente, publico, com RLS para admins). O arquivo sera salvo em `coupon-logos/{timestamp}-{filename}` e a URL publica sera armazenada no campo `partner_logo`.

**2. Crop/redimensionamento automatico via Canvas**

Ao selecionar uma imagem, redimensionar automaticamente para 200x200px usando Canvas API nativa do navegador. Isso garante tamanho uniforme sem o usuario precisar editar previamente. O resultado sera um Blob que entao e enviado ao storage.

Nao usaremos uma biblioteca de crop interativo (como react-cropper) para manter a simplicidade -- o logo sera automaticamente centralizado e cortado para formato quadrado.

**3. Protecao contra fechamento acidental**

- Usar `onInteractOutside={(e) => e.preventDefault()}` no `DialogContent` para impedir que cliques fora fechem o modal.
- Usar `onEscapeKeyDown={(e) => e.preventDefault()}` para impedir fechamento via ESC.
- No botao "Cancelar", verificar se ha dados preenchidos e exibir `confirm()` antes de fechar.

### Arquivos Modificados

- **`src/components/admin/CreateCouponModal.tsx`** -- Upload real com crop automatico, preview funcional, protecao contra fechamento

### Detalhes Tecnicos

**Upload com crop (Canvas API):**
```typescript
const cropAndResize = (file: File, size: number): Promise<Blob> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;
      const min = Math.min(img.width, img.height);
      const sx = (img.width - min) / 2;
      const sy = (img.height - min) / 2;
      ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
      canvas.toBlob((blob) => resolve(blob!), 'image/webp', 0.85);
    };
    img.src = URL.createObjectURL(file);
  });
};
```

**Upload ao Storage:**
```typescript
const blob = await cropAndResize(file, 200);
const path = `coupon-logos/${Date.now()}-${file.name.replace(/\.[^.]+$/, '')}.webp`;
const { data } = await supabase.storage.from('platform-assets').upload(path, blob, {
  contentType: 'image/webp',
  upsert: true,
});
const { data: urlData } = supabase.storage.from('platform-assets').getPublicUrl(path);
setLogoPreview(urlData.publicUrl);
setValue('partnerLogo', urlData.publicUrl);
```

**Protecao do modal:**
```tsx
<DialogContent
  onInteractOutside={(e) => e.preventDefault()}
  onEscapeKeyDown={(e) => e.preventDefault()}
>
```

**Cancelamento seguro:**
```typescript
const handleClose = () => {
  const hasData = watchedFields.partnerName || watchedFields.offerTitle || watchedFields.code;
  if (hasData && !editingCoupon) {
    if (!confirm('Tem certeza que deseja sair? Os dados preenchidos serao perdidos.')) return;
  }
  reset(defaultValues);
  setLogoPreview('');
  onClose();
};
```
