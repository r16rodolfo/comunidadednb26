import Layout from "@/components/Layout";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Calculator, Construction } from "lucide-react";

export default function AdminPlanner() {
  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <PageHeader
          icon={Calculator}
          title="Planner de Compras"
          description="Dados agregados das compras de câmbio dos usuários"
        />

        <Card>
          <CardContent className="py-16 text-center">
            <Construction className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
            <h3 className="text-lg font-semibold mb-2">Em construção</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              O painel de analytics do Planner com dados agregados dos usuários estará disponível em breve. 
              Os dados individuais dos usuários continuam sendo gerenciados na página do Planner.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
