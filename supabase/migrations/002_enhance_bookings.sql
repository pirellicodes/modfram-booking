-- Enhance existing bookings table with Cal.com fields
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS event_type_id UUID REFERENCES public.event_types(id) ON DELETE SET NULL;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS attendee_name TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS attendee_email TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS attendee_phone TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS booking_fields_responses JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS meeting_url TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS meeting_password TEXT;

-- Update status enum to match Cal.com patterns
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_status_check
  CHECK (status IN ('pending', 'confirmed', 'cancelled', 'rescheduled', 'no_show'));

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_bookings_event_type_id ON public.bookings(event_type_id);
CREATE INDEX IF NOT EXISTS idx_bookings_attendee_email ON public.bookings(attendee_email);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
