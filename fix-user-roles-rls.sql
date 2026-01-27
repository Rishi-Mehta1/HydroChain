-- Fix Row Level Security policies for user_roles table
-- Run this in your Supabase SQL Editor

-- First, let's check if RLS is enabled on user_roles table
-- You can run this to see the current state:
-- SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE tablename = 'user_roles';

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can insert their own role" ON user_roles;
DROP POLICY IF EXISTS "Users can view their own role" ON user_roles;
DROP POLICY IF EXISTS "Users can update their own role" ON user_roles;
DROP POLICY IF EXISTS "Allow role insertion during signup" ON user_roles;
DROP POLICY IF EXISTS "Allow service role full access" ON user_roles;

-- Create policies that allow proper role management

-- 1. Allow users to insert their own role (needed for signup)
CREATE POLICY "Users can insert their own role" ON user_roles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 2. Allow users to view their own role
CREATE POLICY "Users can view their own role" ON user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 3. Allow users to update their own role (optional, for role changes)
CREATE POLICY "Users can update their own role" ON user_roles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Allow service role (backend) full access for administrative operations
CREATE POLICY "Allow service role full access" ON user_roles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 5. Allow anon role to insert during signup (if using anon signup flow)
CREATE POLICY "Allow signup role insertion" ON user_roles
FOR INSERT
TO anon
WITH CHECK (true);

-- Enable RLS on user_roles table if not already enabled
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Verify the policies were created
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename = 'user_roles';
