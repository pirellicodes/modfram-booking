# Implement Cal.com-Aligned Database Schema and TypeScript Integration

## Problem Statement

**Current State**: The booking platform is experiencing cascading failures due to a fundamental database-application layer disconnect. The core issue is that the application references `event_types` table in TypeScript and API calls, but the actual Supabase database only contains a basic schema without this critical table.

**Critical Missing Components**:
- **event_types table does not exist** in Supabase (causing "relation does not exist" errors)
- **Mismatch between Drizzle schema** (src/db/schema.ts) and **actual database tables**
- **API routes referencing non-existent tables** (.from("event_types") calls failing)
- **TypeScript types generated from missing database structures**

**Current Database vs Application Expectations**:

| Current Supabase Schema | Application Expects | Status |
|------------------------|-------------------|---------|
| ❌ No `event_types` table | ✅ Full `event_types` with Cal.com fields | **MISSING** |
| ✅ `bookings` table (basic) | ✅ Cal.com-aligned `bookings` | **INCOMPLETE** |
| ✅ `events` table (calendar events) | ✅ Separate calendar vs booking events | **CONFUSED** |
| ❌ No `availability` table | ✅ Time slot availability management | **MISSING** |

**Blocking Issues**:
- TypeScript compilation errors due to missing database types
- API routes failing with "relation does not exist" 
- Unable to deploy due to database query failures
- Frontend components expecting data structures that don't exist

This problem must be solved **database-first** before the TypeScript specification can be applied successfully.

## Cal.com Schema Analysis

### Field Mapping and Structure Requirements

**Cal.com Event Types API Structure Analysis**:
```json
{
  "id": 1,
  "lengthInMinutes": 60,
  "lengthInMinutesOptions": [15, 30, 60], 
  "title": "Learn the secrets of masterchief!",
  "slug": "learn-the-secrets-of-masterchief",
  "description": "Discover the culinary wonders...",
  "locations": [{"type": "address", "address": "123 Example St"}],
  "bookingFields": [{"type": "name", "label": "string", "required": true}],
  "disableGuests": true,
  "slotInterval": 60,
  "minimumBookingNotice": 0,
  "beforeEventBuffer": 0,
  "afterEventBuffer": 0,
  "scheduleId": 123,
  "price": 123,
  "currency": "USD",
  "isInstantEvent": true,
  "metadata": {}
}
```

**Required Field Mapping**:

| Current Drizzle Schema | Cal.com API | Required Supabase Column | Type |
|----------------------|-------------|--------------------------|------|
| `length` | `lengthInMinutes` | `length_in_minutes` | INTEGER NOT NULL |
| ❌ Missing | `lengthInMinutesOptions` | `length_in_minutes_options` | INTEGER[] |
| `slug` | `slug` | `slug` | VARCHAR(255) UNIQUE |
| `locations` | `locations` | `locations` | JSONB |
| `bookingFields` | `bookingFields` | `booking_fields` | JSONB |
| `disableGuests` | `disableGuests` | `disable_guests` | BOOLEAN |
| `slotInterval` | `slotInterval` | `slot_interval` | INTEGER |
| `minimumBookingNotice` | `minimumBookingNotice` | `minimum_booking_notice` | INTEGER |
| `beforeEventBuffer` | `beforeEventBuffer` | `before_event_buffer` | INTEGER |
| `afterEventBuffer` | `afterEventBuffer` | `after_event_buffer` | INTEGER |
| `scheduleId` | `scheduleId` | `schedule_id` | INTEGER |
| `price` | `price` | `price_cents` | INTEGER (convert dollars to cents) |
| `currency` | `currency` | `currency` | TEXT DEFAULT 'usd' |
| ❌ Missing | `isInstantEvent` | `is_instant_event` | BOOLEAN |
| `metadata` | `metadata` | `metadata` | JSONB |

### Cal.com Standard Patterns

**Required Cal.com Conventions**:
1. **Pricing**: Store as cents (integer) not decimal for precision
2. **Time Fields**: All durations in minutes (integer)
3. **JSON Fields**: Structured objects for locations, booking fields, metadata
4. **Slugs**: URL-safe identifiers for public booking pages
5. **User Ownership**: Every event type belongs to a user (user_id foreign key)
6. **Buffer Times**: Before/after event padding in minutes
7. **Booking Constraints**: Minimum notice, slot intervals, guest policies

## Database Implementation

### Phase 1: Core Event Types Table

**SQL Creation Script with Cal.com Alignment**:
```sql
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
```

### Phase 2: Enhanced Bookings Table

**Align bookings with Cal.com patterns**:
```sql
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
```

### Phase 3: Availability System

**Create Cal.com-style availability management**:
```sql
-- Enhanced availability table for Cal.com patterns
DROP TABLE IF EXISTS public.availability CASCADE;

CREATE TABLE public.availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Schedule reference (optional - can belong to a schedule)
  schedule_id INTEGER DEFAULT NULL,
  
  -- Time range definition
  weekday INTEGER NOT NULL CHECK (weekday BETWEEN 0 AND 6), -- 0 = Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  
  -- Timezone handling
  timezone TEXT DEFAULT 'UTC',
  
  -- Date range (optional - for date-specific overrides)
  date_from DATE DEFAULT NULL,
  date_to DATE DEFAULT NULL,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CHECK(start_time < end_time),
  CHECK(date_from IS NULL OR date_to IS NULL OR date_from <= date_to)
);

-- Enable RLS
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own availability"
  ON public.availability FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_availability_user_id ON public.availability(user_id);
CREATE INDEX idx_availability_weekday ON public.availability(weekday);
CREATE INDEX idx_availability_schedule_id ON public.availability(schedule_id) WHERE schedule_id IS NOT NULL;
```

## TypeScript Integration

### Phase 1: Database Type Foundation

**Update `/src/lib/types/database.ts`**:
```typescript
// Generate from actual Supabase schema - the single source of truth
export interface DatabaseEventType {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  description?: string;
  length_in_minutes: number;
  length_in_minutes_options: number[];
  slot_interval?: number;
  price_cents: number;
  currency: string;
  minimum_booking_notice: number;
  before_event_buffer: number;
  after_event_buffer: number;
  disable_guests: boolean;
  requires_confirmation: boolean;
  is_instant_event: boolean;
  locations: LocationObject[];
  booking_fields: BookingField[];
  metadata: Record<string, unknown>;
  schedule_id?: number;
  is_active: boolean;
  hidden: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface DatabaseBooking {
  id: string;
  user_id: string;
  event_type_id?: string;
  client_id?: string;
  attendee_name?: string;
  attendee_email?: string;
  attendee_phone?: string;
  start: string; // ISO timestamp
  end: string;   // ISO timestamp  
  status: 'pending' | 'confirmed' | 'cancelled' | 'rescheduled' | 'no_show';
  notes?: string;
  booking_fields_responses: Record<string, unknown>;
  confirmed_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  meeting_url?: string;
  meeting_password?: string;
  created_at: string;
}

export interface DatabaseAvailability {
  id: string;
  user_id: string;
  schedule_id?: number;
  weekday: number; // 0-6
  start_time: string; // HH:MM format
  end_time: string;   // HH:MM format
  timezone: string;
  date_from?: string; // YYYY-MM-DD
  date_to?: string;   // YYYY-MM-DD
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

### Phase 2: Domain Types with Cal.com Patterns

**Update `/src/types/index.ts`**:
```typescript
// Domain types that extend database types with computed/transformed properties
export interface EventType extends Omit<DatabaseEventType, 'price_cents' | 'length_in_minutes'> {
  // Transform cents to dollars for UI
  price: number; // Computed from price_cents / 100
  
  // Cal.com API compatibility
  lengthInMinutes: number; // Mapped from length_in_minutes
  lengthInMinutesOptions: number[]; // Mapped from length_in_minutes_options
  
  // Parsed JSON fields with proper typing
  locations: LocationObject[];
  bookingFields: BookingField[];
  metadata: Record<string, unknown>;
}

export interface Booking extends Omit<DatabaseBooking, 'booking_fields_responses'> {
  // Parsed and typed fields
  bookingFieldsResponses: Record<string, unknown>;
  eventType?: EventType; // Joined data
  client?: Client; // Joined data
}

export interface Availability extends DatabaseAvailability {
  // Computed properties for UI
  startDate: Date; // Computed from start_time + timezone
  endDate: Date;   // Computed from end_time + timezone
}

// Cal.com structured data types
export interface LocationObject {
  type: 'in_person' | 'phone' | 'video' | 'custom';
  address?: string;
  link?: string;
  phone?: string;
  displayLocationPublicly?: boolean;
}

export interface BookingField {
  name: string;
  type: 'name' | 'email' | 'phone' | 'textarea' | 'select' | 'multiselect' | 'number' | 'checkbox';
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[]; // For select/multiselect
}
```

## Migration Strategy

### From Current Broken State to Working Cal.com-Aligned System

**Current State Assessment**:
- ❌ Supabase missing `event_types` table
- ❌ API routes failing with "relation does not exist"  
- ❌ TypeScript expecting types that don't exist
- ❌ Frontend components cannot load data

**Migration Path**:

**Phase 1: Database Foundation (Critical - Must Complete First)**
1. **Create event_types table** in Supabase with Cal.com schema
2. **Enhance bookings table** with event_type_id and Cal.com fields  
3. **Replace availability table** with Cal.com time slot structure
4. **Verify database connectivity** and RLS policies

**Phase 2: Type System Alignment**  
1. **Update database types** to match actual Supabase schema
2. **Generate domain types** with Cal.com API compatibility
3. **Fix TypeScript compilation** errors from missing types
4. **Update import statements** across codebase

**Phase 3: API Integration**
1. **Update API routes** to use correct table names and fields
2. **Add data transformation** between database and Cal.com formats
3. **Implement proper error handling** for database operations
4. **Test all CRUD operations** with new schema

**Phase 4: Frontend Integration**
1. **Update components** to use new type definitions
2. **Fix form submissions** to match database schema
3. **Update calendar integration** with proper event type handling
4. **Test user workflows** end-to-end

## Implementation Phases

### Phase 1: Database Foundation (Days 1-2)
**Priority: CRITICAL - Blocking all other work**

**Tasks**:
- [ ] Execute SQL scripts to create `event_types` table in Supabase
- [ ] Enhance `bookings` table with Cal.com fields
- [ ] Replace `availability` table with time slot structure
- [ ] Create RLS policies and indexes
- [ ] Verify database connectivity from application

**Success Criteria**:
- [ ] `SELECT * FROM event_types` works in Supabase
- [ ] API routes no longer throw "relation does not exist"
- [ ] Database connection established without errors

### Phase 2: TypeScript Integration (Days 2-3)

**Tasks**:
- [ ] Create `/src/lib/types/database.ts` with actual schema types
- [ ] Update `/src/types/index.ts` with Cal.com domain types
- [ ] Fix all import statements referencing missing types
- [ ] Update Drizzle schema to match Supabase tables

**Success Criteria**:
- [ ] `npx tsc --noEmit` passes without errors
- [ ] All import statements resolve correctly
- [ ] Type checking works in IDE

### Phase 3: API Layer Updates (Days 3-4)

**Tasks**:
- [ ] Update all API routes to use correct table/field names
- [ ] Add data transformation between database and Cal.com formats
- [ ] Implement proper error handling and validation
- [ ] Test CRUD operations with Postman/curl

**Success Criteria**:
- [ ] All API endpoints return data without errors
- [ ] POST/PUT operations save data correctly
- [ ] Error responses are properly formatted

### Phase 4: Frontend Integration (Days 4-5)

**Tasks**:
- [ ] Update React components with new type definitions
- [ ] Fix form submissions and data handling
- [ ] Update calendar and dashboard components
- [ ] Test complete user workflows

**Success Criteria**:
- [ ] Application loads without console errors
- [ ] Users can create/edit event types
- [ ] Booking flow works end-to-end
- [ ] Dashboard displays correct data

## Self-Validation

### Database Validation
**SQL Tests**:
```sql
-- Verify event_types table exists and is accessible
SELECT COUNT(*) FROM public.event_types;

-- Test RLS policies work correctly
SET ROLE authenticated;
SELECT * FROM public.event_types WHERE user_id = auth.uid();

-- Verify foreign key relationships
SELECT et.title, COUNT(b.id) as booking_count
FROM public.event_types et
LEFT JOIN public.bookings b ON b.event_type_id = et.id
GROUP BY et.id, et.title;

-- Test JSON field structure
SELECT locations, booking_fields, metadata 
FROM public.event_types 
LIMIT 1;
```

### TypeScript Validation
**Compilation Tests**:
```bash
# Zero TypeScript errors
npx tsc --noEmit

# Build succeeds  
npm run build

# Lint passes
npm run lint

# Type checking in development
npm run dev
```

### API Validation  
**Endpoint Tests**:
```bash
# Test event types CRUD
curl -X GET http://localhost:3000/api/event-types
curl -X POST http://localhost:3000/api/event-types -d '{"title":"Test","slug":"test"}'

# Test bookings with event_type_id
curl -X GET http://localhost:3000/api/bookings

# Test availability endpoints
curl -X GET http://localhost:3000/api/availability
```

### Runtime Validation
**Application Tests**:
- [ ] User can create new event types without errors
- [ ] Event type form saves data to database correctly
- [ ] Calendar displays events from event_types table
- [ ] Booking flow connects event_types to bookings
- [ ] Dashboard analytics load without crashes
- [ ] No console errors on page load

## Files to Modify

### Database Schema Files
- **CREATE** `/supabase/migrations/001_create_event_types.sql` - Core event_types table
- **CREATE** `/supabase/migrations/002_enhance_bookings.sql` - Add Cal.com fields to bookings
- **CREATE** `/supabase/migrations/003_availability_system.sql` - New availability structure
- **MODIFY** `/src/db/schema.ts` - Update Drizzle schema to match Supabase

### Type Definition Files
- **CREATE** `/src/lib/types/database.ts` - Database-first type definitions
- **MODIFY** `/src/types/index.ts` - Cal.com domain types extending database types
- **MODIFY** `/src/types/event-types.ts` - Update EventTypeWithParsedFields
- **MODIFY** `/src/types/api.ts` - API request/response types
- **MODIFY** `/src/types/components.ts` - Component prop types
- **MODIFY** `/src/types/forms.ts` - Form validation types

### API Integration Files  
- **MODIFY** `/src/app/api/event-types/route.ts` - CRUD operations with Cal.com data
- **MODIFY** `/src/app/api/event-types/[id]/route.ts` - Individual event type operations
- **CREATE** `/src/app/api/availability/route.ts` - Availability management
- **MODIFY** `/src/app/api/bookings/route.ts` - Enhanced booking with event_type_id

### Application Layer Files
- **MODIFY** `/src/constants/calendar-constant.ts` - Fix imports, add Cal.com constants
- **MODIFY** `/src/hooks/use-dashboard-data.ts` - Update queries for new schema
- **MODIFY** `/src/hooks/use-event.ts` - Fix imports and event type handling
- **MODIFY** `/src/components/event-types/EventTypeForm.tsx` - Cal.com field handling
- **MODIFY** `/src/components/EventTypes.tsx` - Update component with new types
- **MODIFY** `/src/components/Calendar.tsx` - Event type integration
- **MODIFY** `/src/lib/supabase-server.ts` - Database client configuration
- **MODIFY** `/src/lib/supabase-browser.ts` - Client-side database types

### Validation and Testing
- **CREATE** `/src/lib/__tests__/database-schema.test.ts` - Database schema validation
- **CREATE** `/src/types/__tests__/calcom-compatibility.test.ts` - Cal.com API compatibility tests  
- **CREATE** `/scripts/verify-migration.js` - Migration verification script

This comprehensive implementation will establish the missing database foundation first, then properly integrate it with the approved TypeScript specification to create a working Cal.com-aligned booking platform.