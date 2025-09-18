import React from 'react';
import { Budget } from '../types/budgetTypes';
import { formatCurrency } from '../utils/currency';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PrintBudgetProps {
  budget: Budget;
}

const PrintBudget: React.FC<PrintBudgetProps> = ({ budget }) => {
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      {/* Cabeçalho */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '20px',
        borderBottom: '2px solid #333',
        paddingBottom: '10px'
      }}>
        <h1 style={{ margin: 0, color: '#333' }}>ORÇAMENTO Nº {budget.number}</h1>
        <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
          {format(budget.date, "dd/MM/yyyy", { locale: ptBR })}
        </p>
      </div>
      
      {/* Dados da Empresa */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>{budget.company.name}</h2>
        <p style={{ margin: '5px 0', fontSize: '14px' }}>{budget.company.address}</p>
        <p style={{ margin: '5px 0', fontSize: '14px' }}>{budget.company.city}</p>
        <p style={{ margin: '5px 0', fontSize: '14px' }}>
          Tel: {budget.company.phone} | E-mail: {budget.company.email}
        </p>
      </div>
      
      {/* Dados do Cliente */}
      <div style={{ marginBottom: '20px', backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '5px' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Cliente</h3>
        <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Nome:</strong> {budget.client.name}</p>
        {budget.client.address && <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Endereço:</strong> {budget.client.address}</p>}
        {budget.client.phone && <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Telefone:</strong> {budget.client.phone}</p>}
      </div>
      
      {/* Tabela de Produtos */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Produtos e Serviços</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#e3f2fd', color: '#333' }}>
              <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #ddd' }}>Descrição</th>
              <th style={{ textAlign: 'right', padding: '10px', borderBottom: '1px solid #ddd' }}>Qtd</th>
              <th style={{ textAlign: 'right', padding: '10px', borderBottom: '1px solid #ddd' }}>Unitário</th>
              <th style={{ textAlign: 'right', padding: '10px', borderBottom: '1px solid #ddd' }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {budget.products.map((product) => (
              <tr key={product.id}>
                <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{product.description}</td>
                <td style={{ textAlign: 'right', padding: '10px', borderBottom: '1px solid #eee' }}>{product.quantity}</td>
                <td style={{ textAlign: 'right', padding: '10px', borderBottom: '1px solid #eee' }}>{formatCurrency(product.unitPrice)}</td>
                <td style={{ textAlign: 'right', padding: '10px', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>
                  {formatCurrency(product.subtotal)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} style={{ textAlign: 'right', padding: '10px', fontWeight: 'bold', borderTop: '2px solid #333' }}>Total:</td>
              <td style={{ textAlign: 'right', padding: '10px', fontWeight: 'bold', borderTop: '2px solid #333', color: '#1976d2' }}>
                {formatCurrency(budget.products.reduce((total, product) => total + product.subtotal, 0))}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      
      {/* Condições de Pagamento */}
      <div style={{ marginBottom: '20px', backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '5px' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Condições de Pagamento</h3>
        <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Condição:</strong> {budget.payment.condition}</p>
        <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Data de Vencimento:</strong> {budget.payment.dueDate}</p>
      </div>
      
      {/* Observações */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Observações</h3>
        <p style={{ margin: '5px 0', fontSize: '14px', whiteSpace: 'pre-line' }}>{budget.notes}</p>
      </div>
      
      {/* Rodapé */}
      <div style={{ 
        marginTop: '40px', 
        textAlign: 'center', 
        fontSize: '12px', 
        color: '#777',
        borderTop: '1px solid #ddd',
        paddingTop: '10px'
      }}>
        Orçamento gerado em {format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })} - {budget.company.name}
      </div>
    </div>
  );
};

export default PrintBudget;