-- Create event_types table with Cal.com field structure
CREATE TABLE IF NOT EXISTS public.event_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Core event type fields
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,

  -- Duration and scheduling
  length_in_minutes INTEGER NOT NULL DEFAULT 30,
  length_in_minutes_options INTEGER[] DEFAULT ARRAY[30],
  slot_interval INTEGER DEFAULT NULL, -- NULL means use length_in_minutes

  -- Pricing (store in cents for precision)
  price_cents INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'usd',

  -- Booking constraints
  minimum_booking_notice INTEGER DEFAULT 0, -- minutes
  before_event_buffer INTEGER DEFAULT 0,    -- minutes
  after_event_buffer INTEGER DEFAULT 0,     -- minutes

  -- Guest and confirmation settings
  disable_guests BOOLEAN DEFAULT FALSE,
  requires_confirmation BOOLEAN DEFAULT FALSE,
  is_instant_event BOOLEAN DEFAULT FALSE,

  -- Structured data fields (Cal.com JSON patterns)
  locations JSONB DEFAULT '[]'::jsonb,
  booking_fields JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Scheduling and availability
  schedule_id INTEGER DEFAULT NULL,

  -- Status and visibility
  is_active BOOLEAN DEFAULT TRUE,
  hidden BOOLEAN DEFAULT FALSE,
  position INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  UNIQUE(user_id, slug),
  CHECK(length_in_minutes > 0),
  CHECK(price_cents >= 0),
  CHECK(minimum_booking_notice >= 0),
  CHECK(before_event_buffer >= 0),
  CHECK(after_event_buffer >= 0)
);

-- Enable Row Level Security
ALTER TABLE public.event_types ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own event types"
  ON public.event_types FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own event types"
  ON public.event_types FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own event types"
  ON public.event_types FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own event types"
  ON public.event_types FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_event_types_user_id ON public.event_types(user_id);
CREATE INDEX idx_event_types_slug ON public.event_types(slug);
CREATE INDEX idx_event_types_active ON public.event_types(is_active) WHERE is_active = true;
