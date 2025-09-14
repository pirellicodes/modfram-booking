const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createEventTypesTable() {
  console.log('\n🔄 Creating event_types table...');

  try {
    // First check if table already exists
    const { data: existing, error: checkError } = await supabase
      .from('event_types')
      .select('id')
      .limit(1);

    if (!checkError) {
      console.log('✅ event_types table already exists');
      return;
    }

    console.log('Table does not exist, attempting to create via API calls...');

    // Since we can't execute raw SQL, let's try to create using the REST API
    // This is a workaround - in production you'd use Supabase dashboard or CLI

    console.log('❌ Cannot create tables via Supabase client API');
    console.log('📋 Please execute this SQL manually in Supabase Dashboard:');
    console.log(`
CREATE TABLE IF NOT EXISTS public.event_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  length_in_minutes INTEGER NOT NULL DEFAULT 30,
  length_in_minutes_options INTEGER[] DEFAULT ARRAY[30],
  slot_interval INTEGER DEFAULT NULL,
  price_cents INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'usd',
  minimum_booking_notice INTEGER DEFAULT 0,
  before_event_buffer INTEGER DEFAULT 0,
  after_event_buffer INTEGER DEFAULT 0,
  disable_guests BOOLEAN DEFAULT FALSE,
  requires_confirmation BOOLEAN DEFAULT FALSE,
  is_instant_event BOOLEAN DEFAULT FALSE,
  locations JSONB DEFAULT '[]'::jsonb,
  booking_fields JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  schedule_id INTEGER DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  hidden BOOLEAN DEFAULT FALSE,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, slug),
  CHECK(length_in_minutes > 0),
  CHECK(price_cents >= 0)
);

ALTER TABLE public.event_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own event types" ON public.event_types FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own event types" ON public.event_types FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own event types" ON public.event_types FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own event types" ON public.event_types FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_event_types_user_id ON public.event_types(user_id);
CREATE INDEX idx_event_types_slug ON public.event_types(slug);
CREATE INDEX idx_event_types_active ON public.event_types(is_active) WHERE is_active = true;
`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function validateConnection() {
  console.log('🔍 Testing Supabase connection...');

  try {
    const { data, error } = await supabase
      .from('clients')
      .select('id')
      .limit(1);

    if (error) {
      console.error('❌ Connection failed:', error.message);
      return false;
    }

    console.log('✅ Supabase connection successful');
    return true;

  } catch (error) {
    console.error('❌ Connection error:', error.message);
    return false;
  }
}

async function checkExistingTables() {
  console.log('\n🔍 Checking existing tables...');

  const tables = ['clients', 'events', 'bookings', 'payments', 'availability', 'user_integrations'];

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: exists (${data?.length || 0} records)`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
    }
  }

  // Check for event_types specifically
  try {
    const { data, error } = await supabase
      .from('event_types')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.log(`❌ event_types: ${error.message} (THIS IS THE MISSING TABLE)`);
    } else {
      console.log(`✅ event_types: exists`);
    }
  } catch (err) {
    console.log(`❌ event_types: ${err.message} (THIS IS THE MISSING TABLE)`);
  }
}

async function main() {
  console.log('🚀 Starting database analysis...');

  const connected = await validateConnection();
  if (!connected) {
    process.exit(1);
  }

  await checkExistingTables();
  await createEventTypesTable();

  console.log('\n📋 Next Steps:');
  console.log('1. Go to your Supabase Dashboard: https://supabase.com/dashboard');
  console.log('2. Navigate to SQL Editor');
  console.log('3. Copy and paste the SQL shown above');
  console.log('4. Execute the SQL to create the missing event_types table');
  console.log('5. Re-run this script to validate the creation');
}

main();
