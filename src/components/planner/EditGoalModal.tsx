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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Target } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { TripGoal, SUPPORTED_CURRENCIES } from "@/types/planner";

interface EditGoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (goal: Omit<TripGoal, 'id' | 'createdAt'>) => void;
  existingGoal?: TripGoal | null;
}

export function EditGoalModal({ 
  open, 
  onOpenChange, 
  onSubmit, 
  existingGoal 
}: EditGoalModalProps) {
  const [targetAmount, setTargetAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [tripDate, setTripDate] = useState<Date>();

  useEffect(() => {
    if (existingGoal) {
      setTargetAmount(existingGoal.targetAmount.toString());
      setCurrency(existingGoal.currency);
      setTripDate(existingGoal.tripDate);
    } else {
      // Reset form for new goal
      setTargetAmount("");
      setCurrency("USD");
      setTripDate(undefined);
    }
  }, [existingGoal, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!targetAmount || !currency || !tripDate) {
      return;
    }

    onSubmit({
      targetAmount: parseFloat(targetAmount),
      currency,
      tripDate,
    });

    onOpenChange(false);
  };

  const isEditMode = !!existingGoal;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            {isEditMode ? "Editar Meta de Viagem" : "Nova Meta de Viagem"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? "Atualize os detalhes da sua meta de viagem"
              : "Defina sua meta de compra de moeda estrangeira"
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Valor da Meta */}
            <div className="space-y-2">
              <Label htmlFor="targetAmount">Valor da Meta</Label>
              <Input
                id="targetAmount"
                type="number"
                step="0.01"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="1000.00"
                required
              />
            </div>

            {/* Moeda */}
            <div className="space-y-2">
              <Label htmlFor="currency">Moeda</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar moeda" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_CURRENCIES.map((curr) => (
                    <SelectItem key={curr.code} value={curr.code}>
                      {curr.symbol} {curr.name} ({curr.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Data da Viagem */}
          <div className="space-y-2">
            <Label htmlFor="tripDate">Data da Viagem</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !tripDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {tripDate ? format(tripDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={tripDate}
                  onSelect={setTripDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!targetAmount || !currency || !tripDate}>
              {isEditMode ? "Atualizar Meta" : "Criar Meta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}