import { supabase } from '../lib/supabaseClient';
import aiAutomationService from './aiAutomationService';

class TestCreditService {
  /**
   * Create a test credit directly in the database (bypasses edge functions)
   */
  async createTestCredit(volume, description = 'Test Green Hydrogen Credit') {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('🔧 Creating test credit directly in database...');

      // Create credit record
      const { data: credit, error: creditError } = await supabase
        .from('credits')
        .insert({
          user_id: user.id,
          volume: parseFloat(volume),
          status: 'issued',
          metadata: {
            description: description,
            productionMethod: 'Test Production',
            energySource: 'Renewable',
            testCredit: true,
            createdVia: 'Test Credit Service'
          },
          token_id: Math.floor(Math.random() * 1000000), // Generate random token ID
          blockchain_tx_hash: `test_${Date.now()}` // Mock blockchain hash
        })
        .select('*')
        .single();

      if (creditError) {
        console.error('❌ Credit creation failed:', creditError);
        throw new Error(`Failed to create credit: ${creditError.message}`);
      }

      console.log('✅ Test credit created successfully:', credit);

      // Send AI automation notification for credit issuance
      try {
        const producerInfo = await aiAutomationService.getUserInfo(user, supabase);
        
        await aiAutomationService.notifyCreditIssued(
          credit,
          producerInfo
        );
        console.log('🤖 AI automation notification sent for credit issuance');
      } catch (notificationError) {
        console.log('ℹ️ AI automation notification failed:', notificationError.message);
      }

      // Create initial transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          credit_id: credit.id,
          from_user: null,
          to_user: user.id,
          type: 'issue',
          volume: parseFloat(volume),
          tx_hash: credit.blockchain_tx_hash
        });

      if (transactionError) {
        console.warn('⚠️ Transaction recording failed:', transactionError);
      } else {
        console.log('✅ Transaction recorded successfully');
      }

      return {
        success: true,
        credit: credit,
        message: `Successfully created test credit: ${volume} kg H₂`
      };

    } catch (error) {
      console.error('❌ Test credit creation failed:', error);
      throw error;
    }
  }

  /**
   * Create multiple test credits for testing
   */
  async createMultipleTestCredits(count = 3) {
    const results = [];
    const volumes = [25, 50, 100, 75, 120]; // Different volumes for variety

    for (let i = 0; i < count; i++) {
      try {
        const volume = volumes[i % volumes.length];
        const description = `Test Credit #${i + 1} - ${volume} kg H₂`;
        
        const result = await this.createTestCredit(volume, description);
        results.push(result);
        
        // Small delay between creations
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Failed to create test credit ${i + 1}:`, error);
        results.push({
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Clean up test credits (removes all credits marked as test credits)
   */
  async cleanupTestCredits() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Find test credits
      const { data: testCredits, error: fetchError } = await supabase
        .from('credits')
        .select('id, volume')
        .eq('user_id', user.id)
        .contains('metadata', { testCredit: true });

      if (fetchError) {
        throw new Error(`Failed to fetch test credits: ${fetchError.message}`);
      }

      if (!testCredits || testCredits.length === 0) {
        return {
          success: true,
          message: 'No test credits found to clean up'
        };
      }

      // Delete test credits
      const creditIds = testCredits.map(c => c.id);
      const { error: deleteError } = await supabase
        .from('credits')
        .delete()
        .in('id', creditIds);

      if (deleteError) {
        throw new Error(`Failed to delete test credits: ${deleteError.message}`);
      }

      return {
        success: true,
        message: `Successfully deleted ${testCredits.length} test credits`,
        deletedCount: testCredits.length
      };

    } catch (error) {
      console.error('❌ Cleanup failed:', error);
      throw error;
    }
  }
}

export default new TestCreditService();
