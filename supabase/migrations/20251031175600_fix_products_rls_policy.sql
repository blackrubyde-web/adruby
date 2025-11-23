-- Fix RLS Policy for products table to prevent circular dependencies
-- Drop the existing problematic policy
DROP POLICY IF EXISTS "users_and_admins_manage_products" ON public.products;

-- Create new safe RLS policies following best practices
-- Policy 1: Users can manage their own products
CREATE POLICY "users_manage_own_products"
ON public.products
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Policy 2: Admins can manage all products (using auth.users metadata to avoid circular dependency)
CREATE POLICY "admins_manage_all_products" 
ON public.products
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid() 
    AND (au.raw_user_meta_data->>'role' = 'admin' 
         OR au.raw_app_meta_data->>'role' = 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid() 
    AND (au.raw_user_meta_data->>'role' = 'admin' 
         OR au.raw_app_meta_data->>'role' = 'admin')
  )
);

-- Alternative fallback policy if auth metadata is not available
-- This uses the existing is_admin_user function but with explicit SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.is_admin_user_safe()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() 
    AND up.role = 'admin'
)
$$;

-- Backup admin policy using the safe function
CREATE POLICY "admins_manage_all_products_backup" 
ON public.products
FOR ALL
TO authenticated
USING (public.is_admin_user_safe())
WITH CHECK (public.is_admin_user_safe());

-- Enable RLS on the products table if not already enabled
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;