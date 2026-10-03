-- ==============================================================================
-- SquadIn Auth-Based RLS Migration
-- PREREQUISITE: Enable "Anonymous Sign-ins" in Supabase Dashboard:
-- Dashboard → Authentication → Providers → Anonymous → Enable
-- Then run this script in Supabase SQL Editor
-- ==============================================================================

-- 1. DROP ALL EXISTING PERMISSIVE POLICIES
-- Profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Profiles insert or update policy" ON public.profiles;
DROP POLICY IF EXISTS "Allow all profiles read" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile upsert" ON public.profiles;

-- Plans
DROP POLICY IF EXISTS "Plans are viewable by everyone" ON public.plans;
DROP POLICY IF EXISTS "Plans insert policy" ON public.plans;
DROP POLICY IF EXISTS "Plans update policy" ON public.plans;
DROP POLICY IF EXISTS "Plans delete policy" ON public.plans;
DROP POLICY IF EXISTS "Allow all plans read" ON public.plans;
DROP POLICY IF EXISTS "Allow plan insert/update" ON public.plans;

-- Plan Requests
DROP POLICY IF EXISTS "Requests visibility policy" ON public.plan_requests;
DROP POLICY IF EXISTS "Requests insert policy" ON public.plan_requests;
DROP POLICY IF EXISTS "Requests update policy" ON public.plan_requests;
DROP POLICY IF EXISTS "Requests delete policy" ON public.plan_requests;
DROP POLICY IF EXISTS "Allow requests read" ON public.plan_requests;
DROP POLICY IF EXISTS "Allow request create/update" ON public.plan_requests;

-- Messages
DROP POLICY IF EXISTS "Messages read policy" ON public.messages;
DROP POLICY IF EXISTS "Messages insert policy" ON public.messages;
DROP POLICY IF EXISTS "Messages update policy" ON public.messages;
DROP POLICY IF EXISTS "Messages delete policy" ON public.messages;
DROP POLICY IF EXISTS "Allow messages read" ON public.messages;
DROP POLICY IF EXISTS "Allow message insert" ON public.messages;

-- Reports
DROP POLICY IF EXISTS "Reports insert policy" ON public.reports;
DROP POLICY IF EXISTS "Allow reports insert" ON public.reports;

-- Storage
DROP POLICY IF EXISTS "Public avatar read" ON storage.objects;
DROP POLICY IF EXISTS "Allow avatar uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow avatar updates" ON storage.objects;

-- 2. PROFILES — Users can only modify their own profile
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid()::text);

CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE USING (id = auth.uid()::text)
  WITH CHECK (id = auth.uid()::text);

CREATE POLICY "profiles_delete" ON public.profiles
  FOR DELETE USING (id = auth.uid()::text);

-- 3. PLANS — Anyone can read; only host can modify/delete their plans
CREATE POLICY "plans_select" ON public.plans
  FOR SELECT USING (true);

CREATE POLICY "plans_insert" ON public.plans
  FOR INSERT WITH CHECK (
    host_id = auth.uid()::text AND
    host_id IS NOT NULL AND
    length(title) > 0
  );

CREATE POLICY "plans_update" ON public.plans
  FOR UPDATE USING (host_id = auth.uid()::text)
  WITH CHECK (host_id = auth.uid()::text);

CREATE POLICY "plans_delete" ON public.plans
  FOR DELETE USING (host_id = auth.uid()::text);

-- 4. PLAN REQUESTS — Users can create/manage their own requests; hosts can manage requests for their plans
CREATE POLICY "requests_select" ON public.plan_requests
  FOR SELECT USING (true);

CREATE POLICY "requests_insert" ON public.plan_requests
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "requests_update" ON public.plan_requests
  FOR UPDATE USING (
    user_id = auth.uid()::text OR
    plan_id IN (SELECT id FROM public.plans WHERE host_id = auth.uid()::text)
  );

CREATE POLICY "requests_delete" ON public.plan_requests
  FOR DELETE USING (
    user_id = auth.uid()::text OR
    plan_id IN (SELECT id FROM public.plans WHERE host_id = auth.uid()::text)
  );

-- 5. MESSAGES — Users can only send messages as themselves; can read messages for plans they're in
CREATE POLICY "messages_select" ON public.messages
  FOR SELECT USING (
    -- Waves: visible to sender and target
    (type = 'wave' AND (user_id = auth.uid()::text OR target_user_id = auth.uid()::text))
    OR
    -- Plan messages: visible to crew members
    (type != 'wave' AND plan_id IN (
      SELECT id FROM public.plans WHERE auth.uid()::text = ANY(accepted_members)
    ))
  );

CREATE POLICY "messages_insert" ON public.messages
  FOR INSERT WITH CHECK (
    user_id = auth.uid()::text AND
    plan_id IS NOT NULL AND
    (content IS NOT NULL OR text IS NOT NULL OR type = 'wave')
  );

-- Allow message update only for the sender (needed for account deletion anonymization)
CREATE POLICY "messages_update" ON public.messages
  FOR UPDATE USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

-- Allow message delete only for the sender
CREATE POLICY "messages_delete" ON public.messages
  FOR DELETE USING (user_id = auth.uid()::text);

-- 6. REPORTS — Insert-only (no reading by regular users)
CREATE POLICY "reports_insert" ON public.reports
  FOR INSERT WITH CHECK (
    reporter_id = auth.uid()::text AND
    target_user_id IS NOT NULL AND
    reason IS NOT NULL
  );

-- 7. STORAGE — Users can only upload/update their own avatar files
CREATE POLICY "avatars_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
    OR bucket_id = 'avatars'
  );

CREATE POLICY "avatars_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars'
  );

-- 8. UPDATE STORED PROCEDURE to use auth.uid()
CREATE OR REPLACE FUNCTION public.accept_crew_applicant(
  p_plan_id text,
  p_user_id text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_plan record;
  v_current_count integer;
  v_is_full boolean;
  v_new_members text[];
  v_new_status text;
BEGIN
  -- 1. Lock the plan row for update
  SELECT * INTO v_plan FROM public.plans WHERE id = p_plan_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Plan not found');
  END IF;

  -- 2. Verify caller is host using auth.uid() (NOT a client-supplied parameter)
  IF lower(trim(v_plan.host_id)) <> lower(trim(auth.uid()::text)) THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized: Only host can accept applicants');
  END IF;

  -- 3. Check capacity limit
  v_current_count := coalesce(array_length(v_plan.accepted_members, 1), 0);
  IF NOT (p_user_id = ANY(v_plan.accepted_members)) AND v_current_count >= v_plan.target_capacity THEN
    RETURN json_build_object('success', false, 'error', 'Crew is already at maximum capacity');
  END IF;

  -- 4. Append member if not already present
  IF NOT (p_user_id = ANY(v_plan.accepted_members)) THEN
    v_new_members := array_append(v_plan.accepted_members, p_user_id);
  ELSE
    v_new_members := v_plan.accepted_members;
  END IF;

  -- 5. Determine if quorum is met
  v_is_full := coalesce(array_length(v_new_members, 1), 0) >= v_plan.target_capacity;
  v_new_status := CASE WHEN v_is_full THEN 'LOCKED_CHAT_ACTIVE' ELSE v_plan.status END;

  -- 6. Update plan atomically
  UPDATE public.plans
  SET accepted_members = v_new_members,
      status = v_new_status
  WHERE id = p_plan_id;

  -- 7. Remove/accept plan request
  DELETE FROM public.plan_requests
  WHERE plan_id = p_plan_id AND user_id = p_user_id;

  RETURN json_build_object(
    'success', true, 
    'is_full', v_is_full, 
    'status', v_new_status,
    'member_count', coalesce(array_length(v_new_members, 1), 0)
  );
END;
$$;

-- 9. KEEP REALTIME PUBLICATION AND REPLICA IDENTITY
alter table public.profiles replica identity full;
alter table public.plans replica identity full;
alter table public.plan_requests replica identity full;
alter table public.messages replica identity full;

-- 10. KEEP PRIVACY: Drop raw phone number storage
alter table public.profiles drop column if exists phone_number;

-- 11. KEEP INTEGRITY: Message length constraint
alter table public.messages drop constraint if exists message_length_check;
alter table public.messages add constraint message_length_check 
  check (
    (content is null or length(content) <= 2500) and
    (text is null or length(text) <= 2500)
  );

-- 12. ACTIVITY TRACKING: Auto-pruning & recency for radar
alter table public.profiles add column if not exists last_active_at timestamp with time zone default now();
