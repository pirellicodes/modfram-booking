# Problem

- **Booking create**: Could not find the 'end_time' column of 'bookings' in the schema cache.
- **Session Type save**: Could not find the 'afterEventBuffer' column of 'event_types'.
- **Session Type form**: can't type Title until Slug has 1 char; slug only accepts 1 char; cannot save.
- **Calendar tab** shows nothing when there are no bookings; colors/filters hidden.
- **Availability "Add Event"** doesn't persist.
- **Need guard**: end_time must not be before start_time.

# Solution (high level)

## Schema reconcile (idempotent):

- `public.bookings`: `start_time timestamptz`, `end_time timestamptz` (nullable but present).
- `public.event_types`: snake_case fields used by UI: `after_event_buffer int default 0`, `before_event_buffer int default 0`, `length_in_minutes int default 30`, `price_cents int default 0`, `color text default 'indigo'`.
- Keep unique `(user_id, slug)` + owner-only RLS.

## Form control: 
Fully controlled Title/Slug with one-time auto-fill + manual override.

## API/session-types: 
SSR Supabase client; scope uniqueness to `(user_id, slug)`; map camel↔snake (`afterEventBuffer` ↔ `after_event_buffer`).

## API/bookings: 
Validate required fields; derive `start_time`/`end_time` from `booking_date`/time + `length_in_minutes`; always send `total_price` (type price or 0); enforce `end_time >= start_time`.

## Calendar refactor:

- Extract the working Availability calendar into a shared component and use it in Calendar so Calendar always renders even with zero bookings.
- Fallback palette if `event_types.color` missing; keep header/filters visible when empty.
- Availability's "Add Event" should POST to `/api/bookings`, then re-fetch and render.

## Debugging: 
Lightweight server logging, curl tests, Supabase MCP schema describe, PostgREST reload.

# Requirements

- Next.js 15 App Router; TypeScript strict.
- Supabase SSR via `cookies()`; never expose service role to client.
- Resilient to absent optional columns; add the ones UI depends on.
- All API errors: `{ error: string, hint?: string }`.
- After DDL: `select pg_notify('pgrst','reload schema')` (empty row is expected).

# Steps (implementation)

## 0) Tools

Use Supabase MCP (write) for schema checks & DDL, Octocode to find form/API/calendar files, Ref to pull patterns from:
- satnaing/shadcn-admin (calendar creation/persisting)
- Cal.com (buffers, duration, validation end >= start)

## 1) SQL migration (run via Supabase MCP → SQL Editor)

```sql
begin;

-- bookings: ensure columns used by UI/API exist
alter table public.bookings
  add column if not exists start_time timestamptz,
  add column if not exists end_time   timestamptz,
  alter column total_price set default 0;
update public.bookings set total_price = 0 where total_price is null;

-- event_types: fields UI references (snake_case)
alter table public.event_types
  add column if not exists after_event_buffer  integer default 0,
  add column if not exists before_event_buffer integer default 0,
  add column if not exists length_in_minutes   integer default 30,
  add column if not exists price_cents         integer default 0,
  add column if not exists color               text    default 'indigo';

-- RLS (owner-only)
alter table public.bookings    enable row level security;
alter table public.event_types enable row level security;

drop policy if exists "bookings_select_own" on public.bookings;
create policy "bookings_select_own" on public.bookings for select using (auth.uid() = user_id);
drop policy if exists "bookings_ins_own" on public.bookings;
create policy "bookings_ins_own" on public.bookings for insert with check (auth.uid() = user_id);
drop policy if exists "bookings_upd_own" on public.bookings;
create policy "bookings_upd_own" on public.bookings for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "bookings_del_own" on public.bookings;
create policy "bookings_del_own" on public.bookings for delete using (auth.uid() = user_id);

create unique index if not exists event_types_user_slug_key on public.event_types(user_id, slug);
drop policy if exists "event_types_select_own" on public.event_types;
create policy "event_types_select_own" on public.event_types for select using (auth.uid() = user_id);
drop policy if exists "event_types_ins_own" on public.event_types;
create policy "event_types_ins_own" on public.event_types for insert with check (auth.uid() = user_id);
drop policy if exists "event_types_upd_own" on public.event_types;
create policy "event_types_upd_own" on public.event_types for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "event_types_del_own" on public.event_types;
create policy "event_types_del_own" on public.event_types for delete using (auth.uid() = user_id);

-- PostgREST schema cache
select pg_notify('pgrst','reload schema');
commit;
```

## 2) Calendar refactor

Extract shared component from Availability calendar to:
`src/components/calendar/BookingCalendar.tsx`

Props:
```typescript
type Props = {
  mode: 'view' | 'availability';
  initialRange?: { start: string; end: string };
  events?: Array<...>;               // normalized
  onCreateBooking?: (payload)=>Promise<void>;
  onRangeChange?: (r)=>void;
}
```

**Behavior:**
- Always render header, filters, color chips, and time grid even when `events.length === 0`.
- Guard in UI: prevent choosing end < start; show inline error.
- Color: `event_types.color ?? 'indigo'` → fixed palette.

**Calendar tab** (`src/app/(admin)/calendar/page.tsx`)
- Server-fetch bookings for current range via `/api/bookings?start=…&end=…` (return `[]` if none).
- Render `<BookingCalendar mode="view" events={...} initialRange={...}/>`; never hide chrome.

**Availability tab reuses it**
`src/app/(admin)/availability/page.tsx`
- `<BookingCalendar mode="availability" onCreateBooking={POST /api/bookings then re-fetch} />`
- Delete/replace any duplicate calendar logic in Calendar tab; the shared component is canonical.

## 3) Session Type form (fix editability)

Controlled inputs with `slugTouched` guard:

```typescript
const [title,setTitle] = useState("");
const [slug,setSlug] = useState("");
const [slugTouched,setSlugTouched] = useState(false);
const slugify=(s:string)=>s.toLowerCase().trim().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"").slice(0,60);

<Input value={title} onChange={(e)=>{ const v=e.target.value; setTitle(v); if(!slugTouched) setSlug(slugify(v)); }} />
<Input value={slug}  onChange={(e)=>{ setSlug(slugify(e.target.value)); setSlugTouched(true); }}
       onBlur={()=> setSlug(s=> s || slugify(title))} />
```

Remove any effects/props that recompute slug after first edit.

## 4) /api/session-types

- SSR client via `cookies()`; on insert/update set `user_id = user.id`.
- Scope uniqueness to `(user_id, slug)`.
- Map camel↔snake (`afterEventBuffer` ↔ `after_event_buffer`, etc.).
- On conflict: `{ error: "slug_taken" }` with 409.

## 5) /api/bookings

- Validate required: `client_name`, `booking_date`, `booking_time`.
- If `event_type_id`, fetch `length_in_minutes`, `price_cents`; else default 30 & 0.
- Derive times & guard:

```typescript
const start = new Date(`${date}T${time}Z`);
const end   = new Date(start.getTime() + duration*60*1000);
if (end < start) return json({ error:"end_before_start" }, { status:400 });
```

- Insert with `user_id`, `total_price`, `start_time`, `end_time`, `event_type_id`?.
- GET supports `?start&end`; returns `[]` when empty.

## 6) Debugging / Tests

Tiny logger:
```typescript
export const logErr=(scope:string,e:unknown,extra?:any)=>
  console.error(`[${scope}]`, { extra, err: e instanceof Error ? { msg:e.message, stack:e.stack } : e });
```

On route error: `logErr("api/bookings#POST", err, { body })` and return `{ error, hint:"see server logs" }`.

**Supabase MCP quick checks:**
- describe table public.bookings / public.event_types
- `select indexdef from pg_indexes where indexname='event_types_user_slug_key';`
- `select polname, cmd from pg_policies where tablename in ('bookings','event_types');`
- `select pg_notify('pgrst','reload schema');`

**curl smoke:**
```bash
# create session type
curl -sS -X POST localhost:3000/api/session-types -H 'content-type: application/json' \
 -d '{"title":"Mini","slug":"mini","length_in_minutes":30,"price_cents":0}' | jq
# create booking minimal
curl -sS -X POST localhost:3000/api/bookings -H 'content-type: application/json' \
 -d '{"client_name":"Ada","booking_date":"2025-09-20","booking_time":"10:00:00"}' | jq
# fetch range (should return [] when empty, still render calendar)
curl -sS 'localhost:3000/api/bookings?start=2025-09-14T00:00:00Z&end=2025-09-21T00:00:00Z' | jq
```

## 7) Commit
```bash
git add -A
git commit -m "Refactor: unify calendar (always visible), fix schema columns, session-type form, bookings API, colors, availability persist"
git push -u origin feature/session-booking-fixes
```

# Validation

- **Calendar tab** shows full calendar UI with header/filters/colors even when there are zero bookings.
- **Availability "Add Event"** persists and appears on Calendar after refresh.
- **Guard** prevents end < start (UI + server).
- **Creating a booking** no longer errors; `start_time`/`end_time` present; `total_price` populated.
- **Session Type form**: Title editable immediately; slug accepts >1 char; duplicate slug → clear 409 error; save succeeds.
- **Supabase**: `event_types_user_slug_key` present; RLS owner-only confirmed.
- **pg_notify** run; API reflects new columns (empty result row is OK).