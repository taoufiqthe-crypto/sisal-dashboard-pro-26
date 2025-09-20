import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Sale, SaleItem } from '@/components/sales/types';

export function useSalesData() {
  const { user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSales = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Buscar vendas do Supabase
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select(`
          *,
          sale_items (*),
          customers (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (salesError) throw salesError;

      // Transformar dados para o formato esperado
      const transformedSales: Sale[] = (salesData || []).map(sale => ({
        id: parseInt(sale.id),
        date: sale.created_at.split('T')[0],
        products: (sale.sale_items || []).map((item: any) => ({
          name: item.product_name || 'Produto',
          quantity: item.quantity,
          price: parseFloat(item.price.toString()),
          productId: parseInt(item.product_id)
        })),
        total: parseFloat(sale.total.toString()),
        profit: 0, // Calcular se necessário
        paymentMethod: sale.payment_method as string,
        customer: sale.customers ? {
          id: parseInt(sale.customers.id),
          name: sale.customers.name,
          phone: sale.customers.phone || '',
          email: sale.customers.email || '',
          address: sale.customers.address || ''
        } : {
          id: 0,
          name: 'Cliente não informado',
          phone: '',
          email: '',
          address: ''
        },
        discount: parseFloat(sale.discount?.toString() || '0'),
        amountPaid: parseFloat(sale.total.toString()),
        change: 0,
        status: 'completed',
        cart: (sale.sale_items || []).map((item: any) => ({
          productId: parseInt(item.product_id),
          productName: item.product_name || 'Produto',
          quantity: item.quantity,
          price: parseFloat(item.price.toString())
        }))
      }));

      setSales(transformedSales);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar vendas';
      setError(errorMessage);
      toast.error('Erro ao carregar vendas', {
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createSale = useCallback(async (saleData: {
    cart: SaleItem[];
    total: number;
    paymentMethod: string;
    customerId?: number;
    discount?: number;
    date?: Date;
  }) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const saleDate = saleData.date || new Date();

      // Criar venda no Supabase
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert({
          user_id: user.id,
          customer_id: saleData.customerId?.toString() || null,
          total: saleData.total,
          discount: saleData.discount || 0,
          payment_method: saleData.paymentMethod,
          status: 'completed',
          created_at: saleDate.toISOString()
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Criar itens da venda
      const saleItems = saleData.cart.map(item => ({
        sale_id: sale.id,
        product_id: item.productId.toString(),
        quantity: item.quantity,
        price: item.price,
        total: item.quantity * item.price
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems);

      if (itemsError) throw itemsError;

      // Atualizar estoque dos produtos manualmente
      for (const item of saleData.cart) {
        const { data: product, error: fetchError } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.productId.toString())
          .eq('user_id', user.id)
          .single();

        if (fetchError || !product) {
          console.error('Erro ao buscar produto para atualizar estoque:', fetchError);
          continue;
        }

        const newStock = Math.max(0, product.stock - item.quantity);
        
        const { error: stockError } = await supabase
          .from('products')
          .update({ stock: newStock })
          .eq('id', item.productId.toString())
          .eq('user_id', user.id);

        if (stockError) {
          console.error('Erro ao atualizar estoque:', stockError);
        }
      }

      // Recarregar vendas
      await loadSales();

      toast.success('Venda registrada com sucesso!', {
        description: `Total: R$ ${saleData.total.toFixed(2)}`
      });

      return sale;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar venda';
      toast.error('Erro ao processar venda', {
        description: errorMessage
      });
      throw err;
    }
  }, [user, loadSales]);

  const deleteSale = useCallback(async (saleId: number) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const saleIdStr = saleId.toString();
      
      // Primeiro, buscar os itens da venda para restaurar o estoque
      const { data: saleItems, error: itemsError } = await supabase
        .from('sale_items')
        .select('*')
        .eq('sale_id', saleIdStr);

      if (itemsError) throw itemsError;

      // Restaurar estoque manualmente
      for (const item of saleItems || []) {
        const { data: product, error: fetchError } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.product_id)
          .eq('user_id', user.id)
          .single();

        if (fetchError || !product) {
          console.error('Erro ao buscar produto para restaurar estoque:', fetchError);
          continue;
        }

        const newStock = product.stock + item.quantity;
        
        const { error: stockError } = await supabase
          .from('products')
          .update({ stock: newStock })
          .eq('id', item.product_id)
          .eq('user_id', user.id);

        if (stockError) {
          console.error('Erro ao restaurar estoque:', stockError);
        }
      }

      // Deletar itens da venda
      const { error: deleteItemsError } = await supabase
        .from('sale_items')
        .delete()
        .eq('sale_id', saleIdStr);

      if (deleteItemsError) throw deleteItemsError;

      // Deletar venda
      const { error: deleteSaleError } = await supabase
        .from('sales')
        .delete()
        .eq('id', saleIdStr)
        .eq('user_id', user.id);

      if (deleteSaleError) throw deleteSaleError;

      // Atualizar estado local
      setSales(prev => prev.filter(sale => sale.id !== saleId));

      toast.success('Venda excluída com sucesso!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir venda';
      toast.error('Erro ao excluir venda', {
        description: errorMessage
      });
      throw err;
    }
  }, [user]);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  return {
    sales,
    loading,
    error,
    loadSales,
    createSale,
    deleteSale,
    refresh: loadSales
  };
}