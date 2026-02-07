import { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  Users, BookOpen, TrendingUp, UserPlus, DollarSign, Activity,
  Eye, Settings, Key, Database, Shield, AlertTriangle,
  Ticket, CreditCard, BarChart3,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { StatCard } from '@/components/shared/StatCard';
import { AdminPageHeader } from '@/components/shared/AdminPageHeader';
import {
  adminStats, recentUsers, recentActivity,
  defaultPlatformConfig, defaultApiConfigs,
} from '@/data/mock-admin';

// ─── Quick Action Link ──────────────────────────────────────
function QuickLink({ to, icon: Icon, label, description }: {
  to: string; icon: React.ElementType; label: string; description: string;
}) {
  return (
    <Link to={to}>
      <Card className="hover:border-primary/40 hover:shadow-md transition-all duration-200 cursor-pointer group h-full">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-primary/10 p-3 group-hover:bg-primary/15 transition-colors">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{label}</h3>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// ─── Main Component ─────────────────────────────────────────
export default function AdminDashboard() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [platformConfig, setPlatformConfig] = useState(defaultPlatformConfig);
  const [apiConfigs, setApiConfigs] = useState(defaultApiConfigs);

  const handleSavePlatformConfig = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({ title: 'Configurações salvas com sucesso!' });
    } catch {
      toast({ title: 'Erro ao salvar configurações', description: 'Tente novamente mais tarde', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleApi = (apiId: string, checked: boolean) => {
    setApiConfigs(prev => prev.map(api => api.id === apiId ? { ...api, isActive: checked } : api));
    toast({ title: checked ? 'API ativada!' : 'API desativada!' });
  };

  const handleConfigureApi = (apiName: string) => {
    toast({
      title: 'Configuração requer backend',
      description: `Para configurar a chave da ${apiName} com segurança, ative o Lovable Cloud.`,
      variant: 'destructive',
    });
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        <AdminPageHeader icon={BarChart3} title="Painel Administrativo" description="Gerencie e monitore toda a plataforma" />

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full justify-start border-b bg-transparent p-0 h-auto rounded-none gap-1">
            {['overview', 'platform', 'apis', 'security', 'system'].map(tab => (
              <TabsTrigger key={tab} value={tab} className="rounded-b-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none px-4 py-2.5">
                {{ overview: 'Visão Geral', platform: 'Plataforma', apis: 'APIs', security: 'Segurança', system: 'Sistema' }[tab]}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── Visão Geral ───────────────────────────────── */}
          <TabsContent value="overview" className="space-y-6 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total de Usuários" value={adminStats.totalUsers.toLocaleString()} icon={Users} />
              <StatCard label="Usuários Ativos" value={adminStats.activeUsers.toLocaleString()} icon={Activity} variant="success" />
              <StatCard label="Novos este Mês" value={`+${adminStats.newUsersThisMonth}`} icon={UserPlus} variant="info" />
              <StatCard label="Receita Mensal" value={`R$ ${adminStats.monthlyRevenue.toLocaleString()}`} icon={DollarSign} variant="success" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Usuários Recentes</CardTitle>
                    <Button asChild variant="ghost" size="sm">
                      <Link to="/admin/users"><Eye className="h-4 w-4 mr-1.5" />Ver Todos</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                        <div className="text-right space-y-1">
                          <Badge variant={user.role === 'premium' ? 'default' : 'outline'} className="text-xs">
                            {user.role === 'premium' ? 'Premium' : 'Gratuito'}
                          </Badge>
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(user.joinedAt).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Atividade Recente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-1.5 shrink-0"></div>
                        <div>
                          <p className="text-sm">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">{activity.user} • {activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Acesso Rápido</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <QuickLink to="/admin/users" icon={Users} label="Usuários" description={`${adminStats.totalUsers} cadastrados`} />
                <QuickLink to="/admin/content" icon={BookOpen} label="Conteúdo" description={`${adminStats.totalCourses} aulas`} />
                <QuickLink to="/admin/coupons" icon={Ticket} label="Cupons" description="Gerenciar cupons" />
                <QuickLink to="/admin/subscriptions" icon={CreditCard} label="Assinaturas" description="Planos e receita" />
              </div>
            </div>
          </TabsContent>

          {/* ── Plataforma ────────────────────────────────── */}
          <TabsContent value="platform" className="space-y-6 pt-4">
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
                          {feature === 'analytics' && 'Analytics da Plataforma'}
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
                <Button onClick={handleSavePlatformConfig} disabled={isLoading} className="w-full">
                  {isLoading ? 'Salvando...' : 'Salvar Configurações'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── APIs ──────────────────────────────────────── */}
          <TabsContent value="apis" className="space-y-4 pt-4">
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
                    <Button onClick={() => handleConfigureApi(api.name)} variant="outline" size="sm">
                      {api.isConfigured ? 'Alterar' : 'Configurar'}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Switch checked={api.isActive} onCheckedChange={(checked) => handleToggleApi(api.id, checked)} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* ── Segurança ─────────────────────────────────── */}
          <TabsContent value="security" className="space-y-6 pt-4">
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
          </TabsContent>

          {/* ── Sistema ──────────────────────────────────── */}
          <TabsContent value="system" className="space-y-6 pt-4">
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
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
