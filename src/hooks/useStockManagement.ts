import { useCallback } from 'react';
import { toast } from 'sonner';
import { Product, SaleItem } from '@/components/sales/types';

export const useStockManagement = () => {
  const updateProductStock = useCallback((
    products: Product[],
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>,
    cartItems: SaleItem[]
  ) => {
    setProducts(prevProducts => 
      prevProducts.map(product => {
        const cartItem = cartItems.find(item => 
          item.productId === product.id
        );
        
        if (cartItem) {
          const newStock = Math.max(0, product.stock - cartItem.quantity);
          
          // Log para debug
          console.log(`Atualizando estoque: ${product.name} (${product.stock} -> ${newStock})`);
          
          // Verificar se ficou com estoque baixo
          if (newStock <= (product.minStock || 10) && newStock > 0) {
            toast.warning(`Estoque baixo: ${product.name} (${newStock} unidades)`);
          } else if (newStock === 0) {
            toast.error(`Produto esgotado: ${product.name}`);
          }
          
          return { ...product, stock: newStock };
        }
        
        return product;
      })
    );
  }, []);

  const validateStock = useCallback((
    products: Product[],
    cartItems: SaleItem[]
  ): boolean => {
    for (const item of cartItems) {
      const product = products.find(p => p.id === item.productId);
      if (product && product.stock < item.quantity) {
        toast.error(`Estoque insuficiente para ${product.name}! Disponível: ${product.stock}`);
        return false;
      }
    }
    return true;
  }, []);

  const calculateTotalStockValue = useCallback((products: Product[]): number => {
    return products.reduce((total, product) => {
      return total + (product.stock * product.cost);
    }, 0);
  }, []);

  const getStockAlerts = useCallback((products: Product[]) => {
    const outOfStock = products.filter(p => p.stock === 0);
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= (p.minStock || 10));
    
    return {
      outOfStock,
      lowStock,
      totalAlerts: outOfStock.length + lowStock.length
    };
  }, []);

  return {
    updateProductStock,
    validateStock,
    calculateTotalStockValue,
    getStockAlerts
  };
};