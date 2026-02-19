
-- Fix FK constraints that block contact deletion

-- automation_runs: change from NO ACTION to SET NULL
ALTER TABLE public.automation_runs DROP CONSTRAINT automation_runs_contact_id_fkey;
ALTER TABLE public.automation_runs ADD CONSTRAINT automation_runs_contact_id_fkey 
  FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE SET NULL;

-- automation_scheduled_jobs: change from SET NULL (n) — this is fine, but let's verify it doesn't block
-- These SET NULL FKs should work fine, but let's also handle others that might block

-- ai_drafts
ALTER TABLE public.ai_drafts DROP CONSTRAINT IF EXISTS ai_drafts_contact_id_fkey;
ALTER TABLE public.ai_drafts ADD CONSTRAINT ai_drafts_contact_id_fkey 
  FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE SET NULL;

-- qualified_leads
ALTER TABLE public.qualified_leads DROP CONSTRAINT IF EXISTS qualified_leads_contact_id_fkey;
ALTER TABLE public.qualified_leads ADD CONSTRAINT qualified_leads_contact_id_fkey 
  FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE SET NULL;

-- smeksh_messages
ALTER TABLE public.smeksh_messages DROP CONSTRAINT IF EXISTS smeksh_messages_contact_id_fkey;
ALTER TABLE public.smeksh_messages ADD CONSTRAINT smeksh_messages_contact_id_fkey 
  FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE SET NULL;

-- smeksh_conversation_events
ALTER TABLE public.smeksh_conversation_events DROP CONSTRAINT IF EXISTS smeksh_conversation_events_contact_id_fkey;
ALTER TABLE public.smeksh_conversation_events ADD CONSTRAINT smeksh_conversation_events_contact_id_fkey 
  FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE SET NULL;

-- smeksh_conversation_snoozes
ALTER TABLE public.smeksh_conversation_snoozes DROP CONSTRAINT IF EXISTS smeksh_conversation_snoozes_contact_id_fkey;
ALTER TABLE public.smeksh_conversation_snoozes ADD CONSTRAINT smeksh_conversation_snoozes_contact_id_fkey 
  FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE SET NULL;

-- smeksh_internal_notes
ALTER TABLE public.smeksh_internal_notes DROP CONSTRAINT IF EXISTS smeksh_internal_notes_contact_id_fkey;
ALTER TABLE public.smeksh_internal_notes ADD CONSTRAINT smeksh_internal_notes_contact_id_fkey 
  FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE SET NULL;

-- flow_sessions
ALTER TABLE public.flow_sessions DROP CONSTRAINT IF EXISTS flow_sessions_contact_id_fkey;
ALTER TABLE public.flow_sessions ADD CONSTRAINT flow_sessions_contact_id_fkey 
  FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE SET NULL;

-- form_rule_logs
ALTER TABLE public.form_rule_logs DROP CONSTRAINT IF EXISTS form_rule_logs_contact_id_fkey;
ALTER TABLE public.form_rule_logs ADD CONSTRAINT form_rule_logs_contact_id_fkey 
  FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE SET NULL;

-- smeksh_campaign_jobs
ALTER TABLE public.smeksh_campaign_jobs DROP CONSTRAINT IF EXISTS smeksh_campaign_jobs_contact_id_fkey;
ALTER TABLE public.smeksh_campaign_jobs ADD CONSTRAINT smeksh_campaign_jobs_contact_id_fkey 
  FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE SET NULL;

-- smeksh_campaign_events
ALTER TABLE public.smeksh_campaign_events DROP CONSTRAINT IF EXISTS smeksh_campaign_events_contact_id_fkey;
ALTER TABLE public.smeksh_campaign_events ADD CONSTRAINT smeksh_campaign_events_contact_id_fkey 
  FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE SET NULL;

-- smeksh_meta_ad_leads
ALTER TABLE public.smeksh_meta_ad_leads DROP CONSTRAINT IF EXISTS smeksh_meta_ad_leads_contact_id_fkey;
ALTER TABLE public.smeksh_meta_ad_leads ADD CONSTRAINT smeksh_meta_ad_leads_contact_id_fkey 
  FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE SET NULL;

-- automation_scheduled_jobs
ALTER TABLE public.automation_scheduled_jobs DROP CONSTRAINT IF EXISTS automation_scheduled_jobs_contact_id_fkey;
ALTER TABLE public.automation_scheduled_jobs ADD CONSTRAINT automation_scheduled_jobs_contact_id_fkey 
  FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE SET NULL;
