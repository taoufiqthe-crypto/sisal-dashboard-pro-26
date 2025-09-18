export interface Product {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Company {
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
}

export interface Client {
  name: string;
  address: string;
  phone: string;
  email: string;
}

export interface Payment {
  condition: string;
  dueDate: string;
}

export interface Budget {
  number: string;
  date: Date;
  company: Company;
  client: Client;
  products: Product[];
  payment: Payment;
  notes: string;
}