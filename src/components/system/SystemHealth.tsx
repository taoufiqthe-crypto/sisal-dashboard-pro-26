import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Activity, Database, Wifi, AlertTriangle, CheckCircle, 
  XCircle, Clock, Cpu, HardDrive, Zap, RefreshCw
} from 'lucide-react';
import { usePerformance } from '@/hooks/usePerformance';
import { useErrorHandling } from '@/hooks/useErrorHandling';

interface SystemMetrics {
  database: {
    status: 'healthy' | 'warning' | 'error';
    responseTime: number;
    connections: number;
    uptime: number;
  };
  api: {
    status: 'healthy' | 'warning' | 'error';
    responseTime: number;
    errorRate: number;
    requests: number;
  };
  frontend: {
    status: 'healthy' | 'warning' | 'error';
    loadTime: number;
    memoryUsage: number;
    performance: number;
  };
  auth: {
    status: 'healthy' | 'warning' | 'error';
    activeUsers: number;
    sessionDuration: number;
  };
}

export const SystemHealth = () => {
  const { metrics } = usePerformance('SystemHealth');
  const { handleAsyncOperation } = useErrorHandling({ context: 'SystemHealth' });
  
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    database: {
      status: 'healthy',
      responseTime: 0,
      connections: 0,
      uptime: 0,
    },
    api: {
      status: 'healthy',
      responseTime: 0,
      errorRate: 0,
      requests: 0,
    },
    frontend: {
      status: 'healthy',
      loadTime: 0,
      memoryUsage: 0,
      performance: 0,
    },
    auth: {
      status: 'healthy',
      activeUsers: 0,
      sessionDuration: 0,
    },
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const checkSystemHealth = async () => {
    setIsLoading(true);
    
    const result = await handleAsyncOperation(async () => {
      // Simulate system health checks
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockMetrics: SystemMetrics = {
        database: {
          status: Math.random() > 0.1 ? 'healthy' : 'warning',
          responseTime: Math.random() * 100 + 10,
          connections: Math.floor(Math.random() * 50) + 10,
          uptime: Math.random() * 100,
        },
        api: {
          status: Math.random() > 0.05 ? 'healthy' : 'error',
          responseTime: Math.random() * 200 + 50,
          errorRate: Math.random() * 5,
          requests: Math.floor(Math.random() * 1000) + 100,
        },
        frontend: {
          status: 'healthy',
          loadTime: metrics.renderTime || Math.random() * 500 + 100,
          memoryUsage: metrics.memoryUsage || Math.random() * 100,
          performance: Math.random() * 30 + 70,
        },
        auth: {
          status: 'healthy',
          activeUsers: Math.floor(Math.random() * 100) + 5,
          sessionDuration: Math.random() * 120 + 30,
        },
      };
      
      return mockMetrics;
    });
    
    if (result) {
      setSystemMetrics(result);
      setLastUpdate(new Date());
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const getStatusColor = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy':
        return 'bg-success text-success-foreground';
      case 'warning':
        return 'bg-warning text-warning-foreground';
      case 'error':
        return 'bg-destructive text-destructive-foreground';
    }
  };

  const overallStatus = Object.values(systemMetrics).every(metric => metric.status === 'healthy') 
    ? 'healthy' 
    : Object.values(systemMetrics).some(metric => metric.status === 'error')
    ? 'error'
    : 'warning';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Saúde do Sistema</h2>
          <p className="text-muted-foreground">
            Monitor de desempenho e status em tempo real
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge className={getStatusColor(overallStatus)}>
            {getStatusIcon(overallStatus)}
            <span className="ml-2 capitalize">{overallStatus === 'healthy' ? 'Saudável' : overallStatus === 'warning' ? 'Atenção' : 'Erro'}</span>
          </Badge>
          <Button 
            onClick={checkSystemHealth} 
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Database Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Banco de Dados
              {getStatusIcon(systemMetrics.database.status)}
            </CardTitle>
            <CardDescription>
              Status da conexão e performance do banco
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tempo de Resposta</span>
                <span>{systemMetrics.database.responseTime.toFixed(0)}ms</span>
              </div>
              <Progress 
                value={Math.min((systemMetrics.database.responseTime / 200) * 100, 100)} 
                className="h-2"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Conexões Ativas</span>
                <p className="font-semibold">{systemMetrics.database.connections}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Uptime</span>
                <p className="font-semibold">{systemMetrics.database.uptime.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="h-5 w-5" />
              API
              {getStatusIcon(systemMetrics.api.status)}
            </CardTitle>
            <CardDescription>
              Status e performance das APIs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Taxa de Erro</span>
                <span>{systemMetrics.api.errorRate.toFixed(2)}%</span>
              </div>
              <Progress 
                value={Math.min(systemMetrics.api.errorRate * 20, 100)} 
                className="h-2"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Requisições</span>
                <p className="font-semibold">{systemMetrics.api.requests}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Tempo Médio</span>
                <p className="font-semibold">{systemMetrics.api.responseTime.toFixed(0)}ms</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Frontend Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              Frontend
              {getStatusIcon(systemMetrics.frontend.status)}
            </CardTitle>
            <CardDescription>
              Performance e recursos do cliente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Performance Score</span>
                <span>{systemMetrics.frontend.performance.toFixed(0)}/100</span>
              </div>
              <Progress 
                value={systemMetrics.frontend.performance} 
                className="h-2"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Load Time</span>
                <p className="font-semibold">{systemMetrics.frontend.loadTime.toFixed(0)}ms</p>
              </div>
              <div>
                <span className="text-muted-foreground">Memória</span>
                <p className="font-semibold">{(systemMetrics.frontend.memoryUsage / 1024 / 1024).toFixed(1)}MB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Auth Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Autenticação
              {getStatusIcon(systemMetrics.auth.status)}
            </CardTitle>
            <CardDescription>
              Status do sistema de autenticação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Usuários Ativos</span>
                <span>{systemMetrics.auth.activeUsers}</span>
              </div>
              <Progress 
                value={Math.min((systemMetrics.auth.activeUsers / 100) * 100, 100)} 
                className="h-2"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Sessão Média</span>
                <p className="font-semibold">{systemMetrics.auth.sessionDuration.toFixed(0)}min</p>
              </div>
              <div>
                <span className="text-muted-foreground">Status</span>
                <p className="font-semibold capitalize">
                  {systemMetrics.auth.status === 'healthy' ? 'Ativo' : 'Inativo'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Visão Geral do Sistema
          </CardTitle>
          <CardDescription>
            Resumo geral da saúde do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {Object.values(systemMetrics).filter(m => m.status === 'healthy').length}
              </div>
              <p className="text-sm text-muted-foreground">Serviços Saudáveis</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">
                {Object.values(systemMetrics).filter(m => m.status === 'warning').length}
              </div>
              <p className="text-sm text-muted-foreground">Alertas</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">
                {Object.values(systemMetrics).filter(m => m.status === 'error').length}
              </div>
              <p className="text-sm text-muted-foreground">Erros</p>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Última atualização: {lastUpdate.toLocaleTimeString()}
              </span>
              <span>Próxima verificação em 30 segundos</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};