# Establish Proper TypeScript Types

## Problem Statement

The current TypeScript implementation is causing an endless cycle of type errors that create new conflicts when fixed individually. The root issues include:

1. **Inconsistent Date Handling**: Mixed usage of `Date`, `string`, and timestamp formats across components
2. **Missing Type Definitions**: Components rely on implicit `any` types or incomplete interfaces
3. **Form Data Type Conflicts**: React Hook Form data shapes don't match database schemas
4. **Chart Data Type Mismatches**: Recharts expects specific data structures that don't align with our data
5. **Component Prop Type Gaps**: Missing or incomplete prop type definitions causing cascade failures
6. **API Response Type Inconsistencies**: Server responses don't match client-side type expectations

This fragmented approach to typing is causing:
- Build failures that multiply when fixing individual errors
- Runtime type coercion issues
- Poor developer experience with IDE warnings
- Maintenance overhead from inconsistent patterns

## Solution Overview

Establish a comprehensive type system foundation that:

1. **Standardizes Date Handling**: Single source of truth for date/time types
2. **Defines Core Domain Types**: Complete interfaces for all business entities
3. **Ensures API Consistency**: Matching types between client and server
4. **Provides Component Type Safety**: Full prop type coverage
5. **Supports Form Integration**: Aligned form schemas with validation

## Type Definitions

### Core Domain Types

```typescript
// Database entity types
interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

interface Client {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
  created_at: string;
}

interface Event {
  id: string;
  user_id: string;
  title: string;
  start: string; // ISO string
  end: string;   // ISO string
  notes?: string;
  created_at: string;
}

interface Booking {
  id: string;
  user_id: string;
  client_id?: string;
  client?: Client;
  start: string; // ISO string
  end: string;   // ISO string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  created_at: string;
}

interface Payment {
  id: string;
  user_id: string;
  booking_id?: string;
  booking?: Booking;
  amount_cents: number;
  currency: string;
  stripe_payment_intent_id?: string;
  status: 'requires_payment_method' | 'processing' | 'succeeded' | 'failed';
  created_at: string;
}

interface Availability {
  id: string;
  user_id: string;
  weekday: number; // 0-6
  slots: TimeSlot[];
}

interface TimeSlot {
  start: string; // HH:mm format
  end: string;   // HH:mm format
}
```

### Form Types

```typescript
// Form data types that align with database schemas
interface ClientFormData {
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
}

interface EventFormData {
  title: string;
  start: Date;
  end: Date;
  notes?: string;
}

interface BookingFormData {
  client_id?: string;
  start: Date;
  end: Date;
  status: Booking['status'];
  notes?: string;
}

interface AvailabilityFormData {
  weekday: number;
  slots: TimeSlot[];
}
```

### Component Prop Types

```typescript
// Calendar component types
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: any;
}

interface CalendarProps {
  events: CalendarEvent[];
  onSelectEvent?: (event: CalendarEvent) => void;
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void;
  view?: 'month' | 'week' | 'day';
  date?: Date;
}

// Chart component types
interface ChartDataPoint {
  name: string;
  value: number;
  date?: string;
}

interface RecentPaymentsChartProps {
  data: ChartDataPoint[];
  className?: string;
}

// Form component types
interface FormFieldProps<T = any> {
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  value?: T;
  onChange?: (value: T) => void;
}
```

### API Types

```typescript
// API response types
interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API endpoint types
interface CreateBookingRequest {
  client_id?: string;
  start: string; // ISO string
  end: string;   // ISO string
  notes?: string;
}

interface UpdateBookingRequest extends Partial<CreateBookingRequest> {
  status?: Booking['status'];
}
```

### Utility Types

```typescript
// Date handling utilities
type DateInput = Date | string | number;
type ISOString = string;
type TimeString = string; // HH:mm format

// Helper types
type WithTimestamps<T> = T & {
  created_at: string;
  updated_at?: string;
};

type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
type Required<T, K extends keyof T> = T & Required<Pick<T, K>>;
```

## Implementation Strategy

### Phase 1: Core Type Definitions
1. Create `src/types/index.ts` with all core domain types
2. Create `src/types/forms.ts` for form-specific types  
3. Create `src/types/api.ts` for API request/response types
4. Create `src/types/components.ts` for component prop types

### Phase 2: Date Handling Standardization
1. Create `src/lib/date-utils.ts` with typed date conversion functions
2. Update all components to use standardized date utilities
3. Ensure consistent ISO string usage for API communication
4. Convert Date objects only at UI boundaries

### Phase 3: Component Type Application
1. Update all form components with proper prop types
2. Apply types to calendar components and event handling
3. Type all chart components with expected data shapes
4. Ensure dashboard components have complete prop interfaces

### Phase 4: API Integration
1. Type all API route handlers with request/response types
2. Update client-side API calls to use typed interfaces
3. Ensure Supabase queries return properly typed data
4. Add runtime validation where necessary

### Phase 5: Form Schema Alignment
1. Update React Hook Form schemas to match database types
2. Ensure Zod validators align with TypeScript interfaces
3. Create form data transformation utilities
4. Test form submission and validation flows

## Self-Validation

### Type Coverage Verification
- [ ] All components have explicit prop type definitions
- [ ] All API endpoints have typed request/response interfaces
- [ ] All form components use properly typed schemas
- [ ] All database entities have complete type definitions

### Date Handling Consistency
- [ ] All date values use consistent format (ISO strings for API, Date objects for UI)
- [ ] Date conversion utilities handle all edge cases
- [ ] Calendar components receive properly formatted date data
- [ ] Form date inputs align with backend expectations

### Build Validation
- [ ] TypeScript compilation succeeds without errors
- [ ] ESLint passes without type-related warnings
- [ ] All imports resolve to properly typed modules
- [ ] No usage of `any` types in core application code

### Runtime Validation
- [ ] Forms submit data in expected formats
- [ ] API responses match TypeScript interface definitions
- [ ] Calendar events render without type coercion issues
- [ ] Chart components receive data in expected shapes

### Integration Testing
- [ ] End-to-end booking flow works without type errors
- [ ] Client management CRUD operations are properly typed
- [ ] Event calendar integration maintains type safety
- [ ] Payment processing flow has complete type coverage

This comprehensive approach will eliminate the current type error cycle by establishing a solid foundation that prevents conflicts before they occur, rather than fixing them after they cascade through the application.