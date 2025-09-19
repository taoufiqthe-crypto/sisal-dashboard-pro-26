import { useState, useEffect } from 'react';
import { salesService } from '@/services/salesService';
import { Sale } from './types';
import { toast } from 'sonner';

interface SalesDataLoaderProps {
  children: (props: {
    sales: Sale[];
    setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
    loading: boolean;
    refreshSales: () => Promise<void>;
  }) => React.ReactNode;
}

export function SalesDataLoader({ children }: SalesDataLoaderProps) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSales = async () => {
    try {
      setLoading(true);
      const salesData = await salesService.getSales();
      setSales(salesData);
    } catch (error) {
      console.error('Erro ao carregar vendas:', error);
      toast.error('Erro ao carregar dados de vendas');
    } finally {
      setLoading(false);
    }
  };

  const refreshSales = async () => {
    await loadSales();
  };

  useEffect(() => {
    loadSales();
  }, []);

  return <>{children({ sales, setSales, loading, refreshSales })}</>;
}