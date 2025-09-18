import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  Calendar,
  BarChart3
} from "lucide-react";

interface Sale {
  id: number;
  date: string;
  products: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  profit: number;
  paymentMethod: string;
  customer: {
    name: string;
  };
}

export function EnhancedReports() {
  // Carregar vendas do localStorage
  const allSales = useMemo(() => {
    try {
      const storedSales = localStorage.getItem("sales");
      return storedSales ? JSON.parse(storedSales) : [];
    } catch {
      return [];
    }
  }, []);

  const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  // Calcular dados dos últimos 6 meses a partir das vendas reais
  const monthlyData = useMemo(() => {
    const monthsMap: { [key: string]: { faturamento: number; lucro: number; dinheiro: number; pix: number; credito: number; debito: number } } = {};
    
    allSales.forEach((sale: Sale) => {
      const date = new Date(sale.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
      
      if (!monthsMap[monthKey]) {
        monthsMap[monthKey] = { faturamento: 0, lucro: 0, dinheiro: 0, pix: 0, credito: 0, debito: 0 };
      }
      
      monthsMap[monthKey].faturamento += sale.total;
      monthsMap[monthKey].lucro += sale.profit || sale.total * 0.3; // assume 30% de lucro se não definido
      
      // Distribuir por método de pagamento
      const paymentMethod = sale.paymentMethod?.toLowerCase() || 'dinheiro';
      if (paymentMethod.includes('pix')) {
        monthsMap[monthKey].pix += sale.total;
      } else if (paymentMethod.includes('credito') || paymentMethod.includes('crédito')) {
        monthsMap[monthKey].credito += sale.total;
      } else if (paymentMethod.includes('debito') || paymentMethod.includes('débito')) {
        monthsMap[monthKey].debito += sale.total;
      } else {
        monthsMap[monthKey].dinheiro += sale.total;
      }
    });

    return Object.entries(monthsMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, data]) => ({
        name: new Date(key + '-01').toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
        ...data
      }));
  }, [allSales]);

  // Calcular dados de pagamento
  const paymentMethodData = useMemo(() => {
    const methods: { [key: string]: number } = {};
    let total = 0;
    
    allSales.forEach((sale: Sale) => {
      const method = sale.paymentMethod || 'Dinheiro';
      methods[method] = (methods[method] || 0) + sale.total;
      total += sale.total;
    });

    return Object.entries(methods).map(([name, value]) => ({
      name,
      value,
      percentage: total > 0 ? (value / total) * 100 : 0,
      color: name.toLowerCase().includes('pix') ? '#00D4AA' : 
             name.toLowerCase().includes('dinheiro') ? '#4CAF50' :
             name.toLowerCase().includes('credito') || name.toLowerCase().includes('crédito') ? '#FF9800' : '#2196F3'
    }));
  }, [allSales]);

  // Performance dos produtos
  const productPerformance = useMemo(() => {
    const products: { [key: string]: { vendas: number; faturamento: number } } = {};
    
    allSales.forEach((sale: Sale) => {
      sale.products?.forEach(product => {
        if (!products[product.name]) {
          products[product.name] = { vendas: 0, faturamento: 0 };
        }
        products[product.name].vendas += product.quantity;
        products[product.name].faturamento += product.quantity * product.price;
      });
    });

    return Object.entries(products)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.faturamento - a.faturamento)
      .slice(0, 5);
  }, [allSales]);

  // Estatísticas gerais
  const stats = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const yearSales = allSales.filter((sale: Sale) => new Date(sale.date).getFullYear() === currentYear);
    
    const totalRevenue = yearSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalProfit = yearSales.reduce((sum, sale) => sum + (sale.profit || sale.total * 0.3), 0);
    const currentMonth = new Date().getMonth();
    const monthSales = yearSales.filter((sale: Sale) => new Date(sale.date).getMonth() === currentMonth);
    const averageTicket = monthSales.length > 0 ? monthSales.reduce((sum, sale) => sum + sale.total, 0) / monthSales.length : 0;
    
    return {
      totalRevenue,
      totalProfit,
      monthSales: monthSales.length,
      averageTicket
    };
  }, [allSales]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
        <p className="text-muted-foreground">Análise detalhada do desempenho do seu negócio</p>
      </div>

      {/* Cards de estatísticas anuais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Faturamento Anual"
          value={formatCurrency(stats.totalRevenue)}
          icon={<DollarSign className="w-8 h-8" />}
          variant="revenue"
          trend={{ value: 15.8, label: "vs ano anterior" }}
        />
        <StatsCard
          title="Lucro Anual"
          value={formatCurrency(stats.totalProfit)}
          icon={<TrendingUp className="w-8 h-8" />}
          variant="profit"
          trend={{ value: 22.4, label: "vs ano anterior" }}
        />
        <StatsCard
          title="Vendas no Mês"
          value={stats.monthSales.toString()}
          icon={<BarChart3 className="w-8 h-8" />}
          variant="success"
          trend={{ value: 8.1, label: "vs mês anterior" }}
        />
        <StatsCard
          title="Ticket Médio"
          value={formatCurrency(stats.averageTicket)}
          icon={<Calendar className="w-8 h-8" />}
          variant="revenue"
          trend={{ value: 5.2, label: "vs mês anterior" }}
        />
      </div>

      {/* Vendas por Forma de Pagamento - Mês Atual */}
      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <DollarSign className="w-5 h-5" />
          <span>Vendas por Forma de Pagamento (Mês Atual)</span>
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {paymentMethodData.map((method) => {
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            const monthSales = allSales.filter((sale: Sale) => {
              const saleDate = new Date(sale.date);
              return saleDate.getMonth() === currentMonth && 
                     saleDate.getFullYear() === currentYear &&
                     sale.paymentMethod === method.name;
            });
            const total = monthSales.reduce((sum, s) => sum + s.total, 0);
            const count = monthSales.length;

            return (
              <div key={method.name} className="p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center space-x-2 mb-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: method.color }}
                  ></div>
                  <span className="font-medium text-sm">{method.name}</span>
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

      {/* Gráficos principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de barras - Faturamento x Lucro Mensal */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Faturamento x Lucro (Últimos 6 Meses)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(value: number, name: string) => [formatCurrency(value), name]}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Bar dataKey="faturamento" fill="hsl(var(--revenue))" name="Faturamento" />
                <Bar dataKey="lucro" fill="hsl(var(--profit))" name="Lucro" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Gráfico de pizza - Formas de Pagamento */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Vendas por Forma de Pagamento (Anual)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                  label={(entry) => `${entry.name}: ${entry.percentage.toFixed(1)}%`}
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-4">
            {paymentMethodData.map((method, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: method.color }}
                ></div>
                <span className="text-sm">{method.name} ({method.percentage.toFixed(1)}%)</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Gráfico adicional - Vendas por forma de pagamento mensal */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Evolução das Formas de Pagamento (Últimos 6 Meses)</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
              <Tooltip 
                formatter={(value: number, name: string) => [formatCurrency(value), name]}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
              />
              <Bar dataKey="pix" fill="#00D4AA" name="PIX" />
              <Bar dataKey="dinheiro" fill="#4CAF50" name="Dinheiro" />
              <Bar dataKey="credito" fill="#FF9800" name="Cartão Crédito" />
              <Bar dataKey="debito" fill="#2196F3" name="Cartão Débito" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Performance dos produtos */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Performance dos Produtos</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Produto</th>
                <th className="text-center p-2">Vendas</th>
                <th className="text-center p-2">Faturamento</th>
                <th className="text-center p-2">% do Total</th>
              </tr>
            </thead>
            <tbody>
              {productPerformance.map((product, index) => {
                const totalRevenue = productPerformance.reduce((sum, p) => sum + p.faturamento, 0);
                const percentage = totalRevenue > 0 ? ((product.faturamento / totalRevenue) * 100) : 0;
                
                return (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-3 font-medium">{product.name}</td>
                    <td className="p-3 text-center">{product.vendas}</td>
                    <td className="p-3 text-center font-semibold text-profit">
                      {formatCurrency(product.faturamento)}
                    </td>
                    <td className="p-3 text-center">{percentage.toFixed(1)}%</td>
                  </tr>
                );
              })}
              {productPerformance.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-3 text-center text-muted-foreground">
                    Nenhum produto encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Resumo executivo */}
      <Card className="p-6 bg-gradient-to-r from-primary/5 to-profit/5 border-primary/20">
        <h3 className="text-lg font-semibold mb-4">Resumo Executivo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Margem de Lucro Média</p>
            <p className="text-xl font-bold text-profit">
              {stats.totalRevenue > 0 ? ((stats.totalProfit / stats.totalRevenue) * 100).toFixed(1) : '0.0'}%
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Crescimento Mensal</p>
            <p className="text-xl font-bold text-success">+8.2%</p>
          </div>
          <div>
            <p className="text-muted-foreground">Produto Top</p>
            <p className="text-xl font-bold">{productPerformance[0]?.name || 'N/A'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Meta Anual</p>
            <p className="text-xl font-bold text-revenue">78% atingida</p>
          </div>
        </div>
      </Card>
    </div>
  );
}