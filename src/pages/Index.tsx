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
import { ManufacturingTabs } from "@/components/Manufacturing/ManufacturingTabs";
import { Terminal } from "@/components/terminal/Terminal";
import { BudgetManagement } from "@/components/budget/BudgetManagement";
import { CustomerManagement } from "@/components/customers/CustomerManagement";
import { SupplierManagement } from "@/components/suppliers/SupplierManagement";
import { BackupRestore } from "@/components/backup/BackupRestore";
import { FinancialManagement } from "@/components/financial/FinancialManagement";
import { AdvancedStockManagement } from "@/components/advanced-stock/AdvancedStockManagement";
import { ExpensesManagement } from "@/components/expenses/ExpensesManagement";
import { OfflineIndicator } from "@/components/system/OfflineIndicator";
import { PerformanceMonitor } from "@/components/system/PerformanceMonitor";
import { AdvancedReports } from "@/components/reports/AdvancedReports";
import { OperatorLogin } from "@/components/auth/OperatorLogin";
import { RealTimeMetrics } from "@/components/dashboard/RealTimeMetrics";
import { SequentialNumbers } from "@/components/sales/SequentialNumbers";

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

// Initialize data outside of useState to avoid hook violations
const getInitialSales = (): any[] => {
  try {
    const storedSales = localStorage.getItem("sales");
    return storedSales ? JSON.parse(storedSales) : [];
  } catch (error) {
    console.error("Failed to load sales from localStorage", error);
    return [];
  }
};

const getInitialProductions = (): any[] => {
  try {
    const storedProductions = localStorage.getItem("productions");
    return storedProductions ? JSON.parse(storedProductions) : [];
  } catch (error) {
    console.error("Failed to load productions from localStorage", error);
    return [];
  }
};

const Index = () => {
  // All hooks must be called before any conditional returns
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [products, setProducts] = useState<Product[]>(loadProductsFromLocalStorage);
  const [customers, setCustomers] = useState<Customer[]>(loadCustomersFromLocalStorage);
  const [sales, setSales] = useState<any[]>(getInitialSales);
  const [productions, setProductions] = useState<any[]>(getInitialProductions);
  const [currentOperator, setCurrentOperator] = useState<any>(null);

  // Persistência - usando useCallback para evitar loops infinitos
  const saveToLocalStorage = useCallback((key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Failed to save ${key} to localStorage`, error);
    }
  }, []);

  // Handlers
  const handleProductAdded = useCallback((newProduct: Product) => {
    const newId =
      products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;
    const productWithId = { ...newProduct, id: newId };
    setProducts((prevProducts) => [...prevProducts, productWithId]);
  }, [products]);

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

  // Função para lidar com ações rápidas do dashboard
  const handleQuickAction = useCallback((action: string) => {
    switch (action) {
      case 'new-sale':
        setActiveTab('sales');
        break;
      case 'add-product':
        setActiveTab('products');
        break;
      case 'add-customer':
        setActiveTab('customers');
        break;
      case 'new-budget':
        setActiveTab('budget');
        break;
      case 'view-reports':
        setActiveTab('reports');
        break;
      case 'stock-entry':
        setActiveTab('stock');
        break;
      default:
        console.log('Ação não reconhecida:', action);
    }
  }, []);

  // Função para limpar todos os dados do sistema
  const clearAllData = useCallback(() => {
    if (window.confirm("⚠️ ATENÇÃO! Esta ação irá apagar TODOS os dados do sistema (produtos, vendas, clientes, estoque, produção). Esta ação NÃO pode ser desfeita. Tem certeza?")) {
      localStorage.clear();
      setProducts([]);
      setCustomers([]);
      setSales([]);
      setProductions([]);
      alert("✅ Todos os dados foram limpos! Sistema pronto para seus dados reais.");
    }
  }, []);

  // Effects for persistence
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

  // Loading and auth checks after all hooks
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

  // Renderização
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <Dashboard products={products} sales={sales} onClearAllData={clearAllData} onAction={handleQuickAction} />
            <RealTimeMetrics />
            <SequentialNumbers />
          </div>
        );
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
            currentOperator={currentOperator}
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
        return <AdvancedReports />;
      case "manufacturing":
        return (
          <ManufacturingTabs 
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
        return (
          <div className="space-y-6">
            <OperatorLogin
              onOperatorLogin={setCurrentOperator}
              currentOperator={currentOperator}
            />
            <Settings onProductAdded={handleProductAdded} onClearAllData={clearAllData} />
          </div>
        );
      default:
        return <Dashboard products={products} sales={sales} onClearAllData={clearAllData} onAction={handleQuickAction} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <OfflineIndicator />
      <PerformanceMonitor />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 ml-64 transition-all duration-300">
        <div className="container mx-auto px-4 py-6">{renderContent()}</div>
      </main>
    </div>
  );
};

export default Index;
