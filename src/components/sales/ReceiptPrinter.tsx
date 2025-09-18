// src/components/sales/ReceiptPrinter.tsx
import React from 'react';
import { Printer } from 'lucide-react';
import { Sale } from './types';
import logoGessoPrimus from '@/assets/gesso-primus-logo.png';

interface ReceiptPrinterProps {
  sale: Sale;
  onPrint?: () => void;
}

const ReceiptPrinter: React.FC<ReceiptPrinterProps> = ({ sale, onPrint }) => {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(getReceiptHTML());
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
    if (onPrint) onPrint();
  };

  const getReceiptHTML = () => {
    const currentDate = new Date().toLocaleDateString('pt-BR');
    const currentTime = new Date().toLocaleTimeString('pt-BR');
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Orçamento ${sale.id} - Gesso Primus</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: Arial, sans-serif; 
              font-size: 11px; 
              line-height: 1.3;
              color: #000;
              background: #fff;
              padding: 20px;
            }
            .header {
              border: 2px solid #000;
              padding: 15px;
              margin-bottom: 0;
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            .company-info {
              flex: 1;
              padding-right: 20px;
            }
            .company-name {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 8px;
              color: #2d5a27;
            }
            .company-details {
              font-size: 10px;
              line-height: 1.4;
              color: #333;
            }
            .logo-container {
              flex-shrink: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 1px solid #000;
              padding: 5px;
              background: #fff;
            }
            .logo-container img {
              width: 80px;
              height: 60px;
              object-fit: contain;
            }
            .contact-info {
              text-align: right;
              font-size: 9px;
              color: #666;
              margin-top: 10px;
            }
            .orcamento-info {
              background: #f0f0f0;
              border: 2px solid #000;
              border-top: none;
              padding: 10px;
              text-align: center;
              margin-bottom: 0;
            }
            .orcamento-title {
              font-weight: bold;
              font-size: 14px;
              margin-bottom: 5px;
            }
            .previsao {
              background: #e0e0e0;
              border: 1px solid #000;
              padding: 8px;
              margin-bottom: 0;
              font-size: 10px;
            }
            .cliente-section {
              background: #f0f0f0;
              border: 1px solid #000;
              padding: 8px;
              margin-bottom: 0;
              font-size: 10px;
            }
            .cliente-title {
              font-weight: bold;
              margin-bottom: 5px;
            }
            .cliente-row {
              display: flex;
              margin-bottom: 3px;
            }
            .cliente-label {
              width: 80px;
              font-weight: bold;
            }
            .products-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 0;
              font-size: 10px;
            }
            .products-table th,
            .products-table td {
              border: 1px solid #000;
              padding: 4px;
              text-align: left;
            }
            .products-table th {
              background: #f0f0f0;
              font-weight: bold;
              font-size: 9px;
              text-align: center;
            }
            .products-table .item-col { width: 15%; }
            .products-table .nome-col { width: 35%; }
            .products-table .und-col { width: 10%; }
            .products-table .qtd-col { width: 10%; }
            .products-table .vlunit-col { width: 15%; }
            .products-table .subtotal-col { width: 15%; }
            .total-row {
              font-weight: bold;
              background: #f0f0f0;
            }
            .payment-section {
              margin-top: 20px;
              border: 1px solid #000;
              padding: 10px;
              font-size: 10px;
            }
            .payment-title {
              font-weight: bold;
              margin-bottom: 8px;
            }
            .payment-row {
              display: flex;
              margin-bottom: 5px;
            }
            .payment-label {
              width: 120px;
              font-weight: bold;
            }
            .payment-value {
              flex: 1;
            }
            .assinatura {
              margin-top: 30px;
              text-align: center;
              border-top: 1px solid #000;
              padding-top: 20px;
              font-size: 10px;
            }
            @media print { 
              body { 
                padding: 10px;
                font-size: 10px;
              }
              .container {
                max-width: none;
                width: 100%;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-info">
              <div class="company-name">GESSO PRIMUS</div>
              <div class="company-details">
                <strong>CNPJ:</strong> 45.174.762/0001-42<br>
                <strong>Razão Social:</strong> GESSO PRIMUS LTDA<br>
                <strong>Atividade:</strong> Comércio Varejista de Material de Construção em Geral<br>
                <strong>Endereço:</strong> Valparaíso de Goiás - GO<br>
                <strong>Telefone:</strong> (62) 98335-0384<br>
                <strong>Email:</strong> contato@gessoprimus.com.br<br>
                <strong>Site:</strong> www.gessoprimus.com.br
              </div>
            </div>
            <div class="logo-container">
              <img src="${logoGessoPrimus}" alt="Gesso Primus Logo">
            </div>
          </div>

          <div class="orcamento-info">
            <div class="orcamento-title">ORÇAMENTO Nº ${sale.id}</div>
            <div>${currentDate}</div>
          </div>

          <div class="previsao">
            <strong>PREVISÃO DE ENTREGA:</strong> ${currentDate}
          </div>

          <div class="cliente-section">
            <div class="cliente-title">DADOS DO CLIENTE</div>
            <div class="cliente-row">
              <span class="cliente-label">Cliente:</span>
              <span>${sale.customer?.name || 'Cliente Avulso'}</span>
            </div>
            <div class="cliente-row">
              <span class="cliente-label">CNPJ/CPF:</span>
              <span>-</span>
            </div>
            <div class="cliente-row">
              <span class="cliente-label">Cidade:</span>
              <span>-</span>
            </div>
            <div class="cliente-row">
              <span class="cliente-label">Endereço:</span>
              <span>-</span>
            </div>
            <div class="cliente-row">
              <span class="cliente-label">Telefone:</span>
              <span>-</span>
            </div>
          </div>

          <table class="products-table">
            <thead>
              <tr>
                <th class="item-col">ITEM</th>
                <th class="nome-col">NOME</th>
                <th class="und-col">UND.</th>
                <th class="qtd-col">QTD.</th>
                <th class="vlunit-col">VL.UNIT.</th>
                <th class="subtotal-col">SUBTOTAL</th>
              </tr>
            </thead>
            <tbody>
              ${sale.products.map((product, index) => `
                <tr>
                  <td class="item-col" style="text-align: center;">${index + 1}</td>
                  <td class="nome-col">${product.name}</td>
                  <td class="und-col" style="text-align: center;">UN</td>
                  <td class="qtd-col" style="text-align: center;">${product.quantity}</td>
                  <td class="vlunit-col" style="text-align: right;">R$ ${product.price.toFixed(2)}</td>
                  <td class="subtotal-col" style="text-align: right;">R$ ${(product.price * product.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="4" style="text-align: center; font-weight: bold;">TOTAL</td>
                <td style="text-align: right; font-weight: bold;">${sale.products.reduce((sum, p) => sum + p.quantity, 0)}</td>
                <td style="text-align: right; font-weight: bold;">R$ ${sale.total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div style="margin-top: 10px; text-align: center; font-size: 10px;">
            <strong>PRODUTOS</strong><br>
            <strong>TOTAL: R$ ${sale.total.toFixed(2)}</strong>
          </div>

          <div class="payment-section">
            <div class="payment-title">DADOS DO PAGAMENTO</div>
            <div class="payment-row">
              <span class="payment-label">VENCIMENTO</span>
              <span class="payment-value">À VISTA</span>
              <span class="payment-label">VALOR</span>
              <span class="payment-value">R$ ${sale.total.toFixed(2)}</span>
            </div>
            <div class="payment-row">
              <span class="payment-label">FORMA DE PAGAMENTO</span>
              <span class="payment-value">${sale.paymentMethod.toUpperCase()}</span>
              <span class="payment-label">OBSERVAÇÃO</span>
              <span class="payment-value">-</span>
            </div>
          </div>

          <div class="assinatura">
            ______________________________<br>
            Assinatura do cliente
          </div>
        </body>
      </html>
    `;
  };

  return (
    <div>
      <button
        onClick={handlePrint}
        className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center transition-colors font-medium text-lg"
      >
        <Printer className="w-5 h-5 mr-2" />
        🖨️ Imprimir Orçamento
      </button>
      
      {/* Preview do orçamento */}
      <div className="mt-4 p-4 border-2 border-border rounded-lg bg-background text-xs font-sans max-w-md mx-auto">
        {/* Cabeçalho */}
        <div className="border-2 border-border p-3 mb-0 flex justify-between items-start">
          <div className="flex-1 pr-4">
            <div className="text-lg font-bold mb-2 text-primary">GESSO PRIMUS</div>
            <div className="text-xs text-muted-foreground leading-relaxed">
              <strong>CNPJ:</strong> 45.174.762/0001-42<br/>
              <strong>Razão Social:</strong> GESSO PRIMUS LTDA<br/>
              <strong>Atividade:</strong> Comércio Varejista de Material de Construção<br/>
              <strong>Endereço:</strong> Valparaíso de Goiás - GO<br/>
              <strong>Telefone:</strong> (62) 98335-0384<br/>
              <strong>Email:</strong> contato@gessoprimus.com.br<br/>
              <strong>Site:</strong> www.gessoprimus.com.br
            </div>
          </div>
          <div className="flex-shrink-0 border border-border p-1 bg-white">
            <img 
              src={logoGessoPrimus} 
              alt="Gesso Primus Logo" 
              className="w-16 h-12 object-contain"
            />
          </div>
        </div>

        {/* Info do orçamento */}
        <div className="bg-muted border-2 border-border border-t-0 p-2 text-center mb-0">
          <div className="font-bold text-sm mb-1">ORÇAMENTO Nº {sale.id}</div>
          <div className="text-xs">{new Date().toLocaleDateString('pt-BR')}</div>
        </div>

        {/* Previsão */}
        <div className="bg-muted/70 border border-border p-2 mb-0 text-xs">
          <strong>PREVISÃO DE ENTREGA:</strong> {new Date().toLocaleDateString('pt-BR')}
        </div>

        {/* Dados do cliente */}
        <div className="bg-muted border border-border p-2 mb-0 text-xs">
          <div className="font-bold mb-2">DADOS DO CLIENTE</div>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <span className="font-semibold">Cliente:</span>
            <span>{sale.customer?.name || 'Cliente Avulso'}</span>
            <span className="font-semibold">CNPJ/CPF:</span>
            <span>-</span>
            <span className="font-semibold">Cidade:</span>
            <span>-</span>
            <span className="font-semibold">Telefone:</span>
            <span>-</span>
          </div>
        </div>

        {/* Tabela de produtos */}
        <div className="border border-border border-t-0">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted">
                <th className="border border-border p-1 text-center">ITEM</th>
                <th className="border border-border p-1">NOME</th>
                <th className="border border-border p-1 text-center">UND.</th>
                <th className="border border-border p-1 text-center">QTD.</th>
                <th className="border border-border p-1 text-center">VL.UNIT.</th>
                <th className="border border-border p-1 text-center">SUBTOTAL</th>
              </tr>
            </thead>
            <tbody>
              {sale.products.map((product, index) => (
                <tr key={index}>
                  <td className="border border-border p-1 text-center">{index + 1}</td>
                  <td className="border border-border p-1">{product.name}</td>
                  <td className="border border-border p-1 text-center">UN</td>
                  <td className="border border-border p-1 text-center">{product.quantity}</td>
                  <td className="border border-border p-1 text-right">R$ {product.price.toFixed(2)}</td>
                  <td className="border border-border p-1 text-right">R$ {(product.price * product.quantity).toFixed(2)}</td>
                </tr>
              ))}
              <tr className="bg-muted font-bold">
                <td colSpan={4} className="border border-border p-1 text-center">TOTAL</td>
                <td className="border border-border p-1 text-right">{sale.products.reduce((sum, p) => sum + p.quantity, 0)}</td>
                <td className="border border-border p-1 text-right">R$ {sale.total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Total de produtos */}
        <div className="text-center py-2 text-xs">
          <strong>PRODUTOS</strong><br/>
          <strong>TOTAL: R$ {sale.total.toFixed(2)}</strong>
        </div>

        {/* Dados do pagamento */}
        <div className="border border-border p-2 mt-4 text-xs">
          <div className="font-bold mb-2">DADOS DO PAGAMENTO</div>
          <div className="grid grid-cols-4 gap-1 mb-1">
            <span className="font-semibold">VENCIMENTO</span>
            <span>À VISTA</span>
            <span className="font-semibold">VALOR</span>
            <span>R$ {sale.total.toFixed(2)}</span>
          </div>
          <div className="grid grid-cols-4 gap-1">
            <span className="font-semibold">FORMA DE PAGAMENTO</span>
            <span>{sale.paymentMethod.toUpperCase()}</span>
            <span className="font-semibold">OBSERVAÇÃO</span>
            <span>-</span>
          </div>
        </div>

        {/* Assinatura */}
        <div className="text-center mt-6 pt-4 border-t border-border text-xs">
          ______________________________<br/>
          Assinatura do cliente
        </div>
      </div>
    </div>
  );
};

export default ReceiptPrinter;

