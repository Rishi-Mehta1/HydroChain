const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupSupabase() {
  // Initialize Supabase client
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing Supabase URL or Anon Key in environment variables');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Read the SQL migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/20230830000000_create_initial_tables.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec', { sql });
    
    if (error) {
      console.error('Error executing SQL:', error);
      process.exit(1);
    }
    
    console.log('✅ Database setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to Authentication > Providers');
    console.log('3. Enable Email/Password authentication');
    console.log('4. Start the app with `npm start`');
    
  } catch (error) {
    console.error('Error setting up Supabase:', error);
    process.exit(1);
  }
}

setupSupabase();
