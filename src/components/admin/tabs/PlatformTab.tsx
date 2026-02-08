import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Settings, Video } from 'lucide-react';
import type { PlatformConfig } from '@/types/admin';

interface PlatformTabProps {
  platformConfig: PlatformConfig;
  setPlatformConfig: React.Dispatch<React.SetStateAction<PlatformConfig>>;
  onSave: () => void;
  isLoading: boolean;
}

export function PlatformTab({ platformConfig, setPlatformConfig, onSave, isLoading }: PlatformTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" />Configurações Gerais</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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
          {Object.entries(platformConfig.features).map(([feature, enabled]) => (
            <div key={feature} className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm font-medium capitalize">{feature}</p>
                <p className="text-xs text-muted-foreground">
                  {feature === 'planner' && 'Planner de Compras'}
                  {feature === 'academy' && 'DNB Academy'}
                  {feature === 'dnbAnalysis' && 'Análise DNB'}
                  {feature === 'coupons' && 'Cupons de Desconto'}
                </p>
              </div>
              <Switch checked={enabled} onCheckedChange={(checked) => setPlatformConfig(prev => ({ ...prev, features: { ...prev.features, [feature]: checked } }))} />
            </div>
          ))}
        </div>
        <Separator />
        <div className="space-y-4">
          <h3 className="text-base font-semibold">Limites de Uso</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Transações Gratuitos</Label>
              <Input type="number" value={platformConfig.limits.freeTransactions} onChange={(e) => setPlatformConfig(prev => ({ ...prev, limits: { ...prev.limits, freeTransactions: parseInt(e.target.value) } }))} />
            </div>
            <div className="space-y-2">
              <Label>Transações Premium</Label>
              <Input type="number" value={platformConfig.limits.premiumTransactions} onChange={(e) => setPlatformConfig(prev => ({ ...prev, limits: { ...prev.limits, premiumTransactions: parseInt(e.target.value) } }))} placeholder="-1 para ilimitado" />
            </div>
            <div className="space-y-2">
              <Label>API Calls / Dia</Label>
              <Input type="number" value={platformConfig.limits.apiCalls} onChange={(e) => setPlatformConfig(prev => ({ ...prev, limits: { ...prev.limits, apiCalls: parseInt(e.target.value) } }))} />
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
