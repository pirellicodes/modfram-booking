# Fix Session Booking UI and API

## Problem

The current booking system has several UI/UX and API issues that need resolution:

1. **Inconsistent terminology**: "Event Type" vs "Session Type" mixed throughout the app
2. **Broken forms**: Session Title input field is not editable or properly controlled
3. **Navigation issues**: "New" button doesn't open create dialog; Team Availability clutter
4. **API failures**: `/api/bookings` returns generic "bad request" errors due to schema mismatches
5. **UI bugs**: Grey overlay in Availability calendar, contrast issues in dark mode
6. **Incomplete booking flow**: New Booking dialog doesn't work properly
7. **Data inconsistency**: Booking creation fails due to NOT NULL constraint mismatches

## Goals

### Primary Objectives
- **Consistent UI terminology**: Standardize on "Session Type(s)" across all user-facing text
- **Working forms**: Fix Session Title input and New Booking dialog functionality
- **Robust API**: Make `/api/bookings` resilient to schema variations with clear error messages
- **Clean UX**: Remove Team Availability clutter, fix calendar display issues
- **End-to-end flow**: Complete booking creation that syncs between admin and embed widget

### Secondary Objectives
- **Maintainable code**: Remove dead/unused code paths
- **Better error handling**: Replace generic errors with specific, actionable messages
- **Consistent theming**: Fix dark mode contrast issues

## DB Truth

### Current Schema Analysis
```sql
-- Core tables (established)
bookings: id, user_id, event_type_id, client_name, client_email, client_phone, 
         start_time, end_time, date, status, notes, created_at, updated_at

event_types: id, user_id, title, slug, description, duration, active, ...

clients: id, name, email, phone, created_at, updated_at

-- Relationships
bookings.event_type_id → event_types.id
bookings.client_id → clients.id (optional FK)
```

### Schema Constraints
- `bookings.client_name` is NOT NULL (enforce in UI/API)
- `bookings.client_email` is NOT NULL (enforce validation)
- `bookings.start_time`, `bookings.end_time` preferred over legacy `booking_date`+`booking_time`
- Support both inline client fields and FK relationship

### Migration Decision
**Skip optional migration** - enforce `client_name` as required in UI rather than making schema changes.

## UI Changes

### A. Terminology Standardization
**Scope**: All user-facing text only (not database table names)

**Components to update**:
- `src/components/app-sidebar.tsx` - Navigation item
- `src/app/(admin)/admin/event-types/page.tsx` - Page title, headers, buttons
- `src/components/event-types/EventTypeForm.tsx` - Dialog title, labels
- `src/components/event-types/EventTypeBasicForm.tsx` - Form labels
- `src/components/EventTypes.tsx` - Component text
- `src/components/bookings/NewBookingDialog.tsx` - Dropdown label

**Changes**:
```diff
- "Event Type" → "Session Type"
- "Event Types" → "Session Types" 
- "Create Event Type" → "Create Session Type"
- "Edit Event Type" → "Edit Session Type"
- "Event Title" → "Session Title"
```

### B. Form Fixes

**Session Title Input** (`src/components/event-types/EventTypeBasicForm.tsx`):
```tsx
// Fix controlled input
<FormField
  control={form.control}
  name="title"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Session Title *</FormLabel>
      <FormControl>
        <Input 
          {...field}
          placeholder="Enter session title"
          value={field.value || ''} // Ensure controlled
        />
      </FormControl>
    </FormItem>
  )}
/>
```

**New Button Functionality** (`src/app/(admin)/admin/event-types/page.tsx`):
```tsx
// Connect button to dialog trigger
<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
  <DialogTrigger asChild>
    <Button>
      <Plus className="h-4 w-4 mr-2" />
      New
    </Button>
  </DialogTrigger>
  <DialogContent>
    <EventTypeForm onSuccess={() => setIsDialogOpen(false)} />
  </DialogContent>
</Dialog>
```

### C. Availability Cleanup

**Remove Team Availability** from `src/components/Availability.tsx`:
```diff
- Remove tab selector with "My Availability" / "Team Availability"
- Remove any team-related state or functions
- Simplify to single availability view
```

**Fix Calendar Overlay** in `src/app/globals.css`:
```css
/* Remove grey overlay in calendar */
.dark .calendar-container .overlay,
.dark .rbc-overlay {
  background: transparent !important;
}

/* Improve contrast in dark mode */
.dark .rbc-calendar {
  background-color: hsl(var(--background)) !important;
  color: hsl(var(--foreground)) !important;
}

.dark .rbc-header {
  background-color: hsl(var(--muted)) !important;
  color: hsl(var(--foreground)) !important;
  border-color: hsl(var(--border)) !important;
}

.dark .rbc-event {
  background-color: hsl(var(--primary)) !important;
  color: hsl(var(--primary-foreground)) !important;
}
```

### D. New Booking Dialog

**Enhanced Dialog** (`src/components/bookings/NewBookingDialog.tsx`):
```tsx
interface BookingFormData {
  event_type_id: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  start_time: string;
  end_time: string;
  date: string;
  notes?: string;
}

// Form validation
const formSchema = z.object({
  event_type_id: z.string().min(1, "Session type is required"),
  client_name: z.string().min(1, "Client name is required"),
  client_email: z.string().email("Valid email required"),
  client_phone: z.string().optional(),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  date: z.string().min(1, "Date is required"),
  notes: z.string().optional(),
});
```

## API Changes

### A. Robust `/api/bookings` Route

**Error Handling Strategy** (`src/app/api/bookings/route.ts`):
```typescript
// Column detection utility
async function detectBookingsSchema(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .limit(0);
  
  if (error?.details?.includes('column')) {
    // Parse error to understand available columns
    return parseAvailableColumns(error);
  }
  
  return DEFAULT_COLUMNS;
}

// Flexible query builder
function buildBookingsQuery(availableColumns: string[]) {
  const baseColumns = ['id', 'user_id', 'event_type_id', 'status', 'created_at'];
  const optionalColumns = ['client_name', 'client_email', 'client_phone', 'notes'];
  const timeColumns = availableColumns.includes('start_time') 
    ? ['start_time', 'end_time']
    : ['booking_date', 'booking_time'];
  
  return [...baseColumns, ...optionalColumns, ...timeColumns].filter(col => 
    availableColumns.includes(col)
  );
}
```

**GET Handler with Fallback**:
```typescript
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const availableColumns = await detectBookingsSchema(supabase);
    const queryColumns = buildBookingsQuery(availableColumns);
    
    // Try with FK join first
    let { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        ${queryColumns.join(', ')},
        clients (
          id, name, email, phone
        ),
        event_types (
          id, title, duration
        )
      `);
    
    // Fallback without FK join if it fails
    if (error?.code === '42703') { // column doesn't exist
      ({ data: bookings, error } = await supabase
        .from('bookings')
        .select(queryColumns.join(', ')));
    }
    
    if (error) {
      return NextResponse.json({
        error: 'Failed to fetch bookings',
        details: error.message,
        code: error.code
      }, { status: 500 });
    }
    
    return NextResponse.json({ bookings: bookings || [] });
  } catch (err) {
    return NextResponse.json({
      error: 'Internal server error',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
  }
}
```

**POST Handler with Validation**:
```typescript
const CreateBookingSchema = z.object({
  event_type_id: z.string().uuid(),
  client_name: z.string().min(1),
  client_email: z.string().email(),
  client_phone: z.string().optional(),
  start_time: z.string(),
  end_time: z.string(),
  date: z.string(),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const body = await request.json();
    
    // Validate input
    const validationResult = CreateBookingSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validationResult.error.issues
      }, { status: 400 });
    }
    
    const bookingData = validationResult.data;
    
    // Ensure required fields for DB constraints
    const insertData = {
      ...bookingData,
      user_id: user.id,
      status: 'confirmed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert(insertData)
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({
        error: 'Failed to create booking',
        details: error.message,
        code: error.code
      }, { status: 400 });
    }
    
    return NextResponse.json({ booking });
  } catch (err) {
    return NextResponse.json({
      error: 'Internal server error',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
  }
}
```

### B. Session Types API Consistency

**Ensure** `/api/event-types` works with New Booking dialog:
```typescript
// Return format for dropdown consumption
return NextResponse.json({
  sessionTypes: eventTypes.map(et => ({
    id: et.id,
    title: et.title,
    duration: et.duration,
    description: et.description
  }))
});
```

## Migrations

### No Schema Changes Required

The current schema supports the required functionality. We will:
1. **Enforce** `client_name` as required in UI validation
2. **Use existing** `start_time`/`end_time` columns preferentially
3. **Maintain** backward compatibility with legacy `booking_date`+`booking_time`

### Data Validation

**Pre-implementation check**:
```sql
-- Verify current constraints
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'bookings' 
  AND table_schema = 'public';

-- Check for existing NULL values that would break
SELECT COUNT(*) as null_client_names
FROM bookings 
WHERE client_name IS NULL;
```

## Testing

### A. Unit Tests

**API Route Tests** (`__tests__/api/bookings.test.ts`):
```typescript
describe('/api/bookings', () => {
  test('GET returns bookings with proper error handling', async () => {
    // Test successful fetch
    // Test schema mismatch fallback
    // Test empty results
  });
  
  test('POST validates input and creates booking', async () => {
    // Test validation errors
    // Test successful creation
    // Test database constraint failures
  });
});
```

**Component Tests** (`__tests__/components/NewBookingDialog.test.tsx`):
```typescript
describe('NewBookingDialog', () => {
  test('loads session types and validates form', async () => {
    // Test dropdown population
    // Test form validation
    // Test submission flow
  });
});
```

### B. Integration Tests

**Booking Flow End-to-End**:
1. Open New Booking dialog
2. Select session type from dropdown
3. Fill required fields (name, email)
4. Submit form
5. Verify booking appears in list
6. Verify booking appears in calendar

**API Error Scenarios**:
1. Test with missing columns
2. Test with invalid foreign keys
3. Test with malformed input
4. Verify clear error messages

### C. Manual Testing Checklist

**UI Terminology**:
- [ ] All "Event Type" → "Session Type" in navigation
- [ ] All dialog titles updated
- [ ] All form labels updated
- [ ] All button text updated

**Form Functionality**:
- [ ] Session Title input is editable and saves
- [ ] New button opens create dialog
- [ ] New Booking dialog works end-to-end

**API Robustness**:
- [ ] `/api/bookings` returns clear error messages
- [ ] Handles missing columns gracefully
- [ ] Validates input properly

**Visual Issues**:
- [ ] No grey overlay in Availability calendar
- [ ] Good contrast in dark mode
- [ ] No Team Availability clutter

## Acceptance

### Primary Acceptance Criteria

1. **✅ Terminology Consistency**
   - All user-facing text shows "Session Type(s)" instead of "Event Type(s)"
   - Navigation, headers, buttons, dialogs all updated
   - Database schema unchanged

2. **✅ Working Forms**
   - Session Title field is editable and persists changes
   - "New" button opens the create session type dialog
   - Form state management works correctly

3. **✅ Clean Availability UI**
   - "Team Availability" completely removed (button, routes, dead code)
   - Calendar view has no grey overlay or contrast issues
   - Dark mode meets accessibility standards

4. **✅ Functional New Booking**
   - "New Booking" button opens working dialog
   - Session Type dropdown loads from `event_types` table
   - Required fields enforced: client_name, client_email
   - Optional fields supported: client_phone, notes
   - Successful creation shows in Bookings list and Calendar

5. **✅ Robust API**
   - `/api/bookings` no longer returns generic "bad request"
   - Clear, specific error messages for all failure cases
   - Handles schema mismatches gracefully
   - Prefers `start_time`/`end_time` over legacy columns

6. **✅ Build Quality**
   - `npm run build` passes without errors
   - `npm run lint` shows no new errors
   - All TypeScript compilation successful

### Secondary Acceptance Criteria

7. **✅ Embed Widget Compatibility**
   - In-house `/schedule/[slug]` routes work unchanged
   - No leftover `@calcom/*` imports
   - Widget creates bookings that appear in admin

8. **✅ Data Integrity**
   - All bookings satisfy NOT NULL constraints
   - Client data properly stored (inline or FK)
   - Start/end times correctly calculated

9. **✅ Error Handling**
   - API returns structured error responses
   - Frontend shows user-friendly error messages
   - Validation errors highlight specific fields

10. **✅ Performance**
    - No degradation in page load times
    - API responses under 500ms for typical operations
    - No memory leaks in form components

### Manual Validation Script

```bash
# Build and lint checks
npm run lint -- --fix
npm run build

# Manual testing flow
echo "✅ Testing Acceptance Criteria:"
echo "1. Check 'Session Types' terminology throughout app"
echo "2. Test Session Title input field editing"
echo "3. Verify Availability calendar (no overlay)"
echo "4. Test New Booking dialog end-to-end"
echo "5. Verify API error messages are clear"
echo "6. Confirm build passes without issues"
```

This specification provides a comprehensive plan to fix all identified issues while maintaining system stability and improving user experience.