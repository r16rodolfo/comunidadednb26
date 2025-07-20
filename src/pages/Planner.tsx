import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, TrendingUp, Target, Clock } from "lucide-react";

export default function Planner() {
  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Planner de Compras de Câmbio
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Planeje suas compras de moeda estrangeira com inteligência e acompanhe seu progresso visualmente
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                Nova Meta de Compra
              </CardTitle>
              <CardDescription>
                Configure seu objetivo de compra de moeda estrangeira
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-lg mb-4">Funcionalidade em desenvolvimento</p>
                <p className="text-sm">
                  Em breve você poderá criar e gerenciar suas metas de compra de câmbio
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  Progresso Atual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">0%</div>
                  <p className="text-sm text-muted-foreground">Meta concluída</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5 text-primary" />
                  Próximas Ações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    Nenhuma meta ativa no momento
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Criar Primeira Meta
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}