import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DateRange } from 'react-day-picker';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Download, FileText, Users, TrendingUp, DollarSign, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import * as XLSX from 'xlsx';
import { useSalesData } from '@/hooks/useSalesData';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface SalesOperator {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  commission: number;
}

export function AdvancedReports() {
  const { sales, loading } = useSalesData();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const filteredSales = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return sales;
    
    return sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= dateRange.from! && saleDate <= dateRange.to!;
    });
  }, [sales, dateRange]);

  const topProducts = useMemo(() => {
    const productStats = filteredSales.reduce((acc, sale) => {
      (sale.products || []).forEach(product => {
        if (!acc[product.name]) {
          acc[product.name] = { 
            name: product.name,
            quantity: 0, 
            revenue: 0,
            profit: 0,
            salesCount: 0
          };
        }
        acc[product.name].quantity += product.quantity;
        acc[product.name].revenue += product.quantity * product.price;
        acc[product.name].profit += product.quantity * (product.price * 0.3); // 30% profit margin
        acc[product.name].salesCount += 1;
      });
      return acc;
    }, {} as Record<string, any>);

    return Object.values(productStats)
      .sort((a: any, b: any) => b.quantity - a.quantity)
      .slice(0, 10);
  }, [filteredSales]);

  const profitAnalysis = useMemo(() => {
    const monthlyProfit = filteredSales.reduce((acc, sale) => {
      const month = new Date(sale.date).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      if (!acc[month]) {
        acc[month] = { revenue: 0, profit: 0, costs: 0 };
      }
      acc[month].revenue += sale.total;
      acc[month].profit += sale.profit || (sale.total * 0.3);
      acc[month].costs += sale.total * 0.7;
      return acc;
    }, {} as Record<string, any>);

    return Object.entries(monthlyProfit).map(([month, data]) => ({
      month,
      ...data,
      margin: ((data.profit / data.revenue) * 100).toFixed(1)
    }));
  }, [filteredSales]);

  const operators = useMemo(() => {
    const operatorStats = filteredSales.reduce((acc, sale) => {
      const operatorId = (sale as any).operatorId || 'default';
      const operatorName = (sale as any).operatorName || 'Operador Padrão';
      
      if (!acc[operatorId]) {
        acc[operatorId] = {
          id: operatorId,
          name: operatorName,
          sales: 0,
          revenue: 0,
          commission: 0
        };
      }
      
      acc[operatorId].sales += 1;
      acc[operatorId].revenue += sale.total;
      acc[operatorId].commission += sale.total * 0.05; // 5% commission
      
      return acc;
    }, {} as Record<string, SalesOperator>);

    return Object.values(operatorStats).sort((a, b) => b.revenue - a.revenue);
  }, [filteredSales]);

  const exportToExcel = (data: any[], filename: string) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Relatório');
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  if (loading) {
    return <LoadingSpinner text="Carregando relatórios..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Relatórios Avançados</h2>
        <DatePickerWithRange value={dateRange} onChange={setDateRange} />
      </div>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="profit">Lucro</TabsTrigger>
          <TabsTrigger value="operators">Operadores</TabsTrigger>
          <TabsTrigger value="charts">Gráficos</TabsTrigger>
          <TabsTrigger value="export">Exportar</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Produtos Mais Vendidos
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => exportToExcel(topProducts, 'produtos-mais-vendidos')}
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Qtd. Vendida</TableHead>
                    <TableHead>Faturamento</TableHead>
                    <TableHead>Lucro Estimado</TableHead>
                    <TableHead>Vendas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((product: any, index) => (
                    <TableRow key={product.name}>
                      <TableCell className="flex items-center gap-2">
                        <Badge variant="secondary">#{index + 1}</Badge>
                        {product.name}
                      </TableCell>
                      <TableCell>{product.quantity}</TableCell>
                      <TableCell className="text-primary font-medium">
                        {formatCurrency(product.revenue)}
                      </TableCell>
                      <TableCell className="text-green-600 font-medium">
                        {formatCurrency(product.profit)}
                      </TableCell>
                      <TableCell>{product.salesCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profit">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Análise de Lucro por Período
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => exportToExcel(profitAnalysis, 'analise-lucro')}
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Período</TableHead>
                    <TableHead>Faturamento</TableHead>
                    <TableHead>Custos</TableHead>
                    <TableHead>Lucro</TableHead>
                    <TableHead>Margem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profitAnalysis.map((period: any) => (
                    <TableRow key={period.month}>
                      <TableCell className="font-medium">{period.month}</TableCell>
                      <TableCell className="text-primary">
                        {formatCurrency(period.revenue)}
                      </TableCell>
                      <TableCell className="text-red-600">
                        {formatCurrency(period.costs)}
                      </TableCell>
                      <TableCell className="text-green-600 font-medium">
                        {formatCurrency(period.profit)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={parseFloat(period.margin) > 20 ? "default" : "secondary"}>
                          {period.margin}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operators">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Relatório de Operadores
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => exportToExcel(operators, 'relatorio-operadores')}
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Operador</TableHead>
                    <TableHead>Vendas</TableHead>
                    <TableHead>Faturamento</TableHead>
                    <TableHead>Comissão (5%)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {operators.map((operator) => (
                    <TableRow key={operator.id}>
                      <TableCell className="font-medium">{operator.name}</TableCell>
                      <TableCell>{operator.sales}</TableCell>
                      <TableCell className="text-primary font-medium">
                        {formatCurrency(operator.revenue)}
                      </TableCell>
                      <TableCell className="text-green-600">
                        {formatCurrency(operator.commission)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Produtos Mais Vendidos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Top 5 Produtos Mais Vendidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topProducts.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'quantity' ? `${value} unidades` : formatCurrency(value as number),
                        name === 'quantity' ? 'Quantidade' : name === 'revenue' ? 'Receita' : 'Lucro'
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="quantity" fill="hsl(var(--primary))" name="Quantidade" />
                    <Bar dataKey="revenue" fill="hsl(var(--chart-2))" name="Receita" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de Pizza - Métodos de Pagamento */}
            <Card>
              <CardHeader>
                <CardTitle>Métodos de Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Dinheiro', value: filteredSales.filter(s => s.paymentMethod === 'dinheiro').length },
                        { name: 'PIX', value: filteredSales.filter(s => s.paymentMethod === 'pix').length },
                        { name: 'Cartão Crédito', value: filteredSales.filter(s => s.paymentMethod === 'credito').length },
                        { name: 'Cartão Débito', value: filteredSales.filter(s => s.paymentMethod === 'debito').length },
                      ].filter(item => item.value > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: 'Dinheiro', value: filteredSales.filter(s => s.paymentMethod === 'dinheiro').length },
                        { name: 'PIX', value: filteredSales.filter(s => s.paymentMethod === 'pix').length },
                        { name: 'Cartão Crédito', value: filteredSales.filter(s => s.paymentMethod === 'credito').length },
                        { name: 'Cartão Débito', value: filteredSales.filter(s => s.paymentMethod === 'debito').length },
                      ].filter(item => item.value > 0).map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={[
                            'hsl(var(--chart-1))',
                            'hsl(var(--chart-2))', 
                            'hsl(var(--chart-3))',
                            'hsl(var(--chart-4))'
                          ][index % 4]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de Área - Vendas por Período */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Evolução de Vendas e Lucro</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={profitAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stackId="1" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))" 
                      fillOpacity={0.6}
                      name="Receita"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="profit" 
                      stackId="2" 
                      stroke="hsl(var(--chart-2))" 
                      fill="hsl(var(--chart-2))" 
                      fillOpacity={0.6}
                      name="Lucro"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="export">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Exportação de Dados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="outline"
                  onClick={() => exportToExcel(filteredSales, 'vendas-completas')}
                  className="h-20 flex flex-col gap-2"
                >
                  <Download className="w-6 h-6" />
                  Vendas Completas
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => exportToExcel(topProducts, 'produtos-vendidos')}
                  className="h-20 flex flex-col gap-2"
                >
                  <TrendingUp className="w-6 h-6" />
                  Produtos Vendidos
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => exportToExcel(profitAnalysis, 'analise-financeira')}
                  className="h-20 flex flex-col gap-2"
                >
                  <DollarSign className="w-6 h-6" />
                  Análise Financeira
                </Button>
              </div>
              
              <div className="text-sm text-muted-foreground">
                * Os arquivos serão exportados no formato Excel (.xlsx)
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}