# Fix Session Title and Bookings API

## Problem Statement

The current implementation has several critical issues that prevent proper session management and booking functionality:

1. **Session Title Input Bug**: The "Session Title" input field only accepts the first character due to a slug synchronization bug that overwrites the input on every keystroke.

2. **API-Database Schema Mismatch**: The `/api/bookings` endpoint expects columns like `start_time`/`end_time`, but the actual database schema uses `booking_date`, `booking_time`, and requires NOT NULL `client_name`. This causes "Failed to fetch bookings" errors in the Bookings and Calendar views.

3. **Incomplete New Booking Dialog**: The "New Booking" dialog doesn't submit required fields like `client_name` and fails to integrate with the Session Types from the Event Types list.

4. **Inconsistent Terminology**: UI still displays "Event Types" instead of the required "Session Types" terminology.

5. **Unnecessary Team Features**: "Team Availability" functionality exists but isn't needed for the in-house use case.

6. **Calendar UI Issue**: The Availability Calendar View has an unwanted grey overlay that affects usability.

## Solution Overview

### Core Fixes
- **Controlled Input Management**: Implement proper controlled inputs for Session Title and slug with one-time auto-generation and manual edit capability
- **Schema-Aware API**: Replace `/api/bookings` with a route that matches the actual database schema using `booking_date`/`booking_time`
- **Complete Booking Flow**: Wire "New Booking" dialog to load Session Types and submit all required fields
- **UI Consistency**: Rename all "Event Type(s)" references to "Session Type(s)"
- **Feature Cleanup**: Remove Team Availability functionality and fix Calendar grey overlay

### Key Benefits
- Eliminates booking fetch failures
- Enables proper session creation and management
- Provides consistent user experience
- Removes unnecessary complexity

## Technical Requirements

### Environment
- Next.js 15 app router with async route handlers
- Supabase SSR client requiring `await cookies()`
- TypeScript strict mode (no `any` types)
- Maintain RLS policies using authenticated `user_id`

### Database Schema
```sql
-- Relevant bookings table columns
bookings (
  id,
  user_id,           -- FK to authenticated user
  client_id,         -- Optional FK to clients table
  client_name,       -- NOT NULL required field
  client_email,      -- Optional contact info
  client_phone,      -- Optional contact info
  booking_date,      -- Date of booking (YYYY-MM-DD)
  booking_time,      -- Time of booking (HH:MM:SS)
  status,            -- Booking status (pending, confirmed, etc.)
  notes,             -- Optional booking notes
  created_at,
  updated_at,
  event_type_id,     -- Optional FK to event types
  service_type_id    -- Optional FK to service types
)
```

### API Response Format
```typescript
interface BookingResponse {
  id: string;
  user_id: string;
  client_name: string;
  client_email?: string | null;
  client_phone?: string | null;
  booking_date: string;
  booking_time: string;
  status: string;
  notes?: string | null;
  start_time: string;    // Computed from booking_date + booking_time
  end_time: string;      // Computed as start_time + 30 minutes
  created_at: string;
}
```

## Implementation Details

### 1. Fix Session Title + Slug (Controlled Inputs)

**Target Component**: Session Type create/edit form (likely in `EventTypeForm` or similar)

**Implementation Strategy**:
```tsx
const [title, setTitle] = useState("");
const [slug, setSlug] = useState("");
const [slugAutoFilled, setSlugAutoFilled] = useState(false);

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 60);
}

const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  setTitle(value);
  
  // Auto-fill slug only once, when it's empty
  if (!slugAutoFilled && value && !slug) {
    setSlug(slugify(value));
    setSlugAutoFilled(true);
  }
};

const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setSlug(slugify(e.target.value));
  setSlugAutoFilled(true);
};
```

### 2. Schema-Aware Bookings API

**Target File**: `src/app/api/bookings/route.ts`

**Core Features**:
- GET: List bookings ordered by `booking_date` + `booking_time`
- POST: Create bookings with required `client_name` field
- DELETE: Remove bookings by ID with user authorization
- Compute `start_time`/`end_time` from `booking_date` + `booking_time`
- Handle optional fields gracefully

**Helper Functions**:
```typescript
function combineDateTime(dateStr?: string | null, timeStr?: string | null): string | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (timeStr) {
    const [hours, minutes, seconds] = timeStr.split(":").map(Number);
    date.setUTCHours(hours ?? 0, minutes ?? 0, seconds ?? 0, 0);
  }
  return date.toISOString();
}
```

### 3. New Booking Dialog Integration

**Target Component**: `NewBookingDialog` component

**Required Changes**:
- Load Session Types from `event_types` table
- Add form fields for: `client_name` (required), `booking_date`, `booking_time`
- Optional fields: `client_email`, `client_phone`, `notes`
- POST to `/api/bookings` with proper payload
- Handle success/error states and refetch bookings list

**Form Validation**:
```typescript
interface BookingFormData {
  client_name: string;        // Required
  client_email?: string;      // Optional
  client_phone?: string;      // Optional
  booking_date: string;       // Required (YYYY-MM-DD)
  booking_time: string;       // Required (HH:MM:SS)
  notes?: string;             // Optional
  session_type_id?: string;   // Optional FK
}
```

### 4. UI Terminology Updates

**Target Areas**:
- Navigation sidebar: "Event Types" → "Session Types"
- Page headings and form labels
- Button text and placeholders
- Error messages and success notifications

**Search Patterns**:
- `"Event Type"` → `"Session Type"`
- `"Event Types"` → `"Session Types"`
- `"event type"` → `"session type"`
- `"event types"` → `"session types"`

### 5. Remove Team Availability

**Target Components**:
- Availability page tabs or navigation
- Team-related routes in availability section
- Any team selection UI components

**Strategy**:
- Hide/remove team availability tabs
- Simplify availability to individual user only
- Remove unused team-related code

### 6. Fix Calendar Grey Overlay

**Target Component**: Availability Calendar View

**Common CSS Issues**:
- Remove classes like `bg-gray-500/20`, `bg-gray-400/30`
- Remove absolute positioned overlay divs
- Ensure grid uses proper surface colors
- Maintain standard border/divider styling

**CSS Cleanup**:
```css
/* Remove these types of styles */
.calendar-overlay { display: none; }
.bg-gray-500\/20 { background: transparent; }

/* Ensure clean grid appearance */
.calendar-grid {
  background: theme(colors.background);
  border: theme(colors.border);
}
```

## Self-Validation Checklist

### Development Testing (`npm run dev`)

1. **Session Title Input**:
   - [ ] Can type full Session Title without character loss
   - [ ] Slug auto-fills once when title is entered
   - [ ] Slug remains editable after auto-fill
   - [ ] Can manually edit slug without title interference

2. **Session Type Management**:
   - [ ] Can create new session type successfully
   - [ ] Session type appears in listings
   - [ ] Edit functionality works properly

3. **Booking Functionality**:
   - [ ] "New Booking" dialog opens without errors
   - [ ] Client Name field is required and enforced
   - [ ] Date and Time pickers work correctly
   - [ ] Can create booking successfully
   - [ ] Created booking appears in listings

4. **API Integration**:
   - [ ] Bookings list loads without "Failed to fetch" errors
   - [ ] Calendar view displays bookings correctly
   - [ ] API returns proper start_time/end_time computed values

5. **UI Consistency**:
   - [ ] All "Event Type" references changed to "Session Type"
   - [ ] Navigation shows "Session Types"
   - [ ] No "Team Availability" visible in UI

6. **Calendar Appearance**:
   - [ ] Availability Calendar has no grey overlay/haze
   - [ ] Grid appears clean with proper surface colors
   - [ ] Standard border styling maintained

### Build Validation (`npm run build`)

1. **Compilation**:
   - [ ] TypeScript compilation passes without errors
   - [ ] No unused import warnings for removed features
   - [ ] All API routes compile successfully

2. **Type Safety**:
   - [ ] No `any` types in new/modified code
   - [ ] Proper interfaces for API requests/responses
   - [ ] Supabase client typing maintained

### Database Integration

1. **Schema Compatibility**:
   - [ ] Bookings API uses actual database columns
   - [ ] RLS policies respected for user data
   - [ ] Required fields properly enforced

2. **Data Integrity**:
   - [ ] Created bookings have all required fields
   - [ ] User isolation maintained through `user_id`
   - [ ] Optional fields handle null values correctly

## Migration Notes

### Existing Data
- Existing bookings with old schema will be handled gracefully
- No data migration required for this change
- New bookings will use proper schema fields

### Backward Compatibility
- API maintains response format for frontend compatibility
- Computed fields (`start_time`/`end_time`) provide bridge to existing UI
- Gradual migration path for any legacy components

## Testing Strategy

### Unit Tests
- API route handlers for all CRUD operations
- Form validation logic
- Date/time computation functions
- Slug generation utility

### Integration Tests
- Full booking creation flow
- Session type management workflow
- Calendar view data loading
- Error handling scenarios

### User Experience Tests
- Session title/slug editing experience
- Booking creation workflow
- Calendar view usability
- Mobile responsiveness maintained