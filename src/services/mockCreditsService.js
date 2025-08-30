import { supabase } from '../lib/supabaseClient';
import { generateMockTxHash, generateMockBlockchainData } from '../utils/mockBlockchain';

/**
 * Temporary Mock Credits Service
 * This bypasses Edge Functions and implements basic credit operations directly
 * Use this until Edge Functions are properly deployed
 */
class MockCreditsService {
  /**
   * Issue new credits (mock implementation)
   */
  async issueCredits(volume, description) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Mock: Issuing credits with:', { volume, description });
      
      // Check if user is a producer
      const { data: userRole, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (roleError || !userRole) {
        throw new Error('Unable to verify user role. Please ensure you are registered as a producer.');
      }

      if (userRole.role !== 'producer') {
        throw new Error('Only producers can issue credits');
      }

      // Generate mock blockchain data with proper Ethereum hash format
      const mockBlockchainData = generateMockBlockchainData();

      // Store credit in database
      const { data: credit, error: creditError } = await supabase
        .from('credits')
        .insert({
          user_id: user.id,
          token_id: mockBlockchainData.tokenId,
          volume: parseFloat(volume),
          status: 'issued',
          blockchain_tx_hash: mockBlockchainData.transactionHash,
          metadata: {
            description: description || 'Green Hydrogen Credit',
            issuedAt: new Date().toISOString(),
            producer: user.email,
            isMockData: true // Flag to indicate this is mock data
          }
        })
        .select()
        .single();

      if (creditError) {
        console.error('Database error:', creditError);
        throw new Error('Failed to store credit in database');
      }

      // Log the transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          credit_id: credit.id,
          from_user: null,
          to_user: user.id,
          type: 'issue',
          volume: parseFloat(volume),
          tx_hash: mockBlockchainData.transactionHash
        });

      if (transactionError) {
        console.warn('Failed to log transaction:', transactionError);
      }

      console.log('Mock: Credit issued successfully:', credit);

      return {
        success: true,
        credit: credit,
        blockchain: mockBlockchainData,
        message: 'Credit issued successfully (mock implementation)',
        // Return expected format for compatibility
        tx_hash: mockBlockchainData.transactionHash,
        token_id: mockBlockchainData.tokenId
      };

    } catch (error) {
      console.error('Mock: Error issuing credits:', error);
      throw error;
    }
  }

  /**
   * Get credits owned by current user
   */
  async getUserCredits() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('credits')
        .select(`
          id,
          token_id,
          volume,
          status,
          metadata,
          blockchain_tx_hash,
          created_at,
          updated_at
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user credits:', error);
      throw error;
    }
  }

  /**
   * Get all available credits (for buyers and auditors)
   */
  async getAvailableCredits() {
    try {
      const { data, error } = await supabase
        .from('credits')
        .select(`
          id,
          user_id,
          token_id,
          volume,
          status,
          metadata,
          blockchain_tx_hash,
          created_at
        `)
        .eq('status', 'issued')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching available credits:', error);
      throw error;
    }
  }

  /**
   * Transfer credit to another user (mock)
   */
  async transferCredit(creditId, toUserId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get credit details
      const { data: credit, error: creditError } = await supabase
        .from('credits')
        .select('*')
        .eq('id', creditId)
        .eq('user_id', user.id)
        .single();

      if (creditError || !credit) {
        throw new Error('Credit not found or not owned by user');
      }

      if (credit.status !== 'issued') {
        throw new Error('Credit is not available for transfer');
      }

      // Update credit ownership
      const { error: updateError } = await supabase
        .from('credits')
        .update({ user_id: toUserId })
        .eq('id', creditId);

      if (updateError) {
        throw new Error('Failed to transfer credit');
      }

      // Log the transaction with proper hash format
      const mockTxHash = generateMockTxHash();
      
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          credit_id: creditId,
          from_user: user.id,
          to_user: toUserId,
          type: 'transfer',
          volume: credit.volume,
          tx_hash: mockTxHash
        });

      if (transactionError) {
        console.warn('Failed to log transaction:', transactionError);
      }

      return {
        success: true,
        message: 'Credit transferred successfully (mock implementation)',
        tx_hash: mockTxHash
      };

    } catch (error) {
      console.error('Error transferring credit:', error);
      throw error;
    }
  }

  /**
   * Retire credit (mock)
   */
  async retireCredit(creditId, reason) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get credit details
      const { data: credit, error: creditError } = await supabase
        .from('credits')
        .select('*')
        .eq('id', creditId)
        .eq('user_id', user.id)
        .single();

      if (creditError || !credit) {
        throw new Error('Credit not found or not owned by user');
      }

      if (credit.status !== 'issued') {
        throw new Error('Credit is not available for retirement');
      }

      // Update credit status to retired
      const { error: updateError } = await supabase
        .from('credits')
        .update({ 
          status: 'retired',
          metadata: {
            ...credit.metadata,
            retiredAt: new Date().toISOString(),
            retirementReason: reason || 'Compliance retirement'
          }
        })
        .eq('id', creditId);

      if (updateError) {
        throw new Error('Failed to retire credit');
      }

      // Log the transaction with proper hash format
      const mockTxHash = generateMockTxHash();
      
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          credit_id: creditId,
          from_user: user.id,
          to_user: null,
          type: 'retire',
          volume: credit.volume,
          tx_hash: mockTxHash
        });

      if (transactionError) {
        console.warn('Failed to log transaction:', transactionError);
      }

      return {
        success: true,
        message: 'Credit retired successfully (mock implementation)',
        tx_hash: mockTxHash
      };

    } catch (error) {
      console.error('Error retiring credit:', error);
      throw error;
    }
  }

  /**
   * Get user transactions
   */
  async getUserTransactions() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('transactions')
        .select(`
          id,
          type,
          volume,
          tx_hash,
          created_at,
          credits (
            id,
            token_id,
            volume,
            metadata
          )
        `)
        .or(`from_user.eq.${user.id},to_user.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user transactions:', error);
      throw error;
    }
  }
}

export default new MockCreditsService();
