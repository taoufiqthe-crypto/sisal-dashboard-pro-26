import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Package, Users, FileText, Plus, TrendingUp } from 'lucide-react';

interface QuickActionsProps {
  onAction: (action: string) => void;
}

export function QuickActions({ onAction }: QuickActionsProps) {
  const actions = [
    {
      id: 'new-sale',
      title: 'Nova Venda',
      description: 'Registrar uma nova venda',
      icon: ShoppingCart,
      color: 'text-primary'
    },
    {
      id: 'add-product',
      title: 'Novo Produto',
      description: 'Cadastrar produto no estoque',
      icon: Package,
      color: 'text-success'
    },
    {
      id: 'add-customer',
      title: 'Novo Cliente',
      description: 'Cadastrar novo cliente',
      icon: Users,
      color: 'text-blue-500'
    },
    {
      id: 'new-budget',
      title: 'Novo Orçamento',
      description: 'Criar orçamento profissional',
      icon: FileText,
      color: 'text-purple-500'
    },
    {
      id: 'view-reports',
      title: 'Relatórios',
      description: 'Ver análises de vendas',
      icon: TrendingUp,
      color: 'text-orange-500'
    },
    {
      id: 'stock-entry',
      title: 'Entrada Estoque',
      description: 'Registrar entrada no estoque',
      icon: Plus,
      color: 'text-green-500'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {actions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => onAction(action.id)}
            >
              <action.icon className={`w-6 h-6 ${action.color}`} />
              <div className="text-center">
                <div className="font-semibold text-sm">{action.title}</div>
                <div className="text-xs text-muted-foreground">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}