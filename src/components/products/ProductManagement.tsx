import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Package, Edit, Trash2, Search, Grid3X3, PlusCircle } from "lucide-react";
import { NewProductForm } from "./NewProductForm";

interface Product {
  id: number;
  name: string;
  price: number;
  cost: number;
  stock: number;
  category: string;
}

interface ProductManagementProps {
  products: Product[];
  onProductAdded: (newProduct: Omit<Product, 'id'>) => void;
}

export function ProductManagement({ products, onProductAdded }: ProductManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = Array.from(new Set(products.map(p => p.category))).sort();
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const productsByCategory = categories.reduce((acc, category) => {
    acc[category] = products.filter(p => p.category === category);
    return acc;
  }, {} as Record<string, Product[]>);

  const handleProductAdded = (newProduct: Omit<Product, 'id'>) => {
    onProductAdded(newProduct);
    setIsDialogOpen(false);
  };

  const getStockStatus = (stock: number) => {
    if (stock <= 10) return { label: "Baixo", variant: "destructive" as const };
    if (stock <= 30) return { label: "Médio", variant: "warning" as const };
    return { label: "Bom", variant: "success" as const };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Produtos</h2>
          <p className="text-muted-foreground">Gerencie seus produtos e estoque</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="default" className="flex items-center space-x-2">
              <PlusCircle className="w-4 h-4" />
              <span>Novo Produto</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Produto</DialogTitle>
            </DialogHeader>
            <NewProductForm onProductAdded={handleProductAdded} />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="all" className="flex items-center space-x-1">
            <Grid3X3 className="w-4 h-4" />
            <span>Todos</span>
          </TabsTrigger>
          {categories.map(category => (
            <TabsTrigger key={category} value={category}>
              {category} ({productsByCategory[category].length})
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="all" className="mt-6">
          <div className="grid gap-4">
            {categories.map(category => (
              <div key={category} className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Package className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-semibold">{category}</h3>
                  <Badge variant="secondary">{productsByCategory[category].length} produtos</Badge>
                </div>
                <div className="grid gap-3 ml-7">
                  {productsByCategory[category]
                    .filter(product => 
                      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      product.category.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((product) => {
                      const stockStatus = getStockStatus(product.stock);
                      return (
                        <Card key={product.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Package className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-semibold">{product.name}</h4>
                                <p className="text-xs text-muted-foreground">{product.category}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                              <div className="text-center">
                                <p className="text-lg font-bold text-profit">R$ {product.price.toFixed(2)}</p>
                                <p className="text-xs text-muted-foreground">Preço</p>
                              </div>
                              
                              <div className="text-center">
                                <p className="text-lg font-bold">{product.stock}</p>
                                <p className="text-xs text-muted-foreground">Estoque</p>
                              </div>
                              
                              <div className="flex flex-col items-center space-y-1">
                                <Badge variant={stockStatus.variant} className="text-xs">
                                  {stockStatus.label}
                                </Badge>
                                <div className="flex space-x-1">
                                  <Button variant="outline" size="sm">
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        {categories.map(category => (
          <TabsContent key={category} value={category} className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Package className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-semibold">{category}</h3>
                  <Badge variant="secondary">{productsByCategory[category].length} produtos</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Valor total em estoque: R$ {productsByCategory[category]
                    .reduce((total, product) => total + (product.price * product.stock), 0)
                    .toFixed(2)}
                </div>
              </div>
              
              <div className="grid gap-4">
                {filteredProducts
                  .filter(product => product.category === category)
                  .map((product) => {
                    const stockStatus = getStockStatus(product.stock);
                    return (
                      <Card key={product.id} className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Package className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold">{product.name}</h4>
                              <p className="text-sm text-muted-foreground">{product.category}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-6">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-profit">R$ {product.price.toFixed(2)}</p>
                              <p className="text-xs text-muted-foreground">Preço</p>
                            </div>
                            
                            <div className="text-center">
                              <p className="text-2xl font-bold">{product.stock}</p>
                              <p className="text-xs text-muted-foreground">Em estoque</p>
                            </div>
                            
                            <div className="text-center">
                              <p className="text-lg font-bold">R$ {(product.price * product.stock).toFixed(2)}</p>
                              <p className="text-xs text-muted-foreground">Valor total</p>
                            </div>
                            
                            <div className="flex flex-col items-center space-y-2">
                              <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                              <div className="flex space-x-1">
                                <Button variant="outline" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {filteredProducts.length === 0 && (
        <Card className="p-8 text-center">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum produto encontrado</h3>
          <p className="text-muted-foreground">
            {searchTerm ? "Tente ajustar sua pesquisa" : "Comece adicionando seu primeiro produto"}
          </p>
        </Card>
      )}
    </div>
  );
}
                                