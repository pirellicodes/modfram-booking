# Fix All Property Name Mismatches

## Problem Statement

The comprehensive TypeScript type system implementation has created property name mismatches throughout the codebase. Components are referencing property names that don't match the new TypeScript interfaces, causing runtime errors and type failures. Key issues include:

1. **EventTypes.tsx Property Mismatches**: Components trying to use `duration_minutes`, `price_cents` but interfaces may expect different names
2. **Database vs UI Property Naming**: Inconsistency between database field names (snake_case) and UI property names (camelCase)
3. **Form Data vs Entity Property Names**: Form interfaces using different property names than database entity interfaces
4. **Legacy Property References**: Components still using old property names that no longer exist in the new type system
5. **Cascading Type Failures**: Property mismatches causing TypeScript compilation errors and runtime undefined property access

This systematic mismatch prevents proper data flow between components and the type system, breaking functionality across the application.

## Property Mapping Analysis

### Core Entity Property Analysis

**EventType Interface (`src/types/index.ts`):**
```typescript
interface EventType {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  duration_minutes: number;    // Database field
  price_cents?: number;        // Database field
  buffer_time_minutes?: number;
  max_bookings_per_day?: number;
  requires_confirmation?: boolean;
  is_active: boolean;
  booking_window_days?: number;
  minimum_notice_hours?: number;
  created_at: string;
  updated_at?: string;
}
```

**EventTypeFormData Interface (`src/types/forms.ts`):**
```typescript
interface EventTypeFormData {
  // Core fields
  title: string;
  description?: string;
  duration_minutes: number;
  price_cents?: number;
  
  // Form-specific aliases
  length?: number;           // Alias for duration_minutes
  price?: string;            // String version for form input
  currency?: string;
  
  // Extended form fields
  slug?: string;
  locations?: LocationObject[];
  // ... more form-specific fields
}
```

### Component Property Usage Audit

**Files Requiring Property Name Analysis:**
1. `src/components/EventTypes.tsx` - Primary EventType display component
2. `src/components/event-types/EventTypeForm.tsx` - Main form component
3. `src/components/event-types/EventTypeBasicForm.tsx` - Form sections
4. `src/components/event-types/EventTypeAdvancedForm.tsx`
5. `src/components/event-types/EventTypeAvailabilityForm.tsx`
6. `src/components/event-types/EventTypeBookingForm.tsx`
7. `src/hooks/use-dashboard-data.ts` - Data fetching hooks
8. `src/app/api/event-types/[id]/route.ts` - API endpoints

### Property Mapping Strategy

**Database Entity ↔ UI Component Mapping:**
```typescript
// Database (snake_case) → UI Component (expected property)
duration_minutes → duration_minutes (keep consistent)
price_cents → price_cents (keep consistent)
requires_confirmation → requires_confirmation (keep consistent)
user_id → user_id (keep consistent)
created_at → created_at (keep consistent)
```

**Form Data ↔ Database Entity Mapping:**
```typescript
// Form (mixed) → Database (snake_case)
length → duration_minutes
price (string) → price_cents (number)
requiresConfirmation → requires_confirmation
userId → user_id
```

## Implementation Strategy

### Phase 1: Property Name Standardization

**Establish Consistent Naming Convention:**
- Database entities: snake_case (matches database schema)
- Form data: Support both snake_case and aliases for UI convenience
- API requests/responses: snake_case (matches database)
- Component props: snake_case (matches entity interfaces)

### Phase 2: Component-by-Component Property Audit

**EventTypes.tsx Issues:**
```typescript
// Current (likely incorrect):
eventType.duration_minutes // May be undefined
eventType.price_cents     // May be undefined

// Expected fix:
eventType.duration_minutes // Ensure property exists in interface
eventType.price_cents     // Ensure property exists in interface
```

**Form Component Issues:**
```typescript
// EventTypeBasicForm.tsx - Property alias handling:
formData.length vs formData.duration_minutes
formData.price vs formData.price_cents
formData.requiresConfirmation vs formData.requires_confirmation
```

### Phase 3: Interface Alignment Strategy

**Option A: Single Source of Truth (Recommended)**
- Use database field names consistently across all interfaces
- Update components to use snake_case properties
- Maintain type safety throughout the stack

**Option B: Property Mapping Layer**
- Create transformation utilities between naming conventions
- Keep form-friendly names in UI components
- Transform data at API boundaries

### Phase 4: Systematic Component Updates

**For Each Component File:**
1. **Audit Current Property Usage**
   - List all property accesses (e.g., `object.property`)
   - Identify TypeScript errors and undefined property warnings

2. **Map to Correct Interface Properties**
   - Cross-reference with updated type definitions
   - Identify missing or renamed properties

3. **Update Property References**
   - Change property names to match interfaces
   - Add null/undefined checks where needed
   - Update destructuring assignments

4. **Test Data Flow**
   - Ensure data flows correctly from API to component
   - Verify form submissions use correct property names
   - Check type safety is maintained

### Phase 5: Data Transformation Utilities

**Create Helper Functions:**
```typescript
// src/lib/type-transforms.ts
export function entityToFormData(entity: EventType): EventTypeFormData {
  return {
    ...entity,
    length: entity.duration_minutes,
    price: entity.price_cents ? (entity.price_cents / 100).toString() : undefined,
    // ... other transformations
  };
}

export function formDataToEntity(formData: EventTypeFormData): Partial<EventType> {
  return {
    title: formData.title,
    description: formData.description,
    duration_minutes: formData.length || formData.duration_minutes,
    price_cents: formData.price ? Math.round(parseFloat(formData.price) * 100) : formData.price_cents,
    // ... other transformations
  };
}
```

## Self-Validation

### Property Consistency Check
- [ ] All EventType entity properties match database schema field names
- [ ] All components use properties that exist in their respective interfaces
- [ ] No undefined property access warnings in TypeScript compilation
- [ ] All form components can successfully read and write data

### Component-Interface Alignment
- [ ] EventTypes.tsx uses correct EventType interface properties
- [ ] All event-types form components use correct EventTypeFormData properties
- [ ] Dashboard hooks return data matching expected interface shapes
- [ ] API endpoints send/receive data with correct property names

### Data Flow Validation
- [ ] API responses match TypeScript interface definitions
- [ ] Form submissions include all required properties with correct names
- [ ] Component props receive data in expected format
- [ ] No runtime errors from accessing undefined properties

### TypeScript Compilation Validation
- [ ] No property access errors (TS2339: Property 'x' does not exist)
- [ ] No type assignment errors due to property mismatches
- [ ] All component prop types match actual usage
- [ ] Form validation schemas align with interface properties

### Functional Testing Validation
- [ ] EventTypes display correctly with proper data
- [ ] Event type forms can be filled and submitted
- [ ] Dashboard charts receive and display correct data
- [ ] Search and filtering work with correct property names
- [ ] CRUD operations use consistent property names throughout

### Database Integration Validation
- [ ] API queries use correct database column names
- [ ] Supabase operations reference correct table fields
- [ ] Insert/update operations include all required properties
- [ ] Property transformations maintain data integrity

This comprehensive approach will systematically identify and fix all property name mismatches, ensuring consistent data flow between the database, API, components, and TypeScript type system without breaking existing functionality.