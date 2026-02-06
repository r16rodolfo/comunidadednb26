
import { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Settings as SettingsIcon, 
  Key, 
  Database, 
  Shield, 
  Activity,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminSettings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [platformConfig, setPlatformConfig] = useState({
    siteName: 'Comunidade DNB',
    siteDescription: 'Viaje com inteligência',
    maintenanceMode: false,
    registrationEnabled: true,
    maxFreeUsers: 1000,
    features: {
      planner: true,
      academy: true,
      analytics: true
    },
    limits: {
      freeTransactions: 10,
      premiumTransactions: -1,
      apiCalls: 1000
    }
  });

  const [apiConfigs, setApiConfigs] = useState([
    { id: '1', name: 'OpenAI API', key: 'sk-...', isActive: true },
    { id: '2', name: 'PandaVideo API', key: 'pv_...', isActive: true },
    { id: '3', name: 'Exchange Rate API', key: 'er_...', isActive: false },
    { id: '4', name: 'Stripe Secret Key', key: 'sk_live_...', isActive: true }
  ]);

  const handleSavePlatformConfig = async () => {
    setIsLoading(true);
    try {
      // Mock save
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({ title: 'Configurações salvas com sucesso!' });
    } catch (error) {
      toast({
        title: 'Erro ao salvar configurações',
        description: 'Tente novamente mais tarde',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveApiConfig = async (apiId: string, newKey: string) => {
    setApiConfigs(prev => prev.map(api => 
      api.id === apiId ? { ...api, key: newKey } : api
    ));
    toast({ title: 'API configurada com sucesso!' });
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
            <SettingsIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Configurações do Sistema</h1>
            <p className="text-muted-foreground">Gerencie as configurações globais da plataforma</p>
          </div>
        </div>

        <Tabs defaultValue="platform" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="platform">Plataforma</TabsTrigger>
            <TabsTrigger value="apis">APIs</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
            <TabsTrigger value="maintenance">Manutenção</TabsTrigger>
          </TabsList>

          <TabsContent value="platform">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações Gerais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="siteName">Nome do Site</Label>
                      <Input
                        id="siteName"
                        value={platformConfig.siteName}
                        onChange={(e) => setPlatformConfig(prev => ({ 
                          ...prev, 
                          siteName: e.target.value 
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxFreeUsers">Limite de Usuários Gratuitos</Label>
                      <Input
                        id="maxFreeUsers"
                        type="number"
                        value={platformConfig.maxFreeUsers}
                        onChange={(e) => setPlatformConfig(prev => ({ 
                          ...prev, 
                          maxFreeUsers: parseInt(e.target.value) 
                        }))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="siteDescription">Descrição do Site</Label>
                    <Textarea
                      id="siteDescription"
                      value={platformConfig.siteDescription}
                      onChange={(e) => setPlatformConfig(prev => ({ 
                        ...prev, 
                        siteDescription: e.target.value 
                      }))}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Recursos da Plataforma</h3>
                    {Object.entries(platformConfig.features).map(([feature, enabled]) => (
                      <div key={feature} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium capitalize">{feature}</p>
                          <p className="text-sm text-muted-foreground">
                            {feature === 'planner' && 'Planner de Compras'}
                            {feature === 'academy' && 'DNB Academy'}
                            {feature === 'analytics' && 'Analytics da Plataforma'}
                          </p>
                        </div>
                        <Switch
                          checked={enabled}
                          onCheckedChange={(checked) => 
                            setPlatformConfig(prev => ({
                              ...prev,
                              features: { ...prev.features, [feature]: checked }
                            }))
                          }
                        />
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Limites de Uso</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Transações Usuários Gratuitos</Label>
                        <Input
                          type="number"
                          value={platformConfig.limits.freeTransactions}
                          onChange={(e) => setPlatformConfig(prev => ({
                            ...prev,
                            limits: { ...prev.limits, freeTransactions: parseInt(e.target.value) }
                          }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Transações Usuários Premium</Label>
                        <Input
                          type="number"
                          value={platformConfig.limits.premiumTransactions}
                          onChange={(e) => setPlatformConfig(prev => ({
                            ...prev,
                            limits: { ...prev.limits, premiumTransactions: parseInt(e.target.value) }
                          }))}
                          placeholder="-1 para ilimitado"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Chamadas de API por Dia</Label>
                        <Input
                          type="number"
                          value={platformConfig.limits.apiCalls}
                          onChange={(e) => setPlatformConfig(prev => ({
                            ...prev,
                            limits: { ...prev.limits, apiCalls: parseInt(e.target.value) }
                          }))}
                        />
                      </div>
                    </div>
                  </div>

                  <Button onClick={handleSavePlatformConfig} disabled={isLoading} className="w-full">
                    {isLoading ? 'Salvando...' : 'Salvar Configurações'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="apis">
            <div className="space-y-6">
              {apiConfigs.map((api) => (
                <Card key={api.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5" />
                        {api.name}
                      </CardTitle>
                      <Badge variant={api.isActive ? 'default' : 'secondary'}>
                        {api.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Chave da API</Label>
                      <div className="flex gap-2">
                        <Input
                          type="password"
                          value={api.key}
                          onChange={(e) => setApiConfigs(prev => 
                            prev.map(a => a.id === api.id ? { ...a, key: e.target.value } : a)
                          )}
                          placeholder="Cole sua chave de API aqui"
                        />
                        <Button 
                          onClick={() => handleSaveApiConfig(api.id, api.key)}
                          variant="outline"
                        >
                          Salvar
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Status da API</span>
                      <Switch
                        checked={api.isActive}
                        onCheckedChange={(checked) => 
                          setApiConfigs(prev => 
                            prev.map(a => a.id === api.id ? { ...a, isActive: checked } : a)
                          )
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Configurações de Segurança
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Registro de Novos Usuários</p>
                    <p className="text-sm text-muted-foreground">Permitir novos cadastros na plataforma</p>
                  </div>
                  <Switch
                    checked={platformConfig.registrationEnabled}
                    onCheckedChange={(checked) => 
                      setPlatformConfig(prev => ({ ...prev, registrationEnabled: checked }))
                    }
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Logs de Auditoria</h3>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm">Últimas atividades administrativas:</p>
                    <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                      <p>• API OpenAI configurada - há 2 horas</p>
                      <p>• Usuário premium@dnb.com criado - há 1 dia</p>
                      <p>• Configurações da plataforma atualizadas - há 3 dias</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Status do Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-green-600">99.9%</p>
                      <p className="text-sm text-muted-foreground">Uptime</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold">245ms</p>
                      <p className="text-sm text-muted-foreground">Latência Média</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold">1,234</p>
                      <p className="text-sm text-muted-foreground">Usuários Ativos</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold">15,678</p>
                      <p className="text-sm text-muted-foreground">API Calls Hoje</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="maintenance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Modo de Manutenção
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Ativar Modo de Manutenção</p>
                    <p className="text-sm text-muted-foreground">
                      Bloqueia acesso de todos os usuários exceto administradores
                    </p>
                  </div>
                  <Switch
                    checked={platformConfig.maintenanceMode}
                    onCheckedChange={(checked) => 
                      setPlatformConfig(prev => ({ ...prev, maintenanceMode: checked }))
                    }
                  />
                </div>
                
                {platformConfig.maintenanceMode && (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <p className="text-yellow-800 font-medium">⚠️ Modo de Manutenção Ativo</p>
                    <p className="text-yellow-700 text-sm mt-1">
                      A plataforma está em manutenção para usuários regulares
                    </p>
                  </div>
                )}
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Ferramentas de Manutenção</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="justify-start">
                      <Database className="h-4 w-4 mr-2" />
                      Backup do Banco de Dados
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Activity className="h-4 w-4 mr-2" />
                      Limpar Cache do Sistema
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
