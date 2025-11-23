-- Location: supabase/migrations/20251031180000_fix_products_rls_circular_dependency.sql
-- Schema Analysis: Existing products table with complex RLS policies causing circular dependencies
-- Integration Type: Modificative - Fix existing RLS policies to prevent circular dependencies
-- Dependencies: products table, user_profiles table

-- Issue Analysis:
-- The current RLS policies on products table use functions that may query user_profiles
-- which can create circular dependencies when checking permissions during product creation.
-- The error "new row violates row-level security policy for table 'products'" indicates
-- that the RLS policy is blocking the insert operation.

-- Solution: Replace complex policies with simple, safe Pattern 2 policies

-- Step 1: Drop existing problematic policies that may have circular dependencies
DROP POLICY IF EXISTS "users_manage_own_products" ON public.products;
DROP POLICY IF EXISTS "admins_manage_all_products" ON public.products;
DROP POLICY IF EXISTS "admins_manage_all_products_backup" ON public.products;

-- Step 2: Create safe, simple RLS policies using Pattern 2 (Simple User Ownership)
-- This avoids any function calls that could create circular dependencies

-- ✅ SAFE: Direct column comparison using Pattern 2
CREATE POLICY "users_manage_own_products_simple"
ON public.products
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Step 3: Add admin access using auth.users metadata (Pattern 6 Option A)
-- This avoids querying user_profiles table which could cause circular dependencies

CREATE OR REPLACE FUNCTION public.is_admin_from_auth_metadata()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid() 
    AND (au.raw_user_meta_data->>'role' = 'admin' 
         OR au.raw_app_meta_data->>'role' = 'admin')
)
$$;

-- ✅ SAFE: Admin policy using auth.users instead of user_profiles
CREATE POLICY "admin_full_access_products_safe"
ON public.products
FOR ALL
TO authenticated
USING (public.is_admin_from_auth_metadata())
WITH CHECK (public.is_admin_from_auth_metadata());

-- Step 4: Ensure user_profiles has proper trigger to create profiles for new users
-- This ensures that when a user signs up, they get a profile entry

CREATE OR REPLACE FUNCTION public.handle_new_user_products_fix()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Create user profile if it doesn't exist
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'member')::public.user_role
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists and create new one
DROP TRIGGER IF EXISTS on_auth_user_created_products_fix ON auth.users;
CREATE TRIGGER on_auth_user_created_products_fix
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_products_fix();

-- Step 5: Add helper function to check if user profile exists (for debugging)
CREATE OR REPLACE FUNCTION public.debug_user_profile_exists(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = user_uuid
)
$$;

-- Step 6: Create function to ensure user profile exists before product creation
CREATE OR REPLACE FUNCTION public.ensure_user_profile_exists()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_user_id UUID;
    user_email TEXT;
    user_name TEXT;
BEGIN
    -- Get current user
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check if profile exists
    IF EXISTS (SELECT 1 FROM public.user_profiles WHERE id = current_user_id) THEN
        RETURN TRUE;
    END IF;
    
    -- Get user info from auth.users
    SELECT email, COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1))
    INTO user_email, user_name
    FROM auth.users 
    WHERE id = current_user_id;
    
    -- Create profile if missing
    IF user_email IS NOT NULL THEN
        INSERT INTO public.user_profiles (id, email, full_name, role)
        VALUES (current_user_id, user_email, user_name, 'member'::public.user_role)
        ON CONFLICT (id) DO NOTHING;
        
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail
        RAISE NOTICE 'Error creating user profile: %', SQLERRM;
        RETURN FALSE;
END;
$$;

-- Step 7: Update the service to call the profile creation function if needed
-- (This will be handled in the React service layer)

-- Verification queries (for debugging):
-- SELECT public.debug_user_profile_exists(); -- Check if current user has profile
-- SELECT * FROM public.user_profiles WHERE id = auth.uid(); -- View current user profile
-- SELECT public.ensure_user_profile_exists(); -- Force create profile if missing