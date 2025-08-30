import { createClient } from '@supabase/supabase-js';

// Check if environment variables are defined
if (!process.env.REACT_APP_SUPABASE_URL) {
  console.error('Missing REACT_APP_SUPABASE_URL environment variable');
}

if (!process.env.REACT_APP_SUPABASE_ANON_KEY) {
  console.error('Missing REACT_APP_SUPABASE_ANON_KEY environment variable');
}

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://kotakdgdunayyvdrhboq.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvdGFrZGdkdW5heXl2ZHJoYm9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1MjE2NTAsImV4cCI6MjA3MjA5NzY1MH0.XlAwAimerKgLpVWRBg0suEvRB5bNqDj8Ktw8nZE6ieA';

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Helper function to get user role
export const getUserRole = async (userId) => {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;
  return data.role;
};

// Check if user has required role
export const hasRole = async (userId, requiredRole) => {
  const userRole = await getUserRole(userId);
  return userRole === requiredRole;
};
