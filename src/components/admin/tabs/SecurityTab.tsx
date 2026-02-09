import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Shield } from 'lucide-react';
import type { PlatformConfig } from '@/types/admin';

interface SecurityTabProps {
  platformConfig: PlatformConfig;
  setPlatformConfig: React.Dispatch<React.SetStateAction<PlatformConfig>>;
}

export function SecurityTab({ platformConfig, setPlatformConfig }: SecurityTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Configurações de Segurança</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Registro de Novos Usuários</p>
            <p className="text-xs text-muted-foreground">Permitir novos cadastros na plataforma</p>
          </div>
          <Switch checked={platformConfig.registrationEnabled} onCheckedChange={(checked) => setPlatformConfig(prev => ({ ...prev, registrationEnabled: checked }))} />
        </div>
      </CardContent>
    </Card>
  );
}
