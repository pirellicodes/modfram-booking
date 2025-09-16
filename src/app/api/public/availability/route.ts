import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with service role for reading availability
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

// Rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 30; // Max 30 requests per minute per IP

  const current = rateLimitStore.get(ip);

  if (!current || now > current.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (current.count >= maxRequests) {
    return false;
  }

  current.count++;
  return true;
}

function generateSlotsForPeriod(
  date: Date,
  startTime: string,
  endTime: string,
  duration: number,
  bookedSlots: { start_time: string; end_time: string }[]
): TimeSlot[] {
  const slots: TimeSlot[] = [];

  // Parse start and end times
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  // Create start and end datetime objects
  const periodStart = new Date(date);
  periodStart.setHours(startHour, startMinute, 0, 0);

  const periodEnd = new Date(date);
  periodEnd.setHours(endHour, endMinute, 0, 0);

  // Generate slots every 15 minutes for better granularity
  let current = new Date(periodStart);

  while (current < periodEnd) {
    const slotEnd = new Date(current.getTime() + duration * 60000);

    // Check if this slot would extend beyond the availability period
    if (slotEnd > periodEnd) {
      break;
    }

    // Check if this slot conflicts with existing bookings
    const isBooked = bookedSlots.some(booking => {
      const bookingStart = new Date(`${date.toISOString().split('T')[0]}T${booking.start_time}`);
      const bookingEnd = new Date(`${date.toISOString().split('T')[0]}T${booking.end_time}`);

      // Check for overlap
      return (current < bookingEnd && slotEnd > bookingStart);
    });

    slots.push({
      start: current.toISOString(),
      end: slotEnd.toISOString(),
      available: !isBooked
    });

    // Move to next slot (15-minute intervals)
    current = new Date(current.getTime() + 15 * 60000);
  }

  return slots;
}

export async function GET(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown';

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const date = searchParams.get('date');
    const timezone = searchParams.get('timezone') || 'America/New_York';

    if (!slug || !date) {
      return NextResponse.json(
        { error: 'Missing required parameters: slug and date' },
        { status: 400 }
      );
    }

    // Validate date format
    const requestedDate = new Date(date);
    if (isNaN(requestedDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    // Don't allow past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (requestedDate < today) {
      return NextResponse.json({ slots: [] });
    }

    // Get event type
    const { data: eventType, error: eventTypeError } = await supabase
      .from('event_types')
      .select(`
        id,
        slug,
        duration,
        active,
        user_id,
        users (
          id,
          email
        )
      `)
      .eq('slug', slug)
      .eq('active', true)
      .single();

    if (eventTypeError || !eventType) {
      return NextResponse.json(
        { error: 'Event type not found or inactive' },
        { status: 404 }
      );
    }

    // Get availability for this day of week
    const dayOfWeek = requestedDate.getDay();
    const { data: availability } = await supabase
      .from('availability')
      .select('*')
      .eq('user_id', eventType.user_id)
      .eq('day_of_week', dayOfWeek);

    if (!availability || availability.length === 0) {
      return NextResponse.json({ slots: [] });
    }

    // Get existing bookings for this date
    const dateStr = requestedDate.toISOString().split('T')[0];
    const { data: bookings } = await supabase
      .from('bookings')
      .select('start_time, end_time')
      .eq('date', dateStr)
      .eq('status', 'confirmed');

    // Generate slots for each availability period
    let allSlots: TimeSlot[] = [];

    for (const avail of availability) {
      const periodSlots = generateSlotsForPeriod(
        requestedDate,
        avail.start_time,
        avail.end_time,
        eventType.duration || 30,
        bookings || []
      );
      allSlots.push(...periodSlots);
    }

    // Sort slots by start time
    allSlots.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    // Filter out past slots for today
    const now = new Date();
    const isToday = requestedDate.toDateString() === now.toDateString();

    if (isToday) {
      allSlots = allSlots.filter(slot => new Date(slot.start) > now);
    }

    // Only return available slots to reduce payload
    const availableSlots = allSlots.filter(slot => slot.available);

    return NextResponse.json({
      slots: availableSlots,
      date: dateStr,
      timezone: timezone,
      eventType: {
        id: eventType.id,
        slug: eventType.slug,
        duration: eventType.duration
      }
    });

  } catch (error) {
    console.error('Public availability API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
