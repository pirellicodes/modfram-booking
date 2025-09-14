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
