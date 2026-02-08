import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Construction } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';

export default function Analytics() {
  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader icon={TrendingUp} title="Analytics e Relatórios" description="Acompanhe o desempenho da plataforma" />

        <Card>
          <CardContent className="py-16 text-center">
            <Construction className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
            <h3 className="text-lg font-semibold mb-2">Em construção</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Os relatórios e métricas em tempo real estarão disponíveis quando o sistema de pagamentos e analytics estiver completamente integrado.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
