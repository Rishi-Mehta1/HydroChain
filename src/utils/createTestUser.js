// Test user creation utility
import { supabase } from '../lib/supabaseClient';

export const createTestUser = async () => {
  const testEmail = 'test@hydrochain.com';
  const testPassword = 'TestPassword123!';

  try {
    console.log('Creating test user...');
    
    // Sign up the test user
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Test User'
        }
      }
    });

    if (error) {
      console.error('Error creating test user:', error);
      return { success: false, error };
    }

    console.log('Test user created successfully:', data.user?.email);
    
    // If user_roles table exists, add a role
    try {
      if (data.user?.id) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert([
            { user_id: data.user.id, role: 'buyer' }
          ]);
        
        if (roleError) {
          console.warn('Could not set user role (table might not exist):', roleError);
        } else {
          console.log('Test user role set to: buyer');
        }
      }
    } catch (roleErr) {
      console.warn('Role assignment failed:', roleErr);
    }

    return { 
      success: true, 
      user: data.user,
      credentials: { email: testEmail, password: testPassword }
    };
    
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, error: err };
  }
};

// Add to window for easy access in development
if (process.env.NODE_ENV === 'development') {
  window.createTestUser = createTestUser;
  console.log('🧪 Test user creation available at window.createTestUser()');
  console.log('📧 Test credentials: test@hydrochain.com / TestPassword123!');
}
