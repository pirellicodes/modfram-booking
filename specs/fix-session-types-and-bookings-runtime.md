# Fix Session Types and Bookings Runtime

## Problem
- Session Type form: "Session Title" works but "URL Slug" only accepts ~1 char; auto-slug keeps overwriting manual edits. Creation sometimes shows "Unauthorized".
- Bookings/Calendar: GET /api/bookings returns "bad request" (opaque). Need schema-aware API & clearer errors.
- New Booking dialog must POST required fields for current schema (NOT NULL client_name), and "Session Type" dropdown should load from `event_types` (renamed to "Session Types" in UI).

## Solution
- Make title/slug **fully controlled** with one-time auto-fill, then manual override. Validate slug (kebab-case), uniqueness per user.
- Add **/api/session-types** (GET/POST/PUT/DELETE) with Supabase SSR (await `cookies()`), set `user_id=auth.uid()`, handle RLS. Return clear JSON errors.
- Replace /api/bookings with a **schema-aware** route using actual columns: `booking_date`, `booking_time`, `client_name`, … Compute `start_time/end_time` for UI. Return precise error messages.
- Update New Booking dialog: require `client_name`, `booking_date`, `booking_time`; optional email/phone/notes; optional `event_type_id`. Pull options from Session Types.

## Requirements
- Next.js 15 App Router, TypeScript strict.
- Supabase SSR: `const c = await cookies()`; pass to `createServerClient`.
- Respect RLS: policies for own `user_id`. No Cal.com dependencies.
- Keep existing tables; don't rename DB columns. Add constraints/policies if missing.

## Implementation Steps

1) **Session Type form (create/edit)**
   - In the component handling "Create Session Type" (files: `EventTypeForm` / `EventTypeBasicForm` or similar):
     ```tsx
     const [title, setTitle] = useState("");
     const [slug, setSlug] = useState("");
     const [slugTouched, setSlugTouched] = useState(false);

     const slugify = (s:string) =>
       s.toLowerCase().trim().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"").slice(0,60);

     <input value={title} onChange={(e) => {
       const v = e.target.value;
       setTitle(v);
       if (!slugTouched) setSlug(slugify(v));
     }} />

     <input value={slug}
            onChange={(e)=>{ setSlug(slugify(e.target.value)); setSlugTouched(true); }}
            onBlur={()=> setSlug((s)=> s || slugify(title)) } />
     ```
   - Before submit, **check uniqueness**:
     ```ts
     const { data: clash } = await supabase
       .from("event_types").select("id").eq("user_id", user.id).eq("slug", slug).maybeSingle();
     if (clash) throw new Error("Slug already in use");
     ```
   - Submit via **/api/session-types** (created below).

2) **/api/session-types route**
   - `src/app/api/session-types/route.ts` with GET (list for user), POST (insert), PUT (update by id), DELETE.
   - Always await cookies(); set `user_id` on insert/update; return `{error: string}` on failure.
   - Expected insert fields: `title`, `slug`, `description?`, `duration_minutes?`, etc. (Infer from existing table and form; don't require extras.)

3) **DB policies & constraints (SQL)**
   - Add once-only migration (idempotent guards):
     ```sql
     -- Unique slug per user
     DO $$ BEGIN
       IF NOT EXISTS (
         SELECT 1 FROM pg_indexes WHERE indexname='event_types_user_slug_key'
       ) THEN
         CREATE UNIQUE INDEX event_types_user_slug_key ON public.event_types (user_id, slug);
       END IF;
     END $$;

     -- RLS policies (assumes row-level security ON)
     DO $$ BEGIN
       IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE polname='event_types_select_own') THEN
         CREATE POLICY event_types_select_own ON public.event_types
           FOR SELECT USING (auth.uid() = user_id);
       END IF;
       IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE polname='event_types_insert_own') THEN
         CREATE POLICY event_types_insert_own ON public.event_types
           FOR INSERT WITH CHECK (auth.uid() = user_id);
       END IF;
       IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE polname='event_types_update_own') THEN
         CREATE POLICY event_types_update_own ON public.event_types
           FOR UPDATE USING (auth.uid() = user_id);
       END IF;
       IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE polname='event_types_delete_own') THEN
         CREATE POLICY event_types_delete_own ON public.event_types
           FOR DELETE USING (auth.uid() = user_id);
       END IF;
     END $$;
     ```

4) **/api/bookings (replace with schema-aware + verbose errors)**
   - Use columns: `id,user_id,client_id,client_name,client_email,client_phone,booking_date,booking_time,status,notes,created_at`.
   - GET: filter by `user_id`, order by `booking_date`,`booking_time`. Map:
     ```ts
     const start = combine(booking_date, booking_time); // ISO
     const end   = addMinutes(start, 30);
     ```
   - POST: require `client_name`, `booking_date` (YYYY-MM-DD), `booking_time` (HH:MM:SS). Assign `user_id`.
   - DELETE: by `id` + `user_id`.
   - **Error helper** returns exact `error.message` from Supabase; add console.error with context so the UI sees real cause instead of generic "bad request".

5) **New Booking dialog**
   - Fetch Session Types from `/api/session-types` for dropdown (label: "Session Type").
   - Required inputs: `client_name`, `booking_date` (date picker), `booking_time` (time picker).
   - Optional: `client_email`, `client_phone`, `notes`, `event_type_id`.
   - On submit, POST to `/api/bookings`; on success, close and `refetch()`.

6) **Copy & UX cleanups**
   - Ensure all UI copy says **"Session Type(s)"** (not "Event").
   - Remove/hide any "Team Availability" entry.
   - Fix Availability Calendar shade: remove/override any `bg-gray-xxx/opacity` overlay on the grid container.

7) **Diagnostics**
   - In `/api/bookings` and `/api/session-types`, include:
     ```ts
     catch(e){ console.error('API/<route> error', e); return NextResponse.json({ error: (e as any)?.message ?? 'unknown' }, { status: 400 }); }
     ```
   - In `use-bookings`, when `!response.ok`, log returned `error` string to console so we see the real DB/authorization reason.

## Validation
- Can type full Session Title; slug auto-fills once, remains editable; creating a Session Type succeeds (no "Unauthorized").
- `/bookings` and `/calendar` load; GET `/api/bookings` returns data or empty array (no "bad request").
- New Booking dialog creates a row when required fields present (no NOT NULL violations).
- Slug uniqueness enforced per user; meaningful error shown if duplicate.
- Build passes; no TypeScript errors.