import { Card } from "@/components/ui/card";
import { AlertTriangle, Package, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: number;
  name: string;
  stock: number;
  category?: string;
}

interface StockAlertsProps {
  products: Product[];
}

export function StockAlerts({ products }: StockAlertsProps) {
  const outOfStock = products.filter(p => p.stock === 0);
  const lowStock = products.filter(p => p.stock > 0 && p.stock < 20);
  
  if (outOfStock.length === 0 && lowStock.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Package className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold">Estoque</h3>
        </div>
        <div className="text-center py-4">
          <ShoppingBag className="w-12 h-12 text-green-600 mx-auto mb-2" />
          <p className="text-green-600 font-medium">Todos os produtos com estoque adequado</p>
          <p className="text-sm text-muted-foreground">Continue o bom trabalho!</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center space-x-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-warning" />
        <h3 className="text-lg font-semibold">Alertas de Estoque</h3>
      </div>
      
      <div className="space-y-4">
        {outOfStock.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-destructive">Produtos Esgotados</h4>
              <Badge variant="destructive">{outOfStock.length}</Badge>
            </div>
            <div className="space-y-2">
              {outOfStock.slice(0, 3).map((product) => (
                <div key={product.id} className="flex items-center justify-between p-2 bg-destructive/10 rounded border border-destructive/20">
                  <div>
                    <p className="font-medium text-sm">{product.name}</p>
                    {product.category && (
                      <p className="text-xs text-muted-foreground">{product.category}</p>
                    )}
                  </div>
                  <Badge variant="destructive" className="text-xs">
                    Esgotado
                  </Badge>
                </div>
              ))}
              {outOfStock.length > 3 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{outOfStock.length - 3} produtos esgotados
                </p>
              )}
            </div>
          </div>
        )}

        {lowStock.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-warning">Estoque Baixo</h4>
              <Badge variant="secondary">{lowStock.length}</Badge>
            </div>
            <div className="space-y-2">
              {lowStock.slice(0, 3).map((product) => (
                <div key={product.id} className="flex items-center justify-between p-2 bg-warning/10 rounded border border-warning/20">
                  <div>
                    <p className="font-medium text-sm">{product.name}</p>
                    {product.category && (
                      <p className="text-xs text-muted-foreground">{product.category}</p>
                    )}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {product.stock} restantes
                  </Badge>
                </div>
              ))}
              {lowStock.length > 3 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{lowStock.length - 3} produtos com estoque baixo
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}