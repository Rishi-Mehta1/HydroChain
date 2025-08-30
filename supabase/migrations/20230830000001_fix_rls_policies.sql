-- Fix RLS policies for user_roles table
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update their own roles" ON public.user_roles;

-- Create more permissive policies for development
-- Allow authenticated users to view all roles (for now)
CREATE POLICY "Allow authenticated users to view roles" 
  ON public.user_roles 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert roles
CREATE POLICY "Allow authenticated users to insert roles" 
  ON public.user_roles 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own roles
CREATE POLICY "Allow users to update their own roles" 
  ON public.user_roles 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Allow users to delete their own roles
CREATE POLICY "Allow users to delete their own roles" 
  ON public.user_roles 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Make the handle_new_user function bypass RLS
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- Default role is 'buyer' for new users
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'buyer');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
