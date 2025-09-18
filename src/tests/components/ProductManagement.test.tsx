import { render } from "@testing-library/react";
import { screen, fireEvent, waitFor } from "@testing-library/dom";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProductManagement } from "@/components/products/ProductManagement";
import { Product } from "@/components/sales/types";

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

// Mock toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockProducts: Product[] = [
  {
    id: 1,
    name: "Produto 1",
    category: "Categoria A",
    price: 10.50,
    cost: 5.25,
    stock: 100,
    barcode: "123456789",
  },
  {
    id: 2,
    name: "Produto 2",
    category: "Categoria B",
    price: 20.00,
    cost: 10.00,
    stock: 50,
    barcode: "987654321",
  },
];

const defaultProps = {
  products: mockProducts,
  onProductAdded: vi.fn(),
};

describe("ProductManagement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render product management interface", () => {
    render(<ProductManagement {...defaultProps} />, { wrapper: createWrapper() });
    
    expect(screen.getByText("Gestão de Produtos")).toBeInTheDocument();
    expect(screen.getByText("Novo Produto")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Buscar produtos...")).toBeInTheDocument();
  });

  it("should display all products", () => {
    render(<ProductManagement {...defaultProps} />, { wrapper: createWrapper() });
    
    expect(screen.getByText("Produto 1")).toBeInTheDocument();
    expect(screen.getByText("Produto 2")).toBeInTheDocument();
    expect(screen.getByText("R$ 10,50")).toBeInTheDocument();
    expect(screen.getByText("R$ 20,00")).toBeInTheDocument();
  });

  it("should filter products by search term", async () => {
    render(<ProductManagement {...defaultProps} />, { wrapper: createWrapper() });
    
    const searchInput = screen.getByPlaceholderText("Buscar produtos...");
    fireEvent.change(searchInput, { target: { value: "Produto 1" } });
    
    await waitFor(() => {
      expect(screen.getByText("Produto 1")).toBeInTheDocument();
      expect(screen.queryByText("Produto 2")).not.toBeInTheDocument();
    });
  });

  it("should filter products by category", async () => {
    render(<ProductManagement {...defaultProps} />, { wrapper: createWrapper() });
    
    const categorySelect = screen.getByDisplayValue("Todas as categorias");
    fireEvent.click(categorySelect);
    
    await waitFor(() => {
      const categoryOption = screen.getByText("Categoria A");
      fireEvent.click(categoryOption);
    });
    
    await waitFor(() => {
      expect(screen.getByText("Produto 1")).toBeInTheDocument();
      expect(screen.queryByText("Produto 2")).not.toBeInTheDocument();
    });
  });

  it("should open new product dialog", async () => {
    render(<ProductManagement {...defaultProps} />, { wrapper: createWrapper() });
    
    const newProductButton = screen.getByText("Novo Produto");
    fireEvent.click(newProductButton);
    
    await waitFor(() => {
      expect(screen.getByText("Adicionar Novo Produto")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Nome do produto")).toBeInTheDocument();
    });
  });

  it("should validate required fields in new product form", async () => {
    render(<ProductManagement {...defaultProps} />, { wrapper: createWrapper() });
    
    const newProductButton = screen.getByText("Novo Produto");
    fireEvent.click(newProductButton);
    
    await waitFor(() => {
      const saveButton = screen.getByText("Adicionar Produto");
      fireEvent.click(saveButton);
    });
    
    // Form should not submit without required fields
    expect(defaultProps.onProductAdded).not.toHaveBeenCalled();
  });

  it("should add new product successfully", async () => {
    render(<ProductManagement {...defaultProps} />, { wrapper: createWrapper() });
    
    const newProductButton = screen.getByText("Novo Produto");
    fireEvent.click(newProductButton);
    
    await waitFor(() => {
      // Fill form
      fireEvent.change(screen.getByPlaceholderText("Nome do produto"), {
        target: { value: "Novo Produto" }
      });
      fireEvent.change(screen.getByPlaceholderText("Categoria"), {
        target: { value: "Nova Categoria" }
      });
      fireEvent.change(screen.getByPlaceholderText("0.00"), {
        target: { value: "15.99" }
      });
      fireEvent.change(screen.getByPlaceholderText("Custo"), {
        target: { value: "8.50" }
      });
      fireEvent.change(screen.getByPlaceholderText("Quantidade"), {
        target: { value: "25" }
      });
      
      // Submit form
      const saveButton = screen.getByText("Adicionar Produto");
      fireEvent.click(saveButton);
    });
    
    await waitFor(() => {
      expect(defaultProps.onProductAdded).toHaveBeenCalledWith({
        name: "Novo Produto",
        category: "Nova Categoria",
        price: 15.99,
        cost: 8.50,
        stock: 25,
        barcode: "",
      });
    });
  });

  it("should show product statistics", () => {
    render(<ProductManagement {...defaultProps} />, { wrapper: createWrapper() });
    
    expect(screen.getByText("Total de Produtos")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument(); // Total count
    expect(screen.getByText("Categorias")).toBeInTheDocument();
    expect(screen.getByText("Valor Total")).toBeInTheDocument();
  });

  it("should show low stock warning", () => {
    const lowStockProducts: Product[] = [
      {
        id: 1,
        name: "Produto Baixo Estoque",
        category: "Categoria A",
        price: 10.50,
        cost: 5.25,
        stock: 5, // Low stock
        barcode: "123456789",
      },
    ];

    render(<ProductManagement {...{ ...defaultProps, products: lowStockProducts }} />, { wrapper: createWrapper() });
    
    // Should show low stock indicator
    expect(screen.getByText("5 un.")).toBeInTheDocument();
  });

  it("should edit product", async () => {
    render(<ProductManagement {...defaultProps} />, { wrapper: createWrapper() });
    
    // Find edit button for first product
    const editButtons = screen.getAllByLabelText("Editar produto");
    fireEvent.click(editButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue("Produto 1")).toBeInTheDocument();
      expect(screen.getByText("Editar Produto")).toBeInTheDocument();
    });
  });

  it("should delete product with confirmation", async () => {
    // Mock window.confirm
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    
    render(<ProductManagement {...defaultProps} />, { wrapper: createWrapper() });
    
    const deleteButtons = screen.getAllByLabelText("Excluir produto");
    fireEvent.click(deleteButtons[0]);
    
    expect(confirmSpy).toHaveBeenCalledWith(
      "Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita."
    );
    
    confirmSpy.mockRestore();
  });

  it("should export products data", async () => {
    render(<ProductManagement {...defaultProps} />, { wrapper: createWrapper() });
    
    const exportButton = screen.getByText("Exportar");
    expect(exportButton).toBeInTheDocument();
    
    fireEvent.click(exportButton);
    
    // Should trigger download (hard to test actual file download in jsdom)
  });

  it("should import products data", async () => {
    render(<ProductManagement {...defaultProps} />, { wrapper: createWrapper() });
    
    const importButton = screen.getByText("Importar");
    expect(importButton).toBeInTheDocument();
    
    fireEvent.click(importButton);
    
    await waitFor(() => {
      expect(screen.getByText("Importar Produtos")).toBeInTheDocument();
    });
  });

  it("should show barcode input in form", async () => {
    render(<ProductManagement {...defaultProps} />, { wrapper: createWrapper() });
    
    const newProductButton = screen.getByText("Novo Produto");
    fireEvent.click(newProductButton);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText("Código de barras (opcional)")).toBeInTheDocument();
    });
  });
});