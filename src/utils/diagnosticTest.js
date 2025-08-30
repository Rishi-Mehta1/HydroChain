import { supabase } from '../lib/supabaseClient';

// Diagnostic function to test Edge Function connectivity
export const testEdgeFunctionConnectivity = async () => {
  console.log('🔧 Running Edge Function Diagnostic Test...');
  
  try {
    // Test 1: Check if user is authenticated
    console.log('📋 Test 1: Checking authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('❌ Authentication failed:', authError);
      return false;
    }
    console.log('✅ User authenticated:', user.email);

    // Test 2: Check user role
    console.log('📋 Test 2: Checking user role...');
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    if (roleError || !userRole) {
      console.error('❌ User role check failed:', roleError);
      return false;
    }
    console.log('✅ User role:', userRole.role);

    // Test 3: Try a simple fetch to the Edge Function endpoint
    console.log('📋 Test 3: Testing Edge Function connectivity...');
    
    // Get the current session token
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error('❌ No session available');
      return false;
    }

    // Construct the Edge Function URL
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    const functionUrl = `${supabaseUrl}/functions/v1/issue-credit-simple`;
    
    console.log('🔗 Function URL:', functionUrl);
    
    // Test OPTIONS request (CORS preflight)
    try {
      console.log('📋 Test 3a: Testing OPTIONS request (CORS preflight)...');
      const optionsResponse = await fetch(functionUrl, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:3000',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'authorization, x-client-info, apikey, content-type'
        }
      });
      
      console.log('✅ OPTIONS response status:', optionsResponse.status);
      console.log('✅ OPTIONS response headers:', Object.fromEntries(optionsResponse.headers.entries()));
      
    } catch (optionsError) {
      console.error('❌ OPTIONS request failed:', optionsError);
    }

    // Test actual POST request
    console.log('📋 Test 3b: Testing POST request...');
    try {
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'x-client-info': 'hydrochain-dashboard@1.0.0',
          'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          volume: 1.0,
          description: 'Test credit for diagnostics'
        })
      });

      console.log('📊 POST response status:', response.status);
      console.log('📊 POST response headers:', Object.fromEntries(response.headers.entries()));
      
      const responseText = await response.text();
      console.log('📊 POST response body:', responseText);
      
      if (response.status === 200) {
        console.log('✅ Edge Function is working correctly!');
        return true;
      } else {
        console.error('❌ Edge Function returned error status:', response.status);
        return false;
      }
      
    } catch (postError) {
      console.error('❌ POST request failed:', postError);
    }

  } catch (error) {
    console.error('❌ Diagnostic test failed:', error);
    return false;
  }
};

// Function to check Supabase local development status
export const checkSupabaseStatus = () => {
  console.log('🔧 Checking Supabase Configuration...');
  console.log('📊 Supabase URL:', process.env.REACT_APP_SUPABASE_URL);
  console.log('📊 Supabase Anon Key:', process.env.REACT_APP_SUPABASE_ANON_KEY ? '✅ Present' : '❌ Missing');
  
  // Check if it's local development
  const isLocal = process.env.REACT_APP_SUPABASE_URL?.includes('localhost') || 
                  process.env.REACT_APP_SUPABASE_URL?.includes('127.0.0.1');
  
  console.log('📊 Local Development:', isLocal ? '✅ Yes' : '❌ No');
  
  if (isLocal) {
    console.log('💡 NOTE: You appear to be using local Supabase development.');
    console.log('💡 Make sure you have run: supabase start');
    console.log('💡 And that Edge Functions are deployed with: supabase functions deploy');
  }
};
