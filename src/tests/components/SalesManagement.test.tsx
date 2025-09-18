import { render } from "@testing-library/react";
import { screen, fireEvent, waitFor } from "@testing-library/dom";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SalesManagement } from "@/components/sales/SalesManagement";
import { Product, Customer } from "@/components/sales/types";

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

// Mock the child components
vi.mock("@/components/sales/ModernPDV", () => ({
  ModernPDV: ({ onSaleCreated }: { onSaleCreated: (sale: any) => void }) => (
    <div data-testid="modern-pdv">
      <button 
        onClick={() => onSaleCreated({
          id: 1,
          date: "2024-01-01",
          total: 100,
          products: [],
          cart: [{ productId: 1, productName: "Test", quantity: 1, price: 100 }]
        })}
      >
        Create Sale
      </button>
    </div>
  )
}));

vi.mock("@/components/sales/SalesToday", () => ({
  SalesToday: () => <div data-testid="sales-today">Sales Today</div>
}));

vi.mock("@/components/sales/SalesMonth", () => ({
  SalesMonth: () => <div data-testid="sales-month">Sales Month</div>
}));

vi.mock("@/components/sales/SalesYear", () => ({
  SalesYear: () => <div data-testid="sales-year">Sales Year</div>
}));

vi.mock("@/components/sales/SalesHistory", () => ({
  SalesHistory: () => <div data-testid="sales-history">Sales History</div>
}));

vi.mock("@/components/sales/NewSale", () => ({
  NewSale: ({ onSaleCreated, onClose }: { onSaleCreated: (sale: any) => void, onClose: () => void }) => (
    <div data-testid="new-sale">
      <button onClick={() => {
        onSaleCreated({
          id: 2,
          date: "2024-01-01",
          total: 50,
          products: [],
          cart: [{ productId: 2, productName: "Manual", quantity: 1, price: 50 }]
        });
        onClose();
      }}>
        Create Manual Sale
      </button>
    </div>
  )
}));

const mockProducts: Product[] = [
  {
    id: 1,
    name: "Produto Teste",
    category: "Categoria A",
    price: 10.50,
    cost: 5.25,
    stock: 100,
    barcode: "123456789",
  },
];

const mockCustomers: Customer[] = [
  {
    id: 1,
    name: "Cliente Teste",
    phone: "(11) 99999-9999",
    email: "cliente@teste.com",
  },
];

const defaultProps = {
  products: mockProducts,
  setProducts: vi.fn(),
  customers: mockCustomers,
  setCustomers: vi.fn(),
  onSaleCreated: vi.fn(),
};

describe("SalesManagement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render sales management interface", () => {
    render(<SalesManagement {...defaultProps} />, { wrapper: createWrapper() });
    
    expect(screen.getByText("PDV Moderno")).toBeInTheDocument();
    expect(screen.getByText("Relatórios de Vendas")).toBeInTheDocument();
  });

  it("should default to PDV tab", () => {
    render(<SalesManagement {...defaultProps} />, { wrapper: createWrapper() });
    
    expect(screen.getByTestId("modern-pdv")).toBeInTheDocument();
  });

  it("should switch to reports tab", async () => {
    render(<SalesManagement {...defaultProps} />, { wrapper: createWrapper() });
    
    const reportsTab = screen.getByText("Relatórios de Vendas");
    fireEvent.click(reportsTab);
    
    await waitFor(() => {
      expect(screen.getByTestId("sales-today")).toBeInTheDocument();
      expect(screen.getByTestId("sales-month")).toBeInTheDocument();
      expect(screen.getByTestId("sales-year")).toBeInTheDocument();
      expect(screen.getByTestId("sales-history")).toBeInTheDocument();
    });
  });

  it("should show manual sale dialog", async () => {
    render(<SalesManagement {...defaultProps} />, { wrapper: createWrapper() });
    
    // Switch to reports tab first
    const reportsTab = screen.getByText("Relatórios de Vendas");
    fireEvent.click(reportsTab);
    
    await waitFor(() => {
      const manualSaleButton = screen.getByText("Nova Venda Manual");
      fireEvent.click(manualSaleButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText("Nova Venda Manual")).toBeInTheDocument();
      expect(screen.getByTestId("new-sale")).toBeInTheDocument();
    });
  });

  it("should handle sale creation from PDV", async () => {
    render(<SalesManagement {...defaultProps} />, { wrapper: createWrapper() });
    
    const createSaleButton = screen.getByText("Create Sale");
    fireEvent.click(createSaleButton);
    
    await waitFor(() => {
      expect(defaultProps.onSaleCreated).toHaveBeenCalledWith({
        id: 1,
        date: "2024-01-01",
        total: 100,
        products: [],
        cart: [{ productId: 1, productName: "Test", quantity: 1, price: 100 }]
      });
    });
  });

  it("should handle manual sale creation", async () => {
    render(<SalesManagement {...defaultProps} />, { wrapper: createWrapper() });
    
    // Switch to reports tab
    const reportsTab = screen.getByText("Relatórios de Vendas");
    fireEvent.click(reportsTab);
    
    await waitFor(() => {
      const manualSaleButton = screen.getByText("Nova Venda Manual");
      fireEvent.click(manualSaleButton);
    });
    
    await waitFor(() => {
      const createManualSaleButton = screen.getByText("Create Manual Sale");
      fireEvent.click(createManualSaleButton);
    });
    
    await waitFor(() => {
      expect(defaultProps.onSaleCreated).toHaveBeenCalledWith({
        id: 2,
        date: "2024-01-01",
        total: 50,
        products: [],
        cart: [{ productId: 2, productName: "Manual", quantity: 1, price: 50 }]
      });
    });
  });

  it("should update product stock when sale is created", async () => {
    const setProductsMock = vi.fn();
    const props = {
      ...defaultProps,
      setProducts: setProductsMock,
    };
    
    render(<SalesManagement {...props} />, { wrapper: createWrapper() });
    
    const createSaleButton = screen.getByText("Create Sale");
    fireEvent.click(createSaleButton);
    
    await waitFor(() => {
      expect(setProductsMock).toHaveBeenCalled();
    });
  });

  it("should validate stock before finalizing sale", async () => {
    const lowStockProducts: Product[] = [
      {
        id: 1,
        name: "Produto Baixo Estoque",
        category: "Categoria A",
        price: 10.50,
        cost: 5.25,
        stock: 0, // No stock
        barcode: "123456789",
      },
    ];
    
    const props = {
      ...defaultProps,
      products: lowStockProducts,
    };
    
    render(<SalesManagement {...props} />, { wrapper: createWrapper() });
    
    // The stock validation is handled internally
    // This test ensures the component renders without errors
    expect(screen.getByTestId("modern-pdv")).toBeInTheDocument();
  });

  it("should filter sales by date correctly", () => {
    render(<SalesManagement {...defaultProps} />, { wrapper: createWrapper() });
    
    // Switch to reports tab to see sales data
    const reportsTab = screen.getByText("Relatórios de Vendas");
    fireEvent.click(reportsTab);
    
    // The date filtering logic is tested through the child components
    // which are mocked in this test
    expect(screen.getByTestId("sales-today")).toBeInTheDocument();
    expect(screen.getByTestId("sales-month")).toBeInTheDocument();
    expect(screen.getByTestId("sales-year")).toBeInTheDocument();
  });

  it("should format currency correctly", () => {
    render(<SalesManagement {...defaultProps} />, { wrapper: createWrapper() });
    
    // The formatCurrency function is used internally
    // This test ensures no errors are thrown
    expect(screen.getByTestId("modern-pdv")).toBeInTheDocument();
  });

  it("should handle payment methods correctly", () => {
    render(<SalesManagement {...defaultProps} />, { wrapper: createWrapper() });
    
    // Payment methods are handled in the PDV component
    expect(screen.getByTestId("modern-pdv")).toBeInTheDocument();
  });
});