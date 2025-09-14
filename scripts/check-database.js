const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  console.log('URL:', supabaseUrl);
  console.log('KEY:', supabaseServiceKey ? 'Present' : 'Missing');
  process.exit(1);
}

console.log('🔗 Connecting to:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function basicConnectionTest() {
  console.log('\n🔍 Testing basic connection...');

  try {
    // Try to get auth user (this should work even with no tables)
    const { data: authData, error: authError } = await supabase.auth.getUser();

    console.log('Auth test result:', authError ? authError.message : 'Connected (no user logged in)');

    // Try to query a system table that should exist
    const { data, error } = await supabase
      .rpc('version'); // This RPC should exist in Supabase

    if (error) {
      console.log('❌ RPC test failed:', error.message);
    } else {
      console.log('✅ RPC connection working');
    }

  } catch (error) {
    console.error('❌ Basic connection failed:', error.message);
  }
}

async function main() {
  console.log('🚀 Database Connection Test');
  await basicConnectionTest();

  console.log('\n📋 Manual Setup Required:');
  console.log('Since we cannot execute SQL programmatically, please:');
  console.log('1. Go to https://supabase.com/dashboard');
  console.log('2. Select your project: scemkehjfqvvjjmeybqq');
  console.log('3. Go to SQL Editor');
  console.log('4. Execute the following SQL:');
  console.log('\n--- COPY THE SQL BELOW ---');
  console.log(`
-- Step 1: Create event_types table
CREATE TABLE IF NOT EXISTS public.event_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
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

-- Step 2: Enable RLS
ALTER TABLE public.event_types ENABLE ROW LEVEL SECURITY;

-- Step 3: Create policies
CREATE POLICY "Users can view their own event types" ON public.event_types FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own event types" ON public.event_types FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own event types" ON public.event_types FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own event types" ON public.event_types FOR DELETE USING (auth.uid() = user_id);

-- Step 4: Create indexes
CREATE INDEX idx_event_types_user_id ON public.event_types(user_id);
CREATE INDEX idx_event_types_slug ON public.event_types(slug);
CREATE INDEX idx_event_types_active ON public.event_types(is_active) WHERE is_active = true;

-- Step 5: Enhance bookings table (if it exists)
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS event_type_id UUID REFERENCES public.event_types(id) ON DELETE SET NULL;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS attendee_name TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS attendee_email TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS attendee_phone TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS booking_fields_responses JSONB DEFAULT '{}'::jsonb;

-- Step 6: Create indexes on bookings
CREATE INDEX IF NOT EXISTS idx_bookings_event_type_id ON public.bookings(event_type_id);
CREATE INDEX IF NOT EXISTS idx_bookings_attendee_email ON public.bookings(attendee_email);
`);

  console.log('\n--- END SQL ---\n');
  console.log('5. After executing, run the TypeScript build to verify it works');
  console.log('6. Test API endpoints to ensure they can access event_types table');
}

main();
