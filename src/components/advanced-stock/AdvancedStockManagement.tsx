import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertTriangle, Package, TrendingDown, TrendingUp, History, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

interface Product {
  id: number;
  name: string;
  stock: number;
  minStock?: number;
  price: number;
  cost: number;
  category: string;
}

interface StockMovement {
  id: string;
  product_id: number;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  created_at: string;
  productName: string;
}

interface AdvancedStockManagementProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

export const AdvancedStockManagement = ({ products, setProducts }: AdvancedStockManagementProps) => {
  const [movements, setMovements] = useState<StockMovement[]>(() => {
    try {
      const stored = localStorage.getItem("stockMovements");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [movementData, setMovementData] = useState({
    type: 'in' as 'in' | 'out' | 'adjustment',
    quantity: '',
    reason: ''
  });
  const [manualProductName, setManualProductName] = useState('');

  useEffect(() => {
    localStorage.setItem("stockMovements", JSON.stringify(movements));
  }, [movements]);

  const createMovement = async () => {
    let productId: number;
    let productName: string;

    if (selectedProduct) {
      const product = products.find(p => p.id === parseInt(selectedProduct));
    if (!product) {
        toast.error("Produto não encontrado!");
        return;
      }
      productId = product.id;
      productName = product.name;
    } else if (manualProductName.trim()) {
      // Criar produto manual
      const newProduct: Product = {
        id: Date.now(),
        name: manualProductName.trim(),
        stock: 0,
        minStock: 10,
        price: 0,
        cost: 0,
        category: 'Manual'
      };
      setProducts(prev => [...prev, newProduct]);
      productId = newProduct.id;
      productName = newProduct.name;
    } else {
      toast.error("Selecione um produto ou digite o nome de um novo produto!");
      return;
    }

    if (!movementData.quantity || !movementData.reason) {
      toast.error("Preencha todos os campos!");
      return;
    }

    const quantity = parseInt(movementData.quantity);
    const product = products.find(p => p.id === productId);
    
    if (!product) return;

    // Criar movimento
    const newMovement: StockMovement = {
      id: Date.now().toString(),
      product_id: productId,
      type: movementData.type,
      quantity,
      reason: movementData.reason,
      created_at: new Date().toISOString(),
      productName
    };

    setMovements(prev => [newMovement, ...prev]);

    // Atualizar estoque do produto
    let newStock = product.stock;
    if (movementData.type === 'in') {
      newStock += quantity;
    } else if (movementData.type === 'out') {
      newStock -= quantity;
    } else { // adjustment
      newStock = quantity;
    }

    setProducts(prev => prev.map(p => 
      p.id === productId 
        ? { ...p, stock: Math.max(0, newStock) }
        : p
    ));

    toast.success("Movimentação registrada com sucesso!");

    setMovementData({ type: 'in', quantity: '', reason: '' });
    setSelectedProduct('');
    setManualProductName('');
    setIsDialogOpen(false);
  };

  const lowStockProducts = products.filter(p => p.stock <= (p.minStock || 10));
  const outOfStockProducts = products.filter(p => p.stock === 0);

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'in':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'out':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Package className="h-4 w-4 text-blue-500" />;
    }
  };

  const getMovementBadge = (type: string) => {
    const variants = {
      in: { label: 'Entrada', variant: 'default' as const },
      out: { label: 'Saída', variant: 'destructive' as const },
      adjustment: { label: 'Ajuste', variant: 'secondary' as const }
    };
    
    const typeInfo = variants[type as keyof typeof variants];
    return <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestão Avançada de Estoque</h2>
          <p className="text-muted-foreground">Controle detalhado de movimentações e alertas</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Movimentação
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Movimentação de Estoque</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Produto</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(product => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name} (Estoque: {product.stock})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Ou digite o nome de um novo produto</Label>
                <Input
                  value={manualProductName}
                  onChange={(e) => setManualProductName(e.target.value)}
                  placeholder="Nome do produto (será criado automaticamente)"
                />
              </div>
              <div>
                <Label>Tipo de Movimentação *</Label>
                <Select 
                  value={movementData.type} 
                  onValueChange={(value: 'in' | 'out' | 'adjustment') => 
                    setMovementData({ ...movementData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in">Entrada</SelectItem>
                    <SelectItem value="out">Saída</SelectItem>
                    <SelectItem value="adjustment">Ajuste</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Quantidade *</Label>
                <Input
                  type="number"
                  value={movementData.quantity}
                  onChange={(e) => setMovementData({ ...movementData, quantity: e.target.value })}
                  placeholder="Quantidade"
                />
              </div>
              <div>
                <Label>Motivo *</Label>
                <Input
                  value={movementData.reason}
                  onChange={(e) => setMovementData({ ...movementData, reason: e.target.value })}
                  placeholder="Motivo da movimentação"
                />
              </div>
              <Button onClick={createMovement} className="w-full">
                Registrar Movimentação
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alertas de Estoque */}
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              Alertas de Estoque
            </CardTitle>
          </CardHeader>
          <CardContent>
            {outOfStockProducts.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-red-800 mb-2">Produtos em Falta:</h4>
                <div className="flex flex-wrap gap-2">
                  {outOfStockProducts.map(product => (
                    <Badge key={product.id} variant="destructive">{product.name}</Badge>
                  ))}
                </div>
              </div>
            )}
            {lowStockProducts.length > 0 && (
              <div>
                <h4 className="font-semibold text-yellow-800 mb-2">Estoque Baixo:</h4>
                <div className="flex flex-wrap gap-2">
                  {lowStockProducts.map(product => (
                    <Badge key={product.id} variant="outline" className="border-yellow-500">
                      {product.name} ({product.stock}/{product.minStock || 10})
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status do Estoque */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Status do Estoque
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Total de Produtos:</span>
                <Badge variant="outline">{products.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Produtos em Falta:</span>
                <Badge variant="destructive">{outOfStockProducts.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Estoque Baixo:</span>
                <Badge variant="outline" className="border-yellow-500">
                  {lowStockProducts.length}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Valor Total em Estoque:</span>
                <span className="font-semibold">
                  R$ {products.reduce((total, p) => total + (p.stock * p.cost), 0).toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Produtos com Estoque Crítico */}
        <Card>
          <CardHeader>
            <CardTitle>Produtos com Estoque Crítico</CardTitle>
            <CardDescription>Produtos que precisam de atenção</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {lowStockProducts.map(product => (
                <div key={product.id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Categoria: {product.category}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-red-600">
                      {product.stock}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Mín: {product.minStock || 10}
                    </div>
                  </div>
                </div>
              ))}
              {lowStockProducts.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  Todos os produtos estão com estoque adequado
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Histórico de Movimentações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Movimentações
          </CardTitle>
          <CardDescription>Últimas movimentações de estoque</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Motivo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.slice(0, 20).map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell>
                    {format(new Date(movement.created_at), 'dd/MM/yyyy HH:mm')}
                  </TableCell>
                  <TableCell>{movement.productName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getMovementIcon(movement.type)}
                      {getMovementBadge(movement.type)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={movement.type === 'in' ? 'text-green-600' : movement.type === 'out' ? 'text-red-600' : 'text-blue-600'}>
                      {movement.type === 'in' ? '+' : movement.type === 'out' ? '-' : '='}{movement.quantity}
                    </span>
                  </TableCell>
                  <TableCell>{movement.reason}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};