const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration in .env file');
  console.log('Please add:');
  console.log('REACT_APP_SUPABASE_URL=your_url');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Simple test users
const testUsers = [
  {
    email: 'producer@hydrochain.com',
    password: 'TestPassword123!',
    role: 'producer'
  },
  {
    email: 'buyer@hydrochain.com', 
    password: 'TestPassword123!',
    role: 'buyer'
  },
  {
    email: 'auditor@hydrochain.com',
    password: 'TestPassword123!',
    role: 'auditor'
  }
];

async function generateSimpleTestData() {
  console.log('🎯 Generating simple test data for hackathon...');

  try {
    const createdUsers = [];

    // Create test users
    console.log('\n👥 Creating test users...');
    for (const userData of testUsers) {
      // Create user
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true
      });

      if (authError) {
        console.log(`⚠️ User ${userData.email} might already exist:`, authError.message);
        continue;
      }

      // Set user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({ role: userData.role })
        .eq('user_id', authUser.user.id);

      if (roleError) {
        console.error(`Failed to set role for ${userData.email}:`, roleError.message);
      }

      createdUsers.push({
        ...authUser.user,
        role: userData.role
      });

      console.log(`✅ Created user: ${userData.email} (${userData.role})`);
    }

    // Create some sample credits for the producer
    console.log('\n💚 Creating sample credits...');
    const producerUser = createdUsers.find(u => u.role === 'producer');
    
    if (producerUser) {
      const sampleCredits = [
        { volume: 1000.0, description: 'Solar-powered electrolysis production' },
        { volume: 750.5, description: 'Wind-powered hydrogen generation' },
        { volume: 500.25, description: 'Hydroelectric facility production' }
      ];

      for (let i = 0; i < sampleCredits.length; i++) {
        const creditData = sampleCredits[i];
        
        const { data: credit, error } = await supabase
          .from('credits')
          .insert({
            user_id: producerUser.id,
            token_id: `GHC_${Date.now()}_${i}`,
            volume: creditData.volume,
            status: 'issued',
            blockchain_tx_hash: `0x${Math.random().toString(16).substring(2, 66)}`,
            metadata: {
              description: creditData.description,
              issuedAt: new Date().toISOString(),
              producer: producerUser.email
            }
          })
          .select()
          .single();

        if (error) {
          console.error('Failed to create credit:', error.message);
        } else {
          console.log(`✅ Created credit: ${credit.volume}kg - ${credit.metadata.description}`);

          // Log transaction
          await supabase.from('transactions').insert({
            credit_id: credit.id,
            from_user: null,
            to_user: producerUser.id,
            type: 'issue',
            volume: credit.volume,
            tx_hash: credit.blockchain_tx_hash
          });
        }
      }
    }

    console.log('\n🎉 Simple test data generation completed!');
    console.log('\n📊 Summary:');
    console.log(`👥 Users created: ${createdUsers.length}`);
    console.log(`💚 Sample credits: 3`);
    
    console.log('\n🔑 Test Login Credentials:');
    for (const user of testUsers) {
      console.log(`${user.role}: ${user.email} | Password: ${user.password}`);
    }

    console.log('\n✨ You can now test the system!');
    console.log('1. Run: npm start');
    console.log('2. Login with any of the test accounts above');
    console.log('3. Test issuing, transferring, and retiring credits');

  } catch (error) {
    console.error('❌ Error generating test data:', error.message);
    process.exit(1);
  }
}

generateSimpleTestData();
