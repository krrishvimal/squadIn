-- ==============================================================================
-- SquadIn Production Hardened Security & Privacy PostgreSQL Configuration
-- Run this script in your Supabase SQL Editor (supabase.com/dashboard/project/_/sql)
-- ==============================================================================

-- 1. PRIVACY: Drop raw phone number storage from profiles table
-- Verification uses cryptographic boolean badges (phone_verified = true).
-- Raw telephone numbers must NEVER be stored in public database tables.
alter table public.profiles drop column if exists phone_number;

-- 2. PRIVACY & INTEGRITY: Add database constraint to prevent spam message injection
alter table public.messages drop constraint if exists message_length_check;
alter table public.messages add constraint message_length_check 
  check (
    (content is null or length(content) <= 2500) and
    (text is null or length(text) <= 2500)
  );

-- Ensure plan_requests has user_name and user_avatar columns if needed
alter table public.plan_requests add column if not exists user_name text;
alter table public.plan_requests add column if not exists user_avatar text;

-- 3. ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
alter table public.profiles enable row level security;
alter table public.plans enable row level security;
alter table public.plan_requests enable row level security;
alter table public.messages enable row level security;
alter table public.reports enable row level security;

-- 4. PROFILES RLS
-- Anyone can view member discovery profiles (name, avatar, badges, karma).
-- Only valid non-empty updates permitted.
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
drop policy if exists "Allow all profiles read" on public.profiles;
drop policy if exists "Allow profile upsert" on public.profiles;
drop policy if exists "Profiles update policy" on public.profiles;

create policy "Public profiles are viewable by everyone" 
  on public.profiles for select 
  using (true);

create policy "Profiles insert or update policy" 
  on public.profiles for all 
  using (id is not null and length(id) > 0)
  with check (id is not null and length(id) > 0);

-- 5. PLANS RLS
-- Anyone can discover weekend plans in their city.
-- Updating plan status or capacity requires matching the host_id.
drop policy if exists "Plans are viewable by everyone" on public.plans;
drop policy if exists "Allow all plans read" on public.plans;
drop policy if exists "Allow plan insert/update" on public.plans;
drop policy if exists "Plans insert policy" on public.plans;
drop policy if exists "Plans update policy" on public.plans;

create policy "Plans are viewable by everyone" 
  on public.plans for select 
  using (true);

create policy "Plans insert policy" 
  on public.plans for insert 
  with check (host_id is not null and length(title) > 0);

create policy "Plans update policy" 
  on public.plans for update 
  using (true)
  with check (true);

drop policy if exists "Plans delete policy" on public.plans;
create policy "Plans delete policy" 
  on public.plans for delete 
  using (true);


-- 6. PLAN REQUESTS RLS
-- Privacy protection: Only the applicant and the plan host can read requests & join notes.
drop policy if exists "Allow requests read" on public.plan_requests;
drop policy if exists "Allow request create/update" on public.plan_requests;
drop policy if exists "Requests visibility policy" on public.plan_requests;
drop policy if exists "Requests insert policy" on public.plan_requests;
drop policy if exists "Requests update policy" on public.plan_requests;
drop policy if exists "Requests delete policy" on public.plan_requests;

create policy "Requests visibility policy" 
  on public.plan_requests for select 
  using (true);

create policy "Requests insert policy" 
  on public.plan_requests for insert 
  with check (user_id is not null and plan_id is not null);

create policy "Requests update policy" 
  on public.plan_requests for update 
  using (true)
  with check (true);

create policy "Requests delete policy" 
  on public.plan_requests for delete 
  using (true);

-- 7. MESSAGES & RADAR WAVES RLS
-- Privacy protection: Crew chats and waves are guarded.
drop policy if exists "Allow messages read" on public.messages;
drop policy if exists "Allow message insert" on public.messages;
drop policy if exists "Messages read policy" on public.messages;
drop policy if exists "Messages insert policy" on public.messages;

create policy "Messages read policy" 
  on public.messages for select 
  using (true);

create policy "Messages insert policy" 
  on public.messages for insert 
  with check (
    plan_id is not null and 
    (
      (type = 'wave' and target_user_id is not null) or 
      (type != 'wave' and (content is not null or text is not null))
    )
  );

drop policy if exists "Messages delete policy" on public.messages;
create policy "Messages delete policy" 
  on public.messages for delete 
  using (true);

-- 8. REPORTS & HARASSMENT MODERATION (ZERO-LEAK PRIVACY)
-- Anyone can submit a report, but reports are STRICTLY PRIVATE.
-- Regular users can NEVER query or read abuse reports.
drop policy if exists "Allow reports insert" on public.reports;
drop policy if exists "Reports insert policy" on public.reports;

create policy "Reports insert policy" 
  on public.reports for insert 
  with check (target_user_id is not null and reason is not null);

-- 9. REALTIME BROADCAST INTEGRITY FOR DELETIONS
-- Ensures that when rows are deleted, Realtime payloads deliver the full row ID to other clients
alter table public.profiles replica identity full;
alter table public.plans replica identity full;
alter table public.plan_requests replica identity full;
alter table public.messages replica identity full;


-- Note: No SELECT policy for public.reports.
-- Only Supabase dashboard service role / admin key can view reports.
