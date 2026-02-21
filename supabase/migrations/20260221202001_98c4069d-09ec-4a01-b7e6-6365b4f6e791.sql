
-- Campaign draft table for autosave + resume later
CREATE TABLE public.smeksh_meta_campaign_drafts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  
  -- Campaign type: ctwa | website_traffic | form_leads
  campaign_type TEXT NOT NULL DEFAULT 'ctwa',
  
  -- Current wizard step (1-5)
  current_step INT NOT NULL DEFAULT 1,
  
  -- Step 1: Assets
  ad_account_id TEXT,
  page_id TEXT,
  page_name TEXT,
  instagram_account_id TEXT,
  pixel_id TEXT,
  whatsapp_phone_id TEXT,
  whatsapp_phone_display TEXT,
  
  -- Step 2: Objective
  campaign_name TEXT,
  objective TEXT, -- MESSAGES, TRAFFIC, LEAD_GENERATION
  buying_type TEXT DEFAULT 'AUCTION',
  special_ad_categories TEXT[] DEFAULT '{}',
  daily_budget NUMERIC,
  lifetime_budget NUMERIC,
  budget_type TEXT DEFAULT 'daily', -- daily | lifetime
  
  -- Step 3: Ad Set
  adset_name TEXT,
  targeting JSONB DEFAULT '{}',
  age_min INT DEFAULT 18,
  age_max INT DEFAULT 65,
  genders TEXT[] DEFAULT '{}',
  locations JSONB DEFAULT '[]',
  interests JSONB DEFAULT '[]',
  custom_audiences JSONB DEFAULT '[]',
  placements TEXT DEFAULT 'automatic', -- automatic | manual
  optimization_goal TEXT,
  bid_strategy TEXT DEFAULT 'lowest_cost',
  schedule_start TIMESTAMPTZ,
  schedule_end TIMESTAMPTZ,
  
  -- Step 4: Creative
  ad_name TEXT,
  creative_type TEXT DEFAULT 'single_image', -- single_image | carousel | video
  headline TEXT,
  primary_text TEXT,
  description TEXT,
  call_to_action TEXT DEFAULT 'SEND_WHATSAPP_MESSAGE',
  media_url TEXT,
  media_type TEXT, -- image | video
  destination_url TEXT,
  display_link TEXT,
  instant_form_id TEXT,
  whatsapp_message TEXT,
  whatsapp_welcome_message TEXT,
  
  -- Step 5: Review status
  status TEXT NOT NULL DEFAULT 'draft', -- draft | ready | publishing | published | failed
  meta_campaign_id TEXT,
  meta_adset_id TEXT,
  meta_ad_id TEXT,
  publish_error TEXT,
  published_at TIMESTAMPTZ,
  
  -- Metadata
  last_autosaved_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.smeksh_meta_campaign_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can view drafts"
  ON public.smeksh_meta_campaign_drafts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.tenant_id = smeksh_meta_campaign_drafts.workspace_id
        AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can create drafts"
  ON public.smeksh_meta_campaign_drafts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.tenant_id = smeksh_meta_campaign_drafts.workspace_id
        AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can update drafts"
  ON public.smeksh_meta_campaign_drafts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.tenant_id = smeksh_meta_campaign_drafts.workspace_id
        AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can delete drafts"
  ON public.smeksh_meta_campaign_drafts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.tenant_id = smeksh_meta_campaign_drafts.workspace_id
        AND tm.user_id = auth.uid()
    )
  );

-- Updated at trigger
CREATE TRIGGER set_smeksh_meta_campaign_drafts_updated_at
  BEFORE UPDATE ON public.smeksh_meta_campaign_drafts
  FOR EACH ROW EXECUTE FUNCTION public.smeksh_touch_updated_at();

-- Index for workspace lookup
CREATE INDEX idx_smeksh_meta_campaign_drafts_workspace 
  ON public.smeksh_meta_campaign_drafts(workspace_id, status);
