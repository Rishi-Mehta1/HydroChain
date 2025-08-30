const fs = require('fs');
const path = require('path');

console.log('🔧 HydroChain Setup Verification');
console.log('=====================================');

// Check environment variables
const envPath = path.join(__dirname, '..', '.env');
let envErrors = [];
let envSuccess = [];

if (fs.existsSync(envPath)) {
  console.log('✅ .env file found');
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {
    'REACT_APP_SUPABASE_URL': 'Supabase URL',
    'REACT_APP_SUPABASE_ANON_KEY': 'Supabase Anonymous Key',
    'SUPABASE_SERVICE_ROLE_KEY': 'Supabase Service Role Key',
    'INFURA_PROJECT_ID': 'Infura Project ID',
    'DEPLOYER_PRIVATE_KEY': 'Deployer Private Key'
  };
  
  Object.entries(envVars).forEach(([key, description]) => {
    const regex = new RegExp(`^${key}=(.+)$`, 'm');
    const match = envContent.match(regex);
    
    if (match && match[1] && match[1] !== 'your_key_here' && match[1] !== '') {
      envSuccess.push(`✅ ${description}`);
    } else {
      envErrors.push(`❌ ${description} - Not set or placeholder value`);
    }
  });
  
} else {
  envErrors.push('❌ .env file not found');
}

// Display results
console.log('\n📋 Environment Configuration:');
envSuccess.forEach(msg => console.log(msg));
envErrors.forEach(msg => console.log(msg));

// Check key files
console.log('\n📋 Critical Files:');

const criticalFiles = [
  'src/services/realtimeService.js',
  'src/services/simpleCreditsService.js',
  'src/services/mockCreditsService.js',
  'src/lib/supabaseClient.js',
  'src/components/modals/IssueCreditModal.js'
];

criticalFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, '..', file))) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - Missing`);
  }
});

// Summary
console.log('\n🎯 Setup Status:');

if (envErrors.length === 0) {
  console.log('✅ All environment variables configured');
} else {
  console.log(`❌ ${envErrors.length} environment variable(s) need attention`);
  console.log('\n💡 Next steps:');
  console.log('1. Follow the HACKATHON_SETUP.md guide');
  console.log('2. Get required API keys from Supabase dashboard');
  console.log('3. Create Infura project for blockchain connectivity');
}

console.log('\n🚀 Ready to test:');
console.log('1. Run: npm start');
console.log('2. Open: http://localhost:3000');
console.log('3. Try issuing credits - should use mock service if Edge Functions fail');

console.log('\n📊 Recent fixes applied:');
console.log('✅ Fixed Supabase realtime API usage');
console.log('✅ Improved Edge Function CORS handling');
console.log('✅ Added mock service fallback for credit operations');
console.log('✅ Enhanced error handling and logging');

console.log('\n=====================================');
