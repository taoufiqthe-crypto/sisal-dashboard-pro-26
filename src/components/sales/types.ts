export interface Product {
  id: number;
  name: string;
  price: number;
  cost: number;
  stock: number;
  category: string;
  description?: string;
  barcode?: string;
  image?: string;
  minStock?: number;
}

export interface SaleItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

export interface Customer {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  document?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  neighborhood?: string;
  complement?: string;
}

export interface Sale {
  id: number;
  date: string;
  products: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  cart?: SaleItem[]; // Adicionado para facilitar atualização do estoque
  total: number;
  profit: number;
  paymentMethod: "dinheiro" | "pix" | "credito" | "debito";
  amountPaid: number;
  change: number;
  status: "pago" | "pendente";
  customer: Customer;
}

export interface Budget {
  id: number;
  date: string;
  budgetNumber: string;
  deliveryDate?: string;
  products: Array<{
    name: string;
    quantity: number;
    unit: string;
    price: number;
    subtotal: number;
  }>;
  subtotal: number;
  discount: number;
  total: number;
  customer: {
    name: string;
    document: string;
    address?: string;
    city?: string;
    phone?: string;
  };
  company: {
    name: string;
    document: string;
    address: string;
    phone: string;
    email: string;
  };
  paymentMethod?: string;
  observations?: string;
  status: 'orcamento' | 'aprovado' | 'rejeitado' | 'vendido';
  validUntil: string;
}

export interface PaymentMethod {
  type: "dinheiro" | "pix" | "credito" | "debito";
  label: string;
  icon: string;
}

export const paymentMethods: PaymentMethod[] = [
  { type: "dinheiro", label: "Dinheiro", icon: "💰" },
  { type: "pix", label: "PIX", icon: "📱" },
  { type: "credito", label: "Cartão de Crédito", icon: "💳" },
  { type: "debito", label: "Cartão de Débito", icon: "💳" },
];

// Mock de clientes - sistema limpo sem dados de exemplo
export const mockCustomers: Customer[] = [];

// Mock de produtos - sistema limpo sem dados de exemplo
export const mockProducts: Product[] = [];

// Mock de vendas - sistema limpo sem dados de exemplo
export const mockSales: Sale[] = [];
