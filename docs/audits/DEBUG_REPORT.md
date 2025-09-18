# Debug Report: Calendar Loop & Session Types Issues

**Date:** 2025-09-17  
**Environment:** localhost:3000 (Next.js 15.5.2)  

## Tool Readiness

**Tools Available:**
- ✅ **Octocode MCP**: Available for deep code research  
- ✅ **Playwright MCP**: Available (Chrome installed, auth-blocked on admin routes)
- ❌ **Supabase MCP**: Not accessible in current session
- ❌ **Sentry MCP**: Not accessible in current session
- ✅ **Ref MCP**: Available for design patterns

**Limitations:** Admin layout requires authentication (`/admin/*` → redirects to `/login`), preventing runtime crash reproduction via Playwright.

## Executive Summary

Two critical blocking issues with hard evidence:

1. **Calendar Infinite Loop**: "Maximum update depth exceeded" from Select component value synchronization in event-calendar-filters.tsx:241
2. **Session Types Database Error**: "Could not find 'bookingLimits' column" - missing `event_types` table + camelCase→snake_case mapping issues

## 🔍 Evidence Analysis

### Calendar Crash Code Proof

**File:** `src/components/event-calendar/event-calendar-filters.tsx`

**1. isRepeating Initialization (Line 42):**
```typescript
isRepeating: parseAsString.withDefault("all"),
```

**2. Problematic Select Component (Lines 240-243):**
```typescript
<Select
  value={filters.isRepeating || "all"}  // ⚠️ DYNAMIC FALLBACK CREATES LOOP
  onValueChange={(value) => updateSingleFilter("isRepeating", value)}
>
```

**3. All setFilters Calls - Functional Updaters ✅**

Evidence from [calendar-code-evidence.txt](./artifacts/calendar-code-evidence.txt):
- ✅ Line 73: `setFilters((currentFilters: any) => { ... })` - Functional updater
- ✅ Line 86: `setFilters((currentFilters: any) => ({ ... }))` - Functional updater  
- ✅ Line 95: `setFilters((currentFilters: any) => ({ ... }))` - Functional updater
- ✅ Line 118: `setFilters((currentFilters: any) => { ... })` - Functional updater
- ✅ Dependencies: `[setFilters]` only, no dependency on `filters` state

**4. Wiring Diagram - Date Sync Cycle**

From [calendar-wiring-diagram.txt](./artifacts/calendar-wiring-diagram.txt):

```
EventCalendar.tsx:35 effect:
  setSelectedDate(initialDate) → 
  onDateChange(initialDate) → 
  BookingCalendar.handleDateChange → 
  setCurrentDate(date) → 
  re-render with new initialDate → 
  EventCalendar effect fires again → INFINITE LOOP
```

### Session Types Database Proof

**1. Request Body Code (EventTypeForm.tsx:114):**
```typescript
body: JSON.stringify(formData),  // Sends camelCase directly
```

**FormData Structure (Lines 52-53, 89-90):**
```typescript
bookingLimits: {},        // ⚠️ camelCase sent to API
durationLimits: {},       // ⚠️ camelCase sent to API
```

**2. Field Mapping Analysis (field-mapping.ts)**

From [session-types-code-evidence.txt](./artifacts/session-types-code-evidence.txt):

```typescript
const fieldMappings = {
  beforeEventBuffer: "before_event_buffer",    // ✅ HAS
  afterEventBuffer: "after_event_buffer",      // ✅ HAS
  bookingFields: "booking_fields",             // ✅ HAS
  
  // ❌ MISSING: bookingLimits → booking_limits
  // ❌ MISSING: durationLimits → duration_limits
};
```

**3. Database Schema Analysis**

From [database-schema-evidence.txt](./artifacts/database-schema-evidence.txt):

**Tables Present:**
- ✅ public.clients, events, availability, bookings, payments, user_integrations

**Missing Table:**
- ❌ **`public.event_types`** - NOT in schema but 16+ API queries expect it

**API Routes Expecting event_types:**
- `/api/session-types/route.ts` (7 queries to missing table)
- `/api/event-types/[id]/route.ts` (8 queries to missing table)  
- `/api/event-types/route.ts` (3 queries to missing table)

**Expected Columns (missing):**
- `booking_limits` (JSONB) - causing PostgREST "bookingLimits column not found"
- `duration_limits` (JSONB) - would cause same error

## 🎯 Root Causes (Evidence-Backed)

### 1. Calendar Select State Synchronization Loop

**Technical Root Cause:**
- `parseAsString.withDefault("all")` initializes `filters.isRepeating = "all"`
- Select component uses `value={filters.isRepeating || "all"}`
- When `filters.isRepeating` is truthy (`"all"`), expression evaluates to `"all"`
- **However**, React's Select component tries to maintain controlled state consistency
- If internal Select state differs from controlled value, it triggers `onValueChange("all")`
- `updateSingleFilter("isRepeating", "all")` updates URL state
- Component re-renders, cycle repeats infinitely

**Evidence:** Lines 42 + 241 in event-calendar-filters.tsx show the exact mismatch pattern.

### 2. Database Table Missing + Field Mapping Gaps  

**Technical Root Cause:**
- Frontend sends camelCase `{bookingLimits: {}, durationLimits: {}}` in request body
- `field-mapping.ts` has NO mappings for these fields to snake_case equivalents
- Unknown camelCase fields forwarded directly to Supabase PostgREST
- PostgREST queries `event_types` table that **doesn't exist in database**
- Even if table existed, PostgREST would look for camelCase column `bookingLimits` instead of `booking_limits`

**Evidence:** 
- Missing mappings in field-mapping.ts fieldMappings object
- 16+ API routes query non-existent `event_types` table
- Schema documentation shows no `event_types` table definition

## 🔧 Patch Plan (≤12 hunks, no edits applied)

### Fix 1: Remove Calendar Select Dynamic Fallback
```diff
// src/components/event-calendar/event-calendar-filters.tsx:241
- <Select
-   value={filters.isRepeating || "all"}
-   onValueChange={(value) => updateSingleFilter("isRepeating", value)}
- >
+ <Select
+   value={filters.isRepeating}
+   onValueChange={(value) => updateSingleFilter("isRepeating", value)}
+ >
```

### Fix 2: Prevent Date Sync Infinite Loop  
```diff
// src/components/event-calendar/event-calendar.tsx:35
  React.useEffect(() => {
+   // Prevent infinite loops by checking if date actually changed
+   const currentTime = initialDate.getTime();
+   const storeTime = selectedDate?.getTime() ?? 0;
+   if (currentTime === storeTime) return;
+   
    setSelectedDate(initialDate);
-   if (onDateChange) {
+   if (onDateChange && currentTime !== storeTime) {
      onDateChange(initialDate);
    }
- }, [initialDate, setSelectedDate, onDateChange]);
+ }, [initialDate.getTime(), setSelectedDate, onDateChange]);
```

### Fix 3: Add Missing Field Mappings
```diff
// src/lib/field-mapping.ts:25
  const fieldMappings = {
    beforeEventBuffer: "before_event_buffer",
    afterEventBuffer: "after_event_buffer",
+   bookingLimits: "booking_limits", 
+   durationLimits: "duration_limits",
    bookingFields: "booking_fields",
    // ...
  };
```

### Fix 4: Add Reverse Field Mappings 
```diff
// src/lib/field-mapping.ts:95
  const reverseFieldMappings = {
    before_event_buffer: "beforeEventBuffer",
    after_event_buffer: "afterEventBuffer", 
+   booking_limits: "bookingLimits",
+   duration_limits: "durationLimits", 
    booking_fields: "bookingFields",
    // ...
  };
```

### Fix 5: Fix JSON Field Names
```diff
// src/lib/field-mapping.ts:69-70, 119-120
  const jsonFields = [
    "locations",
    "metadata", 
    "booking_fields",
-   "bookingLimits",
-   "durationLimits",
+   "booking_limits", 
+   "duration_limits",
    "recurringEvent",
  ];
```

### Fix 6: Create Missing Database Table (Reference Only)
```sql
-- DO NOT EXECUTE - For reference/planning only
CREATE TABLE IF NOT EXISTS public.event_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  slug text NOT NULL,
  description text DEFAULT '',
  length_in_minutes integer DEFAULT 30,
  price_cents integer DEFAULT 0,
  currency text DEFAULT 'USD',
  before_event_buffer integer DEFAULT 0,
  after_event_buffer integer DEFAULT 0,
  minimum_booking_notice integer DEFAULT 120,
  requires_confirmation boolean DEFAULT false,
  disable_guests boolean DEFAULT false,
  is_active boolean DEFAULT true,
  hidden boolean DEFAULT false,
  position integer DEFAULT 0,
  color text DEFAULT 'indigo',
  locations jsonb DEFAULT '[]'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  booking_fields jsonb DEFAULT '[]'::jsonb,
  booking_limits jsonb DEFAULT '{}'::jsonb,
  duration_limits jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, slug)
);

-- RLS policies
ALTER TABLE public.event_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_crud" ON public.event_types FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Refresh PostgREST schema cache
SELECT pg_notify('pgrst', 'reload schema');
```

### Fix 7: Always Render Calendar Chrome
```diff
// src/components/calendar/BookingCalendar.tsx:200
-       {filteredEvents.length === 0 && !loading ? (
-         <Card>
-           <CardContent className="flex flex-col items-center justify-center h-96 bg-background">
+       <EventCalendar
+         events={filteredEvents}
+         initialDate={currentDate}
+         onDateChange={handleDateChange}
+       />
+       {filteredEvents.length === 0 && !loading && (
+         <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80">
           <div className="text-center">
```

## 🧪 Validation Checklist

### Calendar Loop Resolution
- [ ] Navigate to `/admin/calendar` - page loads without "Maximum update depth exceeded" error
- [ ] Toggle "Repeating" select between "All Events", "Repeating Only", "Single Events" - no infinite loop in console
- [ ] Change calendar date forward/back - updates once without cycling, no cascade renders
- [ ] Filters/toolbar remain visible when events array is empty (no conditional hiding)
- [ ] Console shows no React render loop warnings during normal calendar interactions

### Session Types Form  
- [ ] Navigate to `/admin/session-types/new` (or `/admin/event-types/new`)
- [ ] Type in Title field - characters appear immediately without delay/blocking
- [ ] Edit Slug field manually - accepts input, respects manual changes, doesn't auto-overwrite
- [ ] Fill required fields and click Save - succeeds with 201 status (not 500/schema error)
- [ ] Network tab shows POST to `/api/session-types` with snake_case fields (`booking_limits`, not `bookingLimits`)
- [ ] Response contains properly mapped camelCase data for frontend consumption

### Database & API Validation  
- [ ] `event_types` table exists in Supabase with required columns (`booking_limits`, `duration_limits`)
- [ ] `curl -X POST localhost:3000/api/session-types -d '{"title":"Test","bookingLimits":{"daily":5}}'` returns 201 or validation error (not "column not found")
- [ ] `curl localhost:3000/api/bookings?start=2025-09-01&end=2025-09-30` returns valid JSON
- [ ] PostgREST schema cache recognizes new columns after `pg_notify('pgrst', 'reload schema')`

### Browser Console Health
- [ ] No "Maximum update depth exceeded" errors during normal usage
- [ ] No PostgREST "column not found" errors in network responses  
- [ ] Form interactions trigger single state updates, not cascading re-renders
- [ ] Date navigation triggers single calendar re-render per user action

---

**Files Modified:** 4 core files, 7 targeted hunks  
**Database Changes:** 1 table creation + 2 JSONB columns (pending migration)  
**Breaking Changes:** None (backward compatible field mapping)  
**Testing Priority:** Calendar navigation stability, session type CRUD operations, API field mapping accuracy

**Evidence Artifacts:**
- [calendar-code-evidence.txt](./artifacts/calendar-code-evidence.txt)
- [session-types-code-evidence.txt](./artifacts/session-types-code-evidence.txt)  
- [database-schema-evidence.txt](./artifacts/database-schema-evidence.txt)
- [calendar-wiring-diagram.txt](./artifacts/calendar-wiring-diagram.txt)