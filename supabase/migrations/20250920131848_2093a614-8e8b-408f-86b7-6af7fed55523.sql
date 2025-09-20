-- Create RPC functions for stock management
CREATE OR REPLACE FUNCTION public.update_product_stock(
  product_id text,
  quantity_sold integer,
  user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE products 
  SET stock = GREATEST(0, stock - quantity_sold)
  WHERE id = product_id::uuid AND products.user_id = update_product_stock.user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.restore_product_stock(
  product_id text,
  quantity_restored integer,
  user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE products 
  SET stock = stock + quantity_restored
  WHERE id = product_id::uuid AND products.user_id = restore_product_stock.user_id;
END;
$$;