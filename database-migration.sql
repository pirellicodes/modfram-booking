-- Database migration for Session Types and Bookings Runtime fixes
-- Run this SQL in your Supabase SQL editor

-- Unique slug per user constraint
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname='event_types_user_slug_key'
  ) THEN
    CREATE UNIQUE INDEX event_types_user_slug_key ON public.event_types (user_id, slug);
  END IF;
END $$;

-- Enable RLS on event_types if not already enabled
ALTER TABLE public.event_types ENABLE ROW LEVEL SECURITY;

-- RLS policies for event_types
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE polname='event_types_select_own') THEN
    CREATE POLICY event_types_select_own ON public.event_types
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE polname='event_types_insert_own') THEN
    CREATE POLICY event_types_insert_own ON public.event_types
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE polname='event_types_update_own') THEN
    CREATE POLICY event_types_update_own ON public.event_types
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE polname='event_types_delete_own') THEN
    CREATE POLICY event_types_delete_own ON public.event_types
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Enable RLS on bookings if not already enabled
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- RLS policies for bookings
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE polname='bookings_select_own') THEN
    CREATE POLICY bookings_select_own ON public.bookings
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE polname='bookings_insert_own') THEN
    CREATE POLICY bookings_insert_own ON public.bookings
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE polname='bookings_update_own') THEN
    CREATE POLICY bookings_update_own ON public.bookings
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE polname='bookings_delete_own') THEN
    CREATE POLICY bookings_delete_own ON public.bookings
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Ensure client_name is not null in bookings table (if column exists)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='bookings' AND column_name='client_name'
  ) THEN
    ALTER TABLE public.bookings ALTER COLUMN client_name SET NOT NULL;
  END IF;
EXCEPTION
  WHEN others THEN
    -- Column might not exist or already has constraint
    NULL;
END $$;
