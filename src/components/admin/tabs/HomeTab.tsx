import { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Home, Plus, Trash2, GripVertical, Upload, ExternalLink } from 'lucide-react';
import { useHomeConfig } from '@/hooks/useHomeConfig';
import { useToast } from '@/hooks/use-toast';
import type { HomeConfig, LucideIconName, BannerItem, StepCardConfig } from '@/types/admin';

const ICON_OPTIONS: { value: LucideIconName; label: string }[] = [
  { value: 'Plane', label: '✈️ Avião' },
  { value: 'Globe', label: '🌍 Globo' },
  { value: 'Map', label: '🗺️ Mapa' },
  { value: 'Compass', label: '🧭 Bússola' },
  { value: 'Luggage', label: '🧳 Mala' },
  { value: 'Wallet', label: '👛 Carteira' },
  { value: 'TrendingUp', label: '📈 Tendência' },
  { value: 'PiggyBank', label: '🐷 Cofrinho' },
  { value: 'DollarSign', label: '💲 Dólar' },
  { value: 'CreditCard', label: '💳 Cartão' },
  { value: 'Banknote', label: '💵 Nota' },
  { value: 'Star', label: '⭐ Estrela' },
  { value: 'Heart', label: '❤️ Coração' },
  { value: 'Sparkles', label: '✨ Brilho' },
  { value: 'Rocket', label: '🚀 Foguete' },
  { value: 'Target', label: '🎯 Alvo' },
  { value: 'Award', label: '🏆 Prêmio' },
  { value: 'Zap', label: '⚡ Raio' },
  { value: 'Sun', label: '☀️ Sol' },
];

export function HomeTab() {
  const { config, saveConfig } = useHomeConfig();
  const { toast } = useToast();
  const [draft, setDraft] = useState<HomeConfig>(config);
  const [isSaving, setIsSaving] = useState(false);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise(r => setTimeout(r, 500));
      saveConfig(draft);
      toast({ title: 'Página inicial atualizada com sucesso!' });
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  // ── Welcome Card handlers ──
  const updateWelcome = (field: string, value: string) => {
    setDraft(prev => ({ ...prev, welcomeCard: { ...prev.welcomeCard, [field]: value } }));
  };

  // ── Banner handlers ──
  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxWidth = 1920;
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL('image/jpeg', 0.8);
        const newBanner: BannerItem = {
          id: `banner-${Date.now()}`,
          imageUrl: compressed,
          redirectUrl: '',
          alt: `Banner ${draft.banners.length + 1}`,
          order: draft.banners.length,
        };
        setDraft(prev => ({ ...prev, banners: [...prev.banners, newBanner] }));
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
    if (bannerInputRef.current) bannerInputRef.current.value = '';
  };

  const updateBanner = (id: string, field: keyof BannerItem, value: string) => {
    setDraft(prev => ({
      ...prev,
      banners: prev.banners.map(b => b.id === id ? { ...b, [field]: value } : b),
    }));
  };

  const removeBanner = (id: string) => {
    setDraft(prev => ({
      ...prev,
      banners: prev.banners.filter(b => b.id !== id).map((b, i) => ({ ...b, order: i })),
    }));
  };

  // ── Step Cards handlers ──
  const updateStep = (id: string, field: keyof StepCardConfig, value: string) => {
    setDraft(prev => ({
      ...prev,
      stepCards: prev.stepCards.map(s => s.id === id ? { ...s, [field]: value } : s),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Welcome Card Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Card de Boas-Vindas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ícone</Label>
              <Select
                value={draft.welcomeCard.icon}
                onValueChange={(v) => updateWelcome('icon', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Botão — Texto</Label>
              <Input value={draft.welcomeCard.ctaLabel} onChange={(e) => updateWelcome('ctaLabel', e.target.value)} placeholder="Começar Planejamento" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Título</Label>
            <Input value={draft.welcomeCard.title} onChange={(e) => updateWelcome('title', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Subtítulo</Label>
            <Input value={draft.welcomeCard.subtitle} onChange={(e) => updateWelcome('subtitle', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Texto</Label>
            <Textarea rows={3} value={draft.welcomeCard.body} onChange={(e) => updateWelcome('body', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Botão — URL de destino</Label>
            <Input value={draft.welcomeCard.ctaUrl} onChange={(e) => updateWelcome('ctaUrl', e.target.value)} placeholder="/planner" />
          </div>
        </CardContent>
      </Card>

      {/* Banners Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Banners Promocionais
            </span>
            <div>
              <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
              <Button variant="outline" size="sm" onClick={() => bannerInputRef.current?.click()}>
                <Plus className="h-4 w-4 mr-1" /> Adicionar Banner
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {draft.banners.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
              <Upload className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Nenhum banner configurado.</p>
              <p className="text-xs">Clique em "Adicionar Banner" para enviar uma imagem.</p>
            </div>
          ) : (
            draft.banners.map((banner, idx) => (
              <div key={banner.id} className="flex gap-4 items-start p-4 border rounded-lg bg-muted/30">
                <div className="flex flex-col items-center gap-1 text-muted-foreground pt-2">
                  <GripVertical className="h-4 w-4" />
                  <span className="text-xs font-medium">{idx + 1}</span>
                </div>
                <img src={banner.imageUrl} alt={banner.alt} className="w-32 h-20 object-cover rounded-md border flex-shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Texto alternativo</Label>
                    <Input value={banner.alt} onChange={(e) => updateBanner(banner.id, 'alt', e.target.value)} placeholder="Descrição do banner" className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" />
                      URL de redirecionamento
                    </Label>
                    <Input value={banner.redirectUrl} onChange={(e) => updateBanner(banner.id, 'redirectUrl', e.target.value)} placeholder="https://... ou /planner" className="h-8 text-sm" />
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10 mt-2" onClick={() => removeBanner(banner.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
          {draft.banners.length > 0 && (
            <p className="text-xs text-muted-foreground">Os banners serão exibidos em carrossel na página inicial. Se houver apenas um, será exibido como imagem estática.</p>
          )}
        </CardContent>
      </Card>

      {/* Step Cards Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex items-center gap-2">
              📋 Cards de Passos
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {draft.stepCards.map((step, idx) => (
            <div key={step.id} className="p-4 border rounded-lg bg-muted/30 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">{step.number}</span>
                </div>
                <span className="text-sm font-medium text-muted-foreground">Passo {idx + 1}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Número / Rótulo</Label>
                  <Input value={step.number} onChange={(e) => updateStep(step.id, 'number', e.target.value)} className="h-8 text-sm" maxLength={3} />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label className="text-xs">Título</Label>
                  <Input value={step.title} onChange={(e) => updateStep(step.id, 'title', e.target.value)} className="h-8 text-sm" />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Descrição</Label>
                <Textarea rows={2} value={step.description} onChange={(e) => updateStep(step.id, 'description', e.target.value)} className="text-sm" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Separator />

      <Button onClick={handleSave} disabled={isSaving} className="w-full">
        {isSaving ? 'Salvando...' : 'Salvar Página Inicial'}
      </Button>
    </div>
  );
}
