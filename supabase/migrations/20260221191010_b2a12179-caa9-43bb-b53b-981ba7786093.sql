
-- Add unique constraint for campaign-level upserts
CREATE UNIQUE INDEX IF NOT EXISTS idx_smeksh_meta_ad_campaigns_workspace_campaign 
ON public.smeksh_meta_ad_campaigns(workspace_id, meta_campaign_id);
