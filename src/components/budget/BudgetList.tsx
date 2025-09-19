import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  DollarSign,
  Calendar,
  User 
} from "lucide-react";
import { budgetService } from '@/services/budgetService';
import { Budget } from '@/components/sales/types';
import { toast } from 'sonner';

interface BudgetListProps {
  onBudgetSelect?: (budget: Budget) => void;
  onBudgetEdit?: (budget: Budget) => void;
}

export function BudgetList({ onBudgetSelect, onBudgetEdit }: BudgetListProps) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBudgets = async () => {
    try {
      setLoading(true);
      const budgetsData = await budgetService.getBudgets();
      setBudgets(budgetsData);
    } catch (error) {
      console.error('Erro ao carregar orçamentos:', error);
      toast.error('Erro ao carregar orçamentos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudgets();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'orcamento': return 'secondary';
      case 'aprovado': return 'default';
      case 'rejeitado': return 'destructive';
      case 'vendido': return 'default';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aprovado': return <CheckCircle className="w-4 h-4" />;
      case 'rejeitado': return <XCircle className="w-4 h-4" />;
      case 'vendido': return <DollarSign className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const updateBudgetStatus = async (budgetId: number, status: 'orcamento' | 'aprovado' | 'rejeitado' | 'vendido') => {
    const success = await budgetService.updateBudgetStatus(budgetId, status);
    if (success) {
      loadBudgets(); // Recarregar lista
    }
  };

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carregando orçamentos...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Orçamentos Salvos</h3>
        <Badge variant="outline">{budgets.length} orçamento(s)</Badge>
      </div>

      {budgets.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum orçamento encontrado</p>
            <p className="text-sm text-muted-foreground mt-2">
              Crie seu primeiro orçamento usando o botão "Novo Orçamento"
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((budget) => (
            <Card key={budget.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(budget.status)} className="flex items-center gap-1">
                      {getStatusIcon(budget.status)}
                      {budget.status.toUpperCase()}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    #{budget.budgetNumber}
                  </span>
                </div>
                <CardTitle className="text-lg">
                  {formatCurrency(budget.total)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span className="truncate">{budget.customer.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(budget.date).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">{budget.products.length}</span> produto(s)
                </div>
                
                {budget.validUntil && (
                  <div className="text-xs text-muted-foreground">
                    Válido até: {new Date(budget.validUntil).toLocaleDateString('pt-BR')}
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onBudgetSelect?.(budget)}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Ver
                  </Button>
                  
                  {budget.status === 'orcamento' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateBudgetStatus(budget.id, 'aprovado')}
                        className="text-green-600 hover:text-green-700"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateBudgetStatus(budget.id, 'rejeitado')}
                        className="text-red-600 hover:text-red-700"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  
                  {budget.status === 'aprovado' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateBudgetStatus(budget.id, 'vendido')}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <DollarSign className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}