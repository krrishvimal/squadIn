-- ==============================================================================
-- SquadIn Production v3 Final Security & RLS Patch
-- Resolves VULN-01 through VULN-05 identified in independent 2nd-pass audit.
-- Run this in Supabase Dashboard → SQL Editor.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. PATCH VULN-01 & STORED PROCEDURE AUTHENTICATION BYPASSES (SECURITY DEFINER)
-- ------------------------------------------------------------------------------

-- Fix leave_crew_and_cleanup: Ensure auth.uid() is NOT NULL and matches p_user_id
CREATE OR REPLACE FUNCTION public.leave_crew_and_cleanup(
  p_plan_id text,
  p_user_id text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_plan record;
  v_new_members text[];
  v_new_host_id text;
BEGIN
  -- Strict authentication check: caller must be authenticated AND caller must be p_user_id
  IF auth.uid() IS NULL OR lower(trim(auth.uid()::text)) <> lower(trim(p_user_id)) THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized: Cannot remove another member');
  END IF;

  -- Lock plan row for atomic update
  SELECT * INTO v_plan FROM public.plans WHERE id = p_plan_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Plan not found');
  END IF;

  -- Case A: User is the Host
  IF lower(trim(v_plan.host_id)) = lower(trim(p_user_id)) THEN
    SELECT COALESCE(array_agg(m), '{}') INTO v_new_members
    FROM unnest(v_plan.accepted_members) AS m
    WHERE lower(trim(m)) <> lower(trim(p_user_id));

    IF v_new_members IS NOT NULL AND array_length(v_new_members, 1) > 0 THEN
      -- Transfer host to first remaining member
      v_new_host_id := v_new_members[1];

      UPDATE public.plans
      SET host_id = v_new_host_id,
          accepted_members = v_new_members,
          status = 'OPEN'
      WHERE id = p_plan_id;

      RETURN json_build_object('success', true, 'action', 'host_transferred', 'new_host_id', v_new_host_id);
    ELSE
      -- 0 members remain -> delete empty plan & its associated rows
      DELETE FROM public.plan_requests WHERE plan_id = p_plan_id;
      DELETE FROM public.messages WHERE plan_id = p_plan_id;
      DELETE FROM public.plans WHERE id = p_plan_id;

      RETURN json_build_object('success', true, 'action', 'plan_deleted');
    END IF;

  -- Case B: User is a regular member
  ELSIF p_user_id = ANY(v_plan.accepted_members) THEN
    SELECT COALESCE(array_agg(m), '{}') INTO v_new_members
    FROM unnest(v_plan.accepted_members) AS m
    WHERE lower(trim(m)) <> lower(trim(p_user_id));

    IF v_new_members IS NULL THEN
      v_new_members := '{}';
    END IF;

    UPDATE public.plans
    SET accepted_members = v_new_members,
        status = 'OPEN'
    WHERE id = p_plan_id;

    RETURN json_build_object('success', true, 'action', 'member_removed');
  END IF;

  RETURN json_build_object('success', true, 'action', 'none');
END;
$$;

-- Fix accept_crew_applicant: Ensure auth.uid() is NOT NULL and matches plan host_id
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

  -- 2. Verify caller is host using auth.uid() (Strict NULL check prevents anonymous bypass)
  IF auth.uid() IS NULL OR lower(trim(v_plan.host_id)) <> lower(trim(auth.uid()::text)) THEN
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

-- ------------------------------------------------------------------------------
-- 2. PATCH VULN-02 & VULN-05: PLAN REQUESTS ACCESS RESTRICTION
-- ------------------------------------------------------------------------------

-- Restrict SELECT: Only applicant and the host of the plan can view requests
DROP POLICY IF EXISTS "requests_select" ON public.plan_requests;
DROP POLICY IF EXISTS "Allow requests read" ON public.plan_requests;
DROP POLICY IF EXISTS "Requests visibility policy" ON public.plan_requests;

CREATE POLICY "requests_select" ON public.plan_requests
  FOR SELECT USING (
    user_id = auth.uid()::text OR
    plan_id IN (SELECT id FROM public.plans WHERE host_id = auth.uid()::text)
  );

-- Restrict UPDATE: Applicant can only edit their note while PENDING. Host can accept/reject.
DROP POLICY IF EXISTS "requests_update" ON public.plan_requests;
DROP POLICY IF EXISTS "Requests update policy" ON public.plan_requests;

CREATE POLICY "requests_update" ON public.plan_requests
  FOR UPDATE USING (
    (user_id = auth.uid()::text AND status = 'PENDING')
    OR
    plan_id IN (SELECT id FROM public.plans WHERE host_id = auth.uid()::text)
  )
  WITH CHECK (
    (user_id = auth.uid()::text AND status = 'PENDING')
    OR
    plan_id IN (SELECT id FROM public.plans WHERE host_id = auth.uid()::text)
  );

-- Restrict DELETE: Applicant can cancel their request, or host can dismiss it
DROP POLICY IF EXISTS "requests_delete" ON public.plan_requests;
DROP POLICY IF EXISTS "Requests delete policy" ON public.plan_requests;

CREATE POLICY "requests_delete" ON public.plan_requests
  FOR DELETE USING (
    user_id = auth.uid()::text OR
    plan_id IN (SELECT id FROM public.plans WHERE host_id = auth.uid()::text)
  );

-- ------------------------------------------------------------------------------
-- 3. PATCH VULN-03: STORAGE ISOLATION & OVERWRITE RESTRICTIONS
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "avatars_upload" ON storage.objects;
DROP POLICY IF EXISTS "avatars_update" ON storage.objects;
DROP POLICY IF EXISTS "avatars_delete" ON storage.objects;
DROP POLICY IF EXISTS "Allow avatar uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow avatar updates" ON storage.objects;

-- Enforce strict folder matching: user can only upload to avatars/{auth.uid()}/...
CREATE POLICY "avatars_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Enforce strict folder matching for updates (e.g. upsert avatar)
CREATE POLICY "avatars_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow user to delete files inside their own avatar folder
CREATE POLICY "avatars_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- ------------------------------------------------------------------------------
-- 4. PATCH VULN-04: PROFILE INTEGRITY & ROLE ESCALATION PROTECTION
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.protect_profile_trust_badges()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF current_setting('request.jwt.claim.role', true) <> 'service_role' THEN
    -- Protect karma score from client manipulation
    IF NEW.karma_score IS DISTINCT FROM OLD.karma_score THEN
      NEW.karma_score := OLD.karma_score;
    END IF;
    -- Protect administrative role escalation
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      NEW.role := OLD.role;
    END IF;
    -- Prevent changing user ID primary key
    IF NEW.id IS DISTINCT FROM OLD.id THEN
      NEW.id := OLD.id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_trust ON public.profiles;
CREATE TRIGGER trg_protect_profile_trust
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_trust_badges();

-- ------------------------------------------------------------------------------
-- 5. MESSAGES SELECT & INSERT WATER-TIGHT POLICIES
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "messages_select" ON public.messages;
DROP POLICY IF EXISTS "Allow messages read" ON public.messages;
DROP POLICY IF EXISTS "Messages read policy" ON public.messages;

CREATE POLICY "messages_select" ON public.messages
  FOR SELECT USING (
    -- Waves: visible to sender and recipient
    (type = 'wave' AND (user_id = auth.uid()::text OR target_user_id = auth.uid()::text))
    OR
    -- Plan messages: visible to crew members and host
    (type != 'wave' AND plan_id IN (
      SELECT id FROM public.plans 
      WHERE auth.uid()::text = ANY(accepted_members) OR host_id = auth.uid()::text
    ))
  );

DROP POLICY IF EXISTS "messages_insert" ON public.messages;
DROP POLICY IF EXISTS "Allow message insert" ON public.messages;
DROP POLICY IF EXISTS "Messages insert policy" ON public.messages;

CREATE POLICY "messages_insert" ON public.messages
  FOR INSERT WITH CHECK (
    (user_id = auth.uid()::text OR sender_id = auth.uid()::text) AND
    plan_id IS NOT NULL AND
    (
      type = 'wave' OR
      plan_id IN (
        SELECT id FROM public.plans 
        WHERE auth.uid()::text = ANY(accepted_members) OR host_id = auth.uid()::text
      )
    )
  );

-- Ensure replica identity and realtime consistency
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.plans REPLICA IDENTITY FULL;
ALTER TABLE public.plan_requests REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;
