
-- Helper: check if current user is an agent in a tenant
CREATE OR REPLACE FUNCTION public.is_agent_role(p_tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.get_user_role_name(p_tenant_id, auth.uid()) = 'agent'
$$;

-- Drop existing conversation SELECT policy
DROP POLICY IF EXISTS "conversations_select_member" ON public.conversations;

-- New: Owners/admins see all conversations, agents see only their own + unassigned
CREATE POLICY "conversations_select_member" ON public.conversations
FOR SELECT USING (
  is_tenant_member(tenant_id)
  AND (
    -- Non-agents (owner/admin) see everything
    NOT is_agent_role(tenant_id)
    -- Agents see: assigned to them, claimed by them, or unassigned
    OR assigned_to = auth.uid()
    OR claimed_by = auth.uid()
    OR (assigned_to IS NULL AND claimed_by IS NULL)
  )
);

-- Also restrict contacts visibility for agents
-- Agents should only see contacts that have conversations visible to them
DROP POLICY IF EXISTS "contacts_select_member" ON public.contacts;

CREATE POLICY "contacts_select_member" ON public.contacts
FOR SELECT USING (
  is_tenant_member(tenant_id)
  AND (
    -- Non-agents see all contacts
    NOT is_agent_role(tenant_id)
    -- Agents see contacts who have conversations assigned/claimed to them or unassigned
    OR EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.contact_id = contacts.id
        AND c.tenant_id = contacts.tenant_id
        AND (
          c.assigned_to = auth.uid()
          OR c.claimed_by = auth.uid()
          OR (c.assigned_to IS NULL AND c.claimed_by IS NULL)
        )
    )
  )
);

-- Similarly restrict contact_inbox_summary for agents
DROP POLICY IF EXISTS "Members can read contact inbox summary" ON public.contact_inbox_summary;

CREATE POLICY "Members can read contact inbox summary" ON public.contact_inbox_summary
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM tenant_members tm
    WHERE tm.tenant_id = contact_inbox_summary.tenant_id
      AND tm.user_id = auth.uid()
  )
  AND (
    NOT is_agent_role(tenant_id)
    OR assigned_to = auth.uid()
    OR claimed_by = auth.uid()
    OR (assigned_to IS NULL AND claimed_by IS NULL)
  )
);
