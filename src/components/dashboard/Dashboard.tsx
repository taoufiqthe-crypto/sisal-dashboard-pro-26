import { StatsCard } from "./StatsCard";
import { StockAlerts } from "./StockAlerts";
import { Card } from "@/components/ui/card";
import { 
  DollarSign, 
  TrendingUp, 
  Calendar,
  AlertTriangle,
  Package,
  ShoppingCart,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Sistema limpo - dados calculados dinamicamente
const mockData = {
  todayRevenue: "R$ 0,00",
  monthRevenue: "R$ 0,00", 
  yearProfit: "R$ 0,00",
  lowStockItems: 0,
  todaySales: 0,
  topProducts: [],
  lowStock: []
};

interface DashboardProps {
  products?: any[];
  sales?: any[];
  onClearAllData?: () => void;
}

export function Dashboard({ products = [], sales = [], onClearAllData }: DashboardProps) {
  // Calcular dados dinâmicos do sistema
  const todayStr = new Date().toISOString().split("T")[0];
  const todaySales = sales.filter(s => s.date === todayStr);
  const monthSales = sales.filter(s => {
    const saleDate = new Date(s.date);
    const now = new Date();
    return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
  });
  
  const todayRevenue = todaySales.reduce((sum, sale) => sum + (sale.total || 0), 0);
  const monthRevenue = monthSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
  const yearRevenue = sales.reduce((sum, sale) => {
    const saleYear = new Date(sale.date).getFullYear();
    return saleYear === new Date().getFullYear() ? sum + (sale.total || 0) : sum;
  }, 0);
  
  const lowStockItems = products.filter(p => p.stock < 20);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Visão geral do seu negócio</p>
        </div>
      </div>

      {/* Cards de estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Faturamento Hoje"
          value={`R$ ${todayRevenue.toFixed(2)}`}
          icon={<DollarSign className="w-8 h-8" />}
          variant="revenue"
          trend={{ value: 12.5, label: "vs ontem" }}
        />
        <StatsCard
          title="Faturamento do Mês"
          value={`R$ ${monthRevenue.toFixed(2)}`}
          icon={<Calendar className="w-8 h-8" />}
          variant="revenue"
          trend={{ value: 8.2, label: "vs mês anterior" }}
        />
        <StatsCard
          title="Faturamento do Ano"
          value={`R$ ${yearRevenue.toFixed(2)}`}
          icon={<TrendingUp className="w-8 h-8" />}
          variant="profit"
          trend={{ value: 15.8, label: "vs ano anterior" }}
        />
        <StatsCard
          title="Produtos em Falta"
          value={lowStockItems.length}
          icon={<AlertTriangle className="w-8 h-8" />}
          variant="warning"
        />
      </div>

      {/* Seção de vendas de hoje e produtos por categoria */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <ShoppingCart className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Produtos Mais Vendidos Hoje</h3>
          </div>
          <div className="space-y-3">
            {todaySales.length > 0 ? (
              todaySales.slice(0, 4).map((sale, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Venda #{sale.id}</p>
                    <p className="text-sm text-muted-foreground">{sale.products?.length || 0} itens</p>
                  </div>
                  <p className="font-semibold text-profit">R$ {(sale.total || 0).toFixed(2)}</p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">Nenhuma venda hoje</p>
            )}
          </div>
        </Card>

        <StockAlerts products={products} />

        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Package className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Vendas por Categoria</h3>
          </div>
          <div className="space-y-3">
            {sales.length > 0 ? (
              // Calcular vendas por categoria dinamicamente
              Object.entries(
                sales.reduce((acc: {[key: string]: {count: number, total: number}}, sale) => {
                  sale.products?.forEach((product: any) => {
                    const category = product.category || 'Sem Categoria';
                    if (!acc[category]) acc[category] = {count: 0, total: 0};
                    acc[category].count += product.quantity || 1;
                    acc[category].total += (product.price || 0) * (product.quantity || 1);
                  });
                  return acc;
                }, {})
              ).slice(0, 4).map(([category, data]) => (
                <div key={category} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{category}</p>
                    <p className="text-sm text-muted-foreground">{(data as {count: number, total: number}).count} vendas</p>
                  </div>
                  <p className="font-semibold text-profit">R$ {(data as {count: number, total: number}).total.toFixed(2)}</p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">Nenhuma venda registrada ainda</p>
            )}
          </div>
        </Card>
      </div>

      {/* Resumo rápido de hoje */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-profit/10 border-primary/20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-2xl font-bold text-primary">{todaySales.length}</p>
            <p className="text-sm text-muted-foreground">Vendas Hoje</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-profit">R$ {todayRevenue.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">Faturamento Hoje</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-warning">{lowStockItems.length}</p>
            <p className="text-sm text-muted-foreground">Alertas de Estoque</p>
          </div>
        </div>
      </Card>
    </div>
  );
}