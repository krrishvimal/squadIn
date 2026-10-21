-- ==============================================================================
-- SquadIn Production v2 Security & RLS Hardening Migration
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ==============================================================================

-- 1. MESSAGES INSERT POLICY: Allow user_id OR sender_id matching auth.uid(), and enforce plan membership
DROP POLICY IF EXISTS "messages_insert" ON public.messages;
CREATE POLICY "messages_insert" ON public.messages
  FOR INSERT WITH CHECK (
    (user_id = auth.uid()::text OR sender_id = auth.uid()::text) AND
    plan_id IS NOT NULL AND
    (
      type = 'wave' OR
      plan_id IN (
        SELECT id FROM public.plans 
        WHERE auth.uid()::text = ANY(accepted_members)
      )
    )
  );

-- 2. WOMEN-ONLY RESTRICTION ON PLAN REQUESTS
DROP POLICY IF EXISTS "requests_insert" ON public.plan_requests;
CREATE POLICY "requests_insert" ON public.plan_requests
  FOR INSERT WITH CHECK (
    user_id = auth.uid()::text AND (
      COALESCE((SELECT women_only FROM public.plans WHERE id = plan_id), false) = false OR
      COALESCE((SELECT gender FROM public.profiles WHERE id = auth.uid()::text), 'unspecified') = 'female'
    )
  );

-- 3. ATOMIC DEPARTURE & ACCOUNT DELETION CLEANUP (SECURITY DEFINER)
-- Solves RLS violation when transferring host or removing member from someone else's plan
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
  -- Security check: caller must be the user leaving or authenticated
  IF auth.uid() IS NOT NULL AND lower(trim(auth.uid()::text)) <> lower(trim(p_user_id)) THEN
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
      -- 0 members remain -> delete empty plan & its requests
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

-- 4. PROFILE TAMPERING PROTECTION (Prevents clients from spoofing karma_score)
CREATE OR REPLACE FUNCTION public.protect_profile_trust_badges()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF current_setting('request.jwt.claim.role', true) <> 'service_role' THEN
    IF NEW.karma_score IS DISTINCT FROM OLD.karma_score THEN
      NEW.karma_score := OLD.karma_score;
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
