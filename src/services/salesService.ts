import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sale, SaleItem, Product } from "@/components/sales/types";

export interface SaleData {
  user_id: string;
  customer_id?: string;
  payment_method: string;
  total: number;
  discount?: number;
  status: string;
}

export interface SaleItemData {
  sale_id: string;
  product_id: string;
  quantity: number;
  price: number;
  total: number;
}

export const salesService = {
  async createSale(sale: Sale): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Usuário não autenticado");
        return false;
      }

      // 1. Criar a venda principal
      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .insert({
          user_id: user.id,
          customer_id: sale.customer?.id?.toString() || null,
          payment_method: sale.paymentMethod,
          total: sale.total,
          discount: 0,
          status: 'completed'
        })
        .select()
        .single();

      if (saleError) {
        console.error('Erro ao criar venda:', saleError);
        toast.error("Erro ao salvar venda");
        return false;
      }

      // 2. Criar os itens da venda
      if (sale.cart && sale.cart.length > 0) {
        const saleItems = sale.cart.map(item => ({
          sale_id: saleData.id,
          product_id: item.productId.toString(),
          quantity: item.quantity,
          price: item.price,
          total: item.quantity * item.price
        }));

        const { error: itemsError } = await supabase
          .from('sale_items')
          .insert(saleItems);

        if (itemsError) {
          console.error('Erro ao criar itens da venda:', itemsError);
          toast.error("Erro ao salvar itens da venda");
          return false;
        }

        // 3. Atualizar estoque dos produtos manualmente
        for (const item of sale.cart) {
          // Buscar produto atual
          const { data: currentProduct } = await supabase
            .from('products')
            .select('stock')
            .eq('id', item.productId.toString())
            .eq('user_id', user.id)
            .single();

          if (currentProduct) {
            const newStock = Math.max(0, currentProduct.stock - item.quantity);
            
            const { error: stockError } = await supabase
              .from('products')
              .update({ stock: newStock })
              .eq('id', item.productId.toString())
              .eq('user_id', user.id);

            if (stockError) {
              console.error('Erro ao atualizar estoque:', stockError);
              toast.warning(`Erro ao atualizar estoque do produto ${item.productName}`);
            }
          }
        }
      }

      // Salvar também no localStorage para compatibilidade com relatórios
      const storedSales = JSON.parse(localStorage.getItem('sales') || '[]');
      storedSales.unshift(sale);
      localStorage.setItem('sales', JSON.stringify(storedSales));

      toast.success("Venda realizada com sucesso!");
      return true;
    } catch (error) {
      console.error('Erro geral ao criar venda:', error);
      toast.error("Erro inesperado ao processar venda");
      return false;
    }
  },

  async getSales(): Promise<Sale[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: salesData, error } = await supabase
        .from('sales')
        .select(`
          *,
          sale_items(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar vendas:', error);
        return JSON.parse(localStorage.getItem('sales') || '[]');
      }

      // Converter dados do Supabase para o formato esperado
      const formattedSales: Sale[] = salesData.map(sale => ({
        id: parseInt(sale.id),
        date: sale.created_at.split('T')[0],
        products: sale.sale_items.map((item: any) => ({
          name: `Produto ${item.product_id}`,
          quantity: item.quantity,
          price: item.price
        })),
        cart: sale.sale_items.map((item: any) => ({
          productId: parseInt(item.product_id),
          productName: `Produto ${item.product_id}`,
          quantity: item.quantity,
          price: item.price
        })),
        total: sale.total,
        profit: sale.total * 0.3, // Estimativa de 30% de lucro
        paymentMethod: sale.payment_method as any,
        amountPaid: sale.total,
        change: 0,
        status: 'pago' as any,
        customer: { id: 1, name: 'Cliente' }
      }));

      return formattedSales;
    } catch (error) {
      console.error('Erro ao buscar vendas:', error);
      return JSON.parse(localStorage.getItem('sales') || '[]');
    }
  },

  validateStock(products: Product[], cartItems: SaleItem[]): boolean {
    for (const item of cartItems) {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        toast.error(`Produto ${item.productName} não encontrado!`);
        return false;
      }
      
      if (product.stock < item.quantity) {
        toast.error(`Estoque insuficiente para ${product.name}! Disponível: ${product.stock}, Solicitado: ${item.quantity}`);
        return false;
      }
    }
    return true;
  },

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }
};