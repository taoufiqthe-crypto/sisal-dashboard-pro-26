import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircle, Calendar, DollarSign } from "lucide-react";

interface Withdrawal {
  id: number;
  date: string;
  amount: number;
}

export function WithdrawalsManagement() {
  const [dailyWithdrawals, setDailyWithdrawals] = useState<Withdrawal[]>([]);
  const [newWithdrawalValue, setNewWithdrawalValue] = useState<string>("");
  const [newWithdrawalDate, setNewWithdrawalDate] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const handleAddWithdrawal = () => {
    if (
      newWithdrawalValue.trim() !== "" &&
      !isNaN(parseFloat(newWithdrawalValue))
    ) {
      const chosenDate = newWithdrawalDate
        ? new Date(newWithdrawalDate).toLocaleDateString("pt-BR")
        : new Date().toLocaleDateString("pt-BR");

      const newEntry: Withdrawal = {
        id: Date.now(),
        date: chosenDate,
        amount: parseFloat(newWithdrawalValue),
      };

      setDailyWithdrawals([...dailyWithdrawals, newEntry]);
      setNewWithdrawalValue("");
      setNewWithdrawalDate("");
      setIsDialogOpen(false);
    }
  };

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  // 🔎 Calcula o total de retiradas
  const totalWithdrawals = dailyWithdrawals.reduce(
    (total, entry) => total + entry.amount,
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Controle de Retiradas Diárias
          </h2>
          <p className="text-muted-foreground">
            Registre e acompanhe o total de retiradas do caixa.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <PlusCircle className="w-4 h-4" />
              <span>Nova Retirada</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Registrar Retirada</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Valor */}
              <div className="space-y-2">
                <Label htmlFor="amount">Valor da Retirada (R$)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Ex: 250.00"
                  value={newWithdrawalValue}
                  onChange={(e) => setNewWithdrawalValue(e.target.value)}
                />
              </div>

              {/* Data */}
              <div className="space-y-2">
                <Label htmlFor="date">Data da Retirada</Label>
                <Input
                  id="date"
                  type="date"
                  value={newWithdrawalDate}
                  onChange={(e) => setNewWithdrawalDate(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleAddWithdrawal}>Salvar Retirada</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 🔎 Total de retiradas */}
      <Card className="p-4 flex items-center justify-between bg-slate-50 dark:bg-slate-800">
        <div className="flex items-center space-x-2">
          <DollarSign className="w-6 h-6 text-green-600" />
          <span className="text-lg font-semibold text-green-700 dark:text-green-400">
            Total retirado
          </span>
        </div>
        <div className="text-xl font-bold text-green-700 dark:text-green-400">
          {formatCurrency(totalWithdrawals)}
        </div>
      </Card>

      {/* Histórico */}
      <div>
        <h3 className="text-xl font-bold mb-4">Histórico de Retiradas</h3>
        <div className="grid gap-4">
          {dailyWithdrawals.length > 0 ? (
            dailyWithdrawals.map((entry) => (
              <Card
                key={entry.id}
                className="p-4 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-lg font-semibold">{entry.date}</p>
                    <p className="text-sm text-muted-foreground">
                      Valor Retirado
                    </p>
                  </div>
                </div>
                <div className="text-lg font-bold">
                  {formatCurrency(entry.amount)}
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                Nenhuma retirada registrada ainda.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export { WithdrawalsManagement as Component };
