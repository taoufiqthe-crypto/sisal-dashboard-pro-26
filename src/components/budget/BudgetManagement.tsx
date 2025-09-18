import { useState } from "react";
import * as XLSX from 'xlsx';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, FileText, Printer, ShoppingCart, Download, Edit, Settings, Calculator } from "lucide-react";
import { ProfessionalBudget } from "./ProfessionalBudget";

interface Product {
  id: number;
  name: string;
  price: number;
  cost: number;
  stock: number;
  category: string;
}

interface BudgetItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

interface Budget {
  id: number;
  date: string;
  products: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  profit: number;
  customerName: string;
  customerDocument: string;
  customerAddress: string;
  customerPhone: string;
  customerType: 'pessoa_fisica' | 'pessoa_juridica';
  status: 'orcamento' | 'pedido' | 'vendido';
  validUntil: string;
}

interface CompanyData {
  cnpj: string;
  email: string;
  phone: string;
  address: string;
  name: string;
}

const defaultCompanyData: CompanyData = {
  cnpj: '45.174.762/0001-42',
  email: 'gessoprimus2017@gmail.com',
  phone: '(62) 98335-0384',
  address: 'Av. V-8, 08 - qd 09 lt 02 - Mansões Paraíso, Aparecida de Goiânia - GO, 74952-370, Brasil',
  name: 'Gesso Primus'
};

const mockBudgets: Budget[] = [];

interface BudgetManagementProps {
  products: Product[];
  onSaleCreated: (sale: any) => void;
}

export function BudgetManagement({ products, onSaleCreated }: BudgetManagementProps) {
  return (
    <Tabs defaultValue="professional" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="professional">Orçamento Profissional</TabsTrigger>
        <TabsTrigger value="legacy">Orçamento Simples</TabsTrigger>
      </TabsList>
      <TabsContent value="professional">
        <ProfessionalBudget products={products} onBudgetCreated={onSaleCreated} />
      </TabsContent>
      <TabsContent value="legacy">
        <LegacyBudgetManagement products={products} onSaleCreated={onSaleCreated} />
      </TabsContent>
    </Tabs>
  );
}

function LegacyBudgetManagement({ products, onSaleCreated }: BudgetManagementProps) {
  const [budgets, setBudgets] = useState<Budget[]>(mockBudgets);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCompanyDialogOpen, setIsCompanyDialogOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<BudgetItem[]>([]);
  const [currentProduct, setCurrentProduct] = useState("");
  const [currentQuantity, setCurrentQuantity] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerDocument, setCustomerDocument] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerType, setCustomerType] = useState<'pessoa_fisica' | 'pessoa_juridica'>('pessoa_fisica');
  const [validUntil, setValidUntil] = useState("");
  const [companyData, setCompanyData] = useState<CompanyData>(defaultCompanyData);
  const [editCompanyData, setEditCompanyData] = useState<CompanyData>(defaultCompanyData);

  const addProductToBudget = () => {
    if (currentProduct && currentQuantity) {
      const product = products.find(p => p.id.toString() === currentProduct);
      if (product) {
        const budgetItem: BudgetItem = {
          productId: product.id,
          productName: product.name,
          quantity: parseInt(currentQuantity),
          price: product.price,
        };
        setSelectedProducts([...selectedProducts, budgetItem]);
        setCurrentProduct("");
        setCurrentQuantity("");
      }
    }
  };

  const removeProductFromBudget = (index: number) => {
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };
  
  const calculateProfit = () => {
    return selectedProducts.reduce((sum, item) => {
      const productData = products.find(p => p.id === item.productId);
      if (productData) {
        return sum + (item.quantity * (item.price - productData.cost));
      }
      return sum;
    }, 0);
  };

  const createBudget = () => {
    if (selectedProducts.length > 0 && customerName && customerDocument) {
      const total = calculateTotal();
      const profit = calculateProfit();
       
      const newBudget: Budget = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        products: selectedProducts.map(item => ({
          name: item.productName,
          quantity: item.quantity,
          price: item.price
        })),
        total,
        profit: profit,
        customerName,
        customerDocument,
        customerAddress,
        customerPhone,
        customerType,
        status: 'orcamento',
        validUntil: validUntil || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };
      setBudgets([newBudget, ...budgets]);
      setSelectedProducts([]);
      setCustomerName("");
      setCustomerDocument("");
      setCustomerAddress("");
      setCustomerPhone("");
      setValidUntil("");
      setIsDialogOpen(false);
    }
  };

  const convertToPedido = (budgetId: number) => {
    setBudgets(budgets.map(b => 
      b.id === budgetId ? { ...b, status: 'pedido' } : b
    ));
  };

  const convertToSale = (budget: Budget) => {
    // Converter para venda
    onSaleCreated(budget.products);
    setBudgets(budgets.map(b => 
      b.id === budget.id ? { ...b, status: 'vendido' } : b
    ));
  };

  const saveCompanyData = () => {
    setCompanyData(editCompanyData);
    setIsCompanyDialogOpen(false);
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    
    const salesData = budgets
      .filter(b => b.status === 'vendido')
      .map(budget => ({
        'ID Orçamento': budget.id,
        'Data da Venda': new Date(budget.date).toLocaleDateString('pt-BR'),
        'Nome do Cliente': budget.customerName,
        'Telefone': budget.customerPhone || 'N/A',
        'CPF/CNPJ': budget.customerDocument || 'N/A',
        'Endereço': budget.customerAddress || 'N/A',
        'Valor Total': `R$ ${budget.total.toFixed(2)}`,
        'Lucro Obtido': `R$ ${budget.profit.toFixed(2)}`,
        'Margem (%)': `${((budget.profit / budget.total) * 100).toFixed(1)}%`,
        'Status': budget.status.toUpperCase()
      }));
    
    const salesWs = XLSX.utils.json_to_sheet(salesData);
    XLSX.utils.book_append_sheet(wb, salesWs, "📊 Vendas Realizadas");
    
    const today = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    XLSX.writeFile(wb, `Relatorio_Completo_${today}.xlsx`);
  };

  const printBudget = (budget: Budget) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Orçamento ${budget.id}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px;
              color: #000;
              background: white;
              font-size: 12px;
            }
            .container {
              max-width: 210mm;
              margin: 0 auto;
              border: 1px solid #000;
              padding: 15px;
            }
            .header { 
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 20px;
              border-bottom: 1px solid #000;
              padding-bottom: 15px;
            }
            .company-info {
              flex: 1;
            }
            .company-name {
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .company-details {
              font-size: 10px;
              line-height: 1.3;
            }
            .company-logo {
              text-align: right;
              margin-left: 20px;
            }
            .budget-title {
              text-align: center;
              font-size: 14px;
              font-weight: bold;
              margin: 15px 0;
              background: #f0f0f0;
              padding: 8px;
              border: 1px solid #000;
            }
            .date-section {
              text-align: right;
              margin-bottom: 15px;
              font-size: 11px;
            }
            .section-title {
              background: #e0e0e0;
              padding: 5px 10px;
              font-weight: bold;
              margin: 15px 0 5px 0;
              border: 1px solid #000;
              font-size: 11px;
            }
            .customer-info {
              border: 1px solid #000;
              padding: 10px;
              margin-bottom: 15px;
            }
            .customer-row {
              display: flex;
              margin-bottom: 5px;
            }
            .customer-row label {
              width: 80px;
              font-weight: bold;
              font-size: 10px;
            }
            .customer-row span {
              flex: 1;
              border-bottom: 1px solid #000;
              font-size: 10px;
              padding-bottom: 2px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 15px;
              border: 1px solid #000;
            }
            th, td { 
              border: 1px solid #000;
              padding: 5px;
              text-align: left;
              font-size: 10px;
            }
            th { 
              background: #e0e0e0;
              font-weight: bold;
              text-align: center;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .total-row {
              font-weight: bold;
              background: #f0f0f0;
            }
            .payment-section {
              margin-top: 20px;
            }
            .payment-info {
              border: 1px solid #000;
              padding: 10px;
            }
            .payment-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
            }
            .payment-row label {
              font-weight: bold;
              font-size: 10px;
            }
            .payment-row span {
              border-bottom: 1px solid #000;
              min-width: 100px;
              font-size: 10px;
              padding-bottom: 2px;
            }
            .observation-box {
              border: 1px solid #000;
              height: 60px;
              margin-top: 15px;
              padding: 5px;
            }
            .signature-section {
              margin-top: 40px;
              display: flex;
              justify-content: space-between;
              border-top: 1px solid #000;
              padding-top: 10px;
              font-size: 10px;
            }
            .signature-box {
              text-align: center;
              width: 45%;
              border-bottom: 1px solid #000;
              padding-bottom: 5px;
            }
            @media print { 
              body { 
                margin: 0;
                padding: 15px;
              }
              .container {
                border: 1px solid #000;
                margin: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="company-info">
                <div class="company-name">GESSO PRIMUS</div>
                <div class="company-details">
                  CNPJ: ${companyData.cnpj}<br>
                  Email: ${companyData.email}<br>
                  Telefone: ${companyData.phone}<br>
                  ${companyData.address}
                </div>
              </div>
              <div class="company-logo">
                <img src="/src/assets/gesso-primus-logo.png" alt="Gesso Primus Logo" style="width: 80px; height: 60px; object-fit: contain; border: 1px solid #000;">
              </div>
            </div>
            
            <div class="budget-title">ORÇAMENTO Nº ${budget.id}</div>
            
            <div class="date-section">
              ${new Date(budget.date).toLocaleDateString('pt-BR')}
            </div>
            
            <div class="section-title">PREVISÃO DE ENTREGA: ${budget.validUntil ? new Date(budget.validUntil).toLocaleDateString('pt-BR') : 'A definir'}</div>
            
            <div class="section-title">DADOS DO CLIENTE</div>
            <div class="customer-info">
              <div class="customer-row">
                <label>Cliente:</label>
                <span>${budget.customerName}</span>
                <label style="margin-left: 20px;">CPF/CNPJ:</label>
                <span style="width: 150px;">${budget.customerDocument}</span>
              </div>
              <div class="customer-row">
                <label>Endereço:</label>
                <span>${budget.customerAddress || ''}</span>
              </div>
              <div class="customer-row">
                <label>Cidade:</label>
                <span></span>
                <label style="margin-left: 20px;">Estado:</label>
                <span style="width: 100px;"></span>
              </div>
              <div class="customer-row">
                <label>Telefone:</label>
                <span>${budget.customerPhone || ''}</span>
                <label style="margin-left: 20px;">E-mail:</label>
                <span style="width: 200px;"></span>
              </div>
            </div>
            
            <div class="section-title">PRODUTOS</div>
            <table>
              <thead>
                <tr>
                  <th style="width: 30px;">ITEM</th>
                  <th>NOME</th>
                  <th style="width: 50px;">UND</th>
                  <th style="width: 50px;">QTD</th>
                  <th style="width: 80px;">VL UNIT.</th>
                  <th style="width: 80px;">SUBTOTAL</th>
                </tr>
              </thead>
              <tbody>
                ${budget.products.map((item, index) => `
                  <tr>
                    <td class="text-center">${index + 1}</td>
                    <td>${item.name}</td>
                    <td class="text-center">UN</td>
                    <td class="text-center">${item.quantity}</td>
                    <td class="text-right">R$ ${item.price.toFixed(2)}</td>
                    <td class="text-right">R$ ${(item.quantity * item.price).toFixed(2)}</td>
                  </tr>
                `).join('')}
                <tr class="total-row">
                  <td colspan="4" class="text-right">TOTAL</td>
                  <td class="text-right">${budget.products.reduce((sum, item) => sum + item.quantity, 0)}</td>
                  <td class="text-right">R$ ${budget.total.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
            
            <div style="text-align: right; margin-bottom: 15px;">
              <strong>PRODUTOS: R$ ${budget.total.toFixed(2)}</strong><br>
              <strong>TOTAL: R$ ${budget.total.toFixed(2)}</strong>
            </div>
            
            <div class="section-title">DADOS DO PAGAMENTO</div>
            <div class="payment-info">
              <div class="payment-row">
                <label>VENCIMENTO:</label>
                <span>${budget.validUntil ? new Date(budget.validUntil).toLocaleDateString('pt-BR') : ''}</span>
                <label>VALOR:</label>
                <span>R$ ${budget.total.toFixed(2)}</span>
                <label>FORMA DE PAGAMENTO:</label>
                <span>À vista</span>
                <label>OBSERVAÇÃO:</label>
              </div>
            </div>
            
            <div class="observation-box">
              <strong style="font-size: 10px;">Observações:</strong>
            </div>
            
            <div class="signature-section">
              <div class="signature-box">
                <div style="height: 40px;"></div>
                <strong>Assinatura do Cliente</strong>
              </div>
              <div class="signature-box">
                <div style="height: 40px;"></div>
                <strong>Assinatura do Vendedor</strong>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  const formatCurrency = (value: number) => `R$ ${value.toFixed(2)}`;

  const getStatusBadge = (status: Budget['status']) => {
    const statusConfig = {
      orcamento: { label: 'Orçamento', variant: 'secondary' as const },
      pedido: { label: 'Pedido', variant: 'default' as const },
      vendido: { label: 'Vendido', variant: 'outline' as const }
    };
    return statusConfig[status];
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Empresa - Gesso Primus */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 border border-green-200 dark:border-green-800 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-4 bg-white dark:bg-slate-800 rounded-lg px-6 py-4 shadow-md border">
              <img
                src="/lovable-uploads/gessoprimus.png"
                alt="Gesso Primus - Qualidade e Preço Baixo"
                className="w-16 h-16 object-contain"
              />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                  Gesso Primus
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">Sistema de Orçamentos Profissional</p>
                <p className="text-sm text-green-600 dark:text-green-400 font-semibold">Qualidade e Preço Baixo</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-white dark:bg-slate-800 rounded-lg px-4 py-3 shadow-md border">
              <p className="text-sm text-slate-600 dark:text-slate-400">CNPJ: {companyData.cnpj}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">📧 {companyData.email}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">📱 {companyData.phone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Controles */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Orçamentos</h2>
          <p className="text-muted-foreground">Gerencie orçamentos e pedidos</p>
        </div>
         
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportToExcel} className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Exportar Excel</span>
          </Button>
          
          <Dialog open={isCompanyDialogOpen} onOpenChange={setIsCompanyDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Dados da Empresa</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Editar Dados da Empresa</DialogTitle>
                <DialogDescription>
                  Edite os dados que aparecerão nos orçamentos impressos.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nome da Empresa</Label>
                  <Input
                    id="companyName"
                    value={editCompanyData.name}
                    onChange={(e) => setEditCompanyData({...editCompanyData, name: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="companyCnpj">CNPJ</Label>
                  <Input
                    id="companyCnpj"
                    value={editCompanyData.cnpj}
                    onChange={(e) => setEditCompanyData({...editCompanyData, cnpj: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Email</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={editCompanyData.email}
                    onChange={(e) => setEditCompanyData({...editCompanyData, email: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Telefone/WhatsApp</Label>
                  <Input
                    id="companyPhone"
                    value={editCompanyData.phone}
                    onChange={(e) => setEditCompanyData({...editCompanyData, phone: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="companyAddress">Endereço</Label>
                  <Textarea
                    id="companyAddress"
                    value={editCompanyData.address}
                    onChange={(e) => setEditCompanyData({...editCompanyData, address: e.target.value})}
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCompanyDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={saveCompanyData}>
                  Salvar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="flex items-center space-x-2">
                <PlusCircle className="w-4 h-4" />
                <span>Novo Orçamento</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Criar Novo Orçamento</DialogTitle>
                <DialogDescription>
                  Selecione os produtos e quantidades para o orçamento.
                </DialogDescription>
              </DialogHeader>
               
              <div className="space-y-4">
                {/* Tipo de pessoa */}
                <div className="space-y-2">
                  <Label>Tipo de Cliente</Label>
                  <Select value={customerType} onValueChange={(value: 'pessoa_fisica' | 'pessoa_juridica') => setCustomerType(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pessoa_fisica">Pessoa Física</SelectItem>
                      <SelectItem value="pessoa_juridica">Pessoa Jurídica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Nome do cliente */}
                <div className="space-y-2">
                  <Label htmlFor="customer">Nome do Cliente/Empresa *</Label>
                  <Input
                    id="customer"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder={customerType === 'pessoa_fisica' ? "Nome completo" : "Razão social"}
                    required
                  />
                </div>
                
                {/* CPF/CNPJ */}
                <div className="space-y-2">
                  <Label htmlFor="document">{customerType === 'pessoa_fisica' ? 'CPF' : 'CNPJ'} *</Label>
                  <Input
                    id="document"
                    value={customerDocument}
                    onChange={(e) => setCustomerDocument(e.target.value)}
                    placeholder={customerType === 'pessoa_fisica' ? "000.000.000-00" : "00.000.000/0000-00"}
                    required
                  />
                </div>
                
                {/* Telefone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                
                {/* Endereço */}
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Textarea
                    id="address"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Endereço completo"
                    rows={2}
                  />
                </div>

                {/* Válido até */}
                <div className="space-y-2">
                  <Label htmlFor="validUntil">Válido até</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {/* Adicionar produto */}
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <Select value={currentProduct} onValueChange={setCurrentProduct}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um produto" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            {product.name} - {formatCurrency(product.price)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      placeholder="Qtd"
                      value={currentQuantity}
                      onChange={(e) => setCurrentQuantity(e.target.value)}
                    />
                  </div>
                  <Button onClick={addProductToBudget} disabled={!currentProduct || !currentQuantity}>
                    Adicionar
                  </Button>
                </div>

                {selectedProducts.length > 0 && (
                  <div className="space-y-2">
                    <Label>Produtos Selecionados</Label>
                    <div className="border rounded-lg p-4 space-y-2 max-h-40 overflow-y-auto">
                      {selectedProducts.map((item, index) => (
                        <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                          <span className="text-sm">
                            {item.productName} - Qtd: {item.quantity} - {formatCurrency(item.price * item.quantity)}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeProductFromBudget(index)}
                          >
                            Remover
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="text-right font-bold">
                      Total: {formatCurrency(calculateTotal())}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={createBudget} disabled={selectedProducts.length === 0 || !customerName}>
                    Criar Orçamento
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Lista de Orçamentos */}
      <div className="grid gap-4">
        {budgets.map((budget) => (
          <Card key={budget.id} className="w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Orçamento #{budget.id}</span>
                    <Badge variant={getStatusBadge(budget.status).variant}>
                      {getStatusBadge(budget.status).label}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Cliente: {budget.customerName} | Data: {new Date(budget.date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{formatCurrency(budget.total)}</p>
                  <p className="text-sm text-green-600 font-medium">
                    Lucro: {formatCurrency(budget.profit)}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium mb-2">Produtos:</h4>
                  <div className="space-y-1">
                    {budget.products.map((product, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{product.name}</span>
                        <span>{product.quantity}x - {formatCurrency(product.price * product.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between pt-3 border-t">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => printBudget(budget)}
                    >
                      <Printer className="w-4 h-4 mr-1" />
                      Imprimir
                    </Button>
                    
                    {budget.status === 'orcamento' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => convertToPedido(budget.id)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Converter em Pedido
                      </Button>
                    )}
                    
                    {(budget.status === 'orcamento' || budget.status === 'pedido') && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => convertToSale(budget)}
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        Converter em Venda
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
