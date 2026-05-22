UPDATE public.form_sessions fs
SET status = 'expired', updated_at = now()
FROM public.form_rules fr
WHERE fs.form_rule_id = fr.id
  AND fr.is_active = false
  AND fs.status IN ('active','review');