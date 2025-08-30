const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Sample data
const sampleFacilities = [
  {
    name: 'SolarHydrogen Plant Alpha',
    location: 'California, USA',
    capacity_mw: 50.5,
    renewable_sources: ['solar', 'wind'],
    certification_status: 'certified',
    certifying_body: 'Green Energy Certification Authority',
    operational_since: '2022-01-15'
  },
  {
    name: 'WindPower H2 Facility',
    location: 'Texas, USA', 
    capacity_mw: 75.2,
    renewable_sources: ['wind'],
    certification_status: 'certified',
    certifying_body: 'Renewable Energy Institute',
    operational_since: '2021-08-20'
  },
  {
    name: 'Hydro-Electric Hydrogen Hub',
    location: 'Oregon, USA',
    capacity_mw: 120.0,
    renewable_sources: ['hydro', 'solar'],
    certification_status: 'pending',
    operational_since: '2023-03-10'
  },
  {
    name: 'Green Valley H2 Production',
    location: 'Nevada, USA',
    capacity_mw: 95.8,
    renewable_sources: ['solar', 'geothermal'],
    certification_status: 'certified',
    certifying_body: 'International Green Standards',
    operational_since: '2022-11-05'
  }
];

const sampleCredits = [
  {
    volume: 1000.0,
    production_method: 'electrolysis',
    renewable_source: 'solar',
    status: 'issued',
    verification_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
  },
  {
    volume: 750.5,
    production_method: 'electrolysis',
    renewable_source: 'wind',
    status: 'verified',
    verification_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
    expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
  },
  {
    volume: 500.25,
    production_method: 'biogas_reforming',
    renewable_source: 'biomass',
    status: 'pending',
    expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
  },
  {
    volume: 2000.0,
    production_method: 'electrolysis',
    renewable_source: 'hydro',
    status: 'issued',
    verification_date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
    expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
  }
];

const sampleIoTData = [
  {
    device_id: 'SOLAR_METER_001',
    data_type: 'energy_input',
    value: 45.7,
    unit: 'MWh',
    quality_score: 0.98
  },
  {
    device_id: 'H2_SENSOR_001',
    data_type: 'hydrogen_output',
    value: 850.3,
    unit: 'kg',
    quality_score: 0.95
  },
  {
    device_id: 'TEMP_SENSOR_001',
    data_type: 'temperature',
    value: 65.2,
    unit: 'celsius',
    quality_score: 1.0
  },
  {
    device_id: 'PRESSURE_001',
    data_type: 'pressure',
    value: 15.8,
    unit: 'bar',
    quality_score: 0.97
  },
  {
    device_id: 'PURITY_ANALYZER_001',
    data_type: 'purity',
    value: 99.95,
    unit: 'percent',
    quality_score: 0.99
  }
];

const sampleUsers = [
  {
    email: 'producer1@hydrochain.com',
    password: 'TestPassword123!',
    role: 'producer',
    profile: {
      company: 'GreenTech Solutions',
      location: 'California, USA',
      certification: 'ISO 14001'
    }
  },
  {
    email: 'buyer1@hydrochain.com', 
    password: 'TestPassword123!',
    role: 'buyer',
    profile: {
      company: 'Steel Manufacturing Corp',
      location: 'Texas, USA',
      industry: 'Steel Production'
    }
  },
  {
    email: 'auditor1@hydrochain.com',
    password: 'TestPassword123!',
    role: 'auditor',
    profile: {
      company: 'Green Certification Authority',
      location: 'New York, USA',
      certifications: ['ISO 14064', 'GHG Protocol']
    }
  }
];

async function generateTestData() {
  console.log('🎯 Starting test data generation...');

  try {
    // Create test users
    console.log('\n👥 Creating test users...');
    const createdUsers = [];

    for (const userData of sampleUsers) {
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true
      });

      if (authError) {
        console.error(`Failed to create user ${userData.email}:`, authError);
        continue;
      }

      // Update user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({ role: userData.role })
        .eq('user_id', authUser.user.id);

      if (roleError) {
        console.error(`Failed to set role for ${userData.email}:`, roleError);
      }

      createdUsers.push({
        ...authUser.user,
        role: userData.role,
        profile: userData.profile
      });

      console.log(`✅ Created user: ${userData.email} (${userData.role})`);
    }

    // Create production facilities (assign to producer users)
    console.log('\n🏭 Creating production facilities...');
    const createdFacilities = [];
    const producerUsers = createdUsers.filter(u => u.role === 'producer');

    for (let i = 0; i < sampleFacilities.length; i++) {
      const facilityData = sampleFacilities[i];
      const assignedUser = producerUsers[i % producerUsers.length];

      const { data: facility, error } = await supabase
        .from('production_facilities')
        .insert({
          ...facilityData,
          user_id: assignedUser.id,
          certification_date: facilityData.certification_status === 'certified' 
            ? new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // 90 days ago
            : null,
          metadata: {
            automation_level: 'high',
            certifications: ['ISO 50001', 'OHSAS 18001'],
            environmental_impact: 'minimal'
          }
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to create facility:', error);
      } else {
        createdFacilities.push(facility);
        console.log(`✅ Created facility: ${facility.name}`);
      }
    }

    // Create credits for facilities
    console.log('\n💚 Creating hydrogen credits...');
    const createdCredits = [];

    for (let i = 0; i < sampleCredits.length; i++) {
      const creditData = sampleCredits[i];
      const facility = createdFacilities[i % createdFacilities.length];

      const { data: credit, error } = await supabase
        .from('credits')
        .insert({
          ...creditData,
          user_id: facility.user_id,
          production_facility_id: facility.id,
          token_id: `HC_${facility.id}_${Date.now()}_${i}`,
          blockchain_tx_hash: `0x${Math.random().toString(16).substring(2, 66)}`,
          metadata: {
            batch_number: `BATCH_${Date.now()}_${i}`,
            quality_score: 0.98,
            verification_documents: ['production_log.pdf', 'energy_audit.pdf'],
            renewable_percentage: 100
          }
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to create credit:', error);
      } else {
        createdCredits.push(credit);
        console.log(`✅ Created credit: ${credit.volume}kg ${credit.renewable_source} hydrogen`);
      }
    }

    // Generate IoT data for facilities
    console.log('\n📊 Generating IoT data...');
    for (const facility of createdFacilities) {
      for (const iotEntry of sampleIoTData) {
        // Generate data for the last 30 days
        for (let day = 0; day < 30; day++) {
          const timestamp = new Date(Date.now() - day * 24 * 60 * 60 * 1000);
          
          const { error } = await supabase
            .from('iot_data')
            .insert({
              facility_id: facility.id,
              device_id: `${facility.id}_${iotEntry.device_id}`,
              data_type: iotEntry.data_type,
              value: iotEntry.value + (Math.random() - 0.5) * iotEntry.value * 0.1, // Add some variance
              unit: iotEntry.unit,
              quality_score: iotEntry.quality_score,
              timestamp: timestamp.toISOString(),
              metadata: {
                sensor_status: 'active',
                calibration_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
              }
            });

          if (error) {
            console.error('Failed to create IoT data:', error);
            break;
          }
        }
      }
      console.log(`✅ Generated IoT data for facility: ${facility.name}`);
    }

    // Create some sample transactions
    console.log('\n💸 Creating sample transactions...');
    for (let i = 0; i < Math.min(createdCredits.length, 3); i++) {
      const credit = createdCredits[i];
      const { error } = await supabase
        .from('transactions')
        .insert({
          credit_id: credit.id,
          from_user_id: null, // Mint transaction
          to_user_id: credit.user_id,
          transaction_type: 'mint',
          volume: credit.volume,
          blockchain_tx_hash: `0x${Math.random().toString(16).substring(2, 66)}`,
          block_number: Math.floor(Math.random() * 1000000) + 17000000,
          gas_used: Math.floor(Math.random() * 100000) + 21000,
          gas_price: '20000000000',
          status: 'confirmed',
          metadata: {
            facility_name: createdFacilities.find(f => f.id === credit.production_facility_id)?.name
          }
        });

      if (error) {
        console.error('Failed to create transaction:', error);
      }
    }

    // Create verification requests
    console.log('\n🔍 Creating verification requests...');
    const auditorUsers = createdUsers.filter(u => u.role === 'auditor');
    
    for (let i = 0; i < Math.min(createdCredits.length, 2); i++) {
      const credit = createdCredits[i];
      const auditor = auditorUsers[i % auditorUsers.length];

      const { error } = await supabase
        .from('verification_requests')
        .insert({
          credit_id: credit.id,
          requester_id: credit.user_id,
          auditor_id: credit.status === 'verified' ? auditor.id : null,
          request_type: 'initial_verification',
          status: credit.status === 'verified' ? 'completed' : 'pending',
          priority: i === 0 ? 'high' : 'normal',
          documents: [
            'production_certificate.pdf',
            'renewable_energy_proof.pdf',
            'facility_inspection_report.pdf'
          ],
          verification_data: {
            production_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            energy_source_verified: true,
            quality_tests_passed: true,
            compliance_score: 95
          },
          requested_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          completed_at: credit.status === 'verified' 
            ? new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() 
            : null,
          decision: credit.status === 'verified' ? 'approved' : null
        });

      if (error) {
        console.error('Failed to create verification request:', error);
      }
    }

    console.log('\n🎉 Test data generation completed successfully!');
    console.log('\nSummary:');
    console.log(`👥 Users created: ${createdUsers.length}`);
    console.log(`🏭 Facilities created: ${createdFacilities.length}`);
    console.log(`💚 Credits created: ${createdCredits.length}`);
    console.log(`📊 IoT data points: ${createdFacilities.length * sampleIoTData.length * 30}`);
    
    console.log('\n🔑 Test Accounts:');
    for (const user of createdUsers) {
      console.log(`${user.role}: ${user.email} | Password: TestPassword123!`);
    }

    console.log('\n✨ You can now test the full system with realistic data!');

  } catch (error) {
    console.error('❌ Error generating test data:', error);
    process.exit(1);
  }
}

// Run the script
generateTestData();
