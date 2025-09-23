import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Factory, 
  BarChart3, 
  Upload,
  TrendingUp
} from "lucide-react";
import { toast } from "sonner";
import { Manufacturing } from "./Manufacturing";
import { ProductionImporter } from "./ProductionImporter";

interface ManufacturingTabsProps {
  onTabChange: (tab: string) => void;
  onProductionToStock?: (production: any) => void;
  productions?: any[];
  setProductions?: React.Dispatch<React.SetStateAction<any[]>>;
}

export function ManufacturingTabs({ 
  onTabChange, 
  onProductionToStock,
  productions,
  setProductions
}: ManufacturingTabsProps) {

  return (
    <div className="space-y-6">
      <Tabs defaultValue="production" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="production" className="flex items-center gap-2">
            <Factory className="w-4 h-4" />
            Produção
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Relatórios
          </TabsTrigger>
          <TabsTrigger value="imports" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Importar
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="production">
          <Manufacturing 
            onTabChange={onTabChange}
            onProductionToStock={onProductionToStock}
            productions={productions}
            setProductions={setProductions}
          />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Relatórios de Produção
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Em desenvolvimento - Relatórios detalhados de produção, eficiência e qualidade.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="imports" className="space-y-6">
          <ProductionImporter 
            onOrdersImported={(orders) => {
              toast.success(`${orders.length} ordens de produção importadas!`);
              // Converter ordens importadas para o formato interno de produções
              if (setProductions) {
                const newProductions = orders.map((order, index) => ({
                  id: Date.now() + index,
                  date: order.dueDate,
                  pieceName: order.product,
                  quantity: order.quantity,
                  gessoSacos: Math.ceil(order.quantity / 10), // Estimativa
                  colaborador: "Importado",
                  orderNumber: order.orderNumber,
                  priority: order.priority,
                  status: order.status,
                  customer: order.customer,
                  materials: order.materials,
                  notes: order.notes
                }));
                
                setProductions(prev => [...(prev || []), ...newProductions]);
              }
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}