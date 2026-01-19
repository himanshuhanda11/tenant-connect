-- Add ai_intent to the trigger_type check constraint
ALTER TABLE public.form_rules DROP CONSTRAINT IF EXISTS form_rules_trigger_type_check;
ALTER TABLE public.form_rules ADD CONSTRAINT form_rules_trigger_type_check 
  CHECK (trigger_type IN ('first_message', 'keyword', 'ad_click', 'qr_scan', 'source', 'tag_added', 'scheduled', 'ai_intent'));