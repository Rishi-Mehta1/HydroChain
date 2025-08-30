const { createClient } = require('@supabase/supabase-js');

// Get Supabase credentials from your .env file
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.log('Make sure you have REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyRLSFixes() {
  console.log('🔧 Applying RLS policy fixes for credit purchases...\n');

  try {
    // 1. Add policy to allow buyers to purchase available credits
    console.log('1️⃣ Adding buyer purchase policy...');
    const { error: buyerPolicyError } = await supabase.rpc('sql', {
      query: `
        CREATE POLICY "Buyers can purchase available credits" ON public.credits
          FOR UPDATE USING (
            -- Credit must be available for purchase
            status IN ('issued', 'verified') 
            AND
            -- User must be a buyer or auditor (buyers can purchase, auditors can facilitate)
            (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) IN ('buyer', 'auditor', 'regulatory', 'verifier')
            AND
            -- Cannot purchase your own credits
            auth.uid() != user_id
          )
          WITH CHECK (
            -- After purchase, credit should be owned by the buyer
            auth.uid() = user_id
            AND
            -- Status should be updated to 'owned' after purchase
            status = 'owned'
          );
      `
    });

    if (buyerPolicyError) {
      console.warn('⚠️ Buyer policy creation failed (may already exist):', buyerPolicyError.message);
    } else {
      console.log('✅ Buyer purchase policy created successfully');
    }

    // 2. Add policy to allow transaction recording
    console.log('\n2️⃣ Adding transaction recording policy...');
    const { error: transactionPolicyError } = await supabase.rpc('sql', {
      query: `
        CREATE POLICY "Users can record transactions" ON public.transactions
          FOR INSERT WITH CHECK (
            -- User can record transactions where they are either sender or receiver
            auth.uid() = from_user OR auth.uid() = to_user
          );
      `
    });

    if (transactionPolicyError) {
      console.warn('⚠️ Transaction policy creation failed (may already exist):', transactionPolicyError.message);
    } else {
      console.log('✅ Transaction recording policy created successfully');
    }

    // 3. Create portfolio summary function
    console.log('\n3️⃣ Creating portfolio summary function...');
    const { error: functionError } = await supabase.rpc('sql', {
      query: `
        CREATE OR REPLACE FUNCTION public.update_user_portfolio_summary(
          user_id UUID,
          credits_purchased INTEGER DEFAULT 0,
          volume_purchased DECIMAL DEFAULT 0
        )
        RETURNS JSON AS $$
        DECLARE
          result JSON;
        BEGIN
          -- For now, just return a success message
          -- In a full implementation, this would update a portfolio_summary table
          result := json_build_object(
            'success', true,
            'user_id', user_id,
            'credits_purchased', credits_purchased,
            'volume_purchased', volume_purchased,
            'updated_at', NOW()
          );
          
          RETURN result;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;

        -- Grant execute permission to authenticated users
        GRANT EXECUTE ON FUNCTION public.update_user_portfolio_summary TO authenticated;
      `
    });

    if (functionError) {
      console.error('❌ Portfolio function creation failed:', functionError.message);
    } else {
      console.log('✅ Portfolio summary function created successfully');
    }

    console.log('\n🎉 RLS policy fixes applied! You can now test credit purchases with full ownership transfer.');
    
  } catch (error) {
    console.error('❌ Failed to apply RLS fixes:', error);
  }
}

// Alternative approach: Temporarily disable RLS for testing
async function disableRLSForTesting() {
  console.log('🔧 Temporarily disabling RLS on credits table for testing...\n');

  try {
    const { error } = await supabase.rpc('sql', {
      query: 'ALTER TABLE public.credits DISABLE ROW LEVEL SECURITY;'
    });

    if (error) {
      console.error('❌ Failed to disable RLS:', error.message);
    } else {
      console.log('✅ RLS disabled on credits table');
      console.log('⚠️ Remember: This is for testing only. Re-enable RLS in production!');
    }
  } catch (error) {
    console.error('❌ Failed to disable RLS:', error);
  }
}

async function enableRLSForProduction() {
  console.log('🔧 Re-enabling RLS on credits table...\n');

  try {
    const { error } = await supabase.rpc('sql', {
      query: 'ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;'
    });

    if (error) {
      console.error('❌ Failed to enable RLS:', error.message);
    } else {
      console.log('✅ RLS re-enabled on credits table');
    }
  } catch (error) {
    console.error('❌ Failed to enable RLS:', error);
  }
}

// Main execution
const command = process.argv[2];

switch (command) {
  case 'fix-policies':
    applyRLSFixes();
    break;
  case 'disable':
    disableRLSForTesting();
    break;
  case 'enable':
    enableRLSForProduction();
    break;
  default:
    console.log('Usage:');
    console.log('  node apply_rls_fixes.js fix-policies   # Add proper RLS policies for purchases');
    console.log('  node apply_rls_fixes.js disable        # Temporarily disable RLS for testing');
    console.log('  node apply_rls_fixes.js enable         # Re-enable RLS');
    break;
}
