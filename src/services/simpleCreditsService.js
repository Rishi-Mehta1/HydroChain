import { supabase } from '../lib/supabaseClient';
import aiAutomationService from './aiAutomationService';

class SimpleCreditsService {
  /**
   * Issue new credits (calls edge function)
   */
  async issueCredits(volume, description) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Invoking issue-credit-simple function with:', { volume, description });
      
      const response = await supabase.functions.invoke('issue-credit-simple', {
        body: {
          volume: parseFloat(volume),
          description: description || 'Green Hydrogen Credit'
        }
      });

      console.log('Edge function response:', response);

      if (response.error) {
        console.error('Edge function error:', response.error);
        throw new Error(response.error.message || 'Failed to send a request to the Edge Function');
      }

      if (!response.data) {
        throw new Error('No data returned from Edge Function');
      }

      return response.data;
    } catch (error) {
      console.error('Error issuing credits:', error);
      // Provide more specific error messages
      if (error.message.includes('fetch')) {
        throw new Error('Failed to connect to the server. Please check your internet connection.');
      } else if (error.message.includes('CORS')) {
        throw new Error('Server configuration error. Please contact support.');
      } else {
        throw new Error(error.message || 'Failed to issue credits');
      }
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
   * Get credit details by ID
   */
  async getCreditById(creditId) {
    try {
      const { data, error } = await supabase
        .from('credits')
        .select(`
          *,
          transactions (
            id,
            type,
            volume,
            from_user,
            to_user,
            tx_hash,
            created_at
          )
        `)
        .eq('id', creditId)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching credit details:', error);
      throw error;
    }
  }

  /**
   * Get user's transaction history
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

  /**
   * Transfer credit to another user
   */
  async transferCredit(creditId, toUserId) {
    try {
      const response = await supabase.functions.invoke('transfer-credit', {
        body: {
          creditId: creditId,
          toUserId: toUserId
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data;
    } catch (error) {
      console.error('Error transferring credit:', error);
      throw error;
    }
  }

  /**
   * Retire credit
   */
  async retireCredit(creditId, reason) {
    try {
      const response = await supabase.functions.invoke('retire-credit', {
        body: {
          creditId: creditId,
          reason: reason || 'Compliance retirement'
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data;
    } catch (error) {
      console.error('Error retiring credit:', error);
      throw error;
    }
  }

  /**
   * Get system statistics
   */
  async getSystemStats() {
    try {
      // Get total credits count
      const { count: totalCredits } = await supabase
        .from('credits')
        .select('*', { count: 'exact', head: true });

      // Get total volume
      const { data: volumeData } = await supabase
        .from('credits')
        .select('volume, status');

      const totalVolume = volumeData?.reduce((sum, credit) => {
        return sum + parseFloat(credit.volume || 0);
      }, 0) || 0;

      const issuedVolume = volumeData?.reduce((sum, credit) => {
        return credit.status === 'issued' ? sum + parseFloat(credit.volume || 0) : sum;
      }, 0) || 0;

      const retiredVolume = volumeData?.reduce((sum, credit) => {
        return credit.status === 'retired' ? sum + parseFloat(credit.volume || 0) : sum;
      }, 0) || 0;

      // Get recent transactions
      const { data: recentTransactions } = await supabase
        .from('transactions')
        .select(`
          id,
          type,
          volume,
          created_at,
          credits (
            token_id,
            metadata
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      return {
        totalCredits: totalCredits || 0,
        totalVolume: Math.round(totalVolume * 100) / 100,
        issuedVolume: Math.round(issuedVolume * 100) / 100,
        retiredVolume: Math.round(retiredVolume * 100) / 100,
        recentTransactions: recentTransactions || []
      };
    } catch (error) {
      console.error('Error fetching system stats:', error);
      return {
        totalCredits: 0,
        totalVolume: 0,
        issuedVolume: 0,
        retiredVolume: 0,
        recentTransactions: []
      };
    }
  }

  /**
   * Search credits with filters
   */
  async searchCredits({ status, minVolume, maxVolume, fromDate, toDate }) {
    try {
      let query = supabase
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
        `);

      // Apply filters
      if (status && status.length > 0) {
        query = query.in('status', status);
      }

      if (minVolume) {
        query = query.gte('volume', minVolume);
      }

      if (maxVolume) {
        query = query.lte('volume', maxVolume);
      }

      if (fromDate) {
        query = query.gte('created_at', fromDate);
      }

      if (toDate) {
        query = query.lte('created_at', toDate);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error searching credits:', error);
      throw error;
    }
  }
}

export default new SimpleCreditsService();
