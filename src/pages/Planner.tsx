import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Target, Calculator } from "lucide-react";
import { usePlanner } from "@/hooks/usePlanner";
import { MetricsGrid } from "@/components/planner/MetricsGrid";
import { BuyingPaceCard } from "@/components/planner/BuyingPaceCard";
import { TransactionTable } from "@/components/planner/TransactionTable";
import { AddTransactionModal } from "@/components/planner/AddTransactionModal";
import { EditGoalModal } from "@/components/planner/EditGoalModal";
import { useToast } from "@/hooks/use-toast";
import { TripGoal, Transaction } from "@/types/planner";
import { PageHeader } from '@/components/shared/PageHeader';

export default function Planner() {
  const {
    tripGoal,
    transactions,
    metrics,
    buyingPace,
    createGoal,
    updateGoal,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = usePlanner();

  const { toast } = useToast();
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showEditGoal, setShowEditGoal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreateGoal = (goal: Omit<TripGoal, 'id' | 'createdAt'>) => {
    createGoal(goal);
    toast({
      title: "Meta criada com sucesso!",
      description: "Sua meta de viagem foi configurada. Agora você pode começar a adicionar transações.",
    });
  };

  const handleUpdateGoal = (goal: Omit<TripGoal, 'id' | 'createdAt'>) => {
    updateGoal(goal);
    toast({
      title: "Meta atualizada!",
      description: "Os detalhes da sua meta foram atualizados com sucesso.",
    });
  };

  const handleAddTransaction = (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    addTransaction(transaction);
    toast({
      title: "Transação adicionada!",
      description: "Sua compra de moeda foi registrada com sucesso.",
    });
  };

  const handleEditTransaction = (id: string, transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    updateTransaction(id, transaction);
    setEditingTransaction(null);
    toast({
      title: "Transação atualizada!",
      description: "Os dados da compra foram atualizados com sucesso.",
    });
  };

  const handleConfirmDelete = () => {
    if (deletingId) {
      deleteTransaction(deletingId);
      setDeletingId(null);
      toast({
        title: "Transação removida",
        description: "A transação foi excluída do seu histórico.",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowAddTransaction(true);
  };

  // Empty state when no goal is set
  if (!tripGoal) {
    return (
      <Layout>
        <div className="space-y-8 animate-fade-in">
          <PageHeader icon={Calculator} title="Planner de Compras de Câmbio" description="Planeje suas compras de moeda estrangeira com inteligência" />

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
        <PageHeader icon={Calculator} title="Planner de Compras" description="Acompanhe seu progresso e planeje suas compras">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowEditGoal(true)} className="text-xs sm:text-sm">
              <Target className="mr-1.5 h-4 w-4" />
              Editar Meta
            </Button>
            <Button size="sm" onClick={() => { setEditingTransaction(null); setShowAddTransaction(true); }} className="text-xs sm:text-sm">
              <Plus className="mr-1.5 h-4 w-4" />
              Nova Compra
            </Button>
          </div>
        </PageHeader>

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
              onEdit={handleEditClick}
              onDelete={(id) => setDeletingId(id)}
            />
          </div>
        </div>

        {/* Modals */}
        <AddTransactionModal
          open={showAddTransaction}
          onOpenChange={(open) => {
            setShowAddTransaction(open);
            if (!open) setEditingTransaction(null);
          }}
          onSubmit={handleAddTransaction}
          onEdit={handleEditTransaction}
          currency={tripGoal.currency}
          editingTransaction={editingTransaction}
        />

        <EditGoalModal
          open={showEditGoal}
          onOpenChange={setShowEditGoal}
          onSubmit={handleUpdateGoal}
          existingGoal={tripGoal}
        />

        {/* Delete Confirmation */}
        <AlertDialog open={!!deletingId} onOpenChange={(open) => { if (!open) setDeletingId(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir transação</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
