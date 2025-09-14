# Remove Tally Integration

## Problem Statement

The ModFram booking platform currently includes Tally form integration code that is no longer needed. This integration was designed to handle form submissions and link them to bookings, but since we're not using Tally for the booking platform, this code creates unnecessary complexity and maintenance burden.

The current Tally integration includes:
- Webhook endpoint for processing Tally form submissions
- React component for embedding Tally forms
- Database schema for storing Tally submissions
- Type definitions for Tally-related data structures
- References to Tally in user integrations

Removing this unused code will:
- Simplify the codebase and reduce complexity
- Eliminate security surface area from unused webhook endpoints
- Clean up database schema by removing unused tables
- Remove unused dependencies and type definitions
- Improve code maintainability and clarity

## Files to Clean

### Complete File Removal
These files should be deleted entirely as they serve no purpose without Tally integration:

1. **`src/app/api/webhooks/tally/route.ts`**
   - Webhook endpoint for processing Tally form submissions
   - Handles POST requests for form responses
   - GET request handler for webhook verification
   - No longer needed without Tally integration

2. **`src/components/tally/TallyEmbed.tsx`**
   - React component for embedding Tally forms
   - Includes modal and inline display modes
   - Contains custom hook `useTallyForm`
   - Complete component removal required

### Partial File Updates
These files contain Tally references that need to be removed while preserving other functionality:

3. **`src/types/index.ts`**
   - Remove `TallySubmission` interface (lines ~100-110)
   - Update `UserIntegration.integration_type` to remove `"tally"` option
   - Keep all other type definitions intact

4. **`ai-docs/supabase-schema.md`**
   - Remove `tally_submissions` table creation
   - Remove related RLS policies for `tally_submissions`
   - Update documentation to reflect schema without Tally

### Database Schema Updates
The Supabase database schema needs cleaning:

5. **`tally_submissions` table**
   - Drop the entire table as it's no longer needed
   - Remove all associated RLS policies
   - Clean up any foreign key references

6. **`bookings` table modifications**
   - Remove `tally_submission_id` column (if it exists)
   - Remove `form_completed` column (if it exists)
   - These columns were referenced in the webhook but may not exist in current schema

## Implementation Details

### Phase 1: File Removal
```bash
# Remove Tally-specific files
rm -rf src/app/api/webhooks/tally/
rm -rf src/components/tally/
```

### Phase 2: Type Definition Updates

**File: `src/types/index.ts`**

Remove the `TallySubmission` interface:
```typescript
// DELETE THIS INTERFACE
export interface TallySubmission {
  id: string;
  event_id: string;
  form_id: string;
  form_name?: string;
  respondent_id?: string;
  booking_draft_id?: string;
  fields: Record<string, unknown>;
  raw_payload: Record<string, unknown>;
  created_at: string;
}
```

Update the `UserIntegration` interface:
```typescript
// CHANGE FROM:
integration_type: "google_calendar" | "stripe" | "tally";

// CHANGE TO:
integration_type: "google_calendar" | "stripe";
```

### Phase 3: Database Schema Updates

**Supabase Migration Commands:**
```sql
-- Drop RLS policies first
DROP POLICY IF EXISTS "owner_via_booking" ON public.tally_submissions;

-- Drop the table
DROP TABLE IF EXISTS public.tally_submissions;

-- If these columns exist in bookings table, remove them
ALTER TABLE public.bookings DROP COLUMN IF EXISTS tally_submission_id;
ALTER TABLE public.bookings DROP COLUMN IF EXISTS form_completed;
```

### Phase 4: Documentation Updates

**File: `ai-docs/supabase-schema.md`**

Remove these sections:
```sql
-- DELETE THESE LINES
create table if not exists public.tally_submissions (
  id uuid primary key default gen_random_uuid(),
  event_id text not null unique,
  form_id text not null,
  form_name text,
  respondent_id text,
  booking_draft_id uuid references public.bookings(id) on delete set null,
  fields jsonb not null default '{}',
  raw_payload jsonb not null default '{}',
  created_at timestamptz default now()
);

alter table public.tally_submissions enable row level security;

-- Tally submissions are linked via booking, so we check ownership through booking's user_id
create policy "owner_via_booking" on public.tally_submissions for all using (
  exists (
    select 1 from public.bookings 
    where bookings.id = tally_submissions.booking_draft_id 
    and bookings.user_id = auth.uid()
  )
);
```

### Phase 5: Import and Reference Cleanup

**Search for and remove any remaining references:**
```bash
# Search for any missed Tally references
grep -r -i "tally" src/ --exclude-dir=node_modules
grep -r "TallyEmbed" src/ --exclude-dir=node_modules
grep -r "tally_submission" src/ --exclude-dir=node_modules
grep -r "booking_draft_id" src/ --exclude-dir=node_modules
```

**Common places to check:**
- Import statements in other components
- Route registrations or middleware
- Environment variable references
- Test files
- Configuration files

## Self-Validation

### Verification Checklist

After completing the removal, verify the following:

#### ✅ File System Check
- [ ] `src/app/api/webhooks/tally/` directory is completely removed
- [ ] `src/components/tally/` directory is completely removed
- [ ] No files contain `import` statements referencing Tally components

#### ✅ Code Reference Check
```bash
# These commands should return no results
grep -r -i "tallyembed" src/
grep -r -i "usetally" src/
grep -r "tally_submission" src/
grep -r "booking_draft_id" src/ 
```

#### ✅ Type System Check
- [ ] TypeScript compilation succeeds: `npm run build`
- [ ] No TypeScript errors related to `TallySubmission` type
- [ ] `UserIntegration` type no longer includes `"tally"` as valid `integration_type`

#### ✅ Database Schema Check
```sql
-- These queries should return no rows/tables
SELECT * FROM information_schema.tables WHERE table_name = 'tally_submissions';
SELECT * FROM information_schema.columns WHERE column_name IN ('tally_submission_id', 'form_completed');
```

#### ✅ Runtime Check
- [ ] Application starts successfully: `npm run dev`
- [ ] No console errors related to Tally
- [ ] No 404 errors when accessing `/api/webhooks/tally` (should be 404 as expected)
- [ ] Booking flow works without Tally form integration

#### ✅ Lint and Test Check
- [ ] ESLint passes: `npm run lint`
- [ ] All existing tests pass (no tests should depend on Tally integration)

#### ✅ Documentation Check
- [ ] `ai-docs/supabase-schema.md` no longer references `tally_submissions`
- [ ] No README or documentation files reference Tally integration
- [ ] External setup docs don't mention Tally configuration

### Expected Outcomes

After successful removal:

1. **Reduced Complexity**: Codebase is simpler without unused Tally integration
2. **Security**: No exposed webhook endpoints for unused integrations  
3. **Performance**: Smaller bundle size and fewer runtime dependencies
4. **Maintainability**: Cleaner type definitions and database schema
5. **Clarity**: Code purpose is clearer without unused integration pathways

### Rollback Plan

If issues arise after removal:

1. **Restore from Git**: `git checkout HEAD~1 -- src/app/api/webhooks/tally/ src/components/tally/`
2. **Restore Types**: Revert changes to `src/types/index.ts`
3. **Restore Database**: Re-run original schema creation for `tally_submissions` table
4. **Verify**: Ensure application functions with restored Tally integration

The rollback should only be necessary if the removal uncovers unexpected dependencies that weren't identified during the audit phase.