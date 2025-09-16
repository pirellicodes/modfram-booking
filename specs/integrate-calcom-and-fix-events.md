# Cal.com Embed Booking + Admin Sync, and Fix Event Type "Title" Bug

## Problem Statement

**Issue 1: Event Type Title Bug**
- The "Event Title" field in the Create Event Type modal doesn't persist when saving
- Form submission calls the API but the `title` field isn't properly wired to the create logic
- Current implementation in `EventTypeForm.tsx` collects the title but API may not be handling it correctly

**Issue 2: Cal.com Integration Needed**
- Need a public booking page that embeds Cal.com for client bookings
- Cal.com bookings should sync into Supabase `bookings` table to appear in Admin
- Admin should show both manual bookings and Cal.com-created bookings
- "New Booking" button should open a dialog for manual booking creation

**Issue 3: Manual Booking Creation**
- Current "New Booking" button doesn't have functionality
- Need a dialog component for creating manual bookings
- Should integrate with existing booking management system

## Solution Overview

**A) Fix Event Type Creation Flow**
1. Ensure `title`, `slug`, and new `calcom_link` field save properly to `event_types` table
2. Verify API endpoint properly handles form data submission
3. Add `calcom_link` field to form for Cal.com integration

**B) Public Booking Page**
1. Create Next.js route `/schedule/[slug]` that embeds Cal.com
2. Use `@calcom/embed-react` to render Cal.com booking widget
3. Fetch event type by slug and use `calcom_link` for embed

**C) Webhook Integration** 
1. Create `/api/webhooks/calcom` endpoint to receive Cal.com events
2. Verify webhook signatures for security
3. Upsert booking data to Supabase with Cal.com IDs for deduplication

**D) Admin Integration**
1. Bookings list automatically shows Cal.com bookings (same table)
2. Add manual booking creation dialog
3. Ensure consistent data format between manual and Cal.com bookings

## Technical Requirements

### Package Dependencies
```bash
npm install @calcom/embed-react
```

### Environment Variables
```bash
# Add to .env.local
CALCOM_WEBHOOK_SECRET=your_webhook_secret_from_calcom
NEXT_PUBLIC_CAL_THEME=dark  # optional, defaults to dark
```

### Database Schema Changes

**SQL Scripts to Execute:**

```sql
-- Add calcom_link to event_types table
ALTER TABLE public.event_types 
ADD COLUMN calcom_link text;

-- Add Cal.com fields to bookings table
ALTER TABLE public.bookings 
ADD COLUMN calcom_event_id text UNIQUE,
ADD COLUMN calcom_payload jsonb DEFAULT '{}'::jsonb;

-- Add helpful indexes
CREATE INDEX IF NOT EXISTS idx_bookings_user_start ON public.bookings(user_id, start);
CREATE INDEX IF NOT EXISTS idx_bookings_calcom_event_id ON public.bookings(calcom_event_id) WHERE calcom_event_id IS NOT NULL;

-- Verify bookings table has required columns (should already exist)
-- id, user_id, client_id, start, "end", status, notes, created_at
```

## Implementation Details

### 1. Fix Event Type Create Modal

**Files to Modify:**

**`src/components/event-types/EventTypeBasicForm.tsx`**
- Add `calcom_link` field to the basic form
- Should be optional text input with placeholder like "username/30min"
- Add validation to ensure proper format

```tsx
<div>
  <Label htmlFor="calcom_link">Cal.com Link (Optional)</Label>
  <Input
    id="calcom_link"
    value={formData.calcom_link || ""}
    onChange={(e) => updateField("calcom_link", e.target.value)}
    placeholder="username/30min"
  />
  <p className="text-sm text-muted-foreground mt-1">
    Your Cal.com booking link (e.g., "username/30min")
  </p>
</div>
```

**`src/types/forms.ts`**
- Add `calcom_link?: string` to `EventTypeFormData` interface

**`src/app/api/event-types/route.ts`**
- Ensure `calcom_link` is included in the insert operation
- Verify `title` field is properly handled in POST request

### 2. Public Booking Page + Cal.com Embed

**Create: `src/app/(public)/schedule/[slug]/page.tsx`**

```tsx
import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase-server';
import CalEmbed from './cal-embed';

interface PageProps {
  params: { slug: string };
}

export default async function SchedulePage({ params }: PageProps) {
  const supabase = await supabaseServer();
  
  // Fetch event type by slug (public, no auth required)
  const { data: eventType, error } = await supabase
    .from('event_types')
    .select('id, title, description, calcom_link, length')
    .eq('slug', params.slug)
    .eq('hidden', false)
    .single();

  if (error || !eventType) {
    notFound();
  }

  if (!eventType.calcom_link) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{eventType.title}</h1>
          <p className="text-muted-foreground">
            This event type is not available for booking at this time.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">{eventType.title}</h1>
            {eventType.description && (
              <p className="text-muted-foreground">{eventType.description}</p>
            )}
          </div>
          <CalEmbed calLink={eventType.calcom_link} />
        </div>
      </div>
    </div>
  );
}
```

**Create: `src/app/(public)/schedule/[slug]/cal-embed.tsx`**

```tsx
"use client";

import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";

interface CalEmbedProps {
  calLink: string;
}

export default function CalEmbed({ calLink }: CalEmbedProps) {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi();
      cal("ui", { 
        theme: process.env.NEXT_PUBLIC_CAL_THEME || "dark",
        hideEventTypeDetails: false,
        layout: "month_view"
      });
    })();
  }, []);

  return (
    <div className="w-full">
      <Cal 
        calLink={calLink}
        style={{ width: "100%", height: "100%", overflow: "scroll" }}
        config={{
          layout: "month_view",
          theme: process.env.NEXT_PUBLIC_CAL_THEME || "dark"
        }}
      />
    </div>
  );
}
```

### 3. Webhook Integration

**Create: `src/app/api/webhooks/calcom/route.ts`**

```tsx
import { NextRequest, NextResponse } from 'next/server';
import { createHash, timingSafeEqual } from 'crypto';
import { supabaseServer } from '@/lib/supabase-server';

function verifySignature(body: string, signature: string, secret: string): boolean {
  const expectedSignature = createHash('sha256')
    .update(body, 'utf8')
    .digest('hex');
  
  const received = signature.replace('sha256=', '');
  
  return timingSafeEqual(
    Buffer.from(expectedSignature, 'hex'),
    Buffer.from(received, 'hex')
  );
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-cal-signature-256');
    const webhookSecret = process.env.CALCOM_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('CALCOM_WEBHOOK_SECRET not configured');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const body = await request.text();
    
    // Verify signature
    if (!verifySignature(body, signature, webhookSecret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(body);
    
    // Extract booking data safely
    const {
      eventId,
      uid,
      startTime,
      endTime,
      title,
      status,
      attendees = [],
      eventType = {}
    } = payload;

    if (!uid || !startTime || !endTime) {
      console.error('Missing required fields in webhook payload:', { uid, startTime, endTime });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get first attendee info
    const attendee = attendees[0] || {};
    const { name, email, phoneNumber } = attendee;

    // Map Cal.com status to our status
    const bookingStatus = ['confirmed', 'accepted'].includes(status?.toLowerCase()) 
      ? 'confirmed' 
      : 'pending';

    // Try to resolve user_id from event type slug or calcom_link
    const supabase = await supabaseServer();
    let userId = null;

    if (eventType.slug) {
      const { data: eventTypeData } = await supabase
        .from('event_types')
        .select('user_id')
        .eq('slug', eventType.slug)
        .single();
      
      userId = eventTypeData?.user_id;
    }

    // If no user found, you might want to use a default user or skip
    if (!userId) {
      console.warn('Could not resolve user_id for Cal.com booking:', eventType);
      // You could set a default user ID here or return an error
      return NextResponse.json({ error: 'Could not resolve user' }, { status: 400 });
    }

    // Create or find client
    let clientId = null;
    if (email) {
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('email', email)
        .eq('user_id', userId)
        .single();

      if (existingClient) {
        clientId = existingClient.id;
      } else if (name) {
        // Create new client
        const { data: newClient } = await supabase
          .from('clients')
          .insert({
            user_id: userId,
            name,
            email,
            phone: phoneNumber || null
          })
          .select('id')
          .single();
        
        clientId = newClient?.id;
      }
    }

    // Upsert booking
    const bookingData = {
      calcom_event_id: uid,
      user_id: userId,
      client_id: clientId,
      start: new Date(startTime).toISOString(),
      end: new Date(endTime).toISOString(),
      status: bookingStatus,
      notes: title || 'Cal.com booking',
      calcom_payload: payload
    };

    const { data, error } = await supabase
      .from('bookings')
      .upsert(bookingData, { 
        onConflict: 'calcom_event_id',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (error) {
      console.error('Error upserting booking:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    console.log('Successfully processed Cal.com webhook:', data.id);
    return NextResponse.json({ ok: true, bookingId: data.id });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
```

### 4. Manual Booking Creation Dialog

**Create: `src/components/bookings/NewBookingDialog.tsx`**

```tsx
"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface NewBookingDialogProps {
  onCreated?: () => void;
}

export function NewBookingDialog({ onCreated }: NewBookingDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState<Date>();
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [sessionType, setSessionType] = useState("");
  const [notes, setNotes] = useState("");

  const resetForm = () => {
    setDate(undefined);
    setStartTime("");
    setEndTime("");
    setSessionType("");
    setNotes("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !startTime || !endTime || !sessionType) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // Combine date and time
      const startDateTime = new Date(date);
      const [startHour, startMinute] = startTime.split(':').map(Number);
      startDateTime.setHours(startHour, startMinute, 0, 0);

      const endDateTime = new Date(date);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      endDateTime.setHours(endHour, endMinute, 0, 0);

      if (endDateTime <= startDateTime) {
        alert("End time must be after start time");
        return;
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_type: sessionType,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          status: 'confirmed',
          notes: notes || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking');
      }

      setOpen(false);
      resetForm();
      onCreated?.();
      
    } catch (error) {
      console.error('Error creating booking:', error);
      alert(error instanceof Error ? error.message : 'Failed to create booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute of [0, 30]) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const display = new Date(2000, 0, 1, hour, minute).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        options.push({ value: time, label: display });
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Booking
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Booking</DialogTitle>
          <DialogDescription>
            Add a new booking manually to your calendar.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="sessionType">Session Type *</Label>
            <Select value={sessionType} onValueChange={setSessionType} required>
              <SelectTrigger>
                <SelectValue placeholder="Select session type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Portrait Session">Portrait Session</SelectItem>
                <SelectItem value="Wedding Photography">Wedding Photography</SelectItem>
                <SelectItem value="Family Photos">Family Photos</SelectItem>
                <SelectItem value="Corporate Event">Corporate Event</SelectItem>
                <SelectItem value="Product Photography">Product Photography</SelectItem>
                <SelectItem value="Consultation">Consultation</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Start Time *</Label>
              <Select value={startTime} onValueChange={setStartTime} required>
                <SelectTrigger>
                  <SelectValue placeholder="Start time" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="endTime">End Time *</Label>
              <Select value={endTime} onValueChange={setEndTime} required>
                <SelectTrigger>
                  <SelectValue placeholder="End time" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes for this booking..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Booking"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

### 5. Update Bookings Page

**Modify: `src/components/Bookings.tsx`**

Replace the existing "New Booking" button:

```tsx
// Import the new component
import { NewBookingDialog } from "@/components/bookings/NewBookingDialog";

// Replace this line:
// <Button size="sm">
//   <Plus className="h-4 w-4 mr-2" />
//   New Booking
// </Button>

// With:
<NewBookingDialog onCreated={refetch} />
```

## File Structure

```
src/
├── app/
│   ├── (public)/
│   │   └── schedule/
│   │       └── [slug]/
│   │           ├── page.tsx          # Main schedule page
│   │           └── cal-embed.tsx     # Cal.com embed component
│   └── api/
│       └── webhooks/
│           └── calcom/
│               └── route.ts          # Webhook handler
├── components/
│   └── bookings/
│       └── NewBookingDialog.tsx      # Manual booking creation
└── types/
    └── forms.ts                      # Updated with calcom_link
```

## Validation & Testing

### Database Setup
1. ✅ Execute SQL scripts to add `calcom_link` to `event_types`
2. ✅ Execute SQL scripts to add Cal.com fields to `bookings`
3. ✅ Verify indexes are created

### Event Type Creation
1. ✅ Create new event type with title and Cal.com link
2. ✅ Verify title persists correctly
3. ✅ Verify Cal.com link is saved

### Public Booking Page
1. ✅ Navigate to `/schedule/[slug]` with valid event type
2. ✅ Verify Cal.com embed loads correctly
3. ✅ Test booking flow through Cal.com

### Webhook Integration
1. ✅ Configure webhook URL in Cal.com dashboard
2. ✅ Test webhook signature verification
3. ✅ Verify bookings appear in admin after Cal.com booking

### Manual Booking Creation
1. ✅ Click "New Booking" button opens dialog
2. ✅ Fill form and create manual booking
3. ✅ Verify booking appears in list immediately

## Build Validation

```bash
# Install new dependency
npm install @calcom/embed-react

# Type check
npx tsc --noEmit

# Build check
npm run build

# Lint check
npm run lint -- --fix
```

## Environment Setup

Add to `.env.local`:
```bash
CALCOM_WEBHOOK_SECRET=your_webhook_secret_from_calcom_dashboard
NEXT_PUBLIC_CAL_THEME=dark
```

## Acceptance Criteria

✅ **Event Type Creation:**
- Title field persists when creating event types
- Cal.com link field available and saves correctly
- Event types can be created with or without Cal.com integration

✅ **Public Booking:**
- Public pages at `/schedule/[slug]` load correctly
- Cal.com embed displays and functions properly
- Booking flow works end-to-end

✅ **Webhook Integration:**
- Cal.com bookings sync to Supabase automatically
- Webhook signatures verified for security
- Client records created/linked appropriately

✅ **Admin Integration:**
- Manual booking creation works via dialog
- Both manual and Cal.com bookings display in admin
- Booking data format consistent across sources

✅ **Technical:**
- TypeScript compilation succeeds
- Build process completes without errors
- No runtime errors in browser console