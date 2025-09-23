import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Clock,
  Zap,
  RefreshCw
} from 'lucide-react';
import { useSalesData } from '@/hooks/useSalesData';

interface RealTimeMetric {
  label: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: any;
}

export function RealTimeMetrics() {
  const { sales } = useSalesData();
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        setLastUpdate(new Date());
      }, 30000); // Update every 30 seconds

      return () => clearInterval(interval);
    }
  }, [isLive]);

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todaySales = sales.filter(sale => {
    const saleDate = new Date(sale.date);
    return saleDate.toDateString() === today.toDateString();
  });

  const yesterdaySales = sales.filter(sale => {
    const saleDate = new Date(sale.date);
    return saleDate.toDateString() === yesterday.toDateString();
  });

  const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);
  const yesterdayRevenue = yesterdaySales.reduce((sum, sale) => sum + sale.total, 0);
  const revenueChange = yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : 0;

  const todayTransactions = todaySales.length;
  const yesterdayTransactions = yesterdaySales.length;
  const transactionChange = yesterdayTransactions > 0 ? ((todayTransactions - yesterdayTransactions) / yesterdayTransactions) * 100 : 0;

  const avgTicket = todayTransactions > 0 ? todayRevenue / todayTransactions : 0;
  const yesterdayAvgTicket = yesterdayTransactions > 0 ? yesterdayRevenue / yesterdayTransactions : 0;
  const avgTicketChange = yesterdayAvgTicket > 0 ? ((avgTicket - yesterdayAvgTicket) / yesterdayAvgTicket) * 100 : 0;

  // Calculate active customers (unique customers today)
  const activeCustomers = new Set(
    todaySales.filter(sale => sale.customer).map(sale => sale.customer?.id)
  ).size;

  const metrics: RealTimeMetric[] = [
    {
      label: 'Faturamento Hoje',
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(todayRevenue),
      change: revenueChange,
      trend: revenueChange > 0 ? 'up' : revenueChange < 0 ? 'down' : 'stable',
      icon: DollarSign
    },
    {
      label: 'Vendas Hoje',
      value: todayTransactions.toString(),
      change: transactionChange,
      trend: transactionChange > 0 ? 'up' : transactionChange < 0 ? 'down' : 'stable',
      icon: TrendingUp
    },
    {
      label: 'Ticket Médio',
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(avgTicket),
      change: avgTicketChange,
      trend: avgTicketChange > 0 ? 'up' : avgTicketChange < 0 ? 'down' : 'stable',
      icon: Activity
    },
    {
      label: 'Clientes Ativos',
      value: activeCustomers.toString(),
      change: 0,
      trend: 'stable',
      icon: Users
    }
  ];

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↗';
      case 'down': return '↙';
      default: return '→';
    }
  };

  const formatChange = (change: number) => {
    if (change === 0) return '0%';
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Métricas em Tempo Real</h3>
          {isLive && (
            <Badge variant="default" className="animate-pulse">
              <Activity className="w-3 h-3 mr-1" />
              Ao Vivo
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsLive(!isLive)}
          >
            {isLive ? 'Pausar' : 'Retomar'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLastUpdate(new Date())}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      {metric.label}
                    </p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                    {metric.change !== 0 && (
                      <div className={`flex items-center text-sm ${getTrendColor(metric.trend)}`}>
                        <span className="mr-1">{getTrendIcon(metric.trend)}</span>
                        {formatChange(metric.change)} vs ontem
                      </div>
                    )}
                  </div>
                  <Icon className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
            </div>
            <div>
              Comparação com {yesterday.toLocaleDateString('pt-BR')}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}