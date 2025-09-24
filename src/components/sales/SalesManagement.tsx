// src/components/sales/SalesManagement.tsx
import { useState } from "react";
import { useStockManagement } from "@/hooks/useStockManagement";
import { useSalesData } from "@/hooks/useSalesData";
import { Button } from "@/components/ui/button";
import { PlusCircle, Monitor, BarChart3, Loader2 } from "lucide-react";
import { toast } from "sonner";
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
import { SalesAnalytics } from "./SalesAnalytics";
import { DataImporter } from "../imports/DataImporter";
import {
  Sale,
  Product,
  paymentMethods,
  Customer,
} from "./types";

interface SalesManagementProps {
  products: Product[];
  setProducts?: React.Dispatch<React.SetStateAction<Product[]>>;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  onSaleCreated?: (sale: Sale) => void;
  currentOperator?: any;
}

export function SalesManagement({
  products,
  setProducts,
  customers,
  setCustomers,
  onSaleCreated,
  currentOperator,
}: SalesManagementProps) {
  const { sales, loading, createSale, deleteSale } = useSalesData();
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

  const handleSaleCreated = async (newSale: Sale) => {
    try {
      // Validar estoque antes de finalizar venda
      if (newSale.cart && setProducts) {
        const stockValid = validateStock(products, newSale.cart);
        if (!stockValid) {
          return; // Não finaliza a venda se estoque inválido
        }
      }

      // Criar venda no Supabase
      await createSale({
        cart: newSale.cart || [],
        total: newSale.total,
        paymentMethod: newSale.paymentMethod,
        customerId: newSale.customer?.id !== 0 ? newSale.customer?.id : undefined,
        discount: newSale.discount,
        date: new Date(newSale.date)
      });
      
      // Salvar também no localStorage para compatibilidade com relatórios
      const storedSales = JSON.parse(localStorage.getItem('sales') || '[]');
      storedSales.unshift(newSale);
      localStorage.setItem('sales', JSON.stringify(storedSales));
      
      // Atualizar estoque automaticamente usando o hook (para compatibilidade)
      if (setProducts && newSale.cart) {
        updateProductStock(products, setProducts, newSale.cart);
      }
      
      // Chamar callback se fornecido
      if (onSaleCreated) {
        onSaleCreated(newSale);
      }
      
    } catch (error) {
      console.error('Erro ao processar venda:', error);
      toast.error("Erro ao processar venda");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando vendas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="pdv" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pdv" className="flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            PDV Moderno
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Relatórios de Vendas
          </TabsTrigger>
          <TabsTrigger value="imports" className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4" />
            Importar Dados
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
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold">Relatórios de Vendas</h3>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Nova Venda Manual
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
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

          {/* Componente de Analytics Completo */}
          <SalesAnalytics sales={sales} />

          <SalesHistory 
            sales={sales} 
            formatCurrency={(value: number) => `R$ ${value.toFixed(2)}`}
            onSaleDeleted={deleteSale}
          />
        </TabsContent>

        <TabsContent value="imports" className="space-y-6">
          <DataImporter 
            onProductsImported={(newProducts) => {
              if (setProducts) {
                setProducts(prev => [...prev, ...newProducts]);
              }
              toast.success(`${newProducts.length} produtos importados!`);
            }}
            onSalesImported={(newSales) => {
              // Adicionar vendas importadas ao localStorage para compatibilidade
              const storedSales = JSON.parse(localStorage.getItem('sales') || '[]');
              const updatedSales = [...newSales, ...storedSales];
              localStorage.setItem('sales', JSON.stringify(updatedSales));
              
              // Criar vendas no Supabase
              newSales.forEach(sale => {
                createSale({
                  cart: sale.cart || [],
                  total: sale.total,
                  paymentMethod: sale.paymentMethod,
                  customerId: sale.customer?.id !== 0 ? sale.customer?.id : undefined,
                  discount: 0,
                  date: new Date(sale.date)
                });
              });
              
              toast.success(`${newSales.length} vendas importadas!`);
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}