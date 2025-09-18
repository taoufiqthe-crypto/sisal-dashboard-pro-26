-- Criar tabela para compras de fornecedores
CREATE TABLE public.supplier_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  supplier_id UUID NOT NULL,
  purchase_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'partial', 'overdue'
  due_date DATE,
  paid_amount NUMERIC DEFAULT 0,
  description TEXT,
  invoice_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para itens das compras
CREATE TABLE public.supplier_purchase_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_id UUID NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  total_price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.supplier_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_purchase_items ENABLE ROW LEVEL SECURITY;

-- Policies para supplier_purchases
CREATE POLICY "Users can manage their supplier purchases" 
ON public.supplier_purchases 
FOR ALL 
USING (auth.uid() = user_id);

-- Policies para supplier_purchase_items
CREATE POLICY "Users can view purchase items through purchases" 
ON public.supplier_purchase_items 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM supplier_purchases 
  WHERE supplier_purchases.id = supplier_purchase_items.purchase_id 
  AND supplier_purchases.user_id = auth.uid()
));

-- Trigger para updated_at
CREATE TRIGGER update_supplier_purchases_updated_at
BEFORE UPDATE ON public.supplier_purchases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Adicionar foreign key constraints
ALTER TABLE public.supplier_purchases 
ADD CONSTRAINT supplier_purchases_supplier_id_fkey 
FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE CASCADE;

ALTER TABLE public.supplier_purchase_items 
ADD CONSTRAINT supplier_purchase_items_purchase_id_fkey 
FOREIGN KEY (purchase_id) REFERENCES public.supplier_purchases(id) ON DELETE CASCADE;