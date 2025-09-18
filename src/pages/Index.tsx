import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Navigation } from "@/components/navigation/Navigation";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { ProductManagement } from "@/components/products/ProductManagement";
import { SalesManagement } from "@/components/sales";
import { StockManagement } from "@/components/stock/StockManagement";
import { Reports } from "@/components/reports/Reports";
import { WithdrawalsManagement } from "@/components/withdrawals/WithdrawalsManagement";
import { Settings } from "@/components/Settings/Settings";
import { Manufacturing } from "@/components/Manufacturing/Manufacturing";
import { Terminal } from "@/components/terminal/Terminal";
import { BudgetManagement } from "@/components/budget/BudgetManagement";
import { CustomerManagement } from "@/components/customers/CustomerManagement";
import { SupplierManagement } from "@/components/suppliers/SupplierManagement";
import { BackupRestore } from "@/components/backup/BackupRestore";
import { FinancialManagement } from "@/components/financial/FinancialManagement";
import { AdvancedStockManagement } from "@/components/advanced-stock/AdvancedStockManagement";
import { ExpensesManagement } from "@/components/expenses/ExpensesManagement";

// ✅ importamos os mocks e tipos
import { mockProducts, Product, mockCustomers, Customer } from "@/components/sales";

// -------------------------------
// Funções utilitárias
// -------------------------------
const loadProductsFromLocalStorage = (): Product[] => {
  try {
    const storedProducts = localStorage.getItem("products");
    return storedProducts ? JSON.parse(storedProducts) : mockProducts;
  } catch (error) {
    console.error("Failed to load products from localStorage", error);
    return mockProducts;
  }
};

const loadCustomersFromLocalStorage = (): Customer[] => {
  try {
    const storedCustomers = localStorage.getItem("customers");
    return storedCustomers ? JSON.parse(storedCustomers) : mockCustomers;
  } catch (error) {
    console.error("Failed to load customers from localStorage", error);
    return mockCustomers;
  }
};

const Index = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Produtos
  const [products, setProducts] = useState<Product[]>(loadProductsFromLocalStorage);

  // Clientes
  const [customers, setCustomers] = useState<Customer[]>(loadCustomersFromLocalStorage);

  // Dados globais do sistema - MOVIDO PARA ANTES DOS RETURNS CONDICIONAIS
  const [sales, setSales] = useState<any[]>(() => {
    try {
      const storedSales = localStorage.getItem("sales");
      return storedSales ? JSON.parse(storedSales) : [];
    } catch (error) {
      console.error("Failed to load sales from localStorage", error);
      return [];
    }
  });

  const [productions, setProductions] = useState<any[]>(() => {
    try {
      const storedProductions = localStorage.getItem("productions");
      return storedProductions ? JSON.parse(storedProductions) : [];
    } catch (error) {
      console.error("Failed to load productions from localStorage", error);
      return [];
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Persistência - usando useCallback para evitar loops infinitos
  const saveToLocalStorage = useCallback((key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Failed to save ${key} to localStorage`, error);
    }
  }, []);

  useEffect(() => {
    saveToLocalStorage("products", products);
  }, [products, saveToLocalStorage]);

  useEffect(() => {
    saveToLocalStorage("customers", customers);
  }, [customers, saveToLocalStorage]);

  useEffect(() => {
    saveToLocalStorage("sales", sales);
  }, [sales, saveToLocalStorage]);

  useEffect(() => {
    saveToLocalStorage("productions", productions);
  }, [productions, saveToLocalStorage]);

  // Handlers
  const handleProductAdded = (newProduct: Product) => {
    const newId =
      products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;
    const productWithId = { ...newProduct, id: newId };
    setProducts((prevProducts) => [...prevProducts, productWithId]);
  };

  // Função para limpar todos os dados do sistema
  const clearAllData = () => {
    if (window.confirm("⚠️ ATENÇÃO! Esta ação irá apagar TODOS os dados do sistema (produtos, vendas, clientes, estoque, produção). Esta ação NÃO pode ser desfeita. Tem certeza?")) {
      localStorage.clear();
      setProducts([]);
      setCustomers([]);
      setSales([]);
      setProductions([]);
      alert("✅ Todos os dados foram limpos! Sistema pronto para seus dados reais.");
    }
  };

  const handleSaleCreated = useCallback((newSale: any) => {
    console.log("Venda criada:", newSale);
    
    // Adicionar a venda às vendas
    setSales(prevSales => [newSale, ...prevSales]);
    
    // Atualizar estoque automaticamente baseado no carrinho ou produtos da venda
    const productsToUpdate = newSale.cart || newSale.products || [];
    
    if (productsToUpdate && Array.isArray(productsToUpdate)) {
      setProducts(prevProducts => 
        prevProducts.map(product => {
          // Procurar produto tanto por ID quanto por nome
          const saleProduct = productsToUpdate.find((p: any) => 
            p.productId === product.id || 
            p.name === product.name || 
            p.productName === product.name
          );
          
          if (saleProduct) {
            const newStock = Math.max(0, product.stock - saleProduct.quantity);
            console.log(`Atualizando estoque de ${product.name}: ${product.stock} -> ${newStock}`);
            return { ...product, stock: newStock };
          }
          
          return product;
        })
      );
    }
  }, []);

  // Função para transferir produção para estoque
  const handleProductionToStock = useCallback((production: any) => {
    // Procurar produto correspondente por nome
    const productName = (production.pieceName || "").toLowerCase();
    const productFound = products.find(p => 
      p.name.toLowerCase().includes(productName) || 
      productName.includes(p.name.toLowerCase())
    );

    if (productFound) {
      // Atualizar estoque do produto
      setProducts(prevProducts => 
        prevProducts.map(p => 
          p.id === productFound.id 
            ? { ...p, stock: p.stock + (production.quantity || 0) }
            : p
        )
      );
      
      console.log(`Produção transferida para estoque: ${production.quantity} unidades de ${production.pieceName}`);
    }
  }, [products]);

  // Renderização
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard products={products} sales={sales} onClearAllData={clearAllData} />;
      case "products":
        return (
          <ProductManagement
            products={products}
            onProductAdded={handleProductAdded}
          />
        );
      case "sales":
        return (
          <SalesManagement
            products={products}
            setProducts={setProducts}
            customers={customers}
            setCustomers={setCustomers}
            onSaleCreated={handleSaleCreated}
          />
        );
      case "stock":
        return (
          <StockManagement
            products={products}
            setProducts={setProducts}
            sales={sales}
          />
        );
      case "customers":
        return (
          <CustomerManagement
            customers={customers}
            setCustomers={setCustomers}
          />
        );
      case "suppliers":
        return <SupplierManagement />;
      case "expenses":
        return <ExpensesManagement />;
      case "budget":
        return (
          <BudgetManagement
            products={products}
            onSaleCreated={handleSaleCreated}
          />
        );
      case "withdrawals":
        return <WithdrawalsManagement />;
      case "reports":
        return <Reports />;
      case "manufacturing":
        return (
          <Manufacturing 
            onTabChange={setActiveTab}
            onProductionToStock={handleProductionToStock}
            productions={productions}
            setProductions={setProductions}
          />
        );
      case "terminal":
        return <Terminal />;
      case "backup":
        return <BackupRestore />;
      case "financial":
        return <FinancialManagement />;
      case "advanced-stock":
        return <AdvancedStockManagement products={products} setProducts={setProducts} />;
      case "settings":
        return <Settings onProductAdded={handleProductAdded} onClearAllData={clearAllData} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 ml-64 transition-all duration-300">
        <div className="container mx-auto px-4 py-6">{renderContent()}</div>
      </main>
    </div>
  );
};

export default Index;
