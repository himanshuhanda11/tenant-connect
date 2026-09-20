DROP POLICY IF EXISTS contacts_select_member ON public.contacts;

CREATE POLICY contacts_select_member
ON public.contacts
FOR SELECT
USING (
  tenant_id IN (SELECT public.my_tenant_ids())
  AND (
    tenant_id NOT IN (SELECT public.my_agent_tenant_ids())
    OR EXISTS (
      SELECT 1
      FROM public.conversations c
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