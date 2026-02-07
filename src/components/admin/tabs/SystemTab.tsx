import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Activity, AlertTriangle, Database } from 'lucide-react';
import type { PlatformConfig } from '@/types/admin';

interface SystemTabProps {
  platformConfig: PlatformConfig;
  setPlatformConfig: React.Dispatch<React.SetStateAction<PlatformConfig>>;
}

export function SystemTab({ platformConfig, setPlatformConfig }: SystemTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" />Status do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-success">99.9%</p>
              <p className="text-xs text-muted-foreground">Uptime</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold">245ms</p>
              <p className="text-xs text-muted-foreground">Latência Média</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold">1,234</p>
              <p className="text-xs text-muted-foreground">Usuários Ativos</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold">15,678</p>
              <p className="text-xs text-muted-foreground">API Calls Hoje</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" />Manutenção</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Modo de Manutenção</p>
              <p className="text-xs text-muted-foreground">Bloqueia acesso exceto para administradores</p>
            </div>
            <Switch checked={platformConfig.maintenanceMode} onCheckedChange={(checked) => setPlatformConfig(prev => ({ ...prev, maintenanceMode: checked }))} />
          </div>
          {platformConfig.maintenanceMode && (
            <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
              <p className="text-destructive font-medium text-sm">⚠️ Modo de Manutenção Ativo</p>
              <p className="text-destructive/80 text-xs mt-1">A plataforma está em manutenção para usuários regulares</p>
            </div>
          )}
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button variant="outline" className="justify-start text-sm"><Database className="h-4 w-4 mr-2" />Backup do Banco de Dados</Button>
            <Button variant="outline" className="justify-start text-sm"><Activity className="h-4 w-4 mr-2" />Limpar Cache do Sistema</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
