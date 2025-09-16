import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isSlotAvailable } from '@/lib/availability';

// Initialize Supabase with service role for bypassing RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role key for admin access
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function getRateLimitKey(ip: string, slug: string): string {
  return `${ip}:${slug}`;
}

function checkRateLimit(ip: string, slug: string): boolean {
  const key = getRateLimitKey(ip, slug);
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 5; // Max 5 requests per minute per IP+slug

  const current = rateLimitStore.get(key);

  if (!current || now > current.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (current.count >= maxRequests) {
    return false;
  }

  current.count++;
  return true;
}

function validateBookingData(data: any) {
  const errors: string[] = [];

  if (!data.event_type_id) {
    errors.push('Event type ID is required');
  }

  if (!data.start_time) {
    errors.push('Start time is required');
  }

  if (!data.end_time) {
    errors.push('End time is required');
  }

  if (!data.date) {
    errors.push('Date is required');
  }

  if (!data.client_name?.trim()) {
    errors.push('Client name is required');
  }

  if (!data.client_email?.trim()) {
    errors.push('Client email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.client_email)) {
      errors.push('Valid email address is required');
    }
  }

  if (!data.client_phone?.trim()) {
    errors.push('Client phone is required');
  }

  if (!data.slug) {
    errors.push('Event type slug is required');
  }

  return errors;
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown';

    const body = await request.json();
    const {
      event_type_id,
      start_time,
      end_time,
      date,
      client_name,
      client_email,
      client_phone,
      notes,
      timezone,
      slug
    } = body;

    // Validate input data
    const validationErrors = validateBookingData(body);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }

    // Check rate limit
    if (!checkRateLimit(ip, slug)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Get event type and verify it exists and is active
    const { data: eventType, error: eventTypeError } = await supabase
      .from('event_types')
      .select(`
        id,
        slug,
        title,
        duration,
        active,
        user_id,
        users (
          id,
          email,
          full_name
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

    // Verify the event_type_id matches the slug
    if (eventType.id !== event_type_id) {
      return NextResponse.json(
        { error: 'Event type ID mismatch' },
        { status: 400 }
      );
    }

    // Validate start and end times
    const startDate = new Date(start_time);
    const endDate = new Date(end_time);
    const bookingDate = new Date(date);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || isNaN(bookingDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date or time format' },
        { status: 400 }
      );
    }

    // Check if booking is in the past
    if (startDate < new Date()) {
      return NextResponse.json(
        { error: 'Cannot book time slots in the past' },
        { status: 400 }
      );
    }

    // Verify slot duration matches event type
    const durationMs = endDate.getTime() - startDate.getTime();
    const expectedDurationMs = (eventType.duration || 30) * 60 * 1000;

    if (Math.abs(durationMs - expectedDurationMs) > 60000) { // Allow 1 minute tolerance
      return NextResponse.json(
        { error: 'Booking duration does not match event type duration' },
        { status: 400 }
      );
    }

    // Check if the slot is available
    const isAvailable = await isSlotAvailable(
      startDate,
      endDate,
      event_type_id,
      eventType.user_id
    );

    if (!isAvailable) {
      return NextResponse.json(
        { error: 'Selected time slot is no longer available' },
        { status: 409 }
      );
    }

    // Create the booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        event_type_id,
        user_id: eventType.user_id,
        start_time: start_time,
        end_time: end_time,
        date: date,
        client_name: client_name.trim(),
        client_email: client_email.trim().toLowerCase(),
        client_phone: client_phone.trim(),
        notes: notes?.trim() || '',
        timezone: timezone || 'America/New_York',
        status: 'confirmed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (bookingError) {
      console.error('Booking creation error:', bookingError);

      // Handle specific database errors
      if (bookingError.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: 'This time slot was just booked by someone else. Please select a different time.' },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to create booking. Please try again.' },
        { status: 500 }
      );
    }

    // Send confirmation email (in a real app, you'd use a proper email service)
    // For now, we'll just log it
    console.log('Booking confirmation email should be sent to:', client_email);
    console.log('Booking details:', {
      id: booking.id,
      eventType: eventType.title,
      date: date,
      time: `${start_time} - ${end_time}`,
      client: client_name,
      timezone
    });

    // Return success response
    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        event_type: eventType.title,
        date: date,
        start_time: start_time,
        end_time: end_time,
        client_name: client_name,
        client_email: client_email,
        timezone: timezone
      }
    });

  } catch (error) {
    console.error('Public booking API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS if needed
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
