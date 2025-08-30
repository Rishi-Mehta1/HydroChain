require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Use service role key for admin access
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

// Create admin client with service role
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function disableRLS() {
  console.log('🔧 Temporarily disabling RLS on credits table for testing...\n');

  try {
    // Disable RLS on credits table
    const { data, error } = await supabase
      .from('credits')
      .select('id')
      .limit(1);

    if (error) {
      console.error('❌ Connection test failed:', error.message);
      return;
    }

    // Execute SQL to disable RLS
    console.log('📡 Attempting to disable RLS...');
    
    // Since we can't directly execute ALTER statements via the client,
    // let's check if we can access the SQL editor
    console.log('🔧 Supabase connected successfully');
    console.log('\n⚠️ To disable RLS for testing, please:');
    console.log('\n1. Go to your Supabase Dashboard: https://supabase.com/dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Run this command:');
    console.log('\n   ALTER TABLE public.credits DISABLE ROW LEVEL SECURITY;');
    console.log('\n4. After testing, re-enable it with:');
    console.log('\n   ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;');
    
    console.log('\n✅ Credentials verified - You can run the SQL commands in Supabase Dashboard');
    
  } catch (error) {
    console.error('❌ Failed to connect to Supabase:', error.message);
  }
}

disableRLS();
