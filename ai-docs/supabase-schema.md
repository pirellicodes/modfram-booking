# Supabase Schema (initial)
```sql
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  email text, phone text, notes text,
  created_at timestamptz default now()
);
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  start timestamptz not null,
  "end" timestamptz not null,
  notes text,
  created_at timestamptz default now()
);
create table if not exists public.availability (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  weekday int check (weekday between 0 and 6),
  slots jsonb not null default '[]'
);
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  client_id uuid references public.clients(id) on delete set null,
  start timestamptz not null,
  "end" timestamptz not null,
  status text not null default 'pending',
  notes text,
  created_at timestamptz default now()
);

-- Add foreign key constraint for PostgREST relationship recognition
ALTER TABLE public.bookings 
ADD CONSTRAINT bookings_client_id_fkey 
FOREIGN KEY (client_id) 
REFERENCES public.clients(id) 
ON DELETE SET NULL;
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  booking_id uuid references public.bookings(id) on delete cascade,
  amount_cents int not null,
  currency text not null default 'usd',
  stripe_payment_intent_id text,
  status text not null default 'requires_payment_method',
  created_at timestamptz default now()
);

create table if not exists public.user_integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  integration_type text not null,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  integration_data jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.clients enable row level security;
alter table public.events enable row level security;
alter table public.availability enable row level security;
alter table public.bookings enable row level security;
alter table public.payments enable row level security;

alter table public.user_integrations enable row level security;
create policy "owner_select" on public.clients for select using (auth.uid() = user_id);
create policy "owner_crud"   on public.clients for all    using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner_select" on public.events  for select using (auth.uid() = user_id);
create policy "owner_crud"   on public.events  for all    using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner_select" on public.availability for select using (auth.uid() = user_id);
create policy "owner_crud"   on public.availability for all    using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner_select" on public.bookings for select using (auth.uid() = user_id);
create policy "owner_crud"   on public.bookings for all    using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner_select" on public.payments for select using (auth.uid() = user_id);
create policy "owner_crud"   on public.payments for all    using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "owner_select" on public.user_integrations for select using (auth.uid() = user_id);
create policy "owner_crud"   on public.user_integrations for all    using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- === v2 hardening / indexes / constraints ===

-- Availability: ensure JSON array + one row per (user, weekday)
ALTER TABLE public.availability
  ADD CONSTRAINT availability_slots_is_array CHECK (jsonb_typeof(slots) = 'array') NOT VALID;
ALTER TABLE public.availability VALIDATE CONSTRAINT availability_slots_is_array;

ALTER TABLE public.availability
  ADD CONSTRAINT availability_user_weekday_key UNIQUE (user_id, weekday);

-- Bookings: status guard + useful indexes
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_status_check
  CHECK (status IN ('pending','confirmed','cancelled','completed'));

CREATE INDEX IF NOT EXISTS bookings_user_start_idx ON public.bookings (user_id, start);
CREATE INDEX IF NOT EXISTS bookings_timerange_idx ON public.bookings USING gist (tsrange(start, "end"));

-- Events: quick lookups
CREATE INDEX IF NOT EXISTS events_user_start_idx ON public.events (user_id, start);

-- Clients: unique email per user (nullable-safe)
CREATE UNIQUE INDEX IF NOT EXISTS clients_user_email_unique
  ON public.clients (user_id, lower(email)) WHERE email IS NOT NULL;

-- Payments: positivity + status guard
ALTER TABLE public.payments
  ADD CONSTRAINT payments_amount_positive CHECK (amount_cents > 0),
  ADD CONSTRAINT payments_status_check
  CHECK (status IN ('requires_payment_method','processing','succeeded','failed','refunded','canceled'));

-- Integrations: one row per (user, type) + keep updated_at fresh
ALTER TABLE public.user_integrations
  ADD CONSTRAINT user_integrations_user_type_unique UNIQUE (user_id, integration_type);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

DROP TRIGGER IF EXISTS user_integrations_set_updated_at ON public.user_integrations;
CREATE TRIGGER user_integrations_set_updated_at
BEFORE UPDATE ON public.user_integrations
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- === PostgREST Schema Cache Management ===

-- When making schema changes that affect relationships, reload the PostgREST cache:
-- Method 1: SQL notification
SELECT pg_notify('pgrst', 'reload schema');

-- Method 2: Supabase UI
-- Go to Database → API → Click "Restart API" button

-- Verify foreign key constraints exist:
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
    AND tc.table_name = 'bookings';
