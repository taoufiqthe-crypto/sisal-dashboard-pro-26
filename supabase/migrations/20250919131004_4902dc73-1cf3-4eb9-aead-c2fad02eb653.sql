-- Corrigir problemas de segurança identificados pelo linter

-- 1. Corrigir todas as funções para definir search_path adequadamente
-- Isso previne ataques de search path hijacking

-- Recriar a função handle_new_user com search_path correto
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
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

-- Recriar a função update_updated_at_column com search_path correto
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Verificar se o trigger on_auth_user_created existe, se não, criá-lo
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_new_user();
    END IF;
END $$;

-- Adicionar comentários de segurança
COMMENT ON FUNCTION public.handle_new_user() IS 'Cria perfil automaticamente quando usuário se registra - SECURITY DEFINER com search_path fixo';
COMMENT ON FUNCTION public.update_updated_at_column() IS 'Atualiza timestamp updated_at - SECURITY DEFINER com search_path fixo';

-- Verificar se todas as políticas RLS estão funcionando corretamente
-- Adicionar política adicional para profiles se necessário
DO $$
BEGIN
    -- Verificar se política para deletar perfil existe
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own profile' AND tablename = 'profiles') THEN
        CREATE POLICY "Users can delete their own profile" 
        ON public.profiles 
        FOR DELETE 
        USING (auth.uid() = id);
    END IF;
END $$;