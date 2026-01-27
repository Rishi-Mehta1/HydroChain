// Enhanced test users creation utility
import { supabase } from '../lib/supabaseClient';

// Test user configurations for different roles
const TEST_USERS = [
  {
    email: 'producer@hydrochain.com',
    password: 'Producer123!',
    role: 'producer',
    name: 'GreenH2 Producer',
    company: 'GreenH2 Technologies'
  },
  {
    email: 'buyer@hydrochain.com',
    password: 'Buyer123!',
    role: 'buyer',
    name: 'Steel Corp Buyer',
    company: 'Industrial Steel Corp'
  },
  {
    email: 'auditor@hydrochain.com',
    password: 'Auditor123!',
    role: 'auditor',
    name: 'Certification Auditor',
    company: 'GreenCert Auditing'
  },
  {
    email: 'regulatory@hydrochain.com',
    password: 'Regulatory123!',
    role: 'regulatory',
    name: 'Government Officer',
    company: 'Environmental Protection Agency'
  },
  {
    email: 'verifier@hydrochain.com',
    password: 'Verifier123!',
    role: 'verifier',
    name: 'Independent Verifier',
    company: 'TrustVerify Solutions'
  }
];

/**
 * Create a single test user
 */
export const createTestUser = async (userConfig) => {
  const { email, password, role, name, company } = userConfig;
  
  try {
    console.log(`Creating ${role} test user: ${email}`);
    
    // Check if user already exists
    const { data: existingUser } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (existingUser?.user) {
      console.log(`User ${email} already exists, updating role if needed`);
      
      // Check and update role if needed
      const { data: roleData, error: roleCheckError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', existingUser.user.id)
        .single();
      
      if (roleCheckError || roleData?.role !== role) {
        // Update or insert role
        const { error: roleUpsertError } = await supabase
          .from('user_roles')
          .upsert([
            { user_id: existingUser.user.id, role: role }
          ], { onConflict: 'user_id' });
        
        if (roleUpsertError) {
          console.warn(`Could not update role for ${email}:`, roleUpsertError);
        } else {
          console.log(`✅ Updated role for ${email} to ${role}`);
        }
      }
      
      // Sign out the user since we were just checking
      await supabase.auth.signOut();
      
      return {
        success: true,
        user: existingUser.user,
        credentials: { email, password },
        existed: true
      };
    }
    
    // Create new user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          company: company
        }
      }
    });

    if (signUpError) {
      console.error(`Error creating ${role} user:`, signUpError);
      return { success: false, error: signUpError, role };
    }

    console.log(`✅ Created ${role} user: ${email}`);
    
    // Add role to user_roles table
    if (signUpData.user?.id) {
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert([
          { user_id: signUpData.user.id, role: role }
        ]);
      
      if (roleError) {
        console.warn(`Could not set role for ${email}:`, roleError);
      } else {
        console.log(`✅ Set role ${role} for ${email}`);
      }
    }

    // Sign out after creation to not interfere with current session
    await supabase.auth.signOut();

    return { 
      success: true, 
      user: signUpData.user,
      credentials: { email, password },
      role,
      existed: false
    };
    
  } catch (err) {
    console.error(`Unexpected error creating ${role} user:`, err);
    return { success: false, error: err, role };
  }
};

/**
 * Create all test users
 */
export const createAllTestUsers = async () => {
  console.log('🚀 Creating all test users...');
  const results = [];
  
  for (const userConfig of TEST_USERS) {
    const result = await createTestUser(userConfig);
    results.push(result);
    
    // Add small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Summary
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log('\n📊 Test User Creation Summary:');
  console.log(`✅ Successfully created/verified: ${successful.length} users`);
  console.log(`❌ Failed: ${failed.length} users`);
  
  if (successful.length > 0) {
    console.log('\n🔑 Test User Credentials:');
    successful.forEach(result => {
      const status = result.existed ? 'EXISTS' : 'NEW';
      console.log(`  ${result.role}: ${result.credentials.email} / ${result.credentials.password} [${status}]`);
    });
  }
  
  if (failed.length > 0) {
    console.log('\n❌ Failed Users:');
    failed.forEach(result => {
      console.log(`  ${result.role}: ${result.error?.message || 'Unknown error'}`);
    });
  }
  
  return { successful, failed, total: results.length };
};

/**
 * Test user login and dashboard navigation
 */
export const testUserLogin = async (email, password, expectedRole) => {
  console.log(`🧪 Testing login for ${expectedRole}: ${email}`);
  
  try {
    // Sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (signInError) {
      console.error('❌ Login failed:', signInError);
      return { success: false, error: signInError };
    }
    
    console.log('✅ Login successful');
    
    // Check role
    if (signInData.user?.id) {
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', signInData.user.id)
        .single();
      
      if (roleError) {
        console.warn('⚠️ Could not fetch role:', roleError);
      } else if (roleData?.role === expectedRole) {
        console.log(`✅ Role verified: ${roleData.role}`);
      } else {
        console.log(`⚠️ Role mismatch. Expected: ${expectedRole}, Got: ${roleData?.role}`);
      }
    }
    
    // Sign out to not interfere
    await supabase.auth.signOut();
    
    return { success: true, user: signInData.user, role: expectedRole };
    
  } catch (err) {
    console.error('❌ Unexpected error during login test:', err);
    return { success: false, error: err };
  }
};

/**
 * Test all user logins
 */
export const testAllUserLogins = async () => {
  console.log('🧪 Testing all user logins...');
  
  const results = [];
  
  for (const userConfig of TEST_USERS) {
    const result = await testUserLogin(userConfig.email, userConfig.password, userConfig.role);
    results.push({ ...result, email: userConfig.email });
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log('\n📊 Login Test Results:');
  console.log(`✅ Successful logins: ${successful.length}`);
  console.log(`❌ Failed logins: ${failed.length}`);
  
  if (failed.length > 0) {
    console.log('\n❌ Failed Logins:');
    failed.forEach(result => {
      console.log(`  ${result.email}: ${result.error?.message || 'Unknown error'}`);
    });
  }
  
  return { successful, failed };
};

/**
 * Clean up test users (use with caution)
 */
export const cleanupTestUsers = async () => {
  console.log('🧹 Cleaning up test users...');
  
  for (const userConfig of TEST_USERS) {
    try {
      // Sign in to get user ID
      const { data: signInData } = await supabase.auth.signInWithPassword({
        email: userConfig.email,
        password: userConfig.password
      });
      
      if (signInData.user?.id) {
        // Remove from user_roles table
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', signInData.user.id);
        
        console.log(`🗑️ Cleaned up role for ${userConfig.email}`);
      }
      
      // Sign out
      await supabase.auth.signOut();
      
    } catch (err) {
      console.warn(`Could not cleanup ${userConfig.email}:`, err);
    }
  }
  
  console.log('⚠️ Note: User accounts in Supabase Auth cannot be deleted via client SDK');
  console.log('   You may need to delete them manually from the Supabase dashboard');
};

/**
 * Get navigation URL based on user role
 */
export const getRoleNavigationUrl = (role) => {
  // All roles go to /dashboard, but the Dashboard component will render the appropriate view
  return '/dashboard';
};

/**
 * Simulate user navigation testing
 */
export const testRoleNavigation = () => {
  console.log('🧭 Testing role-based navigation:');
  
  TEST_USERS.forEach(userConfig => {
    const navUrl = getRoleNavigationUrl(userConfig.role);
    console.log(`  ${userConfig.role} (${userConfig.email}) → ${navUrl}`);
  });
  
  console.log('\n💡 All users navigate to /dashboard');
  console.log('   The Dashboard component renders role-specific views:');
  console.log('   - Producer: ProducerDashboard component');
  console.log('   - Buyer: BuyerDashboard component');
  console.log('   - Auditor: AuditorDashboard component');
  console.log('   - Regulatory: Default dashboard with role-specific actions');
  console.log('   - Verifier: Default dashboard with role-specific actions');
};

// Export user configurations for reference
export { TEST_USERS };

// Add to window for easy access in development
if (process.env.NODE_ENV === 'development') {
  window.createAllTestUsers = createAllTestUsers;
  window.testAllUserLogins = testAllUserLogins;
  window.testRoleNavigation = testRoleNavigation;
  window.cleanupTestUsers = cleanupTestUsers;
  window.TEST_USERS = TEST_USERS;
  
  console.log('🧪 Enhanced test utilities available:');
  console.log('  window.createAllTestUsers() - Create all test users');
  console.log('  window.testAllUserLogins() - Test all user logins');
  console.log('  window.testRoleNavigation() - Show navigation info');
  console.log('  window.cleanupTestUsers() - Clean up test data');
  console.log('  window.TEST_USERS - View user configurations');
}
