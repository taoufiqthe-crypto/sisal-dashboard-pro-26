import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { 
  Download, FileSpreadsheet, FileText, Mail, Filter, 
  TrendingUp, TrendingDown, Eye, Calendar, DollarSign,
  Package, Users, ShoppingCart, AlertTriangle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useErrorHandling } from '@/hooks/useErrorHandling';
import { usePerformance } from '@/hooks/usePerformance';
import { useI18n } from '@/contexts/I18nContext';
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import * as XLSX from 'xlsx';

interface ReportData {
  id: string;
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  category?: string;
  date?: string;
}

interface ReportFilter {
  dateRange: { from: Date; to: Date };
  category: string;
  metric: string;
  groupBy: 'day' | 'week' | 'month' | 'year';
  includeComparison: boolean;
}

const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export const DynamicReports = () => {
  const { t, formatCurrency, formatDate } = useI18n();
  const { handleAsyncOperation, withErrorBoundary } = useErrorHandling({
    context: 'DynamicReports',
    showToast: true,
  });
  const { trackApiCall, metrics } = usePerformance('DynamicReports');
  
  const [filters, setFilters] = useState<ReportFilter>({
    dateRange: { from: subDays(new Date(), 30), to: new Date() },
    category: 'all',
    metric: 'revenue',
    groupBy: 'day',
    includeComparison: false,
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data generation (replace with real API calls)
  const generateMockData = useCallback((filters: ReportFilter): ReportData[] => {
    const data: ReportData[] = [];
    const days = Math.ceil((filters.dateRange.to.getTime() - filters.dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i < days; i++) {
      const date = new Date(filters.dateRange.from);
      date.setDate(date.getDate() + i);
      
      data.push({
        id: `data-${i}`,
        name: format(date, 'dd/MM'),
        value: Math.random() * 10000 + 1000,
        change: (Math.random() - 0.5) * 100,
        trend: Math.random() > 0.5 ? 'up' : 'down',
        category: ['vendas', 'produtos', 'clientes'][Math.floor(Math.random() * 3)],
        date: format(date, 'yyyy-MM-dd'),
      });
    }
    
    return data;
  }, []);

  const generateReport = withErrorBoundary(async () => {
    setIsGenerating(true);
    trackApiCall();
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const data = generateMockData(filters);
      setReportData(data);
      
      toast({
        title: t('reports.generate'),
        description: "Relatório gerado com sucesso!",
      });
    } finally {
      setIsGenerating(false);
    }
  });

  const exportToExcel = useCallback(async () => {
    if (!reportData.length) {
      toast({
        title: "Aviso",
        description: "Nenhum dado para exportar",
        variant: "destructive",
      });
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(
      reportData.map(item => ({
        Data: item.date,
        Nome: item.name,
        Valor: item.value,
        'Mudança (%)': item.change,
        Tendência: item.trend,
        Categoria: item.category,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório');
    
    const fileName = `relatorio-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    toast({
      title: "Exportação concluída",
      description: `Arquivo ${fileName} baixado com sucesso!`,
    });
  }, [reportData]);

  const exportToPDF = useCallback(() => {
    // PDF export would be implemented here with a library like jsPDF
    toast({
      title: "Em desenvolvimento",
      description: "Exportação para PDF será implementada em breve",
    });
  }, []);

  const sendByEmail = useCallback(() => {
    // Email functionality would be implemented here
    toast({
      title: "Em desenvolvimento",
      description: "Envio por email será implementado em breve",
    });
  }, []);

  const chartData = useMemo(() => {
    if (!reportData.length) return [];
    
    return reportData.map(item => ({
      name: item.name,
      value: item.value,
      change: item.change,
    }));
  }, [reportData]);

  const summaryMetrics = useMemo(() => {
    if (!reportData.length) return { total: 0, average: 0, growth: 0, count: 0 };
    
    const total = reportData.reduce((sum, item) => sum + item.value, 0);
    const average = total / reportData.length;
    const growth = reportData.reduce((sum, item) => sum + item.change, 0) / reportData.length;
    
    return {
      total,
      average,
      growth,
      count: reportData.length,
    };
  }, [reportData]);

  const quickDateRanges = [
    { label: 'Últimos 7 dias', value: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
    { label: 'Últimos 30 dias', value: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
    { label: 'Este mês', value: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
    { label: 'Este ano', value: () => ({ from: startOfYear(new Date()), to: endOfYear(new Date()) }) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">{t('reports.title')} Dinâmicos</h2>
          <p className="text-muted-foreground">
            Relatórios personalizáveis com análises avançadas
          </p>
        </div>
        <Badge variant="secondary">
          Performance: {metrics.renderTime.toFixed(2)}ms
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Relatório
          </CardTitle>
          <CardDescription>
            Configure os parâmetros para gerar relatórios personalizados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="metric">Métrica</Label>
              <Select
                value={filters.metric}
                onValueChange={(value) => setFilters(prev => ({ ...prev, metric: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a métrica" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Receita</SelectItem>
                  <SelectItem value="sales">Vendas</SelectItem>
                  <SelectItem value="products">Produtos</SelectItem>
                  <SelectItem value="customers">Clientes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={filters.category}
                onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="vendas">Vendas</SelectItem>
                  <SelectItem value="produtos">Produtos</SelectItem>
                  <SelectItem value="clientes">Clientes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="groupBy">Agrupar por</Label>
              <Select
                value={filters.groupBy}
                onValueChange={(value: 'day' | 'week' | 'month' | 'year') => 
                  setFilters(prev => ({ ...prev, groupBy: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Dia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Dia</SelectItem>
                  <SelectItem value="week">Semana</SelectItem>
                  <SelectItem value="month">Mês</SelectItem>
                  <SelectItem value="year">Ano</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Períodos Rápidos</Label>
              <div className="flex flex-wrap gap-2">
                {quickDateRanges.map((range, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters(prev => ({ ...prev, dateRange: range.value() }))}
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <DatePickerWithRange
              value={filters.dateRange}
              onChange={(dateRange) => 
                dateRange && dateRange.to && setFilters(prev => ({ ...prev, dateRange: { from: dateRange.from!, to: dateRange.to! } }))
              }
            />
            
            <Button onClick={generateReport} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                  Gerando...
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  {t('reports.generate')}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isGenerating && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Gerando relatório...</span>
                <span className="text-sm text-muted-foreground">75%</span>
              </div>
              <Progress value={75} />
            </div>
          </CardContent>
        </Card>
      )}

      {reportData.length > 0 && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div className="ml-2">
                    <p className="text-sm font-medium">Total</p>
                    <div className="flex items-center">
                      <p className="text-2xl font-bold">{formatCurrency(summaryMetrics.total)}</p>
                      {summaryMetrics.growth > 0 ? (
                        <TrendingUp className="ml-2 h-4 w-4 text-success" />
                      ) : (
                        <TrendingDown className="ml-2 h-4 w-4 text-danger" />
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <div className="ml-2">
                    <p className="text-sm font-medium">Média</p>
                    <p className="text-2xl font-bold">{formatCurrency(summaryMetrics.average)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <div className="ml-2">
                    <p className="text-sm font-medium">Crescimento</p>
                    <p className="text-2xl font-bold">
                      {summaryMetrics.growth.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div className="ml-2">
                    <p className="text-sm font-medium">Registros</p>
                    <p className="text-2xl font-bold">{summaryMetrics.count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Export Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2">
                <Button onClick={exportToExcel} variant="outline">
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Exportar Excel
                </Button>
                <Button onClick={exportToPDF} variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Exportar PDF
                </Button>
                <Button onClick={sendByEmail} variant="outline">
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar por Email
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Charts */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="trends">Tendências</TabsTrigger>
              <TabsTrigger value="comparison">Comparação</TabsTrigger>
              <TabsTrigger value="details">Detalhes</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Gráfico de Barras</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Legend />
                        <Bar dataKey="value" fill={CHART_COLORS[0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Gráfico de Linha</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke={CHART_COLORS[1]} 
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Análise de Tendências</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke={CHART_COLORS[2]} 
                        fill={CHART_COLORS[2]}
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comparison" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Comparação de Períodos</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                      <Bar dataKey="value" fill={CHART_COLORS[3]} />
                      <Bar dataKey="change" fill={CHART_COLORS[4]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Dados Detalhados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-border">
                      <thead>
                        <tr className="bg-muted">
                          <th className="border border-border p-2 text-left">Data</th>
                          <th className="border border-border p-2 text-left">Nome</th>
                          <th className="border border-border p-2 text-right">Valor</th>
                          <th className="border border-border p-2 text-right">Mudança</th>
                          <th className="border border-border p-2 text-center">Tendência</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.map((item, index) => (
                          <tr key={item.id} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/50'}>
                            <td className="border border-border p-2">{item.date}</td>
                            <td className="border border-border p-2">{item.name}</td>
                            <td className="border border-border p-2 text-right">
                              {formatCurrency(item.value)}
                            </td>
                            <td className="border border-border p-2 text-right">
                              <span className={item.change > 0 ? 'text-success' : 'text-danger'}>
                                {item.change.toFixed(1)}%
                              </span>
                            </td>
                            <td className="border border-border p-2 text-center">
                              {item.trend === 'up' ? (
                                <TrendingUp className="h-4 w-4 text-success mx-auto" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-danger mx-auto" />
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};