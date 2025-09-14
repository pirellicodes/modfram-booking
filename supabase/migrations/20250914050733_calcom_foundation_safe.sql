-- UUIDs
create extension if not exists pgcrypto;

-------------------------
-- EVENT TYPES (new)
-------------------------
create table if not exists public.event_types (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title varchar(255) not null,
  slug varchar(255) not null,
  description text,
  length_in_minutes integer not null default 30,
  length_in_minutes_options integer[] default array[30],
  slot_interval integer,
  price_cents integer not null default 0,
  currency text not null default 'usd',
  minimum_booking_notice integer not null default 0,
  before_event_buffer integer not null default 0,
  after_event_buffer integer not null default 0,
  disable_guests boolean not null default false,
  requires_confirmation boolean not null default false,
  is_instant_event boolean not null default false,
  locations jsonb not null default '[]'::jsonb,
  booking_fields jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  schedule_id integer,
  is_active boolean not null default true,
  hidden boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, slug),
  check (length_in_minutes > 0),
  check (price_cents >= 0)
);

create index if not exists event_types_user_id_idx on public.event_types(user_id);
create index if not exists event_types_slug_ci_idx on public.event_types(lower(slug));

alter table public.event_types enable row level security;

drop policy if exists et_select on public.event_types;
create policy et_select on public.event_types
for select using (auth.uid() = user_id);

drop policy if exists et_insert on public.event_types;
create policy et_insert on public.event_types
for insert with check (auth.uid() = user_id);

drop policy if exists et_update on public.event_types;
create policy et_update on public.event_types
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists et_delete on public.event_types;
create policy et_delete on public.event_types
for delete using (auth.uid() = user_id);

-------------------------
-- BOOKINGS (patch)
-------------------------
alter table public.bookings
  add column if not exists event_type_id uuid references public.event_types(id) on delete set null,
  add column if not exists attendee_name text,
  add column if not exists attendee_email text,
  add column if not exists booking_fields_responses jsonb not null default '{}'::jsonb;

create index if not exists bookings_event_type_id_idx on public.bookings(event_type_id);

-------------------------
-- AVAILABILITY (patch if present, create if missing)
-------------------------
do $$
begin
  if to_regclass('public.availability') is null then
    create table public.availability (
      id uuid primary key default gen_random_uuid(),
      user_id uuid not null references auth.users(id) on delete cascade,
      weekday smallint check (weekday between 0 and 6),
      start_time time without time zone not null,
      end_time time without time zone not null,
      date_override date,
      is_available boolean not null default true,
      timezone text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
  end if;
end $$;

alter table public.availability
  add column if not exists date_override date,
  add column if not exists is_available boolean not null default true,
  add column if not exists timezone text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create index if not exists availability_user_id_idx on public.availability(user_id);
create index if not exists availability_weekday_idx on public.availability(weekday);
create index if not exists availability_date_override_idx on public.availability(date_override);

alter table public.availability enable row level security;

drop policy if exists av_all on public.availability;
create policy av_all on public.availability
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-------------------------
-- updated_at triggers
-------------------------
create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_et_updated_at on public.event_types;
create trigger trg_et_updated_at before update on public.event_types
for each row execute function public.set_updated_at();

drop trigger if exists trg_av_updated_at on public.availability;
create trigger trg_av_updated_at before update on public.availability
for each row execute function public.set_updated_at();

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='bookings' and column_name='updated_at'
  ) then
    drop trigger if exists trg_bk_updated_at on public.bookings;
    create trigger trg_bk_updated_at before update on public.bookings
    for each row execute function public.set_updated_at();
  end if;
end $$;
