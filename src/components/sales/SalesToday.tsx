// src/components/sales/SalesToday.tsx
import { Card } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import { Sale, PaymentMethod } from "./types";

interface SalesTodayProps {
  sales: Sale[];
  paymentMethods: PaymentMethod[];
  formatCurrency: (value: number) => string;
  isToday: (date: string) => boolean;
}

export function SalesToday({ sales, paymentMethods, formatCurrency, isToday }: SalesTodayProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
        <DollarSign className="w-5 h-5" />
        <span>Vendas por Forma de Pagamento (Hoje)</span>
      </h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {paymentMethods.map((method) => {
          const todaySales = sales.filter(
            (s) => isToday(s.date) && s.paymentMethod === method.type
          );
          const total = todaySales.reduce((sum, s) => sum + s.total, 0);
          const count = todaySales.length;

          return (
            <div key={method.type} className="p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg">{method.icon}</span>
                <span className="font-medium text-sm">{method.label}</span>
              </div>
              <p className="text-lg font-bold text-revenue">{formatCurrency(total)}</p>
              <p className="text-xs text-muted-foreground">
                {count} venda{count !== 1 ? "s" : ""}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
