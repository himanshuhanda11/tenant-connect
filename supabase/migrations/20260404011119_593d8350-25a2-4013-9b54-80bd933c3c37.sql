-- Add billing settings columns to tenants table
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS billing_email text,
  ADD COLUMN IF NOT EXISTS billing_address jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS tax_id text,
  ADD COLUMN IF NOT EXISTS vat_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS vat_percentage numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS invoice_notes text,
  ADD COLUMN IF NOT EXISTS enforcement_mode text DEFAULT 'soft';
