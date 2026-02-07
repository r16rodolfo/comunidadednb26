import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Key } from 'lucide-react';
import type { APIConfig } from '@/types/admin';

interface ApisTabProps {
  apiConfigs: APIConfig[];
  onToggleApi: (apiId: string, checked: boolean) => void;
  onConfigureApi: (apiName: string) => void;
}

export function ApisTab({ apiConfigs, onToggleApi, onConfigureApi }: ApisTabProps) {
  return (
    <div className="space-y-4">
      <div className="bg-warning/10 border border-warning/30 p-4 rounded-lg mb-2">
        <p className="text-sm font-medium text-warning">⚠️ Chaves de API são gerenciadas pelo backend</p>
        <p className="text-xs text-muted-foreground mt-1">
          Para adicionar ou alterar chaves, ative o Lovable Cloud. Chaves nunca são expostas no frontend.
        </p>
      </div>
      {apiConfigs.map((api) => (
        <Card key={api.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base"><Key className="h-4 w-4" />{api.name}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={api.isConfigured ? 'default' : 'outline'} className="text-xs">
                  {api.isConfigured ? 'Configurada' : 'Não configurada'}
                </Badge>
                <Badge variant={api.isActive ? 'default' : 'secondary'} className="text-xs">
                  {api.isActive ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-muted/50 rounded-md px-3 py-2 font-mono text-xs text-muted-foreground">
                {api.isConfigured ? api.maskedKey : 'Nenhuma chave configurada'}
              </div>
              <Button onClick={() => onConfigureApi(api.name)} variant="outline" size="sm">
                {api.isConfigured ? 'Alterar' : 'Configurar'}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Switch checked={api.isActive} onCheckedChange={(checked) => onToggleApi(api.id, checked)} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
