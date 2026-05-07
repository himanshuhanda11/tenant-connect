CREATE OR REPLACE VIEW public.platform_kpi_overview AS
SELECT 
  (SELECT count(*)::int FROM tenants) AS total_workspaces,
  (SELECT count(*)::int FROM tenants WHERE is_suspended = false) AS active_workspaces,
  (SELECT count(*)::int FROM tenants WHERE is_suspended = true) AS suspended_workspaces,
  (SELECT count(*)::int FROM smeksh_phone_numbers) AS total_phone_numbers,
  (SELECT count(*)::int FROM smeksh_phone_numbers WHERE status = 'connected'::smeksh_number_status) AS connected_phone_numbers,
  (SELECT count(DISTINCT user_id)::int FROM tenant_members) AS total_users,
  (SELECT count(*)::int FROM contacts) AS total_contacts,
  (SELECT count(*)::int FROM conversations) AS total_conversations,
  (SELECT count(*)::int FROM profiles) AS total_accounts,
  (SELECT count(*)::int FROM profiles WHERE step_completed_at IS NOT NULL) AS completed_accounts,
  (SELECT count(*)::int FROM profiles WHERE step_workspace_created_at IS NOT NULL) AS accounts_with_workspace,
  (SELECT count(*)::int FROM profiles WHERE created_at > now() - interval '30 days') AS accounts_last_30d,
  (SELECT COALESCE(sum(amount), 0)::bigint FROM platform_payments WHERE status IN ('paid','captured','succeeded','success')) AS total_revenue_cents,
  (SELECT COALESCE(sum(amount), 0)::bigint FROM platform_payments WHERE status IN ('paid','captured','succeeded','success') AND created_at > now() - interval '30 days') AS revenue_30d_cents,
  (SELECT count(DISTINCT conversation_id)::int FROM messages WHERE created_at > now() - interval '24 hours') AS daily_conversations,
  (SELECT count(*)::int FROM messages WHERE created_at > now() - interval '24 hours') AS daily_messages;