-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Enable PostGIS for geospatial queries (optional, for future use)
-- create extension if not exists "postgis";

-- ============================================================
-- PROFILES TABLE
-- Extends the built-in auth.users table with public profile data
-- ============================================================
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Policies for profiles
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Trigger: automatically create a profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name'
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- LISTINGS TABLE
-- Unified table for both "Space" (driveways/parking) and "Tool" listings
-- ============================================================
create table if not exists public.listings (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  -- Category: 'space' for driveways/parking, 'tool' for heavy-duty items
  category text not null check (category in ('space', 'tool')),
  price_per_day numeric(10, 2) not null check (price_per_day >= 0),
  -- Geographic coordinates for map display
  latitude double precision not null,
  longitude double precision not null,
  -- Status flag to show/hide on the map
  is_active boolean not null default true,
  -- Optional: image URL for the listing
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.listings enable row level security;

-- Policies for listings
create policy "Active listings are viewable by everyone"
  on public.listings for select
  using (is_active = true);

create policy "Users can insert their own listings"
  on public.listings for insert
  with check (auth.uid() = owner_id);

create policy "Users can update their own listings"
  on public.listings for update
  using (auth.uid() = owner_id);

create policy "Users can delete their own listings"
  on public.listings for delete
  using (auth.uid() = owner_id);

-- Index for map queries (filtering by location)
create index if not exists listings_category_idx on public.listings (category);
create index if not exists listings_owner_idx on public.listings (owner_id);
create index if not exists listings_active_idx on public.listings (is_active);

-- ============================================================
-- BOOKINGS TABLE
-- Records when a user books a listing for a time period
-- ============================================================
create table if not exists public.bookings (
  id uuid primary key default uuid_generate_v4(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  renter_id uuid not null references auth.users(id) on delete cascade,
  -- Booking window
  start_date date not null,
  end_date date not null,
  -- Total cost = price_per_day * number_of_days
  total_price numeric(10, 2) not null check (total_price >= 0),
  -- Status: pending -> confirmed -> completed | cancelled
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Ensure start_date is before end_date
  constraint valid_date_range check (end_date >= start_date)
);

-- Enable Row Level Security
alter table public.bookings enable row level security;

-- Policies for bookings
create policy "Users can view their own bookings"
  on public.bookings for select
  using (auth.uid() = renter_id);

create policy "Listing owners can view bookings for their listings"
  on public.bookings for select
  using (
    exists (
      select 1 from public.listings
      where listings.id = bookings.listing_id
        and listings.owner_id = auth.uid()
    )
  );

create policy "Authenticated users can create bookings"
  on public.bookings for insert
  with check (auth.uid() = renter_id);

create policy "Renters can update their own bookings"
  on public.bookings for update
  using (auth.uid() = renter_id);

-- Indexes for common booking queries
create index if not exists bookings_listing_idx on public.bookings (listing_id);
create index if not exists bookings_renter_idx on public.bookings (renter_id);
create index if not exists bookings_date_range_idx on public.bookings (start_date, end_date);

-- ============================================================
-- UPDATED_AT TRIGGER HELPER
-- Automatically updates the updated_at timestamp
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger handle_listings_updated_at
  before update on public.listings
  for each row execute procedure public.handle_updated_at();

create or replace trigger handle_bookings_updated_at
  before update on public.bookings
  for each row execute procedure public.handle_updated_at();

create or replace trigger handle_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();
