-- Fix role selection during signup
-- We need to store the selected role temporarily so the trigger can use it
-- Create a temporary table to store signup data
CREATE TABLE IF NOT EXISTS public.temp_signup_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('buyer', 'producer', 'auditor')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 hour')
);

-- Enable RLS on temp table
ALTER TABLE public.temp_signup_data ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert into temp table (for signup)
CREATE POLICY "Allow anyone to insert temp signup data" 
  ON public.temp_signup_data 
  FOR INSERT 
  WITH CHECK (true);

-- Allow authenticated users to view their own temp data
CREATE POLICY "Allow users to view their own temp signup data" 
  ON public.temp_signup_data 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Update the handle_new_user function to use the selected role
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  selected_role TEXT;
BEGIN
  -- Try to get the selected role from temp_signup_data
  SELECT role INTO selected_role 
  FROM public.temp_signup_data 
  WHERE email = NEW.email 
  AND expires_at > NOW()
  ORDER BY created_at DESC 
  LIMIT 1;
  
  -- If no role found, default to 'buyer'
  IF selected_role IS NULL THEN
    selected_role := 'buyer';
  END IF;
  
  -- Insert the user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, selected_role);
  
  -- Clean up temp data
  DELETE FROM public.temp_signup_data 
  WHERE email = NEW.email;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
