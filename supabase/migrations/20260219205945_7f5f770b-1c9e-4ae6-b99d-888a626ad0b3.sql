
-- Add new lead stages for dismissal
ALTER TYPE lead_stage ADD VALUE IF NOT EXISTS 'not_relevant';
ALTER TYPE lead_stage ADD VALUE IF NOT EXISTS 'abuse';

-- Allow all workspace members to update qualified_leads (not just owner/admin)
-- Drop existing update policy if any and create a permissive one
DROP POLICY IF EXISTS "qualified_leads_update_member" ON qualified_leads;
CREATE POLICY "qualified_leads_update_member" ON qualified_leads
  FOR UPDATE TO authenticated
  USING (public.is_tenant_member(auth.uid(), workspace_id));
