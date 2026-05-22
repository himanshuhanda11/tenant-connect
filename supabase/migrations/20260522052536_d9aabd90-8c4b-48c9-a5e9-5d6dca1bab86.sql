ALTER TABLE public.template_submission_logs
  ADD COLUMN IF NOT EXISTS step text DEFAULT 'submitted',
  ADD COLUMN IF NOT EXISTS meta_error_code integer,
  ADD COLUMN IF NOT EXISTS meta_error_subcode integer,
  ADD COLUMN IF NOT EXISTS meta_error_title text,
  ADD COLUMN IF NOT EXISTS meta_error_details jsonb;

CREATE INDEX IF NOT EXISTS idx_template_submission_logs_template_created
  ON public.template_submission_logs (template_id, created_at DESC);