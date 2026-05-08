INSERT INTO public.workspace_entitlements (workspace_id, plan, updated_at)
SELECT t.id, 'free', now()
FROM public.tenants t
LEFT JOIN public.workspace_entitlements e ON e.workspace_id = t.id
WHERE e.workspace_id IS NULL
ON CONFLICT (workspace_id) DO NOTHING;