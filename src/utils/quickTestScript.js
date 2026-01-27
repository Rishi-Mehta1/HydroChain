// Quick Test Script for HydroChain Role-based Navigation
// Copy and paste this entire script into your browser console

console.log('🚀 HydroChain Quick Test Script Loading...');

// Wait for the enhanced test utilities to be available
const waitForTestUtils = () => {
  return new Promise((resolve) => {
    const checkUtils = () => {
      if (window.createAllTestUsers && window.testAllUserLogins) {
        resolve();
      } else {
        setTimeout(checkUtils, 100);
      }
    };
    checkUtils();
  });
};

// Main testing function
const runFullTest = async () => {
  console.log('\n🧪 Starting Full Role-based Navigation Test...');
  console.log('=============================================\n');
  
  try {
    // Step 1: Create all test users
    console.log('📝 Step 1: Creating test users...');
    const createResult = await window.createAllTestUsers();
    
    if (createResult.successful.length === 0) {
      console.error('❌ Failed to create any test users. Stopping test.');
      return;
    }
    
    // Step 2: Test all logins
    console.log('\n🔐 Step 2: Testing user logins...');
    const loginResult = await window.testAllUserLogins();
    
    // Step 3: Show navigation information
    console.log('\n🧭 Step 3: Navigation Information...');
    window.testRoleNavigation();
    
    // Step 4: Summary
    console.log('\n📊 Test Summary:');
    console.log(`✅ Users created/verified: ${createResult.successful.length}`);
    console.log(`✅ Successful logins: ${loginResult.successful.length}`);
    console.log(`❌ Failed logins: ${loginResult.failed.length}`);
    
    // Step 5: Next steps
    console.log('\n🎯 Next Steps for Manual Testing:');
    console.log('1. Go to /login page');
    console.log('2. Use any of the test credentials shown above');
    console.log('3. Verify you are redirected to /dashboard');
    console.log('4. Check that the correct role-specific dashboard is rendered');
    console.log('5. Verify the role badge and quick actions in navigation');
    console.log('6. Test logout and try different roles');
    
    console.log('\n🔑 Test Credentials Summary:');
    console.table(window.TEST_USERS.map(user => ({
      Role: user.role,
      Email: user.email,
      Password: user.password
    })));
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
};

// Function to test a specific role
const testRole = async (role) => {
  const user = window.TEST_USERS.find(u => u.role === role);
  if (!user) {
    console.error(`❌ Role '${role}' not found. Available roles: ${window.TEST_USERS.map(u => u.role).join(', ')}`);
    return;
  }
  
  console.log(`🧪 Testing ${role} role...`);
  console.log(`Email: ${user.email}`);
  console.log(`Password: ${user.password}`);
  console.log('\n1. Go to /login');
  console.log(`2. Login with: ${user.email} / ${user.password}`);
  console.log('3. Verify dashboard navigation and role-specific features');
};

// Function to show quick help
const showHelp = () => {
  console.log('\n🚀 HydroChain Test Utilities Help');
  console.log('=================================\n');
  console.log('Available Functions:');
  console.log('• runFullTest() - Run complete test suite');
  console.log('• testRole("role") - Get test info for specific role');
  console.log('• showHelp() - Show this help menu');
  console.log('• createAllTestUsers() - Create all test users');
  console.log('• testAllUserLogins() - Test all user logins');
  console.log('• testRoleNavigation() - Show navigation info');
  console.log('• cleanupTestUsers() - Clean up test data');
  console.log('\nAvailable Roles:');
  console.log('• "producer" - Green Hydrogen Producer');
  console.log('• "buyer" - Industry Buyer');
  console.log('• "auditor" - Certification Auditor');
  console.log('• "regulatory" - Regulatory Authority');
  console.log('• "verifier" - Government Verifier');
  console.log('\nExample Usage:');
  console.log('runFullTest() // Run everything');
  console.log('testRole("producer") // Test producer role');
  console.log('console.table(TEST_USERS) // View all test users');
};

// Initialize the script
const initializeQuickTest = async () => {
  console.log('⏳ Waiting for test utilities to load...');
  
  try {
    await waitForTestUtils();
    console.log('✅ Test utilities loaded successfully!');
    
    // Make functions available globally
    window.runFullTest = runFullTest;
    window.testRole = testRole;
    window.showHelp = showHelp;
    
    console.log('\n🎉 Quick Test Script Ready!');
    console.log('Use runFullTest() to start complete testing');
    console.log('Use showHelp() for more options');
    console.log('Use testRole("roleName") for specific role testing');
    
  } catch (error) {
    console.error('❌ Failed to initialize test utilities:', error);
    console.log('💡 Make sure you\'re running this in the HydroChain app with dev server running');
  }
};

// Auto-run initialization
initializeQuickTest();
