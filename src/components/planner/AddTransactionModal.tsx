import { useState } from "react";
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
  currency: string;
}

export function AddTransactionModal({ 
  open, 
  onOpenChange, 
  onSubmit, 
  currency 
}: AddTransactionModalProps) {
  const [date, setDate] = useState<Date>(new Date());
  const [location, setLocation] = useState("");
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("");
  const [totalPaid, setTotalPaid] = useState("");
  const [autoCalculate, setAutoCalculate] = useState(true);

  const handleAmountChange = (value: string) => {
    setAmount(value);
    if (autoCalculate && rate && value) {
      const calculatedTotal = parseFloat(value) * parseFloat(rate);
      setTotalPaid(calculatedTotal.toFixed(2));
    }
  };

  const handleRateChange = (value: string) => {
    setRate(value);
    if (autoCalculate && amount && value) {
      const calculatedTotal = parseFloat(amount) * parseFloat(value);
      setTotalPaid(calculatedTotal.toFixed(2));
    }
  };

  const handleTotalPaidChange = (value: string) => {
    setTotalPaid(value);
    setAutoCalculate(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!location || !amount || !rate || !totalPaid) {
      return;
    }

    onSubmit({
      date,
      location,
      amount: parseFloat(amount),
      rate: parseFloat(rate),
      totalPaid: parseFloat(totalPaid),
    });

    // Reset form
    setLocation("");
    setAmount("");
    setRate("");
    setTotalPaid("");
    setAutoCalculate(true);
    onOpenChange(false);
  };

  const resetForm = () => {
    setDate(new Date());
    setLocation("");
    setAmount("");
    setRate("");
    setTotalPaid("");
    setAutoCalculate(true);
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
            Nova Compra de {currency}
          </DialogTitle>
          <DialogDescription>
            Registre uma nova transação de compra de moeda estrangeira
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
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            {/* Taxa */}
            <div className="space-y-2">
              <Label htmlFor="rate">Taxa (R$ por {currency})</Label>
              <Input
                id="rate"
                type="number"
                step="0.0001"
                value={rate}
                onChange={(e) => handleRateChange(e.target.value)}
                placeholder="0.0000"
                required
              />
            </div>
          </div>

          {/* Total Pago */}
          <div className="space-y-2">
            <Label htmlFor="totalPaid">
              Total Pago (R$)
              {autoCalculate && (
                <span className="text-xs text-muted-foreground ml-2">
                  (calculado automaticamente)
                </span>
              )}
            </Label>
            <Input
              id="totalPaid"
              type="number"
              step="0.01"
              value={totalPaid}
              onChange={(e) => handleTotalPaidChange(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!location || !amount || !rate || !totalPaid}>
              Adicionar Transação
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}