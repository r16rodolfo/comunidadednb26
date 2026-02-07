import { useState } from 'react';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AdminPageHeader } from '@/components/shared/AdminPageHeader';
import { defaultPlatformConfig, defaultApiConfigs } from '@/data/mock-admin';
import { OverviewTab } from '@/components/admin/tabs/OverviewTab';
import { PlatformTab } from '@/components/admin/tabs/PlatformTab';
import { ApisTab } from '@/components/admin/tabs/ApisTab';
import { SecurityTab } from '@/components/admin/tabs/SecurityTab';
import { SystemTab } from '@/components/admin/tabs/SystemTab';

const TAB_LABELS: Record<string, string> = {
  overview: 'Visão Geral',
  platform: 'Plataforma',
  apis: 'APIs',
  security: 'Segurança',
  system: 'Sistema',
};

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
            {Object.entries(TAB_LABELS).map(([value, label]) => (
              <TabsTrigger key={value} value={value} className="rounded-b-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none px-4 py-2.5">
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="space-y-6 pt-4">
            <OverviewTab />
          </TabsContent>

          <TabsContent value="platform" className="space-y-6 pt-4">
            <PlatformTab
              platformConfig={platformConfig}
              setPlatformConfig={setPlatformConfig}
              onSave={handleSavePlatformConfig}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="apis" className="space-y-4 pt-4">
            <ApisTab
              apiConfigs={apiConfigs}
              onToggleApi={handleToggleApi}
              onConfigureApi={handleConfigureApi}
            />
          </TabsContent>

          <TabsContent value="security" className="space-y-6 pt-4">
            <SecurityTab platformConfig={platformConfig} setPlatformConfig={setPlatformConfig} />
          </TabsContent>

          <TabsContent value="system" className="space-y-6 pt-4">
            <SystemTab platformConfig={platformConfig} setPlatformConfig={setPlatformConfig} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
