import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Cell,
  LineChart,
  Line
} from 'recharts';
import { TrendingUp, DollarSign, ShoppingCart, Users } from 'lucide-react';
import { Sale } from './types';

interface SalesAnalyticsProps {
  sales: Sale[];
}

export function SalesAnalytics({ sales }: SalesAnalyticsProps) {
  const analytics = useMemo(() => {
    const today = new Date();
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();

    // Vendas de hoje
    const todaySales = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate.toDateString() === today.toDateString();
    });

    // Vendas do mês
    const monthSales = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate.getMonth() === thisMonth && saleDate.getFullYear() === thisYear;
    });

    // Vendas por forma de pagamento
    const paymentMethodStats = sales.reduce((acc, sale) => {
      const method = sale.paymentMethod || 'dinheiro';
      if (!acc[method]) {
        acc[method] = { count: 0, total: 0 };
      }
      acc[method].count += 1;
      acc[method].total += sale.total;
      return acc;
    }, {} as Record<string, { count: number; total: number }>);

    // Dados mensais para gráfico
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const month = i;
      const monthSales = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate.getMonth() === month && saleDate.getFullYear() === thisYear;
      });

      return {
        month: new Date(thisYear, month, 1).toLocaleDateString('pt-BR', { month: 'short' }),
        vendas: monthSales.length,
        faturamento: monthSales.reduce((sum, sale) => sum + sale.total, 0),
        lucro: monthSales.reduce((sum, sale) => sum + (sale.profit || 0), 0)
      };
    });

    // Top produtos
    const productStats = sales.reduce((acc, sale) => {
      (sale.products || []).forEach(product => {
        if (!acc[product.name]) {
          acc[product.name] = { quantity: 0, revenue: 0 };
        }
        acc[product.name].quantity += product.quantity;
        acc[product.name].revenue += product.quantity * product.price;
      });
      return acc;
    }, {} as Record<string, { quantity: number; revenue: number }>);

    const topProducts = Object.entries(productStats)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      todayRevenue: todaySales.reduce((sum, sale) => sum + sale.total, 0),
      monthRevenue: monthSales.reduce((sum, sale) => sum + sale.total, 0),
      todayCount: todaySales.length,
      monthCount: monthSales.length,
      averageTicket: monthSales.length > 0 ? monthSales.reduce((sum, sale) => sum + sale.total, 0) / monthSales.length : 0,
      paymentMethodStats,
      monthlyData: monthlyData.filter(m => m.vendas > 0 || m.faturamento > 0),
      topProducts
    };
  }, [sales]);

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const paymentColors: Record<string, string> = {
    dinheiro: '#4CAF50',
    pix: '#00D4AA',
    credito: '#FF9800',
    debito: '#2196F3'
  };

  return (
    <div className="space-y-6">
      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vendas Hoje</p>
                <p className="text-2xl font-bold">{analytics.todayCount}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Faturamento Hoje</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(analytics.todayRevenue)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vendas do Mês</p>
                <p className="text-2xl font-bold">{analytics.monthCount}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ticket Médio</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(analytics.averageTicket)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de vendas mensais */}
        <Card>
          <CardHeader>
            <CardTitle>Vendas Mensais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="faturamento" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de formas de pagamento */}
        <Card>
          <CardHeader>
            <CardTitle>Formas de Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={Object.entries(analytics.paymentMethodStats).map(([method, data]) => ({
                      name: method,
                      value: data.total,
                      count: data.count
                    }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="hsl(var(--primary))"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {Object.entries(analytics.paymentMethodStats).map(([method], index) => (
                      <Cell key={index} fill={paymentColors[method] || '#8884d8'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top produtos */}
      <Card>
        <CardHeader>
          <CardTitle>Produtos Mais Vendidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.topProducts.map((product, index) => (
              <div key={product.name} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">#{index + 1}</Badge>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.quantity} unidades vendidas</p>
                  </div>
                </div>
                <p className="font-bold text-primary">{formatCurrency(product.revenue)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Formas de pagamento detalhadas */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento por Forma de Pagamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(analytics.paymentMethodStats).map(([method, data]) => (
              <div key={method} className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: paymentColors[method] || '#8884d8' }}
                  />
                  <span className="font-medium capitalize">{method}</span>
                </div>
                <p className="text-2xl font-bold text-primary">{formatCurrency(data.total)}</p>
                <p className="text-sm text-muted-foreground">{data.count} transações</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}