-- ==============================================================================
-- SquadIn Production PostgreSQL Database Schema & Realtime Configuration
-- Execute this script directly in the Supabase SQL Editor (supabase.com/dashboard)
-- ==============================================================================

-- 1. PROFILES TABLE (Verified Users)
create table if not exists public.profiles (
  id text primary key,
  name text not null,
  avatar text,
  bio text,
  city text default 'Bangalore',
  role text default 'Member',
  company text default 'Verified',
  phone_verified boolean default false,
  work_email_verified boolean default false,
  linkedin_verified boolean default false,
  id_verified boolean default false,
  karma_score numeric(3,1) default 5.0,
  phone_number text,
  last_active_at timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Add missing columns to existing profiles table if it already exists
do $$ begin
  alter table public.profiles add column if not exists id_verified boolean default false;
  alter table public.profiles add column if not exists linkedin_verified boolean default false;
  alter table public.profiles add column if not exists work_email_verified boolean default false;
  alter table public.profiles add column if not exists phone_verified boolean default false;
  alter table public.profiles add column if not exists gender text default 'unspecified';
  alter table public.profiles add column if not exists last_active_at timestamp with time zone default now();
exception when others then null; end $$;

-- 2. PLANS TABLE (IRL Activities & Meetups)
create table if not exists public.plans (
  id text primary key,
  title text not null,
  category text not null default 'cafe',
  category_label text not null default 'Hangout',
  host_id text not null,
  host_name text,
  host_avatar text,
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
  plan_id text not null,
  user_id text not null,
  user_name text,
  user_avatar text,
  message text default '',
  status text default 'PENDING', -- 'PENDING' | 'ACCEPTED' | 'REJECTED'
  requested_at timestamp with time zone default now(),
  unique(plan_id, user_id)
);

-- 4. MESSAGES TABLE (Realtime Group Chat & Waves)
create table if not exists public.messages (
  id text primary key default gen_random_uuid()::text,
  plan_id text not null default 'general',
  sender_id text,
  user_id text,
  user_name text,
  user_avatar text,
  target_user_id text,
  type text default 'text', -- 'text' | 'wave' | 'system'
  text text,
  content text,
  timestamp text default now()::text,
  is_system boolean default false,
  created_at timestamp with time zone default now()
);

-- Add missing columns to existing messages table if it already exists
do $$ begin
  alter table public.messages add column if not exists target_user_id text;
  alter table public.messages add column if not exists type text default 'text';
  alter table public.messages add column if not exists user_id text;
  alter table public.messages add column if not exists user_name text;
  alter table public.messages add column if not exists user_avatar text;
  alter table public.messages add column if not exists text text;
exception when others then null; end $$;

-- 5. REPORTS TABLE (Safety & Moderation)
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  target_user_id text not null,
  reporter_id text not null,
  plan_id text,
  reason text not null,
  details text,
  created_at timestamp with time zone default now()
);

-- 6. ENABLE ROW LEVEL SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.plans enable row level security;
alter table public.plan_requests enable row level security;
alter table public.messages enable row level security;
alter table public.reports enable row level security;

-- 7. CLEAN & RE-CREATE POLICIES (Idempotent Safe Run)
drop policy if exists "Allow all profiles read" on public.profiles;
drop policy if exists "Allow profile upsert" on public.profiles;
create policy "Allow all profiles read" on public.profiles for select using (true);
create policy "Allow profile upsert" on public.profiles for all using (true);

drop policy if exists "Allow all plans read" on public.plans;
drop policy if exists "Allow plan insert/update" on public.plans;
create policy "Allow all plans read" on public.plans for select using (true);
create policy "Allow plan insert/update" on public.plans for all using (true);

drop policy if exists "Allow requests read" on public.plan_requests;
drop policy if exists "Allow request create/update" on public.plan_requests;
create policy "Allow requests read" on public.plan_requests for select using (true);
create policy "Allow request create/update" on public.plan_requests for all using (true);

drop policy if exists "Allow messages read" on public.messages;
drop policy if exists "Allow message insert" on public.messages;
create policy "Allow messages read" on public.messages for select using (true);
create policy "Allow message insert" on public.messages for all using (true);

drop policy if exists "Allow reports insert" on public.reports;
create policy "Allow reports insert" on public.reports for insert with check (true);

-- 8. ENABLE SUPABASE REALTIME WEBSOCKET SUBSCRIPTIONS
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;

alter publication supabase_realtime add table public.profiles;
alter publication supabase_realtime add table public.plans;
alter publication supabase_realtime add table public.plan_requests;
alter publication supabase_realtime add table public.messages;

-- 9. AVATARS STORAGE BUCKET (Public Bucket for Verified Selfies & Avatars)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

drop policy if exists "Public avatar read" on storage.objects;
drop policy if exists "Allow avatar uploads" on storage.objects;
drop policy if exists "Allow avatar updates" on storage.objects;

create policy "Public avatar read" on storage.objects for select using (bucket_id = 'avatars');
create policy "Allow avatar uploads" on storage.objects for insert with check (bucket_id = 'avatars');
create policy "Allow avatar updates" on storage.objects for update using (bucket_id = 'avatars');

-- Add date column to plans if not exists
do $$ begin
  alter table public.plans add column if not exists date text;
exception when others then null; end $$;

-- 10. ATOMIC QUORUM STORED PROCEDURE (Prevents Race Conditions in Crew Approvals)
create or replace function public.accept_crew_applicant(
  p_plan_id text,
  p_user_id text,
  p_host_id text
)
returns json
language plpgsql
security definer
as $$
declare
  v_plan record;
  v_current_count integer;
  v_is_full boolean;
  v_new_members text[];
  v_new_status text;
begin
  -- 1. Lock the plan row for update
  select * into v_plan from public.plans where id = p_plan_id for update;
  if not found then
    return json_build_object('success', false, 'error', 'Plan not found');
  end if;

  -- 2. Verify caller is host
  if lower(trim(v_plan.host_id)) <> lower(trim(p_host_id)) then
    return json_build_object('success', false, 'error', 'Unauthorized: Only host can accept applicants');
  end if;

  -- 3. Check capacity limit
  v_current_count := coalesce(array_length(v_plan.accepted_members, 1), 0);
  if not (p_user_id = any(v_plan.accepted_members)) and v_current_count >= v_plan.target_capacity then
    return json_build_object('success', false, 'error', 'Crew is already at maximum capacity');
  end if;

  -- 4. Append member if not already present
  if not (p_user_id = any(v_plan.accepted_members)) then
    v_new_members := array_append(v_plan.accepted_members, p_user_id);
  else
    v_new_members := v_plan.accepted_members;
  end if;

  -- 5. Determine if quorum is met
  v_is_full := coalesce(array_length(v_new_members, 1), 0) >= v_plan.target_capacity;
  v_new_status := case when v_is_full then 'LOCKED_CHAT_ACTIVE' else v_plan.status end;

  -- 6. Update plan atomically
  update public.plans
  set accepted_members = v_new_members,
      status = v_new_status
  where id = p_plan_id;

  -- 7. Remove/accept plan request
  delete from public.plan_requests
  where plan_id = p_plan_id and user_id = p_user_id;

  return json_build_object(
    'success', true, 
    'is_full', v_is_full, 
    'status', v_new_status,
    'member_count', coalesce(array_length(v_new_members, 1), 0)
  );
end;
$$;

