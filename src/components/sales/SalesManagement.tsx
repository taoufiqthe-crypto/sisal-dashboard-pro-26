// src/components/sales/SalesManagement.tsx
import { useState } from "react";
import { useStockManagement } from "@/hooks/useStockManagement";
import { Button } from "@/components/ui/button";
import { PlusCircle, Monitor, BarChart3 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { NewSale } from "./NewSale";
import { PDVInterface } from "./PDVInterface";
import { ModernPDV } from "./ModernPDV";
import { SalesToday } from "./SalesToday";
import { SalesMonth } from "./SalesMonth";
import { SalesYear } from "./SalesYear";
import { SalesHistory } from "./SalesHistory";
import { SalesByPayment } from "./SalesByPayment";
import {
  Sale,
  Product,
  paymentMethods,
  mockSales,
  Customer,
} from "./types";

interface SalesManagementProps {
  products: Product[];
  setProducts?: React.Dispatch<React.SetStateAction<Product[]>>;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  onSaleCreated?: (sale: Sale) => void;
}

export function SalesManagement({
  products,
  setProducts,
  customers,
  setCustomers,
  onSaleCreated,
}: SalesManagementProps) {
  const [sales, setSales] = useState<Sale[]>(mockSales);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { updateProductStock, validateStock } = useStockManagement();

  const formatCurrency = (value: number) => `R$ ${value.toFixed(2)}`;

  const isToday = (date: string) => {
    const today = new Date().toISOString().split("T")[0];
    return date === today;
  };

  const isThisMonth = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  };

  const isThisYear = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    return d.getFullYear() === now.getFullYear();
  };

  const handleSaleCreated = (newSale: Sale) => {
    // Validar estoque antes de finalizar venda
    if (newSale.cart && setProducts) {
      const stockValid = validateStock(products, newSale.cart);
      if (!stockValid) {
        return; // Não finaliza a venda se estoque inválido
      }
    }

    setSales([newSale, ...sales]);
    
    // Atualizar estoque automaticamente usando o hook
    if (setProducts && newSale.cart) {
      updateProductStock(products, setProducts, newSale.cart);
    }
    
    // Chamar callback se fornecido
    if (onSaleCreated) {
      onSaleCreated(newSale);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="pdv" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pdv" className="flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            PDV Moderno
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Relatórios de Vendas
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pdv" className="mt-0">
          <ModernPDV
            products={products}
            customers={customers}
            setCustomers={setCustomers}
            onSaleCreated={handleSaleCreated}
          />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          {/* Cabeçalho dos Relatórios */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Relatórios de Vendas</h2>
              <p className="text-muted-foreground">Acompanhe o desempenho das suas vendas</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Nova Venda Manual
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Nova Venda Manual</DialogTitle>
                </DialogHeader>
                <NewSale
                  products={products}
                  customers={customers}
                  setCustomers={setCustomers}
                  onSaleCreated={handleSaleCreated}
                  onClose={() => setIsDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <SalesToday 
              sales={sales.filter(sale => isToday(sale.date))} 
              paymentMethods={paymentMethods}
              formatCurrency={formatCurrency}
              isToday={isToday}
            />
            <SalesMonth 
              sales={sales.filter(sale => isThisMonth(sale.date))} 
              paymentMethods={paymentMethods}
              formatCurrency={formatCurrency}
              isThisMonth={isThisMonth}
            />
            <SalesYear 
              sales={sales.filter(sale => isThisYear(sale.date))} 
              paymentMethods={paymentMethods}
              formatCurrency={formatCurrency}
              isThisYear={isThisYear}
            />
          </div>

          {/* Vendas por Forma de Pagamento - Mensal */}
          <div className="mt-6">
            <SalesByPayment
              sales={sales}
              paymentMethods={paymentMethods}
              title="Vendas do Mês por Forma de Pagamento"
              filterFn={isThisMonth}
              formatCurrency={formatCurrency}
            />
          </div>

          <SalesHistory 
            sales={sales} 
            formatCurrency={formatCurrency}
            onSaleDeleted={(saleId) => {
              setSales(prevSales => prevSales.filter(sale => sale.id !== saleId));
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}