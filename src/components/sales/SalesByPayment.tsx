import { Card } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

interface Sale {
  id: number;
  date: string;
  total: number;
  paymentMethod: string;
}

interface PaymentMethod {
  type: string;
  label: string;
  icon: string;
}

interface Props {
  sales: Sale[];
  paymentMethods: PaymentMethod[];
  title: string;
  filterFn: (date: string) => boolean;
  formatCurrency: (value: number) => string;
}

export function SalesByPayment({
  sales,
  paymentMethods,
  title,
  filterFn,
  formatCurrency,
}: Props) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
        <DollarSign className="w-5 h-5" />
        <span>{title}</span>
      </h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {paymentMethods.map((method) => {
          const filteredSales = sales.filter(
            (s) => filterFn(s.date) && s.paymentMethod === method.type
          );
          const total = filteredSales.reduce((sum, s) => sum + s.total, 0);
          const count = filteredSales.length;

          return (
            <div
              key={method.type}
              className="p-4 border rounded-lg bg-muted/30"
            >
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg">{method.icon}</span>
                <span className="font-medium text-sm">{method.label}</span>
              </div>
              <p className="text-lg font-bold text-revenue">
                {formatCurrency(total)}
              </p>
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
