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
        <Separator />
        <div className="space-y-3">
          <h3 className="text-base font-semibold">Logs de Auditoria</h3>
          <div className="bg-muted/50 p-4 rounded-lg space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Últimas atividades administrativas:</p>
            <p className="text-xs text-muted-foreground">• API OpenAI configurada — há 2 horas</p>
            <p className="text-xs text-muted-foreground">• Usuário premium@dnb.com criado — há 1 dia</p>
            <p className="text-xs text-muted-foreground">• Configurações atualizadas — há 3 dias</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
