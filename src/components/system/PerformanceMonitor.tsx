import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Activity } from 'lucide-react';

export function PerformanceMonitor() {
  // Simple performance check
  const renderTime = performance.now() % 200; // Simple mock
  const isSlowDevice = renderTime > 100;

  if (!isSlowDevice) return null;

  return (
    <Card className="fixed bottom-4 right-4 z-50 p-4 w-64">
      <div className="flex items-center gap-2 mb-2">
        <Activity className="w-4 h-4 text-warning" />
        <span className="font-semibold text-sm">Performance</span>
        <Badge variant="secondary" className="text-xs">
          {Math.round(renderTime)}ms
        </Badge>
      </div>
      <div className="text-xs text-muted-foreground">
        Dispositivo com performance reduzida detectado.
      </div>
    </Card>
  );
}