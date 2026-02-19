-- Allow all tenant members to delete contacts (not just owner/admin)
DROP POLICY IF EXISTS "contacts_delete_admin" ON public.contacts;

CREATE POLICY "contacts_delete_member"
ON public.contacts
FOR DELETE
TO authenticated
USING (is_tenant_member(tenant_id));