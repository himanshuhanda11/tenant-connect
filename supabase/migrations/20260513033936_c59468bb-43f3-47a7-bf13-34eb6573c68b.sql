
-- =================================================================
-- 1) PRICING RATES TABLE
-- =================================================================
CREATE TABLE IF NOT EXISTS public.whatsapp_meta_pricing_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code text NOT NULL,         -- ISO-3166 alpha-2, or 'OTHER'
  country_name text NOT NULL,
  template_category text NOT NULL CHECK (template_category IN ('marketing','utility','authentication','service')),
  rate_per_message numeric(8,4) NOT NULL CHECK (rate_per_message >= 0),
  currency text NOT NULL DEFAULT 'INR',
  credit_multiplier numeric(8,4) NOT NULL DEFAULT 1.0,
  active boolean NOT NULL DEFAULT true,
  effective_from timestamptz NOT NULL DEFAULT now(),
  effective_to timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_meta_pricing_country_category_active
  ON public.whatsapp_meta_pricing_rates (country_code, template_category) WHERE active;

CREATE TRIGGER trg_meta_pricing_updated
  BEFORE UPDATE ON public.whatsapp_meta_pricing_rates
  FOR EACH ROW EXECUTE FUNCTION public.set_wa_updated_at();

ALTER TABLE public.whatsapp_meta_pricing_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read active pricing"
  ON public.whatsapp_meta_pricing_rates FOR SELECT
  TO authenticated USING (active = true);

CREATE POLICY "Platform admins manage pricing"
  ON public.whatsapp_meta_pricing_rates FOR ALL
  TO authenticated
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

-- =================================================================
-- 2) SEED ROWS (rates expressed in CREDITS per message; tweak in admin)
-- Source: approximate Meta WhatsApp BSP pricing as of 2026 — update via admin.
-- =================================================================
INSERT INTO public.whatsapp_meta_pricing_rates (country_code, country_name, template_category, rate_per_message, currency)
VALUES
  -- India
  ('IN','India','marketing',1.00,'INR'),
  ('IN','India','utility',0.30,'INR'),
  ('IN','India','authentication',0.20,'INR'),
  ('IN','India','service',0.00,'INR'),
  -- UAE
  ('AE','United Arab Emirates','marketing',2.40,'INR'),
  ('AE','United Arab Emirates','utility',0.80,'INR'),
  ('AE','United Arab Emirates','authentication',0.60,'INR'),
  ('AE','United Arab Emirates','service',0.00,'INR'),
  -- Saudi Arabia
  ('SA','Saudi Arabia','marketing',2.60,'INR'),
  ('SA','Saudi Arabia','utility',0.90,'INR'),
  ('SA','Saudi Arabia','authentication',0.70,'INR'),
  ('SA','Saudi Arabia','service',0.00,'INR'),
  -- USA
  ('US','United States','marketing',2.00,'INR'),
  ('US','United States','utility',0.80,'INR'),
  ('US','United States','authentication',0.60,'INR'),
  ('US','United States','service',0.00,'INR'),
  -- UK
  ('GB','United Kingdom','marketing',2.20,'INR'),
  ('GB','United Kingdom','utility',0.85,'INR'),
  ('GB','United Kingdom','authentication',0.65,'INR'),
  ('GB','United Kingdom','service',0.00,'INR'),
  -- Brazil
  ('BR','Brazil','marketing',1.50,'INR'),
  ('BR','Brazil','utility',0.50,'INR'),
  ('BR','Brazil','authentication',0.40,'INR'),
  ('BR','Brazil','service',0.00,'INR'),
  -- Mexico
  ('MX','Mexico','marketing',1.80,'INR'),
  ('MX','Mexico','utility',0.60,'INR'),
  ('MX','Mexico','authentication',0.45,'INR'),
  ('MX','Mexico','service',0.00,'INR'),
  -- Indonesia
  ('ID','Indonesia','marketing',1.70,'INR'),
  ('ID','Indonesia','utility',0.55,'INR'),
  ('ID','Indonesia','authentication',0.40,'INR'),
  ('ID','Indonesia','service',0.00,'INR'),
  -- Philippines
  ('PH','Philippines','marketing',1.60,'INR'),
  ('PH','Philippines','utility',0.50,'INR'),
  ('PH','Philippines','authentication',0.40,'INR'),
  ('PH','Philippines','service',0.00,'INR'),
  -- South Africa
  ('ZA','South Africa','marketing',1.40,'INR'),
  ('ZA','South Africa','utility',0.45,'INR'),
  ('ZA','South Africa','authentication',0.35,'INR'),
  ('ZA','South Africa','service',0.00,'INR'),
  -- Default fallback
  ('OTHER','Other / Default','marketing',2.00,'INR'),
  ('OTHER','Other / Default','utility',0.80,'INR'),
  ('OTHER','Other / Default','authentication',0.60,'INR'),
  ('OTHER','Other / Default','service',0.00,'INR')
ON CONFLICT DO NOTHING;

-- =================================================================
-- 3) CAMPAIGN COLUMNS
-- =================================================================
ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS template_category text,
  ADD COLUMN IF NOT EXISTS estimated_credits_required integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS actual_credits_used integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pricing_breakdown jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS credit_status text DEFAULT 'pending';

ALTER TABLE public.campaign_jobs
  ADD COLUMN IF NOT EXISTS country_code text,
  ADD COLUMN IF NOT EXISTS template_category text,
  ADD COLUMN IF NOT EXISTS rate_per_message numeric(8,4),
  ADD COLUMN IF NOT EXISTS credits_used integer DEFAULT 0;

-- =================================================================
-- 4) PHONE -> COUNTRY HELPER
-- =================================================================
CREATE OR REPLACE FUNCTION public.country_code_from_phone(phone text)
RETURNS text
LANGUAGE plpgsql IMMUTABLE
SET search_path = public
AS $$
DECLARE
  p text;
BEGIN
  IF phone IS NULL THEN RETURN NULL; END IF;
  p := regexp_replace(phone, '[^0-9]', '', 'g');
  IF length(p) < 6 THEN RETURN NULL; END IF;
  -- Order matters: longer prefixes first
  IF p LIKE '971%' THEN RETURN 'AE'; END IF;
  IF p LIKE '966%' THEN RETURN 'SA'; END IF;
  IF p LIKE '973%' THEN RETURN 'BH'; END IF;
  IF p LIKE '974%' THEN RETURN 'QA'; END IF;
  IF p LIKE '965%' THEN RETURN 'KW'; END IF;
  IF p LIKE '968%' THEN RETURN 'OM'; END IF;
  IF p LIKE '880%' THEN RETURN 'BD'; END IF;
  IF p LIKE '977%' THEN RETURN 'NP'; END IF;
  IF p LIKE '92%'  THEN RETURN 'PK'; END IF;
  IF p LIKE '94%'  THEN RETURN 'LK'; END IF;
  IF p LIKE '91%'  THEN RETURN 'IN'; END IF;
  IF p LIKE '20%'  THEN RETURN 'EG'; END IF;
  IF p LIKE '27%'  THEN RETURN 'ZA'; END IF;
  IF p LIKE '34%'  THEN RETURN 'ES'; END IF;
  IF p LIKE '39%'  THEN RETURN 'IT'; END IF;
  IF p LIKE '33%'  THEN RETURN 'FR'; END IF;
  IF p LIKE '49%'  THEN RETURN 'DE'; END IF;
  IF p LIKE '44%'  THEN RETURN 'GB'; END IF;
  IF p LIKE '55%'  THEN RETURN 'BR'; END IF;
  IF p LIKE '52%'  THEN RETURN 'MX'; END IF;
  IF p LIKE '54%'  THEN RETURN 'AR'; END IF;
  IF p LIKE '57%'  THEN RETURN 'CO'; END IF;
  IF p LIKE '60%'  THEN RETURN 'MY'; END IF;
  IF p LIKE '62%'  THEN RETURN 'ID'; END IF;
  IF p LIKE '63%'  THEN RETURN 'PH'; END IF;
  IF p LIKE '65%'  THEN RETURN 'SG'; END IF;
  IF p LIKE '66%'  THEN RETURN 'TH'; END IF;
  IF p LIKE '81%'  THEN RETURN 'JP'; END IF;
  IF p LIKE '82%'  THEN RETURN 'KR'; END IF;
  IF p LIKE '84%'  THEN RETURN 'VN'; END IF;
  IF p LIKE '86%'  THEN RETURN 'CN'; END IF;
  IF p LIKE '90%'  THEN RETURN 'TR'; END IF;
  IF p LIKE '7%'   THEN RETURN 'RU'; END IF;
  IF p LIKE '1%'   THEN RETURN 'US'; END IF;
  RETURN NULL;
END;
$$;

-- =================================================================
-- 5) ESTIMATE BROADCAST COST
-- Returns: { breakdown:[{country,country_name,count,rate,total}], total_credits, available, sufficient, unknown_count, total_recipients }
-- =================================================================
CREATE OR REPLACE FUNCTION public.estimate_broadcast_cost(
  p_tenant_id uuid,
  p_contact_ids uuid[],
  p_template_category text
) RETURNS jsonb
LANGUAGE plpgsql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_category text := lower(coalesce(p_template_category, 'marketing'));
  v_balance integer;
  v_total integer := 0;
  v_unknown integer := 0;
  v_total_recipients integer := 0;
  v_breakdown jsonb := '[]'::jsonb;
BEGIN
  -- Authorization: caller must be a member of the tenant (or platform admin/service role)
  IF NOT (
    public.is_platform_admin(auth.uid())
    OR EXISTS (SELECT 1 FROM public.tenant_members WHERE tenant_id = p_tenant_id AND user_id = auth.uid())
    OR auth.role() = 'service_role'
  ) THEN
    RAISE EXCEPTION 'access denied';
  END IF;

  IF v_category NOT IN ('marketing','utility','authentication','service') THEN
    v_category := 'marketing';
  END IF;

  -- Aggregate recipients by detected country
  WITH cs AS (
    SELECT id, wa_id,
      COALESCE(NULLIF(upper(country),''), public.country_code_from_phone(wa_id), 'OTHER') AS cc
    FROM public.contacts
    WHERE tenant_id = p_tenant_id AND id = ANY(p_contact_ids) AND wa_id IS NOT NULL
  ),
  by_country AS (
    SELECT cc, COUNT(*)::int AS cnt FROM cs GROUP BY cc
  ),
  joined AS (
    SELECT b.cc,
      b.cnt,
      COALESCE(r.rate_per_message, fallback.rate_per_message, 1.0) AS rate,
      COALESCE(r.country_name, fallback.country_name, b.cc) AS cname,
      (r.id IS NULL AND fallback.id IS NULL) AS missing
    FROM by_country b
    LEFT JOIN public.whatsapp_meta_pricing_rates r
      ON r.country_code = b.cc AND r.template_category = v_category AND r.active = true
    LEFT JOIN public.whatsapp_meta_pricing_rates fallback
      ON fallback.country_code = 'OTHER' AND fallback.template_category = v_category AND fallback.active = true
  )
  SELECT
    COALESCE(jsonb_agg(jsonb_build_object(
      'country_code', cc,
      'country_name', cname,
      'count', cnt,
      'rate', rate,
      'total_credits', CEIL(rate * cnt)::int,
      'unknown', missing
    ) ORDER BY cnt DESC), '[]'::jsonb),
    COALESCE(SUM(CEIL(rate * cnt))::int, 0),
    COALESCE(SUM(CASE WHEN missing THEN cnt ELSE 0 END)::int, 0),
    COALESCE(SUM(cnt)::int, 0)
  INTO v_breakdown, v_total, v_unknown, v_total_recipients
  FROM joined;

  SELECT COALESCE(balance, 0) INTO v_balance
    FROM public.message_credits WHERE tenant_id = p_tenant_id;
  IF v_balance IS NULL THEN v_balance := 0; END IF;

  RETURN jsonb_build_object(
    'template_category', v_category,
    'breakdown', v_breakdown,
    'total_credits', v_total,
    'total_recipients', v_total_recipients,
    'available', v_balance,
    'remaining_after', v_balance - v_total,
    'sufficient', v_balance >= v_total,
    'shortfall', GREATEST(v_total - v_balance, 0),
    'unknown_count', v_unknown
  );
END;
$$;

REVOKE ALL ON FUNCTION public.estimate_broadcast_cost(uuid, uuid[], text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.estimate_broadcast_cost(uuid, uuid[], text) TO authenticated, service_role;

-- =================================================================
-- 6) CONSUME N CREDITS (used by worker per message)
-- Replaces single-credit deduction with rate-based deduction.
-- =================================================================
CREATE OR REPLACE FUNCTION public.consume_message_credit_amount(
  p_tenant_id uuid,
  p_amount integer,
  p_campaign_id uuid,
  p_job_id uuid,
  p_country_code text,
  p_template_category text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wallet message_credits%ROWTYPE;
  v_new_balance integer;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    p_amount := 1;
  END IF;
  SELECT * INTO v_wallet FROM public.message_credits
    WHERE tenant_id = p_tenant_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'no_wallet');
  END IF;
  IF v_wallet.balance < p_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'insufficient', 'balance', v_wallet.balance);
  END IF;
  v_new_balance := v_wallet.balance - p_amount;
  UPDATE public.message_credits
     SET balance = v_new_balance,
         total_used = total_used + p_amount,
         updated_at = now()
   WHERE tenant_id = p_tenant_id;
  INSERT INTO public.credit_transactions (
    tenant_id, amount, balance_after, type, description, reference_id, status
  ) VALUES (
    p_tenant_id, -p_amount, v_new_balance, 'usage',
    format('Broadcast %s msg [%s/%s]', coalesce(p_template_category,'marketing'), coalesce(p_country_code,'OTHER'), p_amount),
    p_job_id::text, 'completed'
  );
  RETURN jsonb_build_object('success', true, 'new_balance', v_new_balance, 'consumed', p_amount);
END;
$$;

REVOKE ALL ON FUNCTION public.consume_message_credit_amount(uuid,integer,uuid,uuid,text,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_message_credit_amount(uuid,integer,uuid,uuid,text,text) TO service_role;
