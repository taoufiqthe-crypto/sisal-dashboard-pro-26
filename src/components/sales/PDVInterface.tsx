// src/components/sales/PDVInterface.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Calculator,
  Receipt,
  User,
  CreditCard,
  Banknote,
  Smartphone,
  Printer,
} from "lucide-react";

import { Product, Sale, SaleItem, Customer, paymentMethods } from "./types";
import ReceiptPrinter from "./ReceiptPrinter";

interface PDVInterfaceProps {
  products: Product[];
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  onSaleCreated: (sale: Sale) => void;
}

export function PDVInterface({
  products,
  customers,
  setCustomers,
  onSaleCreated,
}: PDVInterfaceProps) {
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"dinheiro" | "pix" | "credito" | "debito">("dinheiro");
  const [amountPaid, setAmountPaid] = useState("");
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<"reais" | "percent">("reais");
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [showManualProductDialog, setShowManualProductDialog] = useState(false);
  const [manualProduct, setManualProduct] = useState({
    name: "",
    price: "",
    quantity: "1"
  });

  // Filtrar produtos
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Obter categorias únicas
  const categories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);

  const formatCurrency = (value: number) => `R$ ${value.toFixed(2)}`;

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.productId === product.id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      const newItem: SaleItem = {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price: product.price,
      };
      setCart([...cart, newItem]);
    }
  };

  const addManualProductToCart = () => {
    if (!manualProduct.name.trim() || !manualProduct.price || parseFloat(manualProduct.price) <= 0) {
      alert("Preencha o nome e preço do produto!");
      return;
    }

    const quantity = parseInt(manualProduct.quantity) || 1;
    const price = parseFloat(manualProduct.price);

    const newItem: SaleItem = {
      productId: Date.now(), // ID único temporário
      productName: manualProduct.name.trim(),
      quantity: quantity,
      price: price,
    };

    setCart([...cart, newItem]);
    
    // Limpar formulário e fechar dialog
    setManualProduct({ name: "", price: "", quantity: "1" });
    setShowManualProductDialog(false);
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item =>
        item.productId === productId
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomer(null);
    setDiscount(0);
    setDiscountType("reais");
    setAmountPaid("");
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    let discountAmount = 0;
    
    if (discountType === "percent") {
      discountAmount = (subtotal * discount) / 100;
    } else {
      discountAmount = discount;
    }
    
    return Math.max(0, subtotal - discountAmount);
  };

  const getDiscountAmount = () => {
    const subtotal = calculateSubtotal();
    if (discountType === "percent") {
      return (subtotal * discount) / 100;
    }
    return discount;
  };

  const calculateChange = () => {
    const total = calculateTotal();
    const paid = parseFloat(amountPaid) || 0;
    return paymentMethod === "dinheiro" ? Math.max(0, paid - total) : 0;
  };

  const canFinalizeSale = () => {
    const total = calculateTotal();
    if (cart.length === 0) return false;
    if (paymentMethod === "dinheiro") {
      const paid = parseFloat(amountPaid) || 0;
      return paid >= total;
    }
    return true;
  };

  const finalizeSale = () => {
    if (!canFinalizeSale()) return;

    const total = calculateTotal();
    const profit = cart.reduce((sum, item) => {
      const productData = products.find(p => p.id === item.productId);
      return productData ? sum + item.quantity * (item.price - productData.cost) : sum;
    }, 0);

    const finalAmountPaid = paymentMethod === "dinheiro" 
      ? parseFloat(amountPaid) 
      : total;

    const newSale: Sale = {
      id: Date.now(),
      date: new Date().toISOString().split("T")[0],
      products: cart.map(item => ({
        name: item.productName,
        quantity: item.quantity,
        price: item.price,
      })),
      total,
      profit,
      paymentMethod,
      amountPaid: finalAmountPaid,
      change: calculateChange(),
      status: "pago",
      customer: selectedCustomer || { id: Date.now(), name: "Cliente" },
    };

    onSaleCreated(newSale);
    setLastSale(newSale);
    setShowPaymentDialog(false);
    setShowReceiptDialog(true);
    clearCart();
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case "dinheiro": return <Banknote className="w-4 h-4" />;
      case "pix": return <Smartphone className="w-4 h-4" />;
      case "credito":
      case "debito": return <CreditCard className="w-4 h-4" />;
      default: return <CreditCard className="w-4 h-4" />;
    }
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Área Principal - Produtos */}
      <div className="flex-1 p-6 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Cabeçalho */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-4">PDV - Ponto de Venda</h1>
            
            {/* Filtros */}
            <div className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={() => setShowManualProductDialog(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Produto Manual
              </Button>
            </div>
          </div>

          {/* Grid de Produtos */}
          <div className="flex-1 overflow-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredProducts.map((product) => (
                <Card 
                  key={product.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => addToCart(product)}
                >
                  <CardContent className="p-4">
                    <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center">
                      <span className="text-2xl">{product.name.charAt(0)}</span>
                    </div>
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2">{product.name}</h3>
                    <p className="text-lg font-bold text-primary">{formatCurrency(product.price)}</p>
                    {product.stock !== undefined && (
                      <Badge variant={product.stock > 10 ? "default" : "destructive"} className="text-xs mt-1">
                        Estoque: {product.stock}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Carrinho Lateral */}
      <div className="w-96 bg-card border-l p-6 flex flex-col">
        <div className="flex items-center gap-2 mb-6">
          <ShoppingCart className="w-6 h-6" />
          <h2 className="text-xl font-bold">Carrinho</h2>
          <Badge variant="secondary">{cart.length}</Badge>
        </div>

        {/* Cliente */}
        <div className="mb-4">
          <Label className="text-sm font-medium">Cliente</Label>
          <Select 
            value={selectedCustomer?.id.toString() || ""} 
            onValueChange={(value) => {
              const customer = customers.find(c => c.id.toString() === value);
              setSelectedCustomer(customer || null);
            }}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecionar cliente" />
            </SelectTrigger>
            <SelectContent>
              {customers.map(customer => (
                <SelectItem key={customer.id} value={customer.id.toString()}>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {customer.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator className="mb-4" />

        {/* Itens do Carrinho */}
        <div className="flex-1 overflow-auto mb-4">
          {cart.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Carrinho vazio</p>
              <p className="text-sm">Clique nos produtos para adicionar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <Card key={item.productId} className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm">{item.productName}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.productId)}
                      className="h-6 w-6 p-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="h-6 w-6 p-0"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="h-6 w-6 p-0"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{formatCurrency(item.price)} cada</p>
                      <p className="font-semibold">{formatCurrency(item.quantity * item.price)}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Resumo */}
        {cart.length > 0 && (
          <>
            <Separator className="mb-4" />
            
            {/* Desconto */}
            <div className="mb-4">
              <Label className="text-sm font-medium">Desconto</Label>
              <div className="flex gap-2 mt-1">
                <Select value={discountType} onValueChange={(value: "reais" | "percent") => setDiscountType(value)}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reais">R$</SelectItem>
                    <SelectItem value="percent">%</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(calculateSubtotal())}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Desconto ({discountType === "percent" ? `${discount}%` : "R$"}):</span>
                  <span>-{formatCurrency(getDiscountAmount())}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>{formatCurrency(calculateTotal())}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                onClick={() => setShowPaymentDialog(true)}
                className="w-full"
                disabled={cart.length === 0}
              >
                <Receipt className="w-4 h-4 mr-2" />
                Finalizar e Imprimir
              </Button>
              <Button
                variant="outline"
                onClick={clearCart}
                className="w-full"
              >
                Limpar Carrinho
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Dialog de Pagamento */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Finalizar Pagamento</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex justify-between text-lg font-bold">
                <span>Total a pagar:</span>
                <span>{formatCurrency(calculateTotal())}</span>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Forma de Pagamento</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {paymentMethods.map((method) => (
                  <Button
                    key={method.type}
                    variant={paymentMethod === method.type ? "default" : "outline"}
                    onClick={() => setPaymentMethod(method.type)}
                    className="flex items-center gap-2 h-12"
                  >
                    {getPaymentIcon(method.type)}
                    {method.label}
                  </Button>
                ))}
              </div>
            </div>

            {paymentMethod === "dinheiro" && (
              <div>
                <Label className="text-sm font-medium">Valor Recebido</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  placeholder={formatCurrency(calculateTotal())}
                  className="mt-1"
                />
                {amountPaid && parseFloat(amountPaid) >= calculateTotal() && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-green-600" />
                      <span className="font-semibold text-green-800">
                        Troco: {formatCurrency(calculateChange())}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowPaymentDialog(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={finalizeSale}
                disabled={!canFinalizeSale()}
                className="flex-1"
              >
                Confirmar Pagamento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Recibo */}
      <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Printer className="w-5 h-5" />
              Venda Finalizada
            </DialogTitle>
          </DialogHeader>
          
          {lastSale && (
            <div className="space-y-4">
              <ReceiptPrinter sale={lastSale} />
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-semibold text-green-800">Venda realizada com sucesso!</span>
                </div>
                
                <div className="space-y-1 text-sm text-green-700">
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span className="font-semibold">{formatCurrency(lastSale.total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pagamento:</span>
                    <span>{lastSale.paymentMethod.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Valor pago:</span>
                    <span>{formatCurrency(lastSale.amountPaid)}</span>
                  </div>
                  {lastSale.change > 0 && (
                    <div className="flex justify-between">
                      <span>Troco:</span>
                      <span className="font-semibold">{formatCurrency(lastSale.change)}</span>
                    </div>
                  )}
                </div>
              </div>

              <Button
                onClick={() => setShowReceiptDialog(false)}
                className="w-full"
              >
                Nova Venda
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para Produto Manual */}
      <Dialog open={showManualProductDialog} onOpenChange={setShowManualProductDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Produto Manual</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Nome do Produto</Label>
              <Input
                value={manualProduct.name}
                onChange={(e) => setManualProduct(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Digite o nome do produto"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Preço</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={manualProduct.price}
                  onChange={(e) => setManualProduct(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="0.00"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Quantidade</Label>
                <Input
                  type="number"
                  min="1"
                  value={manualProduct.quantity}
                  onChange={(e) => setManualProduct(prev => ({ ...prev, quantity: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowManualProductDialog(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={addManualProductToCart}
                className="flex-1"
                disabled={!manualProduct.name.trim() || !manualProduct.price}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

