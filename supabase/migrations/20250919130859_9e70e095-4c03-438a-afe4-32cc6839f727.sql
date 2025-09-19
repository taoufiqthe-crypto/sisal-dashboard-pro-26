-- Melhorias na estrutura do banco de dados

-- 1. Primeiro verificar se a função de update timestamp já existe
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Adicionar colunas que estão faltando nas tabelas existentes se não existirem
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS company_name text,
ADD COLUMN IF NOT EXISTS cnpj text,
ADD COLUMN IF NOT EXISTS logo_url text,
ADD COLUMN IF NOT EXISTS address text;

-- 3. Criar tabela de orçamentos (budgets) se não existir
CREATE TABLE IF NOT EXISTS public.budgets (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    customer_id uuid REFERENCES public.customers(id),
    title text NOT NULL,
    description text,
    items jsonb NOT NULL DEFAULT '[]'::jsonb,
    subtotal numeric NOT NULL DEFAULT 0,
    discount numeric DEFAULT 0,
    total numeric NOT NULL DEFAULT 0,
    status text NOT NULL DEFAULT 'draft',
    valid_until date,
    notes text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela budgets
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- Policies para budgets
CREATE POLICY "Users can manage their own budgets" 
ON public.budgets 
FOR ALL 
USING (auth.uid() = user_id);

-- 4. Adicionar trigger para budgets
DROP TRIGGER IF EXISTS update_budgets_updated_at ON public.budgets;
CREATE TRIGGER update_budgets_updated_at
    BEFORE UPDATE ON public.budgets
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Adicionar triggers para tabelas existentes se não existirem
DO $$ 
BEGIN
    -- Products
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_products_updated_at') THEN
        CREATE TRIGGER update_products_updated_at
            BEFORE UPDATE ON public.products
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    
    -- Customers
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_customers_updated_at') THEN
        CREATE TRIGGER update_customers_updated_at
            BEFORE UPDATE ON public.customers
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    
    -- Suppliers
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_suppliers_updated_at') THEN
        CREATE TRIGGER update_suppliers_updated_at
            BEFORE UPDATE ON public.suppliers
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    
    -- Accounts
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_accounts_updated_at') THEN
        CREATE TRIGGER update_accounts_updated_at
            BEFORE UPDATE ON public.accounts
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    
    -- Sales
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_sales_updated_at') THEN
        CREATE TRIGGER update_sales_updated_at
            BEFORE UPDATE ON public.sales
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    
    -- Expenses
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_expenses_updated_at') THEN
        CREATE TRIGGER update_expenses_updated_at
            BEFORE UPDATE ON public.expenses
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    
    -- Manufacturing
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_manufacturing_updated_at') THEN
        CREATE TRIGGER update_manufacturing_updated_at
            BEFORE UPDATE ON public.manufacturing
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

-- 6. Melhorar a função handle_new_user para incluir mais dados
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    display_name,
    company_name,
    phone,
    address
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.raw_user_meta_data ->> 'display_name', NEW.email),
    NEW.raw_user_meta_data ->> 'company_name',
    NEW.raw_user_meta_data ->> 'phone',
    NEW.raw_user_meta_data ->> 'address'
  );
  RETURN NEW;
END;
$$;

-- 7. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_products_user_id ON public.products(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_user_id ON public.suppliers(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON public.sales(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON public.sales(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_manufacturing_user_id ON public.manufacturing(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON public.accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_cash_flow_user_id ON public.cash_flow(user_id);

-- 8. Adicionar comentários para documentação
COMMENT ON TABLE public.budgets IS 'Tabela para armazenar orçamentos/propostas';
COMMENT ON COLUMN public.budgets.items IS 'JSON com os itens do orçamento';
COMMENT ON COLUMN public.budgets.status IS 'Status: draft, sent, approved, rejected, expired';

-- 9. Verificar se todas as tabelas têm as políticas RLS corretas
-- Já estão configuradas baseado no schema fornecido

-- 10. Adicionar alguns dados de exemplo para testes (opcional, apenas se não houver dados)
-- Isso será feito via aplicação, não no banco