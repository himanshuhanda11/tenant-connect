
CREATE OR REPLACE FUNCTION public.compute_workspace_entitlements(p_workspace_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan_id text;
  v_billing_cycle text;
  v_trial_end timestamptz;
  v_status text;
BEGIN
  SELECT s.plan_id, s.billing_cycle, s.trial_end, s.status
    INTO v_plan_id, v_billing_cycle, v_trial_end, v_status
  FROM public.subscriptions s
  WHERE s.tenant_id = p_workspace_id
  ORDER BY s.created_at DESC
  LIMIT 1;

  IF v_plan_id IS NULL THEN v_plan_id := 'free'; END IF;
  IF v_plan_id LIKE 'plan_%' THEN v_plan_id := replace(v_plan_id, 'plan_', ''); END IF;
  IF v_billing_cycle IS NULL THEN v_billing_cycle := 'monthly'; END IF;

  -- Defaults are populated by trg_apply_plan_defaults on INSERT/UPDATE OF plan
  INSERT INTO public.workspace_entitlements(workspace_id, plan, status, billing_cycle, trial_ends_at)
  VALUES (
    p_workspace_id,
    v_plan_id,
    'active',
    v_billing_cycle,
    v_trial_end
  )
  ON CONFLICT (workspace_id) DO UPDATE
    SET plan = EXCLUDED.plan,
        billing_cycle = EXCLUDED.billing_cycle,
        trial_ends_at = EXCLUDED.trial_ends_at,
        status = CASE
          WHEN public.workspace_entitlements.status IN ('suspended','closed')
            THEN public.workspace_entitlements.status
          ELSE 'active'
        END,
        updated_at = now();
END;
$$;

-- Backfill this workspace now
SELECT public.compute_workspace_entitlements('4a8cc3e7-720b-43ae-8814-749322bdbba0'::uuid);
