-- Criar tabelas para compras de fornecedores
CREATE TABLE public.supplier_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  purchase_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'partial', 'overdue', 'cancelled')),
  due_date DATE,
  paid_amount NUMERIC NOT NULL DEFAULT 0,
  description TEXT,
  invoice_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.supplier_purchases ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para supplier_purchases
CREATE POLICY "Users can manage their own supplier_purchases" 
ON public.supplier_purchases 
FOR ALL 
USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_supplier_purchases_updated_at
BEFORE UPDATE ON public.supplier_purchases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Criar tabela para itens das compras
CREATE TABLE public.supplier_purchase_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_id UUID NOT NULL REFERENCES public.supplier_purchases(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  total_price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.supplier_purchase_items ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para supplier_purchase_items
CREATE POLICY "Users can manage their own supplier_purchase_items" 
ON public.supplier_purchase_items 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.supplier_purchases 
  WHERE supplier_purchases.id = supplier_purchase_items.purchase_id 
  AND supplier_purchases.user_id = auth.uid()
));

-- Criar tabela para despesas
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  category TEXT,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT,
  supplier_id UUID REFERENCES public.suppliers(id),
  status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'pending', 'cancelled')),
  receipt_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para expenses
CREATE POLICY "Users can manage their own expenses" 
ON public.expenses 
FOR ALL 
USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_expenses_updated_at
BEFORE UPDATE ON public.expenses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Criar tabela para manufatura/produção
CREATE TABLE public.manufacturing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID REFERENCES public.products(id),
  piece_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  material_cost NUMERIC NOT NULL DEFAULT 0,
  labor_cost NUMERIC NOT NULL DEFAULT 0,
  other_costs NUMERIC NOT NULL DEFAULT 0,
  total_cost NUMERIC GENERATED ALWAYS AS (material_cost + labor_cost + other_costs) STORED,
  production_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completion_date DATE,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  notes TEXT,
  transferred_to_stock BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.manufacturing ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para manufacturing
CREATE POLICY "Users can manage their own manufacturing" 
ON public.manufacturing 
FOR ALL 
USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_manufacturing_updated_at
BEFORE UPDATE ON public.manufacturing
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Criar tabela para perfis de usuário
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  company_name TEXT,
  cnpj TEXT,
  phone TEXT,
  address TEXT,
  logo_url TEXT,
  theme_preference TEXT DEFAULT 'system' CHECK (theme_preference IN ('light', 'dark', 'system')),
  language TEXT DEFAULT 'pt-BR',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Função para criar perfil automaticamente quando usuário se cadastra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Adicionar índices para performance
CREATE INDEX idx_supplier_purchases_user_id ON public.supplier_purchases(user_id);
CREATE INDEX idx_supplier_purchases_supplier_id ON public.supplier_purchases(supplier_id);
CREATE INDEX idx_supplier_purchases_date ON public.supplier_purchases(purchase_date);
CREATE INDEX idx_supplier_purchase_items_purchase_id ON public.supplier_purchase_items(purchase_id);
CREATE INDEX idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX idx_expenses_date ON public.expenses(expense_date);
CREATE INDEX idx_manufacturing_user_id ON public.manufacturing(user_id);
CREATE INDEX idx_manufacturing_product_id ON public.manufacturing(product_id);
CREATE INDEX idx_manufacturing_date ON public.manufacturing(production_date);