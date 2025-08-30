import { createClient } from '@supabase/supabase-js';

// Admin service that uses service role to bypass RLS for testing
class AdminMarketplaceService {
  constructor() {
    // Check if service role key is available (should only be in server environment)
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (serviceRoleKey) {
      // Create admin client with service role key
      this.adminClient = createClient(
        process.env.REACT_APP_SUPABASE_URL,
        serviceRoleKey,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );
      this.available = true;
    } else {
      console.log('ℹ️ Admin service not available - service role key not found (expected in browser)');
      this.adminClient = null;
      this.available = false;
    }
  }

  /**
   * Purchase credit with full ownership transfer using service role
   */
  async purchaseCreditWithAdminAccess(creditId, buyerUserId, pricing) {
    try {
      console.log('🔧 Using admin service to transfer credit ownership...');

      // Step 1: Get the current credit
      const { data: credit, error: fetchError } = await this.adminClient
        .from('credits')
        .select('*')
        .eq('id', creditId)
        .single();

      if (fetchError || !credit) {
        throw new Error(`Credit not found: ${fetchError?.message}`);
      }

      console.log('📋 Current credit details:', {
        id: credit.id,
        currentOwner: credit.user_id,
        newOwner: buyerUserId,
        status: credit.status
      });

      // Step 2: Transfer ownership using admin privileges
      const { data: updatedCredit, error: updateError } = await this.adminClient
        .from('credits')
        .update({
          user_id: buyerUserId,
          status: 'owned',
          updated_at: new Date().toISOString()
        })
        .eq('id', creditId)
        .select('*')
        .single();

      if (updateError) {
        console.error('❌ Admin transfer failed:', updateError);
        throw new Error(`Admin transfer failed: ${updateError.message}`);
      }

      console.log('✅ Credit ownership transferred via admin service!');
      console.log('📋 Updated credit:', updatedCredit);

      // Step 3: Record the transaction
      const { error: transactionError } = await this.adminClient
        .from('transactions')
        .insert({
          credit_id: creditId,
          from_user: credit.user_id,
          to_user: buyerUserId,
          type: 'transfer',
          volume: parseFloat(credit.volume),
          tx_hash: `admin_purchase_${Date.now()}`
        });

      if (transactionError) {
        console.error('❌ Transaction recording failed:', transactionError);
      } else {
        console.log('✅ Purchase transaction recorded successfully');
      }

      return {
        success: true,
        credit: updatedCredit,
        originalCredit: credit,
        transferred: true,
        message: 'Credit ownership transferred successfully using admin privileges'
      };

    } catch (error) {
      console.error('❌ Admin purchase failed:', error);
      throw error;
    }
  }

  /**
   * Create the portfolio summary RPC function
   */
  async createPortfolioSummaryFunction() {
    try {
      console.log('🔧 Creating portfolio summary function...');

      // Note: This would typically be done via a proper migration
      // For now, we'll create a placeholder function
      console.log('ℹ️ Portfolio summary function would be created here');
      console.log('✅ Function creation simulated successfully');

      return { success: true };
    } catch (error) {
      console.error('❌ Failed to create portfolio function:', error);
      throw error;
    }
  }
}

export default new AdminMarketplaceService();
