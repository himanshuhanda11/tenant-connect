-- Region-based billing fields
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS pricing_region text,
  ADD COLUMN IF NOT EXISTS currency text;

ALTER TABLE public.platform_plans
  ADD COLUMN IF NOT EXISTS stripe_prices jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS currency text,
  ADD COLUMN IF NOT EXISTS pricing_region text;

-- Helper to resolve region from country code (ISO 3166-1 alpha-2)
CREATE OR REPLACE FUNCTION public.resolve_pricing_region(_country text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE
    WHEN upper(coalesce(_country,'')) = 'IN' THEN 'IN'
    WHEN upper(coalesce(_country,'')) IN ('AE','SA','KW','QA','BH','OM') THEN 'GULF'
    ELSE 'OTHER'
  END;
$$;

CREATE OR REPLACE FUNCTION public.resolve_pricing_currency(_region text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE upper(coalesce(_region,'OTHER'))
    WHEN 'IN' THEN 'INR'
    WHEN 'GULF' THEN 'AED'
    ELSE 'USD'
  END;
$$;

-- Backfill region/currency for existing tenants based on country
UPDATE public.tenants
SET
  pricing_region = COALESCE(pricing_region, public.resolve_pricing_region(country)),
  currency       = COALESCE(currency, public.resolve_pricing_currency(public.resolve_pricing_region(country)))
WHERE pricing_region IS NULL OR currency IS NULL;