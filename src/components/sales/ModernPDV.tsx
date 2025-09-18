import { useState, useEffect, useMemo, useCallback } from "react";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
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
  Zap,
  TrendingUp,
  Package,
  Calendar,
  CalendarIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Product, Sale, SaleItem, Customer, paymentMethods } from "./types";
import ReceiptPrinter from "./ReceiptPrinter";

interface ModernPDVProps {
  products: Product[];
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  onSaleCreated: (sale: Sale) => void;
}

export function ModernPDV({
  products,
  customers,
  setCustomers,
  onSaleCreated,
}: ModernPDVProps) {
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"dinheiro" | "pix" | "credito" | "debito">("pix");
  const [amountPaid, setAmountPaid] = useState("");
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<"reais" | "percent">("reais");
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showManualProductDialog, setShowManualProductDialog] = useState(false);
  const [manualProduct, setManualProduct] = useState({
    name: "",
    price: "",
    quantity: "1"
  });
  // Estado para data da venda reutilizável
  const [saleDate, setSaleDate] = useState<Date>(new Date());
  const [keepSaleDate, setKeepSaleDate] = useState(true);

  // Memoized filtered products for better performance
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (product.barcode && product.barcode.includes(searchTerm));
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      const hasStock = product.stock > 0;
      return matchesSearch && matchesCategory && hasStock;
    });
  }, [products, searchTerm, selectedCategory]);

  // Memoized categories
  const categories = useMemo(() => {
    return Array.from(new Set(products.map(p => p.category))).filter(Boolean);
  }, [products]);

  const formatCurrency = useCallback((value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value), []);

  const addToCart = useCallback((product: Product) => {
    if (product.stock <= 0) {
      toast.error("Produto sem estoque!");
      return;
    }

    const existingItem = cart.find(item => item.productId === product.id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast.error("Quantidade máxima em estoque atingida!");
        return;
      }
      setCart(prev => prev.map(item =>
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
      setCart(prev => [...prev, newItem]);
    }
    
    toast.success(`${product.name} adicionado ao carrinho!`);
  }, [cart]);

  const addManualProductToCart = useCallback(() => {
    if (!manualProduct.name.trim() || !manualProduct.price || parseFloat(manualProduct.price) <= 0) {
      toast.error("Preencha o nome e preço do produto!");
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

    setCart(prev => [...prev, newItem]);
    toast.success(`${manualProduct.name} adicionado ao carrinho!`);
    
    // Limpar formulário e fechar dialog
    setManualProduct({ name: "", price: "", quantity: "1" });
    setShowManualProductDialog(false);
  }, [manualProduct]);

  const updateQuantity = useCallback((productId: number, newQuantity: number) => {
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    if (newQuantity > product.stock) {
      toast.error("Quantidade superior ao estoque!");
      return;
    }

    setCart(prev => prev.map(item =>
      item.productId === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  }, [products]);

  const removeFromCart = useCallback((productId: number) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
    toast.info("Item removido do carrinho");
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setSelectedCustomer(null);
    setDiscount(0);
    setDiscountType("reais");
    setAmountPaid("");
    // Só reseta a data se não estiver mantendo
    if (!keepSaleDate) {
      setSaleDate(new Date());
    }
    toast.info("Carrinho limpo");
  }, [keepSaleDate]);

  const calculateSubtotal = useCallback(() => {
    return cart.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  }, [cart]);

  const calculateTotal = useCallback(() => {
    const subtotal = calculateSubtotal();
    let discountAmount = 0;
    
    if (discountType === "percent") {
      discountAmount = (subtotal * discount) / 100;
    } else {
      discountAmount = discount;
    }
    
    return Math.max(0, subtotal - discountAmount);
  }, [calculateSubtotal, discount, discountType]);

  const getDiscountAmount = useCallback(() => {
    const subtotal = calculateSubtotal();
    if (discountType === "percent") {
      return (subtotal * discount) / 100;
    }
    return discount;
  }, [calculateSubtotal, discount, discountType]);

  const calculateChange = useCallback(() => {
    const total = calculateTotal();
    const paid = parseFloat(amountPaid) || 0;
    return paymentMethod === "dinheiro" ? Math.max(0, paid - total) : 0;
  }, [calculateTotal, amountPaid, paymentMethod]);

  const canFinalizeSale = useCallback(() => {
    const total = calculateTotal();
    if (cart.length === 0) return false;
    if (paymentMethod === "dinheiro") {
      const paid = parseFloat(amountPaid) || 0;
      return paid >= total;
    }
    return true;
  }, [cart.length, paymentMethod, amountPaid, calculateTotal]);

  const finalizeSale = useCallback(async () => {
    if (!canFinalizeSale()) return;

    setIsProcessing(true);
    
    try {
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
        date: saleDate.toISOString().split("T")[0],
        products: cart.map(item => ({
          name: item.productName,
          quantity: item.quantity,
          price: item.price,
        })),
        cart: cart, // Adicionando o carrinho completo para facilitar a atualização do estoque
        total,
        profit,
        paymentMethod,
        amountPaid: finalAmountPaid,
        change: calculateChange(),
        status: "pago",
        customer: selectedCustomer || { id: Date.now(), name: "Cliente Avulso" },
      };

      // Simulate processing delay for professional feel
      await new Promise(resolve => setTimeout(resolve, 1000));

      onSaleCreated(newSale);
      setLastSale(newSale);
      setShowPaymentDialog(false);
      setShowReceiptDialog(true);
      clearCart();
      
      toast.success("Venda finalizada com sucesso!");
    } catch (error) {
      toast.error("Erro ao processar venda");
    } finally {
      setIsProcessing(false);
    }
  }, [canFinalizeSale, calculateTotal, cart, products, paymentMethod, amountPaid, calculateChange, selectedCustomer, onSaleCreated, clearCart]);

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case "dinheiro": return <Banknote className="w-4 h-4" />;
      case "pix": return <Smartphone className="w-4 h-4" />;
      case "credito":
      case "debito": return <CreditCard className="w-4 h-4" />;
      default: return <CreditCard className="w-4 h-4" />;
    }
  };

  // Auto-focus search on mount
  useEffect(() => {
    const searchInput = document.querySelector('input[placeholder="Buscar produtos..."]') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
    }
  }, []);

  return (
    <div className="h-screen flex bg-gradient-to-br from-background to-muted/20">
      {/* Main Area - Products */}
      <div className="flex-1 p-6 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Modern Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg pdv-btn-primary">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  PDV Professional
                </h1>
                <p className="text-muted-foreground">Sistema de Vendas Moderno</p>
              </div>
            </div>
            
            {/* Enhanced Filters */}
            <div className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar produtos, código de barras..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 border-2 focus:border-primary/50 transition-colors"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48 h-11 border-2">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        {category}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-4 mb-4">
              <div className="flex items-center gap-2 px-3 py-2 bg-success/10 rounded-lg">
                <TrendingUp className="w-4 h-4 text-success" />
                <span className="text-sm font-medium">{filteredProducts.length} produtos</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg">
                <ShoppingCart className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{cart.length} no carrinho</span>
              </div>
              <Button 
                onClick={() => setShowManualProductDialog(true)}
                className="flex items-center gap-2 h-8 px-3 bg-amber-500 hover:bg-amber-600 text-white"
              >
                <Plus className="w-4 h-4" />
                Produto Manual
              </Button>
            </div>
          </div>

          {/* Enhanced Products Grid */}
          <div className="flex-1 overflow-auto">
            <div className="pdv-product-grid">
              {filteredProducts.map((product) => (
                <Card 
                  key={product.id} 
                  className="pdv-product-card group"
                  onClick={() => addToCart(product)}
                >
                  <CardContent className="p-4">
                    <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 rounded-lg mb-3 flex items-center justify-center group-hover:from-primary/10 group-hover:to-primary/5 transition-colors">
                      <span className="text-3xl font-bold text-primary/60">{product.name.charAt(0)}</span>
                    </div>
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-lg font-bold text-primary mb-2">
                      {formatCurrency(product.price)}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant={product.stock > 10 ? "default" : product.stock > 5 ? "secondary" : "destructive"} 
                        className="text-xs"
                      >
                        {product.stock} un.
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {product.category}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {filteredProducts.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-12">
                  <Package className="w-16 h-16 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                    Nenhum produto encontrado
                  </h3>
                  <p className="text-sm text-muted-foreground text-center">
                    Tente ajustar os filtros ou verificar se há produtos em estoque
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modern Cart Sidebar */}
      <div className="w-96 pdv-cart border-l flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <ShoppingCart className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold">Carrinho</h2>
            <Badge variant="secondary" className="ml-auto">{cart.length}</Badge>
            </div>

            {/* Date Selection */}
            <div className="mb-4">
              <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4" />
                Data da Venda
              </Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "flex-1 justify-start text-left font-normal",
                        !saleDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {saleDate ? format(saleDate, "dd/MM/yyyy") : <span>Selecione a data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={saleDate}
                      onSelect={(date) => date && setSaleDate(date)}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                      disabled={(date) => date > new Date()}
                    />
                  </PopoverContent>
                </Popover>
                <Button
                  variant={keepSaleDate ? "default" : "outline"}
                  size="sm"
                  onClick={() => setKeepSaleDate(!keepSaleDate)}
                  className="px-3"
                >
                  {keepSaleDate ? "Fixar" : "Livre"}
                </Button>
              </div>
              {keepSaleDate && (
                <p className="text-xs text-muted-foreground mt-1">
                  Data mantida para próximas vendas
                </p>
              )}
            </div>

            {/* Customer Selection */}
            <div>
              <Label className="text-sm font-medium flex items-center gap-2">
                <User className="w-4 h-4" />
                Cliente
              </Label>
            <Select 
              value={selectedCustomer?.id.toString() || ""} 
              onValueChange={(value) => {
                const customer = customers.find(c => c.id.toString() === value);
                setSelectedCustomer(customer || null);
              }}
            >
              <SelectTrigger className="mt-2 border-2">
                <SelectValue placeholder="Selecionar cliente (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {customers.map(customer => (
                  <SelectItem key={customer.id} value={customer.id.toString()}>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        {customer.phone && (
                          <div className="text-xs text-muted-foreground">{customer.phone}</div>
                        )}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Cart Items */}
        <div className="flex-1 overflow-auto p-6">
          {cart.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="font-medium mb-2">Carrinho vazio</p>
              <p className="text-sm">Adicione produtos para começar a venda</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <Card key={item.productId} className="p-3 border-2 hover:border-primary/20 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium text-sm flex-1 pr-2">{item.productName}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.productId)}
                      className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
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
                        className="h-7 w-7 p-0"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="h-7 w-7 p-0"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{formatCurrency(item.price)} cada</p>
                      <p className="font-semibold text-primary">{formatCurrency(item.quantity * item.price)}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Cart Summary & Actions */}
        {cart.length > 0 && (
          <div className="p-6 border-t bg-muted/30">
            {/* Discount Section */}
            <div className="mb-4">
              <Label className="text-sm font-medium">Desconto</Label>
              <div className="flex gap-2 mt-2">
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
                  placeholder="0,00"
                  className="flex-1"
                />
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-success">
                  <span>Desconto ({discountType === "percent" ? `${discount}%` : "R$"}):</span>
                  <span>-{formatCurrency(getDiscountAmount())}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-primary">{formatCurrency(calculateTotal())}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => setShowPaymentDialog(true)}
                className="w-full h-12 pdv-btn-primary text-lg font-semibold"
                disabled={cart.length === 0}
              >
                <Receipt className="w-5 h-5 mr-2" />
                Finalizar Venda
              </Button>
              <Button
                variant="outline"
                onClick={clearCart}
                className="w-full border-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Limpar Carrinho
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              Finalizar Pagamento
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total a pagar:</span>
                <span className="text-primary text-2xl">{formatCurrency(calculateTotal())}</span>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Forma de Pagamento</Label>
              <div className="grid grid-cols-2 gap-3 mt-3">
                {paymentMethods.map((method) => (
                  <Button
                    key={method.type}
                    variant={paymentMethod === method.type ? "default" : "outline"}
                    onClick={() => setPaymentMethod(method.type)}
                    className={`flex items-center gap-2 h-14 ${
                      paymentMethod === method.type ? "pdv-btn-primary" : ""
                    }`}
                  >
                    {getPaymentIcon(method.type)}
                    <span className="text-sm">{method.label}</span>
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
                  className="mt-2 h-12 text-lg border-2"
                />
                {amountPaid && parseFloat(amountPaid) >= calculateTotal() && (
                  <div className="mt-3 p-4 bg-success/10 border border-success/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-success" />
                      <span className="font-semibold text-success text-lg">
                        Troco: {formatCurrency(calculateChange())}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowPaymentDialog(false)}
                className="flex-1 h-12"
                disabled={isProcessing}
              >
                Cancelar
              </Button>
              <Button
                onClick={finalizeSale}
                disabled={!canFinalizeSale() || isProcessing}
                className="flex-1 h-12 pdv-btn-primary"
              >
                {isProcessing ? "Processando..." : "Confirmar Pagamento"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Printer className="w-5 h-5 text-success" />
              Venda Finalizada com Sucesso!
            </DialogTitle>
          </DialogHeader>
          
          {lastSale && (
            <div className="space-y-6">
              <ReceiptPrinter sale={lastSale} />
              
              <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                  <span className="font-semibold text-success">Pagamento processado!</span>
                </div>
                
                <div className="space-y-2 text-sm text-success/80">
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
                className="w-full h-12 pdv-btn-primary"
              >
                <Zap className="w-4 h-4 mr-2" />
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