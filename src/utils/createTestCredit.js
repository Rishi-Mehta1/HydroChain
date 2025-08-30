import { supabase } from '../lib/supabaseClient';
import aiAutomationService from '../services/aiAutomationService';

/**
 * Create a test credit that can be purchased
 * This will create a credit owned by a different user so it can be purchased
 */
export const createTestCredit = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Create a fake producer user ID (different from current user)
    const fakeProducerId = 'producer-test-' + Date.now();
    
    const testCredit = {
      user_id: fakeProducerId, // Different from current user
      token_id: `TEST-${Date.now()}`,
      volume: '25.5',
      status: 'issued',
      production_method: 'electrolysis',
      renewable_source: 'solar',
      facility_location: 'Test Facility',
      production_date: new Date().toISOString(),
      metadata: {
        description: 'Test credit for purchase testing',
        productionMethod: 'solar',
        facility: 'Solar Test Plant',
        efficiency: '85%',
        certificationStandard: 'CertifHy'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('credits')
      .insert(testCredit)
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log('✅ Test credit created successfully:', data);
    
    // Send AI automation notification for test credit issuance
    try {
      const fakeProducerInfo = {
        id: fakeProducerId,
        email: `test_producer_${Date.now()}@hydrochain.com`,
        name: `Test Producer ${fakeProducerId.slice(-6)}`
      };
      
      await aiAutomationService.notifyCreditIssued(data, fakeProducerInfo);
      console.log('🤖 AI automation notification sent for test credit issuance');
    } catch (notificationError) {
      console.log('ℹ️ AI automation notification failed:', notificationError.message);
    }
    
    return data;
  } catch (error) {
    console.error('❌ Failed to create test credit:', error);
    throw error;
  }
};

// Function to check current available credits
export const checkAvailableCredits = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data: availableCredits, error } = await supabase
      .from('credits')
      .select('id, user_id, token_id, volume, status, created_at')
      .eq('status', 'issued')
      .neq('user_id', user.id) // Exclude user's own credits
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    console.log('📋 Available credits for purchase:', availableCredits);
    return availableCredits;
  } catch (error) {
    console.error('❌ Failed to check available credits:', error);
    throw error;
  }
};
