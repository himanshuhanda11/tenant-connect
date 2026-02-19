-- Remove duplicate qualified_leads rows, keeping the most recent
DELETE FROM public.qualified_leads
WHERE id NOT IN (
  SELECT DISTINCT ON (workspace_id, contact_id) id
  FROM public.qualified_leads
  ORDER BY workspace_id, contact_id, updated_at DESC
);

-- Now add unique constraint
ALTER TABLE public.qualified_leads ADD CONSTRAINT uq_qualified_leads_workspace_contact UNIQUE (workspace_id, contact_id);