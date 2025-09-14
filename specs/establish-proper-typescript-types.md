# Establish Proper TypeScript Types

## Problem Statement

**Current State**: Cascading TypeScript compilation errors preventing deployment for hours. The application suffers from inconsistent type definitions, mismatched interfaces, and missing type exports leading to an endless cycle of fixing one error only to reveal new type mismatches.

**Core Issues Identified**:
- Database schema types (`EventType`) conflict with domain types (`EventType` in `/src/types/index.ts`)  
- Missing exports: `Event` should be `EventTypes`, `EventTypes` constant undefined
- Form data interfaces don't align with database schema (nullable vs optional mismatches)
- JSON fields parsed incorrectly (`locations`, `metadata`, `bookingFields` etc.)
- Theme provider imports missing type declarations
- Inconsistent property naming between database and application layer

**Impact**:
- Cannot deploy to production due to TypeScript compilation failures
- Development workflow broken - every change breaks existing functionality  
- Lost confidence in codebase stability as fixing one area breaks others
- Wasted development time on symptom fixes instead of addressing root architectural issues

## Technical Requirements

### 1. Unified Type System Architecture
- **Single Source of Truth**: Database schema types should be the foundation for all other types
- **Layered Typing**: Database → Domain → API → UI type layers with proper inheritance
- **Consistent Naming**: Standardize between snake_case (database) and camelCase (frontend)
- **Null Safety**: Proper handling of nullable database fields vs optional TypeScript properties

### 2. Database-First Type Generation  
- Export properly typed interfaces from `/src/db/schema.ts` 
- Generate domain types that extend database types with computed properties
- Ensure JSON field types are properly parsed and typed
- Create migration-safe types that handle schema evolution

### 3. Form and API Integration Types
- Form data interfaces must precisely match database constraints
- API request/response types aligned with database schema
- Validation schemas (Zod) generated from the same type definitions
- Error-free serialization/deserialization of complex nested objects

### 4. Component and Hook Type Safety
- All React components have proper prop types derived from domain models
- Custom hooks return properly typed data matching expected UI contracts
- Event handlers and callback functions have precise type signatures
- Calendar and dashboard components use consistent event/booking data shapes

## Implementation Details

### Phase 1: Database Type Foundation (`/src/lib/types/database.ts`)

```typescript
// Generate from schema.ts - the single source of truth
export type DatabaseEventType = typeof eventTypes.$inferSelect;
export type NewEventType = typeof eventTypes.$inferInsert; 
export type DatabaseEvent = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

// Helper types for JSON fields with proper parsing
export type ParsedLocations = LocationObject[];
export type ParsedMetadata = Record<string, unknown>;
export type ParsedBookingFields = BookingField[];
export type ParsedBookingLimits = BookingLimits;
export type ParsedDurationLimits = DurationLimits;
export type ParsedRecurringEvent = RecurringEvent;
```

### Phase 2: Domain Type Layer (`/src/types/index.ts`) 

```typescript
// Domain types that extend database types with computed properties
export interface EventType extends Omit<DatabaseEventType, 'locations' | 'metadata' | 'bookingFields' | 'bookingLimits' | 'durationLimits' | 'recurringEvent'> {
  // Parsed JSON fields with proper types
  locations?: ParsedLocations;
  metadata?: ParsedMetadata; 
  bookingFields?: ParsedBookingFields;
  bookingLimits?: ParsedBookingLimits;
  durationLimits?: ParsedDurationLimits;
  recurringEvent?: ParsedRecurringEvent;
}

// Rename to avoid conflicts - this should be Events (plural)
export interface CalendarEvent extends Omit<DatabaseEvent, 'startDate' | 'endDate'> {
  start: Date; // Computed from startDate + startTime  
  end: Date;   // Computed from endDate + endTime
}

// Form-specific types with proper validation alignment
export interface EventTypeFormData extends Partial<EventType> {
  // Handle null vs undefined mismatches from form inputs
  length: number; // Required in forms, maps to database length
  price?: number | null; // Allow null from form, convert to undefined for database
  minimum_booking_notice?: number | null;
  period_days?: number | null;
  seats_per_time_slot?: number[] | null; // Fix array type mismatch
}
```

### Phase 3: API Response Types (`/src/types/api.ts`)

```typescript
// API layer types for request/response handling
export interface EventTypesResponse {
  data: EventType[];
  meta: PaginationMeta;
}

export interface CreateEventTypeRequest extends Omit<NewEventType, 'id' | 'created_at' | 'updated_at'> {
  // Override JSON fields to accept parsed objects from frontend
  locations?: ParsedLocations;
  metadata?: ParsedMetadata;
  bookingFields?: ParsedBookingFields;
}

export interface UpdateEventTypeRequest extends Partial<CreateEventTypeRequest> {
  id: string; // Required for updates
}
```

### Phase 4: Component Prop Types (`/src/types/components.ts`)

```typescript  
// UI component prop types derived from domain types
export interface EventTypeFormProps {
  initialData?: EventType;
  onSubmit: (data: EventTypeFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface EventCalendarProps {
  events: CalendarEvent[];
  onEventSelect?: (event: CalendarEvent) => void;
  onSlotSelect?: (slotInfo: CalendarSlotInfo) => void;
  view?: 'month' | 'week' | 'day';
}
```

### Phase 5: Constants and Utilities Fixes

```typescript
// Fix /src/constants/calendar-constant.ts
import type { CalendarEvent } from '@/types/index'; // Rename from Event
import type { DatabaseEventType } from '@/lib/types/database';

// Define the missing EventTypes constant properly
export const EventTypes = {
  PERSONAL: 'personal',
  BUSINESS: 'business', 
  MEETING: 'meeting'
} as const;

export type EventTypeCategory = typeof EventTypes[keyof typeof EventTypes];
```

## Self-Validation

### Compilation Checks
1. **Zero TypeScript Errors**: `npx tsc --noEmit` must pass without any errors
2. **Build Success**: `npm run build` completes successfully  
3. **Linting Passes**: `npm run lint` completes without type-related errors

### Type Safety Validation
1. **Database Queries**: All database operations have proper return types
2. **Form Submissions**: Form data serializes correctly to API requests
3. **Component Props**: All component props are properly typed and validated
4. **API Responses**: All API responses match expected interface contracts

### Runtime Validation  
1. **JSON Field Parsing**: Complex JSON fields parse correctly without runtime errors
2. **Null/Undefined Handling**: Forms handle database nullable fields correctly
3. **Calendar Events**: Event objects display correctly in all calendar components
4. **Dashboard Data**: All dashboard hooks return properly shaped data

## Files to Modify

### Core Type Definitions
- `/src/lib/types/database.ts` - **CREATE** - Database-first type definitions
- `/src/types/index.ts` - **MODIFY** - Refactor domain types to extend database types  
- `/src/types/event-types.ts` - **MODIFY** - Fix EventTypeWithParsedFields to use new foundation
- `/src/types/api.ts` - **MODIFY** - Align API types with database schema
- `/src/types/components.ts` - **MODIFY** - Update component prop types
- `/src/types/forms.ts` - **MODIFY** - Fix form validation types

### Database Schema Integration
- `/src/db/schema.ts` - **MODIFY** - Ensure proper type exports and naming
- `/src/lib/supabase-server.ts` - **MODIFY** - Fix database client typing  
- `/src/lib/types.ts` - **MODIFY** - Remove duplicate type definitions

### Application Layer Fixes
- `/src/constants/calendar-constant.ts` - **MODIFY** - Fix Event import, define EventTypes constant
- `/src/hooks/use-dashboard-data.ts` - **MODIFY** - Fix return type mismatches
- `/src/hooks/use-event.ts` - **MODIFY** - Fix Event import and EventTypes usage
- `/src/components/event-types/EventTypeForm.tsx` - **MODIFY** - Fix form data type mismatches
- `/src/components/EventTypes.tsx` - **MODIFY** - Fix EventTypeWithParsedFields usage
- `/src/components/theme-provider.tsx` - **MODIFY** - Fix next-themes import

### Validation and Utilities  
- `/src/lib/event.ts` - **MODIFY** - Ensure event utilities use consistent types
- `/src/lib/event-calendar/event.ts` - **MODIFY** - Fix calendar event type usage
- `/src/lib/date-utils.ts` - **MODIFY** - Ensure date utility functions are properly typed

### Testing and Quality Assurance
- **CREATE** `/src/types/__tests__/type-safety.test.ts` - Type safety validation tests
- **CREATE** `/src/lib/__tests__/schema-validation.test.ts` - Database schema validation

This comprehensive approach will establish a solid, maintainable TypeScript foundation that prevents future cascading error cycles while ensuring type safety across the entire application stack.