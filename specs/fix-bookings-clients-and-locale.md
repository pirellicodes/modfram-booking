# Fix Bookings-Clients Relationship and Locale Issues

## Problem Statement

**Issue 1: Database Relationship Error**
- API error: "Could not find a relationship between 'bookings' and 'clients' in the schema cache"
- Root cause: Foreign key constraint missing between `bookings.client_id` and `clients(id)`
- PostgREST schema cache doesn't recognize the relationship for joined queries
- API routes in `src/app/api/bookings/route.ts` fail when trying to join clients

**Issue 2: Indonesian Locale Labels**
- Calendar components display Indonesian text like "hari" and "Cari hari..." instead of English
- Affects search day picker and calendar tabs showing "{number} hari" instead of "{number} days"
- Default locale appears to be set to Indonesian (`id`) instead of English (`en-US`)

## Solution Overview

**A) Database/PostgREST Fix**
1. Add missing foreign key constraint between bookings and clients tables
2. Reload PostgREST schema cache to recognize the relationship
3. Add fallback mechanism in API routes for schema cache issues

**B) Backend Safety Net**
1. Implement graceful fallback in `/api/bookings` route
2. If joined query fails, fetch bookings and clients separately, then stitch together
3. Maintain type safety and existing UI data shape

**C) Locale Configuration Fix**
1. Set default locale to `en-US` in calendar components
2. Replace hardcoded Indonesian strings with English equivalents
3. Ensure consistent English localization across calendar features

## Technical Requirements

- ✅ Maintain strict TypeScript types (no `any`)
- ✅ Ensure `npx tsc --noEmit` passes
- ✅ Ensure `npm run build` succeeds
- ✅ Preserve existing UI data shapes and API contracts
- ✅ Surgical edits - touch minimal files necessary
- ✅ No breaking changes to existing functionality

## Implementation Details

### A) Database/PostgREST

#### SQL Scripts

**1. Create Foreign Key Constraint:**
```sql
-- Add foreign key constraint if it doesn't exist
ALTER TABLE public.bookings 
ADD CONSTRAINT bookings_client_id_fkey 
FOREIGN KEY (client_id) 
REFERENCES public.clients(id) 
ON DELETE SET NULL;
```

**2. Verify Foreign Key Exists:**
```sql
-- Query to verify the foreign key constraint exists
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'bookings'
    AND kcu.column_name = 'client_id';
```

**3. Reload PostgREST Schema Cache:**
```sql
-- Notify PostgREST to reload schema cache
SELECT pg_notify('pgrst', 'reload schema');
```

**Alternative:** Use Supabase UI → Database → API → "Restart API"

#### Update Schema Documentation

Update `ai-docs/supabase-schema.md` to include:
- Foreign key constraint documentation
- Note about schema cache reload process
- Reference to Supabase UI restart option

### B) Backend Safety Net (Temporary)

Implement fallback logic in `src/app/api/bookings/route.ts`:

```typescript
// If joined query fails with schema cache error, use fallback
try {
  // Original joined query
  const { data, error } = await supabase
    .from("bookings")
    .select(`*, clients!inner(id, name, email, phone)`)
    .eq("user_id", user.id)
    .order("start_time", { ascending: false });
    
  if (error) throw error;
  return NextResponse.json(data);
} catch (error) {
  // Fallback: fetch separately and stitch together
  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select("*")
    .eq("user_id", user.id)
    .order("start_time", { ascending: false });
    
  if (bookingsError) throw bookingsError;
  
  if (bookings && bookings.length > 0) {
    const clientIds = [...new Set(bookings.map(b => b.client_id).filter(Boolean))];
    
    if (clientIds.length > 0) {
      const { data: clients, error: clientsError } = await supabase
        .from("clients")
        .select("id, name, email, phone")
        .in("id", clientIds);
        
      if (clientsError) throw clientsError;
      
      // Stitch clients onto bookings
      const enrichedBookings = bookings.map(booking => ({
        ...booking,
        clients: clients?.find(c => c.id === booking.client_id) || null
      }));
      
      return NextResponse.json(enrichedBookings);
    }
  }
  
  return NextResponse.json(bookings || []);
}
```

### C) Locale Fix

**Files to Update:**

1. **src/components/event-calendar/ui/search-day-picker.tsx**
   - Change `placeholder="Cari hari..."` to `placeholder="Search day..."`
   - Change `<CommandEmpty>Hari tidak ditemukan</CommandEmpty>` to `<CommandEmpty>No day found</CommandEmpty>`

2. **src/components/event-calendar/event-calendar-tabs.tsx**
   - Change `{option} hari` to `{option} days` in dropdown menu items

3. **src/lib/event-calendar/date.ts** (if needed)
   - Ensure `getLocalizedDaysOfWeek` uses `enUS` as default locale
   - Set default locale parameter to `enUS` instead of system locale

## Files to Touch

### Modified Files
1. `src/app/api/bookings/route.ts` - Add fallback logic
2. `src/components/event-calendar/ui/search-day-picker.tsx` - Fix Indonesian strings
3. `src/components/event-calendar/event-calendar-tabs.tsx` - Fix Indonesian strings  
4. `ai-docs/supabase-schema.md` - Update with FK constraint info

### SQL Operations
- Run foreign key creation in Supabase SQL editor
- Verify constraint with information_schema query
- Reload schema cache via SQL or UI restart

## Self-Validation

### Database Relationship
1. ✅ Run FK verification query - should return one row
2. ✅ Test `/api/bookings` GET request - should return data without schema cache error
3. ✅ Verify joined data shape includes `clients` object

### Locale Fix  
1. ✅ Navigate to `/admin/calendar` - should show English labels
2. ✅ Open calendar day picker - should show "Search day..." placeholder
3. ✅ Check calendar tabs dropdown - should show "X days" not "X hari"

### Build & Type Safety
1. ✅ `npx tsc --noEmit` - should pass without errors
2. ✅ `npm run lint -- --fix` - should pass without errors  
3. ✅ `npm run build` - should complete successfully

## Rollback Plan

### Database Rollback
```sql
-- Remove foreign key constraint if issues arise
ALTER TABLE public.bookings 
DROP CONSTRAINT IF EXISTS bookings_client_id_fkey;

-- Reload schema cache
SELECT pg_notify('pgrst', 'reload schema');
```

### Code Rollback
- Revert changes to API route (remove fallback logic)
- Revert locale string changes
- Git reset to previous commit if necessary

## Step-by-Step Execution Checklist

1. **Database Setup:**
   - [ ] Execute FK constraint SQL in Supabase
   - [ ] Verify constraint with information_schema query
   - [ ] Restart API via Supabase UI or reload schema cache

2. **Code Changes:**
   - [ ] Update API route with fallback logic
   - [ ] Fix Indonesian strings in calendar components  
   - [ ] Update schema documentation

3. **Validation:**
   - [ ] Test `/admin/bookings` page loads without errors
   - [ ] Test `/admin/calendar` shows English labels
   - [ ] Run type check: `npx tsc --noEmit`
   - [ ] Run build: `npm run build`

4. **Final Verification:**
   - [ ] No console errors in browser
   - [ ] Bookings display with client information
   - [ ] Calendar components show English text
   - [ ] All TypeScript compilation passes

## Acceptance Criteria

✅ **Functional:**
- `/admin/bookings` renders with clients joined, no console errors
- `/admin/calendar` shows English labels ("days", "Search day...")
- Booking data includes client information properly shaped

✅ **Technical:**  
- `npx tsc --noEmit` succeeds
- `npm run lint -- --fix` succeeds  
- `npm run build` succeeds
- No runtime TypeScript errors
- No `any` types introduced

✅ **User Experience:**
- No visible errors or broken functionality
- Consistent English localization
- Existing booking and calendar features work as expected