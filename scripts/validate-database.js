const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function validateEventTypesTable() {
  console.log('\n🔍 Validating event_types table...');

  try {
    const { data, error } = await supabase
      .from('event_types')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.log('❌ event_types table validation failed:', error.message);
      console.log('   This means the SQL has not been executed yet.');
      return false;
    }

    console.log('✅ event_types table exists and is accessible');
    return true;

  } catch (err) {
    console.log('❌ event_types validation error:', err.message);
    return false;
  }
}

async function validateBookingsEnhancement() {
  console.log('\n🔍 Validating bookings table enhancements...');

  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('id, event_type_id, attendee_name, attendee_email, booking_fields_responses')
      .limit(1);

    if (error) {
      console.log('❌ bookings table validation failed:', error.message);
      return false;
    }

    console.log('✅ bookings table enhanced with Cal.com fields');
    return true;

  } catch (err) {
    console.log('❌ bookings validation error:', err.message);
    return false;
  }
}

async function testBasicOperations() {
  console.log('\n🧪 Testing basic CRUD operations...');

  try {
    // Test insert (will fail due to RLS, but should show proper error)
    const { data, error } = await supabase
      .from('event_types')
      .insert([{
        title: 'Test Event',
        slug: 'test-event',
        user_id: '00000000-0000-0000-0000-000000000000' // fake user ID
      }]);

    if (error && error.message.includes('Row Level Security')) {
      console.log('✅ RLS policies are working (insert blocked without auth)');
    } else if (error) {
      console.log('⚠️ Insert test result:', error.message);
    } else {
      console.log('✅ Insert test passed (table is writable)');
    }

  } catch (err) {
    console.log('❌ CRUD test error:', err.message);
  }
}

async function checkApiEndpoints() {
  console.log('\n🌐 Testing API endpoints...');

  try {
    const response = await fetch('http://localhost:3000/api/event-types', {
      method: 'GET',
    });

    if (response.ok) {
      console.log('✅ API endpoint /api/event-types is accessible');
    } else {
      console.log('⚠️ API endpoint returned status:', response.status);
    }

  } catch (err) {
    console.log('⚠️ API test skipped (server not running):', err.message);
  }
}

async function main() {
  console.log('🚀 Validating Database Migration Results');
  console.log('==========================================');

  const eventTypesOk = await validateEventTypesTable();
  const bookingsOk = await validateBookingsEnhancement();

  if (eventTypesOk && bookingsOk) {
    console.log('\n🎉 DATABASE MIGRATION SUCCESSFUL!');

    await testBasicOperations();
    await checkApiEndpoints();

    console.log('\n📋 Next Steps:');
    console.log('1. ✅ Database schema is ready');
    console.log('2. 🔄 Update TypeScript types to match new schema');
    console.log('3. 🔄 Test application build with: npm run build');
    console.log('4. 🔄 Test API endpoints with: npm run dev');

  } else {
    console.log('\n❌ MIGRATION NOT COMPLETE');
    console.log('Please execute the SQL commands in Supabase Dashboard first.');
  }
}

main();
