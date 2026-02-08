import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Settings, Video, Upload, X } from 'lucide-react';
import { useRef } from 'react';
import type { PlatformConfig } from '@/types/admin';

const FEATURE_LABELS: Record<string, { name: string; description: string }> = {
  planner: { name: 'Planner de Compras', description: 'Planejamento e controle de câmbio para viagens' },
  academy: { name: 'DNB Academy', description: 'Cursos e aulas em vídeo para a comunidade' },
  dnbAnalysis: { name: 'Análise de Mercado', description: 'Análises diárias de câmbio com cotações e gráficos' },
  coupons: { name: 'Cupons de Desconto', description: 'Ofertas e cupons exclusivos para membros' },
};

interface PlatformTabProps {
  platformConfig: PlatformConfig;
  setPlatformConfig: React.Dispatch<React.SetStateAction<PlatformConfig>>;
  onSave: () => void;
  isLoading: boolean;
}

export function PlatformTab({ platformConfig, setPlatformConfig, onSave, isLoading }: PlatformTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      const MAX = 256;
      let w = img.width, h = img.height;
      if (w > MAX || h > MAX) {
        const ratio = Math.min(MAX / w, MAX / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }
      canvas.width = w;
      canvas.height = h;
      ctx?.drawImage(img, 0, 0, w, h);
      const dataUrl = canvas.toDataURL('image/png', 0.85);
      setPlatformConfig(prev => ({ ...prev, logoUrl: dataUrl }));
      localStorage.setItem('platform_logo', dataUrl);
    };
    img.src = URL.createObjectURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveLogo = () => {
    setPlatformConfig(prev => ({ ...prev, logoUrl: undefined }));
    localStorage.removeItem('platform_logo');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" />Configurações Gerais</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Logo */}
        <div className="space-y-2">
          <Label>Logotipo da Plataforma</Label>
          <div className="flex items-center gap-4">
            {platformConfig.logoUrl ? (
              <div className="relative group">
                <img src={platformConfig.logoUrl} alt="Logo" className="h-16 w-16 rounded-lg object-contain border border-border bg-muted p-1" />
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div className="h-16 w-16 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center bg-muted/50">
                <Upload className="h-5 w-5 text-muted-foreground/50" />
              </div>
            )}
            <div>
              <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                {platformConfig.logoUrl ? 'Trocar Logo' : 'Enviar Logo'}
              </Button>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG ou SVG. Máx. 256×256px.</p>
            </div>
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/svg+xml" className="hidden" onChange={handleLogoUpload} />
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="siteName">Nome do Site</Label>
            <Input id="siteName" value={platformConfig.siteName} onChange={(e) => setPlatformConfig(prev => ({ ...prev, siteName: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxFreeUsers">Limite de Usuários Gratuitos</Label>
            <Input id="maxFreeUsers" type="number" value={platformConfig.maxFreeUsers} onChange={(e) => setPlatformConfig(prev => ({ ...prev, maxFreeUsers: parseInt(e.target.value) }))} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="siteDescription">Descrição do Site</Label>
          <Textarea id="siteDescription" value={platformConfig.siteDescription} onChange={(e) => setPlatformConfig(prev => ({ ...prev, siteDescription: e.target.value }))} />
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-base font-semibold">Recursos da Plataforma</h3>
          {Object.entries(platformConfig.features).map(([feature, enabled]) => {
            const label = FEATURE_LABELS[feature];
            return (
              <div key={feature} className="flex items-center justify-between py-1">
                <div>
                  <p className="text-sm font-medium">{label?.name ?? feature}</p>
                  <p className="text-xs text-muted-foreground">{label?.description ?? ''}</p>
                </div>
                <Switch checked={enabled} onCheckedChange={(checked) => setPlatformConfig(prev => ({ ...prev, features: { ...prev.features, [feature]: checked } }))} />
              </div>
            );
          })}
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-base font-semibold">Limites de Uso</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Transações (Gratuito)</Label>
              <Input type="number" value={platformConfig.limits.freeTransactions} onChange={(e) => setPlatformConfig(prev => ({ ...prev, limits: { ...prev.limits, freeTransactions: parseInt(e.target.value) } }))} />
              <p className="text-xs text-muted-foreground">Máximo de transações para usuários do plano gratuito.</p>
            </div>
            <div className="space-y-2">
              <Label>Transações (Premium)</Label>
              <Input type="number" value={platformConfig.limits.premiumTransactions} onChange={(e) => setPlatformConfig(prev => ({ ...prev, limits: { ...prev.limits, premiumTransactions: parseInt(e.target.value) } }))} placeholder="-1 para ilimitado" />
              <p className="text-xs text-muted-foreground">Use -1 para transações ilimitadas no plano premium.</p>
            </div>
            <div className="space-y-2">
              <Label>Chamadas de API / Dia</Label>
              <Input type="number" value={platformConfig.limits.apiCalls} onChange={(e) => setPlatformConfig(prev => ({ ...prev, limits: { ...prev.limits, apiCalls: parseInt(e.target.value) } }))} />
              <p className="text-xs text-muted-foreground">Limite diário de requisições à API por usuário. Controla o consumo de recursos do servidor.</p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <Video className="h-4 w-4" />
            Integrações
          </h3>
          <div className="space-y-2">
            <Label htmlFor="bunnyLibraryId">Bunny.net Stream — Library ID</Label>
            <Input
              id="bunnyLibraryId"
              placeholder="Ex: 123456"
              value={platformConfig.integrations.bunnyLibraryId}
              onChange={(e) => setPlatformConfig(prev => ({
                ...prev,
                integrations: { ...prev.integrations, bunnyLibraryId: e.target.value }
              }))}
            />
            <p className="text-xs text-muted-foreground">
              Encontre o Library ID no painel do Bunny.net em Stream &gt; Library &gt; API. Este ID é necessário para reproduzir os vídeos das aulas.
            </p>
          </div>
        </div>

        <Button onClick={onSave} disabled={isLoading} className="w-full">
          {isLoading ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </CardContent>
    </Card>
  );
}
