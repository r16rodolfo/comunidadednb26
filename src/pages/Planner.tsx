import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Target, TrendingUp } from "lucide-react";
import { usePlanner } from "@/hooks/usePlanner";
import { MetricsGrid } from "@/components/planner/MetricsGrid";
import { BuyingPaceCard } from "@/components/planner/BuyingPaceCard";
import { TransactionTable } from "@/components/planner/TransactionTable";
import { AddTransactionModal } from "@/components/planner/AddTransactionModal";
import { EditGoalModal } from "@/components/planner/EditGoalModal";
import { useToast } from "@/hooks/use-toast";

export default function Planner() {
  const {
    tripGoal,
    transactions,
    metrics,
    buyingPace,
    createGoal,
    updateGoal,
    addTransaction,
    deleteTransaction,
  } = usePlanner();

  const { toast } = useToast();
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showEditGoal, setShowEditGoal] = useState(false);

  const handleCreateGoal = (goal: any) => {
    createGoal(goal);
    toast({
      title: "Meta criada com sucesso!",
      description: "Sua meta de viagem foi configurada. Agora você pode começar a adicionar transações.",
    });
  };

  const handleUpdateGoal = (goal: any) => {
    updateGoal(goal);
    toast({
      title: "Meta atualizada!",
      description: "Os detalhes da sua meta foram atualizados com sucesso.",
    });
  };

  const handleAddTransaction = (transaction: any) => {
    addTransaction(transaction);
    toast({
      title: "Transação adicionada!",
      description: "Sua compra de moeda foi registrada com sucesso.",
    });
  };

  const handleDeleteTransaction = (id: string) => {
    deleteTransaction(id);
    toast({
      title: "Transação removida",
      description: "A transação foi excluída do seu histórico.",
      variant: "destructive",
    });
  };

  // Empty state when no goal is set
  if (!tripGoal) {
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

          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <Target className="h-6 w-6 text-primary" />
                Configurar Meta de Viagem
              </CardTitle>
              <CardDescription>
                Para começar, defina sua meta de compra de moeda estrangeira
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="text-muted-foreground">
                <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-lg mb-2">Nenhuma meta configurada</p>
                <p className="text-sm">
                  Crie sua primeira meta para começar a planejar suas compras de câmbio
                </p>
              </div>
              <Button onClick={() => setShowEditGoal(true)} size="lg" className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeira Meta
              </Button>
            </CardContent>
          </Card>

          <EditGoalModal
            open={showEditGoal}
            onOpenChange={setShowEditGoal}
            onSubmit={handleCreateGoal}
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Planner de Compras de Câmbio
            </h1>
            <p className="text-lg text-muted-foreground">
              Acompanhe seu progresso e planeje suas próximas compras
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowEditGoal(true)}>
              <TrendingUp className="mr-2 h-4 w-4" />
              Editar Meta
            </Button>
            <Button onClick={() => setShowAddTransaction(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Compra
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        {metrics && (
          <MetricsGrid metrics={metrics} currency={tripGoal.currency} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Buying Pace Card */}
          <div className="lg:col-span-1">
            {buyingPace && (
              <BuyingPaceCard buyingPace={buyingPace} currency={tripGoal.currency} />
            )}
          </div>

          {/* Transaction Table */}
          <div className="lg:col-span-2">
            <TransactionTable
              transactions={transactions}
              currency={tripGoal.currency}
              onEdit={() => {}} // TODO: Implement edit transaction
              onDelete={handleDeleteTransaction}
            />
          </div>
        </div>

        {/* Modals */}
        <AddTransactionModal
          open={showAddTransaction}
          onOpenChange={setShowAddTransaction}
          onSubmit={handleAddTransaction}
          currency={tripGoal.currency}
        />

        <EditGoalModal
          open={showEditGoal}
          onOpenChange={setShowEditGoal}
          onSubmit={handleUpdateGoal}
          existingGoal={tripGoal}
        />
      </div>
    </Layout>
  );
}