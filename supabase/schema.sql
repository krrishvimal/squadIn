-- ==============================================================================
-- SquadIn Production PostgreSQL Database Schema & Realtime Configuration
-- Execute this script directly in the Supabase SQL Editor (supabase.com/dashboard)
-- ==============================================================================

-- 1. PROFILES TABLE (Verified Users)
create table if not exists public.profiles (
  id text primary key, -- user id or auth.uid()
  name text not null,
  avatar text,
  bio text,
  city text default 'Bangalore',
  role text default 'Member',
  company text default 'Verified',
  phone_verified boolean default false,
  work_email_verified boolean default false,
  linkedin_verified boolean default false,
  karma_score numeric(3,1) default 5.0,
  phone_number text,
  created_at timestamp with time zone default now()
);

-- 2. PLANS TABLE (IRL Activities & Meetups)
create table if not exists public.plans (
  id text primary key,
  title text not null,
  category text not null default 'cafe',
  category_label text not null default 'Hangout',
  host_id text not null references public.profiles(id) on delete cascade,
  city text not null default 'Bangalore',
  venue_name text not null,
  venue_lat double precision,
  venue_lng double precision,
  neighborhood text,
  date_text text not null,
  target_capacity integer not null default 4,
  status text not null default 'OPEN', -- 'OPEN' | 'LOCKED_CHAT_ACTIVE' | 'COMPLETED'
  women_only boolean default false,
  is_verified_venue boolean default false,
  venue_type text default 'Public Landmark',
  description text,
  accepted_members text[] default '{}',
  created_at timestamp with time zone default now()
);

-- 3. PLAN JOIN REQUESTS TABLE (Curation Engine)
create table if not exists public.plan_requests (
  id uuid primary key default gen_random_uuid(),
  plan_id text not null references public.plans(id) on delete cascade,
  user_id text not null references public.profiles(id) on delete cascade,
  message text default '',
  status text default 'PENDING', -- 'PENDING' | 'ACCEPTED' | 'REJECTED'
  requested_at timestamp with time zone default now(),
  unique(plan_id, user_id)
);

-- 4. MESSAGES TABLE (Realtime Group Chat)
create table if not exists public.messages (
  id text primary key,
  plan_id text not null references public.plans(id) on delete cascade,
  sender_id text references public.profiles(id) on delete set null,
  content text not null,
  timestamp text not null,
  is_system boolean default false,
  created_at timestamp with time zone default now()
);

-- 5. ENABLE ROW LEVEL SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.plans enable row level security;
alter table public.plan_requests enable row level security;
alter table public.messages enable row level security;

-- Permissive policies for MVP public social discovery
create policy "Allow all profiles read" on public.profiles for select using (true);
create policy "Allow profile upsert" on public.profiles for all using (true);

create policy "Allow all plans read" on public.plans for select using (true);
create policy "Allow plan insert/update" on public.plans for all using (true);

create policy "Allow requests read" on public.plan_requests for select using (true);
create policy "Allow request create/update" on public.plan_requests for all using (true);

create policy "Allow messages read" on public.messages for select using (true);
create policy "Allow message insert" on public.messages for insert with check (true);

-- 6. ENABLE SUPABASE REALTIME WEBSOCKET SUBSCRIPTIONS
-- This allows real-time chat streaming and instant quorum unlock across devices
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;

alter publication supabase_realtime add table public.plans;
alter publication supabase_realtime add table public.plan_requests;
alter publication supabase_realtime add table public.messages;
