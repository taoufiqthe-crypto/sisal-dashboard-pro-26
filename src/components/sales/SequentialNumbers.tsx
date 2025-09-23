import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Hash, Settings, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SequentialConfig {
  saleNumber: number;
  budgetNumber: number;
  receiptNumber: number;
  prefix: string;
  resetDaily: boolean;
  lastReset: string;
}

export function SequentialNumbers() {
  const [config, setConfig] = useState<SequentialConfig>({
    saleNumber: 1,
    budgetNumber: 1,
    receiptNumber: 1,
    prefix: 'PDV',
    resetDaily: false,
    lastReset: new Date().toDateString()
  });
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('sequential-config');
    if (saved) {
      const savedConfig = JSON.parse(saved);
      
      // Check if daily reset is enabled and if it's a new day
      if (savedConfig.resetDaily && savedConfig.lastReset !== new Date().toDateString()) {
        savedConfig.saleNumber = 1;
        savedConfig.budgetNumber = 1;
        savedConfig.receiptNumber = 1;
        savedConfig.lastReset = new Date().toDateString();
        localStorage.setItem('sequential-config', JSON.stringify(savedConfig));
      }
      
      setConfig(savedConfig);
    }
  }, []);

  const saveConfig = () => {
    localStorage.setItem('sequential-config', JSON.stringify(config));
    setIsEditing(false);
    toast({
      title: "Configuração salva",
      description: "Numeração sequencial atualizada com sucesso"
    });
  };

  const resetNumbers = () => {
    const newConfig = {
      ...config,
      saleNumber: 1,
      budgetNumber: 1,
      receiptNumber: 1,
      lastReset: new Date().toDateString()
    };
    setConfig(newConfig);
    localStorage.setItem('sequential-config', JSON.stringify(newConfig));
    toast({
      title: "Numeração resetada",
      description: "Todos os números foram reiniciados"
    });
  };

  const getNextNumber = (type: 'sale' | 'budget' | 'receipt'): string => {
    const numbers = {
      sale: config.saleNumber,
      budget: config.budgetNumber,
      receipt: config.receiptNumber
    };
    
    return `${config.prefix}${String(numbers[type]).padStart(6, '0')}`;
  };

  const incrementNumber = (type: 'sale' | 'budget' | 'receipt') => {
    const newConfig = { ...config };
    if (type === 'sale') {
      newConfig.saleNumber += 1;
    } else if (type === 'budget') {
      newConfig.budgetNumber += 1;
    } else if (type === 'receipt') {
      newConfig.receiptNumber += 1;
    }
    setConfig(newConfig);
    localStorage.setItem('sequential-config', JSON.stringify(newConfig));
  };

  // Export functions for use in other components
  const exportFunctions = {
    getNextSaleNumber: () => getNextNumber('sale'),
    getNextBudgetNumber: () => getNextNumber('budget'),
    getNextReceiptNumber: () => getNextNumber('receipt'),
    incrementSaleNumber: () => incrementNumber('sale'),
    incrementBudgetNumber: () => incrementNumber('budget'),
    incrementReceiptNumber: () => incrementNumber('receipt')
  };

  // Make functions available globally
  useEffect(() => {
    (window as any).sequentialNumbers = exportFunctions;
  }, [config]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Hash className="w-5 h-5" />
          Numeração Sequencial
        </CardTitle>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Configurar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetNumbers}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Resetar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="prefix">Prefixo</Label>
                <Input
                  id="prefix"
                  value={config.prefix}
                  onChange={(e) => setConfig({...config, prefix: e.target.value})}
                  placeholder="PDV"
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="resetDaily"
                  checked={config.resetDaily}
                  onChange={(e) => setConfig({...config, resetDaily: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="resetDaily">Reset diário</Label>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="saleNumber">Próxima Venda</Label>
                <Input
                  id="saleNumber"
                  type="number"
                  value={config.saleNumber}
                  onChange={(e) => setConfig({...config, saleNumber: parseInt(e.target.value) || 1})}
                />
              </div>
              <div>
                <Label htmlFor="budgetNumber">Próximo Orçamento</Label>
                <Input
                  id="budgetNumber"
                  type="number"
                  value={config.budgetNumber}
                  onChange={(e) => setConfig({...config, budgetNumber: parseInt(e.target.value) || 1})}
                />
              </div>
              <div>
                <Label htmlFor="receiptNumber">Próximo Cupom</Label>
                <Input
                  id="receiptNumber"
                  type="number"
                  value={config.receiptNumber}
                  onChange={(e) => setConfig({...config, receiptNumber: parseInt(e.target.value) || 1})}
                />
              </div>
            </div>
            
            <Button onClick={saveConfig} className="w-full">
              Salvar Configurações
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Próxima Venda</p>
                <Badge variant="default" className="text-lg font-mono">
                  {getNextNumber('sale')}
                </Badge>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Próximo Orçamento</p>
                <Badge variant="secondary" className="text-lg font-mono">
                  {getNextNumber('budget')}
                </Badge>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Próximo Cupom</p>
                <Badge variant="outline" className="text-lg font-mono">
                  {getNextNumber('receipt')}
                </Badge>
              </div>
            </div>
            
            {config.resetDaily && (
              <div className="text-xs text-muted-foreground text-center">
                Reset diário ativo • Último reset: {new Date(config.lastReset).toLocaleDateString('pt-BR')}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}