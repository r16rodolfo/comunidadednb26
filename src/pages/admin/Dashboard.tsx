import { useState } from 'react';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AdminPageHeader } from '@/components/shared/AdminPageHeader';
import { defaultPlatformConfig } from '@/data/mock-admin';
import { OverviewTab } from '@/components/admin/tabs/OverviewTab';
import { PlatformTab } from '@/components/admin/tabs/PlatformTab';
import { SecurityTab } from '@/components/admin/tabs/SecurityTab';
import { HomeTab } from '@/components/admin/tabs/HomeTab';

const TAB_LABELS: Record<string, string> = {
  overview: 'Visão Geral',
  home: 'Página Inicial',
  platform: 'Plataforma',
  security: 'Segurança',
};

export default function AdminDashboard() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [platformConfig, setPlatformConfig] = useState(defaultPlatformConfig);

  const handleSavePlatformConfig = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      localStorage.setItem('bunny_library_id', platformConfig.integrations.bunnyLibraryId);
      toast({ title: 'Configurações salvas com sucesso!' });
    } catch {
      toast({ title: 'Erro ao salvar configurações', description: 'Tente novamente mais tarde', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        <AdminPageHeader icon={BarChart3} title="Painel Administrativo" description="Gerencie e monitore toda a plataforma" />

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full justify-start border-b bg-transparent p-0 h-auto rounded-none gap-0.5 overflow-x-auto scrollbar-hide">
            {Object.entries(TAB_LABELS).map(([value, label]) => (
              <TabsTrigger key={value} value={value} className="rounded-b-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none px-3 sm:px-4 py-2.5 text-xs sm:text-sm whitespace-nowrap flex-shrink-0">
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="space-y-6 pt-4">
            <OverviewTab />
          </TabsContent>

          <TabsContent value="home" className="space-y-6 pt-4">
            <HomeTab />
          </TabsContent>

          <TabsContent value="platform" className="space-y-6 pt-4">
            <PlatformTab
              platformConfig={platformConfig}
              setPlatformConfig={setPlatformConfig}
              onSave={handleSavePlatformConfig}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="security" className="space-y-6 pt-4">
            <SecurityTab platformConfig={platformConfig} setPlatformConfig={setPlatformConfig} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
