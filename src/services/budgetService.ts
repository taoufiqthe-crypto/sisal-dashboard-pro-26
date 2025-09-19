import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Budget } from "@/components/sales/types";

export interface BudgetData {
  user_id: string;
  customer_id?: string;
  title: string;
  description?: string;
  items: any[];
  subtotal: number;
  discount: number;
  total: number;
  status: string;
  valid_until?: string;
  notes?: string;
}

export const budgetService = {
  async createBudget(budget: Budget): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Usuário não autenticado");
        return false;
      }

      // Converter budget para formato do Supabase
      const budgetData: BudgetData = {
        user_id: user.id,
        customer_id: budget.customer ? budget.customer.name : undefined,
        title: `Orçamento ${budget.budgetNumber}`,
        description: budget.observations || '',
        items: budget.products.map(product => ({
          name: product.name,
          quantity: product.quantity,
          unit: product.unit,
          price: product.price,
          subtotal: product.subtotal
        })),
        subtotal: budget.subtotal,
        discount: budget.discount || 0,
        total: budget.total,
        status: budget.status,
        valid_until: budget.validUntil,
        notes: budget.observations
      };

      const { data, error } = await supabase
        .from('budgets')
        .insert(budgetData)
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar orçamento:', error);
        toast.error("Erro ao salvar orçamento no banco de dados");
        return false;
      }

      // Salvar também no localStorage para compatibilidade
      const storedBudgets = JSON.parse(localStorage.getItem('budgets') || '[]');
      storedBudgets.unshift(budget);
      localStorage.setItem('budgets', JSON.stringify(storedBudgets));

      toast.success("Orçamento salvo com sucesso!");
      return true;
    } catch (error) {
      console.error('Erro geral ao criar orçamento:', error);
      toast.error("Erro inesperado ao salvar orçamento");
      return false;
    }
  },

  async getBudgets(): Promise<Budget[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: budgetsData, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar orçamentos:', error);
        return JSON.parse(localStorage.getItem('budgets') || '[]');
      }

      // Converter dados do Supabase para o formato esperado
      const formattedBudgets: Budget[] = budgetsData.map(budget => {
        const items = Array.isArray(budget.items) ? budget.items : [];
        
        return {
          id: parseInt(budget.id),
          date: budget.created_at.split('T')[0],
          budgetNumber: budget.title.replace('Orçamento ', ''),
          deliveryDate: budget.valid_until,
          products: items.map((item: any) => ({
            name: item.name || '',
            quantity: item.quantity || 1,
            unit: item.unit || 'UN',
            price: item.price || 0,
            subtotal: item.subtotal || 0
          })),
          subtotal: budget.subtotal,
          discount: budget.discount,
          total: budget.total,
          customer: {
            name: budget.customer_id || 'Cliente',
            document: '',
            address: '',
            city: '',
            phone: ''
          },
          company: {
            name: 'Gesso Primus',
            document: '45.174.762/0001-42',
            address: 'Av. V-8, 08 - qd 09 lt 02 - Mansões Paraíso, Aparecida de Goiânia - GO',
            phone: '(62) 98335-0384',
            email: 'gessoprimus2017@gmail.com'
          },
          paymentMethod: 'À vista',
          observations: budget.notes,
          status: budget.status as any,
          validUntil: budget.valid_until || ''
        };
      });

      return formattedBudgets;
    } catch (error) {
      console.error('Erro ao buscar orçamentos:', error);
      return JSON.parse(localStorage.getItem('budgets') || '[]');
    }
  },

  async updateBudgetStatus(budgetId: number, status: 'orcamento' | 'aprovado' | 'rejeitado' | 'vendido'): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Usuário não autenticado");
        return false;
      }

      const { error } = await supabase
        .from('budgets')
        .update({ status })
        .eq('id', budgetId.toString())
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao atualizar status do orçamento:', error);
        toast.error("Erro ao atualizar status do orçamento");
        return false;
      }

      toast.success("Status do orçamento atualizado!");
      return true;
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error("Erro inesperado ao atualizar status");
      return false;
    }
  },

  generateBudgetNumber(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  },

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }
};