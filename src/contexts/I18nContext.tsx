import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

type Language = 'pt' | 'en' | 'es';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
  formatCurrency: (value: number) => string;
  formatDate: (date: Date) => string;
}

const translations = {
  pt: {
    // PDV
    'pdv.title': 'Sistema PDV',
    'pdv.sales': 'Vendas',
    'pdv.products': 'Produtos',
    'pdv.customers': 'Clientes',
    'pdv.reports': 'Relatórios',
    'pdv.settings': 'Configurações',
    'pdv.logout': 'Sair',
    'pdv.search': 'Buscar produtos...',
    'pdv.cart': 'Carrinho',
    'pdv.total': 'Total',
    'pdv.finalizeSale': 'Finalizar Venda',
    'pdv.cash': 'Dinheiro',
    'pdv.card': 'Cartão',
    'pdv.pix': 'PIX',
    'pdv.change': 'Troco',
    'pdv.quantity': 'Quantidade',
    'pdv.price': 'Preço',
    'pdv.discount': 'Desconto',
    'pdv.addProduct': 'Adicionar Produto',
    'pdv.removeProduct': 'Remover Produto',
    'pdv.saleCompleted': 'Venda finalizada com sucesso!',
    'pdv.invalidQuantity': 'Quantidade inválida',
    'pdv.insufficientStock': 'Estoque insuficiente',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.todaySales': 'Vendas Hoje',
    'dashboard.monthSales': 'Vendas do Mês',
    'dashboard.yearSales': 'Vendas do Ano',
    'dashboard.lowStock': 'Estoque Baixo',
    'dashboard.topProducts': 'Produtos Mais Vendidos',
    'dashboard.salesChart': 'Gráfico de Vendas',
    'dashboard.revenue': 'Receita',
    'dashboard.profit': 'Lucro',
    'dashboard.customers': 'Clientes',
    'dashboard.orders': 'Pedidos',
    
    // Auth
    'auth.login': 'Entrar',
    'auth.logout': 'Sair',
    'auth.register': 'Cadastrar',
    'auth.email': 'E-mail',
    'auth.password': 'Senha',
    'auth.name': 'Nome',
    'auth.forgotPassword': 'Esqueci minha senha',
    'auth.loginSuccess': 'Login realizado com sucesso!',
    'auth.logoutSuccess': 'Logout realizado com sucesso!',
    'auth.registerSuccess': 'Cadastro realizado com sucesso!',
    'auth.invalidCredentials': 'Credenciais inválidas',
    
    // Products
    'products.title': 'Produtos',
    'products.add': 'Adicionar Produto',
    'products.edit': 'Editar Produto',
    'products.delete': 'Excluir Produto',
    'products.name': 'Nome',
    'products.description': 'Descrição',
    'products.price': 'Preço',
    'products.stock': 'Estoque',
    'products.category': 'Categoria',
    'products.barcode': 'Código de Barras',
    'products.image': 'Imagem',
    'products.created': 'Produto criado com sucesso!',
    'products.updated': 'Produto atualizado com sucesso!',
    'products.deleted': 'Produto excluído com sucesso!',
    
    // Reports
    'reports.title': 'Relatórios',
    'reports.salesReport': 'Relatório de Vendas',
    'reports.productsReport': 'Relatório de Produtos',
    'reports.customersReport': 'Relatório de Clientes',
    'reports.export': 'Exportar',
    'reports.period': 'Período',
    'reports.from': 'De',
    'reports.to': 'Até',
    'reports.generate': 'Gerar Relatório',
    
    // Common
    'common.save': 'Salvar',
    'common.cancel': 'Cancelar',
    'common.edit': 'Editar',
    'common.delete': 'Excluir',
    'common.confirm': 'Confirmar',
    'common.loading': 'Carregando...',
    'common.error': 'Erro',
    'common.success': 'Sucesso',
    'common.warning': 'Aviso',
    'common.info': 'Informação',
    'common.search': 'Buscar',
    'common.filter': 'Filtrar',
    'common.clear': 'Limpar',
    'common.refresh': 'Atualizar',
    'common.back': 'Voltar',
    'common.next': 'Próximo',
    'common.previous': 'Anterior',
    'common.close': 'Fechar',
    'common.open': 'Abrir',
  },
  en: {
    // PDV
    'pdv.title': 'POS System',
    'pdv.sales': 'Sales',
    'pdv.products': 'Products',
    'pdv.customers': 'Customers',
    'pdv.reports': 'Reports',
    'pdv.settings': 'Settings',
    'pdv.logout': 'Logout',
    'pdv.search': 'Search products...',
    'pdv.cart': 'Cart',
    'pdv.total': 'Total',
    'pdv.finalizeSale': 'Complete Sale',
    'pdv.cash': 'Cash',
    'pdv.card': 'Card',
    'pdv.pix': 'PIX',
    'pdv.change': 'Change',
    'pdv.quantity': 'Quantity',
    'pdv.price': 'Price',
    'pdv.discount': 'Discount',
    'pdv.addProduct': 'Add Product',
    'pdv.removeProduct': 'Remove Product',
    'pdv.saleCompleted': 'Sale completed successfully!',
    'pdv.invalidQuantity': 'Invalid quantity',
    'pdv.insufficientStock': 'Insufficient stock',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.todaySales': 'Today Sales',
    'dashboard.monthSales': 'Month Sales',
    'dashboard.yearSales': 'Year Sales',
    'dashboard.lowStock': 'Low Stock',
    'dashboard.topProducts': 'Top Products',
    'dashboard.salesChart': 'Sales Chart',
    'dashboard.revenue': 'Revenue',
    'dashboard.profit': 'Profit',
    'dashboard.customers': 'Customers',
    'dashboard.orders': 'Orders',
    
    // Auth
    'auth.login': 'Login',
    'auth.logout': 'Logout',
    'auth.register': 'Register',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.name': 'Name',
    'auth.forgotPassword': 'Forgot Password',
    'auth.loginSuccess': 'Login successful!',
    'auth.logoutSuccess': 'Logout successful!',
    'auth.registerSuccess': 'Registration successful!',
    'auth.invalidCredentials': 'Invalid credentials',
    
    // Products
    'products.title': 'Products',
    'products.add': 'Add Product',
    'products.edit': 'Edit Product',
    'products.delete': 'Delete Product',
    'products.name': 'Name',
    'products.description': 'Description',
    'products.price': 'Price',
    'products.stock': 'Stock',
    'products.category': 'Category',
    'products.barcode': 'Barcode',
    'products.image': 'Image',
    'products.created': 'Product created successfully!',
    'products.updated': 'Product updated successfully!',
    'products.deleted': 'Product deleted successfully!',
    
    // Reports
    'reports.title': 'Reports',
    'reports.salesReport': 'Sales Report',
    'reports.productsReport': 'Products Report',
    'reports.customersReport': 'Customers Report',
    'reports.export': 'Export',
    'reports.period': 'Period',
    'reports.from': 'From',
    'reports.to': 'To',
    'reports.generate': 'Generate Report',
    
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.confirm': 'Confirm',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.warning': 'Warning',
    'common.info': 'Information',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.clear': 'Clear',
    'common.refresh': 'Refresh',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.close': 'Close',
    'common.open': 'Open',
  },
  es: {
    // PDV
    'pdv.title': 'Sistema POS',
    'pdv.sales': 'Ventas',
    'pdv.products': 'Productos',
    'pdv.customers': 'Clientes',
    'pdv.reports': 'Informes',
    'pdv.settings': 'Configuración',
    'pdv.logout': 'Salir',
    'pdv.search': 'Buscar productos...',
    'pdv.cart': 'Carrito',
    'pdv.total': 'Total',
    'pdv.finalizeSale': 'Finalizar Venta',
    'pdv.cash': 'Efectivo',
    'pdv.card': 'Tarjeta',
    'pdv.pix': 'PIX',
    'pdv.change': 'Cambio',
    'pdv.quantity': 'Cantidad',
    'pdv.price': 'Precio',
    'pdv.discount': 'Descuento',
    'pdv.addProduct': 'Agregar Producto',
    'pdv.removeProduct': 'Quitar Producto',
    'pdv.saleCompleted': '¡Venta finalizada con éxito!',
    'pdv.invalidQuantity': 'Cantidad inválida',
    'pdv.insufficientStock': 'Stock insuficiente',
    
    // Dashboard
    'dashboard.title': 'Panel',
    'dashboard.todaySales': 'Ventas Hoy',
    'dashboard.monthSales': 'Ventas del Mes',
    'dashboard.yearSales': 'Ventas del Año',
    'dashboard.lowStock': 'Stock Bajo',
    'dashboard.topProducts': 'Productos Más Vendidos',
    'dashboard.salesChart': 'Gráfico de Ventas',
    'dashboard.revenue': 'Ingresos',
    'dashboard.profit': 'Ganancia',
    'dashboard.customers': 'Clientes',
    'dashboard.orders': 'Pedidos',
    
    // Auth
    'auth.login': 'Ingresar',
    'auth.logout': 'Salir',
    'auth.register': 'Registrarse',
    'auth.email': 'Email',
    'auth.password': 'Contraseña',
    'auth.name': 'Nombre',
    'auth.forgotPassword': 'Olvidé mi contraseña',
    'auth.loginSuccess': '¡Inicio de sesión exitoso!',
    'auth.logoutSuccess': '¡Cierre de sesión exitoso!',
    'auth.registerSuccess': '¡Registro exitoso!',
    'auth.invalidCredentials': 'Credenciales inválidas',
    
    // Products
    'products.title': 'Productos',
    'products.add': 'Agregar Producto',
    'products.edit': 'Editar Producto',
    'products.delete': 'Eliminar Producto',
    'products.name': 'Nombre',
    'products.description': 'Descripción',
    'products.price': 'Precio',
    'products.stock': 'Stock',
    'products.category': 'Categoría',
    'products.barcode': 'Código de Barras',
    'products.image': 'Imagen',
    'products.created': '¡Producto creado con éxito!',
    'products.updated': '¡Producto actualizado con éxito!',
    'products.deleted': '¡Producto eliminado con éxito!',
    
    // Reports
    'reports.title': 'Informes',
    'reports.salesReport': 'Informe de Ventas',
    'reports.productsReport': 'Informe de Productos',
    'reports.customersReport': 'Informe de Clientes',
    'reports.export': 'Exportar',
    'reports.period': 'Período',
    'reports.from': 'Desde',
    'reports.to': 'Hasta',
    'reports.generate': 'Generar Informe',
    
    // Common
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.edit': 'Editar',
    'common.delete': 'Eliminar',
    'common.confirm': 'Confirmar',
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.warning': 'Advertencia',
    'common.info': 'Información',
    'common.search': 'Buscar',
    'common.filter': 'Filtrar',
    'common.clear': 'Limpiar',
    'common.refresh': 'Actualizar',
    'common.back': 'Atrás',
    'common.next': 'Siguiente',
    'common.previous': 'Anterior',
    'common.close': 'Cerrar',
    'common.open': 'Abrir',
  },
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('preferred-language');
    return (saved as Language) || 'pt';
  });

  useEffect(() => {
    localStorage.setItem('preferred-language', language);
    document.documentElement.lang = language;
    
    toast({
      title: language === 'pt' ? 'Idioma alterado' : language === 'en' ? 'Language changed' : 'Idioma cambiado',
      description: language === 'pt' ? `Idioma alterado para Português` : 
                   language === 'en' ? `Language changed to English` : 
                   `Idioma cambiado a Español`,
    });
  }, [language]);

  const t = (key: string, params?: Record<string, string>) => {
    let translation = translations[language][key as keyof typeof translations[typeof language]] || key;
    
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(`{{${param}}}`, value);
      });
    }
    
    return translation;
  };

  const formatCurrency = (value: number) => {
    const options: Intl.NumberFormatOptions = {
      style: 'currency',
      minimumFractionDigits: 2,
    };

    switch (language) {
      case 'pt':
        return new Intl.NumberFormat('pt-BR', { ...options, currency: 'BRL' }).format(value);
      case 'en':
        return new Intl.NumberFormat('en-US', { ...options, currency: 'USD' }).format(value);
      case 'es':
        return new Intl.NumberFormat('es-ES', { ...options, currency: 'EUR' }).format(value);
      default:
        return new Intl.NumberFormat('pt-BR', { ...options, currency: 'BRL' }).format(value);
    }
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };

    switch (language) {
      case 'pt':
        return new Intl.DateTimeFormat('pt-BR', options).format(date);
      case 'en':
        return new Intl.DateTimeFormat('en-US', options).format(date);
      case 'es':
        return new Intl.DateTimeFormat('es-ES', options).format(date);
      default:
        return new Intl.DateTimeFormat('pt-BR', options).format(date);
    }
  };

  const value = {
    language,
    setLanguage,
    t,
    formatCurrency,
    formatDate,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};