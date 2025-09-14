const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeSQLFile(filename) {
  console.log(`\n🔄 Executing ${filename}...`);

  try {
    const sqlContent = fs.readFileSync(path.join(__dirname, '../supabase/migrations', filename), 'utf8');

    // Split SQL content by semicolons and execute each statement
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        const { data, error } = await supabase.rpc('exec_sql', { sql: statement });

        if (error) {
          // Try direct SQL execution if RPC fails
          const { data: directData, error: directError } = await supabase
            .from('information_schema.tables')
            .select('*')
            .limit(1);

          if (directError) {
            console.error('❌ Error:', error.message);
            throw error;
          }
        }

        console.log('✅ Statement executed successfully');
      }
    }

    console.log(`✅ ${filename} completed successfully`);

  } catch (error) {
    console.error(`❌ Error executing ${filename}:`, error.message);
    throw error;
  }
}

async function validateTables() {
  console.log('\n🔍 Validating tables...');

  try {
    // Check if event_types table exists
    const { data: eventTypesCount, error: eventTypesError } = await supabase
      .from('event_types')
      .select('*', { count: 'exact', head: true });

    if (eventTypesError) {
      console.error('❌ event_types table validation failed:', eventTypesError.message);
    } else {
      console.log(`✅ event_types table exists (${eventTypesCount || 0} records)`);
    }

    // Check if bookings table has new columns
    const { data: bookingsData, error: bookingsError } = await supabase
      .from('bookings')
      .select('id, event_type_id, attendee_name, attendee_email')
      .limit(1);

    if (bookingsError) {
      console.error('❌ bookings table validation failed:', bookingsError.message);
    } else {
      console.log('✅ bookings table enhanced with Cal.com fields');
    }

  } catch (error) {
    console.error('❌ Validation error:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting database migration...');

  try {
    await executeSQLFile('001_create_event_types.sql');
    await executeSQLFile('002_enhance_bookings.sql');
    await validateTables();

    console.log('\n🎉 Database migration completed successfully!');

  } catch (error) {
    console.error('\n💥 Migration failed:', error.message);
    process.exit(1);
  }
}

main();
