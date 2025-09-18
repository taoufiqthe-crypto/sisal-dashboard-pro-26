import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Printer, FileText, Plus, Trash2, Calculator } from "lucide-react";
import { toast } from "sonner";
import { Product, Budget } from "../sales/types";

interface BudgetItem {
  name: string;
  quantity: number;
  unit: string;
  price: number;
}

interface CompanyData {
  name: string;
  document: string;
  address: string;
  phone: string;
  email: string;
}

const defaultCompanyData: CompanyData = {
  name: "Gesso Primus",
  document: "45.174.762/0001-42",
  address: "Av. V-8, 08 - qd 09 lt 02 - Mansões Paraíso, Aparecida de Goiânia - GO, 74952-370, Brasil",
  phone: "(62) 98335-0384",
  email: "gessoprimus2017@gmail.com"
};

interface ProfessionalBudgetProps {
  products: Product[];
  onBudgetCreated?: (budget: Budget) => void;
}

export function ProfessionalBudget({ products, onBudgetCreated }: ProfessionalBudgetProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [customerData, setCustomerData] = useState({
    name: "",
    document: "",
    address: "",
    city: "",
    phone: ""
  });
  const [deliveryDate, setDeliveryDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [observations, setObservations] = useState("");
  const [companyData] = useState<CompanyData>(defaultCompanyData);
  const printRef = useRef<HTMLDivElement>(null);

  const addBudgetItem = () => {
    setBudgetItems([...budgetItems, {
      name: "",
      quantity: 1,
      unit: "UN",
      price: 0
    }]);
  };

  const updateBudgetItem = (index: number, field: keyof BudgetItem, value: any) => {
    const updated = budgetItems.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    setBudgetItems(updated);
  };

  const removeBudgetItem = (index: number) => {
    setBudgetItems(budgetItems.filter((_, i) => i !== index));
  };

  const addProductToBudget = (product: Product) => {
    const newItem: BudgetItem = {
      name: product.name,
      quantity: 1,
      unit: "UN",
      price: product.price
    };
    setBudgetItems([...budgetItems, newItem]);
  };

  const calculateSubtotal = () => {
    return budgetItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal(); // Para futuras implementações de desconto
  };

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const generateBudgetNumber = () => {
    return `${Date.now().toString().slice(-6)}`;
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('pt-BR');
  };

  const printBudget = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const budgetNumber = generateBudgetNumber();
    const currentDate = getCurrentDate();

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Orçamento ${budgetNumber}</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              font-size: 12px; 
              line-height: 1.5;
              color: #1a1a1a;
              background: #ffffff;
            }
            .container { 
              max-width: 800px; 
              margin: 0 auto; 
              padding: 30px;
              background: #ffffff;
              box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            .header { 
              display: flex; 
              justify-content: space-between; 
              align-items: flex-start; 
              margin-bottom: 30px;
              background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
              border: 2px solid #2d5a27;
              border-radius: 12px;
              padding: 25px;
              position: relative;
            }
            .header::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 4px;
              background: linear-gradient(90deg, #2d5a27 0%, #4ade80 50%, #2d5a27 100%);
              border-radius: 12px 12px 0 0;
            }
            .company-info { flex: 1; }
            .company-name { 
              font-size: 20px; 
              font-weight: 700; 
              color: #2d5a27;
              margin-bottom: 8px;
              letter-spacing: 0.5px;
            }
            .company-details { 
              font-size: 11px; 
              line-height: 1.4; 
              color: #4a5568;
              font-weight: 400;
            }
            .logo-container { 
              width: 90px; 
              height: 90px; 
              border: 2px solid #e2e8f0; 
              border-radius: 8px;
              display: flex; 
              align-items: center; 
              justify-content: center; 
              background: white;
              box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            }
            .budget-title { 
              text-align: center; 
              font-size: 24px; 
              font-weight: 700; 
              margin: 25px 0 15px 0;
              color: #2d5a27;
              text-transform: uppercase;
              letter-spacing: 1px;
              position: relative;
            }
            .budget-title::after {
              content: '';
              position: absolute;
              bottom: -8px;
              left: 50%;
              transform: translateX(-50%);
              width: 100px;
              height: 3px;
              background: linear-gradient(90deg, #2d5a27, #4ade80, #2d5a27);
              border-radius: 2px;
            }
            .budget-info { 
              text-align: center; 
              margin-bottom: 25px;
              font-size: 13px;
              color: #6b7280;
              font-weight: 500;
            }
            .section { margin-bottom: 25px; }
            .section-title { 
              background: linear-gradient(135deg, #2d5a27 0%, #4ade80 100%);
              color: white;
              padding: 12px 16px; 
              font-weight: 600; 
              border: none;
              border-radius: 8px 8px 0 0;
              font-size: 13px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              box-shadow: 0 2px 4px rgba(45, 90, 39, 0.2);
            }
            .customer-grid { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 15px; 
              border: 2px solid #e2e8f0; 
              border-top: none; 
              border-radius: 0 0 8px 8px;
              padding: 20px; 
              background: #f8fafc;
            }
            .field { margin-bottom: 10px; }
            .field-label { 
              font-weight: 600; 
              margin-right: 8px; 
              color: #374151;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.3px;
            }
            .products-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 0; 
              border-radius: 0 0 8px 8px;
              overflow: hidden;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .products-table th, .products-table td { 
              border: 1px solid #e2e8f0; 
              padding: 12px 10px; 
              text-align: center; 
              font-size: 11px;
            }
            .products-table th { 
              background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
              font-weight: 600; 
              color: #374151;
              text-transform: uppercase;
              letter-spacing: 0.3px;
              border-bottom: 2px solid #cbd5e1;
            }
            .products-table tr:nth-child(even) {
              background-color: #f8fafc;
            }
            .products-table tr:hover {
              background-color: #f1f5f9;
            }
            .products-table .item-name { 
              text-align: left; 
              font-weight: 500;
              color: #1f2937;
            }
            .total-section { 
              margin-top: 25px; 
              text-align: right;
              background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
              border: 2px solid #e2e8f0;
              border-radius: 8px;
              padding: 20px;
            }
            .total-row { 
              display: flex; 
              justify-content: flex-end; 
              margin-bottom: 8px; 
            }
            .total-label { 
              width: 200px; 
              text-align: right; 
              margin-right: 25px;
              font-weight: 500;
              color: #4b5563;
            }
            .total-value { 
              width: 120px; 
              text-align: right; 
              font-weight: 700;
              color: #2d5a27;
              font-size: 13px;
            }
            .payment-section { 
              display: grid; 
              grid-template-columns: 1fr 1fr 1fr; 
              gap: 15px; 
              border: 2px solid #e2e8f0; 
              border-radius: 0 0 8px 8px;
              padding: 20px; 
              background: #f8fafc;
            }
            .payment-box {
              text-align: center;
              padding: 15px;
              background: white;
              border-radius: 6px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            }
            .payment-box strong {
              display: block;
              color: #374151;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.3px;
              margin-bottom: 8px;
              font-weight: 600;
            }
            .signature-section { 
              margin-top: 40px; 
              display: flex;
              justify-content: space-between;
              border: 2px solid #e2e8f0; 
              border-radius: 8px;
              padding: 40px 20px 15px 20px;
              background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
            }
            .signature-box {
              text-align: center;
              width: 45%;
              border-bottom: 2px solid #2d5a27;
              padding-bottom: 8px;
              font-weight: 600;
              color: #374151;
              text-transform: uppercase;
              letter-spacing: 0.3px;
              font-size: 11px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Header -->
            <div class="header">
              <div class="company-info">
                <div class="company-name">${companyData.name}</div>
                <div class="company-details">
                  ${companyData.document}<br>
                  ${companyData.address}<br>
                  ${companyData.phone} - ${companyData.email}
                </div>
              </div>
              <div class="logo-container">
                <img src="/src/assets/gesso-primus-logo.png" alt="Gesso Primus" style="width: 75px; height: 75px; object-fit: contain;">
              </div>
            </div>

            <!-- Budget Title -->
            <div class="budget-title">ORÇAMENTO Nº ${budgetNumber}</div>
            <div class="budget-info">${currentDate}</div>
            ${deliveryDate ? `<div class="budget-info">PREVISÃO DE ENTREGA: ${new Date(deliveryDate).toLocaleDateString('pt-BR')}</div>` : ''}

            <!-- Customer Data -->
            <div class="section">
              <div class="section-title">DADOS DO CLIENTE</div>
              <div class="customer-grid">
                <div class="field">
                  <span class="field-label">Cliente:</span>
                  ${customerData.name}
                </div>
                <div class="field">
                  <span class="field-label">CPF/CNPJ:</span>
                  ${customerData.document}
                </div>
                <div class="field">
                  <span class="field-label">Endereço:</span>
                  ${customerData.address}
                </div>
                <div class="field">
                  <span class="field-label">Cidade:</span>
                  ${customerData.city}
                </div>
                <div class="field">
                  <span class="field-label">Telefone:</span>
                  ${customerData.phone}
                </div>
              </div>
            </div>

            <!-- Products Table -->
            <div class="section">
              <div class="section-title">PRODUTOS</div>
              <table class="products-table">
                <thead>
                  <tr>
                    <th>ITEM</th>
                    <th>NOME</th>
                    <th>UND</th>
                    <th>QTD.</th>
                    <th>VL. UNIT.</th>
                    <th>SUBTOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  ${budgetItems.map((item, index) => `
                    <tr>
                      <td>${index + 1}</td>
                      <td class="item-name">${item.name}</td>
                      <td>${item.unit}</td>
                      <td>${item.quantity}</td>
                      <td>${formatCurrency(item.price)}</td>
                      <td>${formatCurrency(item.quantity * item.price)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <!-- Total Section -->
            <div class="total-section">
              <div class="total-row">
                <div class="total-label">TOTAL</div>
                <div class="total-value">${formatCurrency(calculateTotal())}</div>
              </div>
              <div style="margin-top: 10px; font-size: 14px; font-weight: bold;">
                PRODUTOS: ${budgetItems.length}<br>
                TOTAL: ${formatCurrency(calculateTotal())}
              </div>
            </div>

            <!-- Payment Data -->
            <div class="section">
              <div class="section-title">DADOS DO PAGAMENTO</div>
              <div class="payment-section">
                <div class="payment-box">
                  <strong>VENCIMENTO</strong>
                  <div style="font-size: 12px; color: #1f2937; font-weight: 500;">À vista</div>
                </div>
                <div class="payment-box">
                  <strong>VALOR</strong>
                  <div style="font-size: 14px; color: #2d5a27; font-weight: 700;">${formatCurrency(calculateTotal())}</div>
                </div>
                <div class="payment-box">
                  <strong>FORMA DE PAGAMENTO</strong>
                  <div style="font-size: 12px; color: #1f2937; font-weight: 500;">${paymentMethod || 'A definir'}</div>
                </div>
              </div>
              ${observations ? `
                <div style="margin-top: 10px;">
                  <strong>OBSERVAÇÃO:</strong><br>
                  ${observations}
                </div>
              ` : ''}
            </div>

            <!-- Signature -->
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
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const saveBudget = () => {
    if (!customerData.name || !customerData.document || budgetItems.length === 0) {
      toast.error("Preencha os dados do cliente e adicione pelo menos um produto");
      return;
    }

    const budget: Budget = {
      id: Date.now(),
      date: getCurrentDate(),
      budgetNumber: generateBudgetNumber(),
      deliveryDate,
      products: budgetItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        price: item.price,
        subtotal: item.quantity * item.price
      })),
      subtotal: calculateSubtotal(),
      discount: 0,
      total: calculateTotal(),
      customer: customerData,
      company: companyData,
      paymentMethod,
      observations,
      status: 'orcamento',
      validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    if (onBudgetCreated) {
      onBudgetCreated(budget);
    }

    toast.success("Orçamento salvo com sucesso!");
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setBudgetItems([]);
    setCustomerData({
      name: "",
      document: "",
      address: "",
      city: "",
      phone: ""
    });
    setDeliveryDate("");
    setPaymentMethod("");
    setObservations("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Orçamentos Profissionais</h2>
          <p className="text-muted-foreground">Crie orçamentos no formato padrão da empresa</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="pdv-btn-primary">
              <FileText className="w-4 h-4 mr-2" />
              Novo Orçamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Orçamento Profissional</DialogTitle>
              <DialogDescription>
                Preencha os dados abaixo para gerar um orçamento no formato padrão
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Customer Data */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Dados do Cliente</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Nome do Cliente *</Label>
                      <Input
                        value={customerData.name}
                        onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
                        placeholder="Nome completo ou razão social"
                      />
                    </div>
                    <div>
                      <Label>CPF/CNPJ *</Label>
                      <Input
                        value={customerData.document}
                        onChange={(e) => setCustomerData({...customerData, document: e.target.value})}
                        placeholder="000.000.000-00"
                      />
                    </div>
                    <div>
                      <Label>Endereço</Label>
                      <Input
                        value={customerData.address}
                        onChange={(e) => setCustomerData({...customerData, address: e.target.value})}
                        placeholder="Rua, número, bairro"
                      />
                    </div>
                    <div>
                      <Label>Cidade</Label>
                      <Input
                        value={customerData.city}
                        onChange={(e) => setCustomerData({...customerData, city: e.target.value})}
                        placeholder="Cidade - UF"
                      />
                    </div>
                    <div>
                      <Label>Telefone</Label>
                      <Input
                        value={customerData.phone}
                        onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                    <div>
                      <Label>Previsão de Entrega</Label>
                      <Input
                        type="date"
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Products */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    Produtos do Orçamento
                    <Button onClick={addBudgetItem} variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Item
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Quick Add from Products */}
                  <div className="mb-4">
                    <Label>Adicionar produtos do estoque:</Label>
                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-2 max-h-32 overflow-y-auto border rounded-lg p-2 bg-muted/50">
                       {products.slice(0, 8).map(product => (
                         <Button
                           key={product.id}
                           variant="outline"
                           size="sm"
                           onClick={() => addProductToBudget(product)}
                           className="text-xs h-8 hover:bg-primary hover:text-primary-foreground transition-colors"
                         >
                           {product.name}
                         </Button>
                       ))}
                    </div>
                  </div>

                  {/* Budget Items */}
                  <div className="space-y-3">
                    {budgetItems.map((item, index) => (
                      <div key={index} className="flex gap-3 items-end border rounded-lg p-3">
                        <div className="flex-1">
                          <Label>Produto/Serviço</Label>
                          <Input
                            value={item.name}
                            onChange={(e) => updateBudgetItem(index, 'name', e.target.value)}
                            placeholder="Nome do produto ou serviço"
                          />
                        </div>
                        <div className="w-20">
                          <Label>Qtd</Label>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateBudgetItem(index, 'quantity', parseFloat(e.target.value) || 1)}
                            min="1"
                          />
                        </div>
                        <div className="w-20">
                          <Label>Und</Label>
                          <Select 
                            value={item.unit} 
                            onValueChange={(value) => updateBudgetItem(index, 'unit', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="UN">UN</SelectItem>
                              <SelectItem value="M²">M²</SelectItem>
                              <SelectItem value="M">M</SelectItem>
                              <SelectItem value="KG">KG</SelectItem>
                              <SelectItem value="CX">CX</SelectItem>
                              <SelectItem value="PC">PC</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="w-28">
                          <Label>Valor Unit.</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.price}
                            onChange={(e) => updateBudgetItem(index, 'price', parseFloat(e.target.value) || 0)}
                            placeholder="0,00"
                          />
                        </div>
                        <div className="w-28">
                          <Label>Subtotal</Label>
                          <Input
                            value={formatCurrency(item.quantity * item.price)}
                            disabled
                            className="bg-muted"
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeBudgetItem(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {budgetItems.length > 0 && (
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Total do Orçamento:</span>
                        <span className="text-2xl font-bold text-primary">
                          {formatCurrency(calculateTotal())}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment and Observations */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Condições e Observações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Forma de Pagamento</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a forma de pagamento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="À vista">À vista</SelectItem>
                        <SelectItem value="30 dias">30 dias</SelectItem>
                        <SelectItem value="60 dias">60 dias</SelectItem>
                        <SelectItem value="Parcelado">Parcelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Observações</Label>
                    <Textarea
                      value={observations}
                      onChange={(e) => setObservations(e.target.value)}
                      placeholder="Observações adicionais, condições especiais, etc."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={saveBudget} variant="secondary">
                  <FileText className="w-4 h-4 mr-2" />
                  Salvar Orçamento
                </Button>
                <Button onClick={printBudget} className="pdv-btn-primary">
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir Orçamento
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Preview/Demo Card */}
      <Card>
        <CardHeader>
          <CardTitle>Modelo de Orçamento</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Os orçamentos seguem o formato profissional padrão com cabeçalho da empresa, 
            dados do cliente, tabela de produtos detalhada e condições de pagamento.
          </p>
          <div className="bg-muted/30 p-4 rounded-lg text-sm">
            <div className="font-semibold mb-2">Formato inclui:</div>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Cabeçalho com dados da empresa e logo</li>
              <li>• Numeração automática do orçamento</li>
              <li>• Dados completos do cliente</li>
              <li>• Tabela profissional com produtos, quantidades e valores</li>
              <li>• Cálculo automático de totais</li>
              <li>• Condições de pagamento e observações</li>
              <li>• Campo para assinatura do cliente</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}