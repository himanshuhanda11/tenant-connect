-- Allow super admins to access all email_* tables (Mail app is super-admin-only)
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'email_accounts','email_ai_suggestions','email_analytics_daily','email_attachments',
    'email_automation_runs','email_automations','email_conversation_labels',
    'email_conversation_viewers','email_conversations','email_drafts','email_events',
    'email_labels','email_messages','email_notes','email_signatures',
    'email_sla_breaches','email_sla_policies','email_templates'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS super_admin_all_%I ON public.%I; '
      'CREATE POLICY super_admin_all_%I ON public.%I AS PERMISSIVE FOR ALL TO authenticated '
      'USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());',
      t, t, t, t
    );
  END LOOP;
END $$;