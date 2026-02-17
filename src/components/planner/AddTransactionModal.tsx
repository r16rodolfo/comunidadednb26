import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Calculator } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Transaction } from "@/types/planner";

interface AddTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onEdit?: (id: string, transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  currency: string;
  editingTransaction?: Transaction | null;
}

export function AddTransactionModal({ 
  open, 
  onOpenChange, 
  onSubmit,
  onEdit,
  currency,
  editingTransaction,
}: AddTransactionModalProps) {
  const [date, setDate] = useState<Date>(new Date());
  const [location, setLocation] = useState("");
  const [amount, setAmount] = useState("");
  const [totalPaid, setTotalPaid] = useState("");

  const isEditing = !!editingTransaction;

  useEffect(() => {
    if (editingTransaction && open) {
      setDate(editingTransaction.date);
      setLocation(editingTransaction.location);
      setAmount(String(editingTransaction.amount));
      setTotalPaid(String(editingTransaction.totalPaid));
    }
  }, [editingTransaction, open]);

  const calculatedRate = amount && totalPaid && parseFloat(amount) > 0
    ? (parseFloat(totalPaid) / parseFloat(amount)).toFixed(4)
    : "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!location || !amount || !totalPaid || !calculatedRate) {
      return;
    }

    const transactionData = {
      date,
      location,
      amount: parseFloat(amount),
      rate: parseFloat(calculatedRate),
      totalPaid: parseFloat(totalPaid),
    };

    if (isEditing && onEdit) {
      onEdit(editingTransaction.id, transactionData);
    } else {
      onSubmit(transactionData);
    }

    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setDate(new Date());
    setLocation("");
    setAmount("");
    setTotalPaid("");
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      onOpenChange(newOpen);
      if (!newOpen) resetForm();
    }}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            {isEditing ? `Editar Compra de ${currency}` : `Nova Compra de ${currency}`}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize os dados desta transação de câmbio"
              : "Registre uma nova transação de compra de moeda estrangeira"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Data */}
            <div className="space-y-2">
              <Label htmlFor="date">Data da Compra</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => newDate && setDate(newDate)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Local */}
            <div className="space-y-2">
              <Label htmlFor="location">Local/Casa de Câmbio</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: Banco Central, Casa de Câmbio XYZ"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Quantidade */}
            <div className="space-y-2">
              <Label htmlFor="amount">Quantidade ({currency})</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            {/* Total Pago */}
            <div className="space-y-2">
              <Label htmlFor="totalPaid">Total Pago (R$)</Label>
              <Input
                id="totalPaid"
                type="number"
                step="0.01"
                value={totalPaid}
                onChange={(e) => setTotalPaid(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Taxa Calculada */}
          <div className="space-y-2">
            <Label htmlFor="rate">
              Taxa (R$ por {currency})
              <span className="text-xs text-muted-foreground ml-2">
                (calculado automaticamente)
              </span>
            </Label>
            <Input
              id="rate"
              type="text"
              value={calculatedRate}
              readOnly
              className="bg-muted cursor-not-allowed"
              placeholder="Preencha quantidade e total"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!location || !amount || !totalPaid || !calculatedRate}>
              {isEditing ? "Salvar Alterações" : "Adicionar Transação"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
