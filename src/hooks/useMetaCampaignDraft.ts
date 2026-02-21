import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { MetaCampaignDraft, MetaCampaignType } from '@/types/meta-campaign';
import { CAMPAIGN_TYPE_CONFIG } from '@/types/meta-campaign';

const AUTOSAVE_DELAY = 2000;

export function useMetaCampaignDraft(draftId?: string) {
  const { currentTenant } = useTenant();
  const { user } = useAuth();
  const [draft, setDraft] = useState<MetaCampaignDraft>({
    workspace_id: '',
    campaign_type: 'ctwa',
    current_step: 1,
    budget_type: 'daily',
    placements: 'automatic',
    bid_strategy: 'lowest_cost',
    creative_type: 'single_image',
    age_min: 18,
    age_max: 65,
    buying_type: 'AUCTION',
    special_ad_categories: [],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!draftId);
  const [savedDraftId, setSavedDraftId] = useState<string | undefined>(draftId);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout>>();

  // Load existing draft
  useEffect(() => {
    if (draftId && currentTenant?.id) {
      loadDraft(draftId);
    }
  }, [draftId, currentTenant?.id]);

  // Set workspace_id when tenant loads
  useEffect(() => {
    if (currentTenant?.id) {
      setDraft(prev => ({ ...prev, workspace_id: currentTenant.id }));
    }
  }, [currentTenant?.id]);

  const loadDraft = async (id: string) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('smeksh_meta_campaign_drafts')
      .select('*')
      .eq('id', id)
      .single();
    
    if (data && !error) {
      setDraft(data as unknown as MetaCampaignDraft);
      setSavedDraftId(data.id);
    }
    setIsLoading(false);
  };

  const updateDraft = useCallback((updates: Partial<MetaCampaignDraft>) => {
    setDraft(prev => {
      const next = { ...prev, ...updates };
      // Auto-set defaults when campaign type changes
      if (updates.campaign_type && updates.campaign_type !== prev.campaign_type) {
        const config = CAMPAIGN_TYPE_CONFIG[updates.campaign_type];
        next.objective = config.objective;
        next.call_to_action = config.callToAction;
        next.optimization_goal = config.optimizationGoal;
        // Clear type-specific fields
        if (updates.campaign_type !== 'ctwa') {
          next.whatsapp_phone_id = undefined;
          next.whatsapp_phone_display = undefined;
          next.whatsapp_message = undefined;
          next.whatsapp_welcome_message = undefined;
        }
        if (updates.campaign_type !== 'website_traffic') {
          next.destination_url = undefined;
          next.display_link = undefined;
        }
        if (updates.campaign_type !== 'form_leads') {
          next.instant_form_id = undefined;
        }
      }
      return next;
    });
    scheduleAutosave();
  }, []);

  const scheduleAutosave = useCallback(() => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => saveDraft(), AUTOSAVE_DELAY);
  }, []);

  const saveDraft = async (forceSave = false) => {
    if (!currentTenant?.id || isSaving) return;
    setIsSaving(true);
    
    try {
      const payload: Record<string, unknown> = {
        workspace_id: currentTenant.id,
        created_by: user?.id,
        campaign_type: draft.campaign_type,
        current_step: draft.current_step,
        ad_account_id: draft.ad_account_id || null,
        page_id: draft.page_id || null,
        page_name: draft.page_name || null,
        instagram_account_id: draft.instagram_account_id || null,
        pixel_id: draft.pixel_id || null,
        whatsapp_phone_id: draft.whatsapp_phone_id || null,
        whatsapp_phone_display: draft.whatsapp_phone_display || null,
        campaign_name: draft.campaign_name || null,
        objective: draft.objective || null,
        buying_type: draft.buying_type || 'AUCTION',
        special_ad_categories: draft.special_ad_categories || [],
        daily_budget: draft.daily_budget || null,
        lifetime_budget: draft.lifetime_budget || null,
        budget_type: draft.budget_type || 'daily',
        adset_name: draft.adset_name || null,
        targeting: draft.targeting || {},
        age_min: draft.age_min ?? 18,
        age_max: draft.age_max ?? 65,
        genders: draft.genders || [],
        locations: draft.locations || [],
        interests: draft.interests || [],
        custom_audiences: draft.custom_audiences || [],
        placements: draft.placements || 'automatic',
        optimization_goal: draft.optimization_goal || null,
        bid_strategy: draft.bid_strategy || 'lowest_cost',
        schedule_start: draft.schedule_start || null,
        schedule_end: draft.schedule_end || null,
        ad_name: draft.ad_name || null,
        creative_type: draft.creative_type || 'single_image',
        headline: draft.headline || null,
        primary_text: draft.primary_text || null,
        description: draft.description || null,
        call_to_action: draft.call_to_action || null,
        media_url: draft.media_url || null,
        media_type: draft.media_type || null,
        destination_url: draft.destination_url || null,
        display_link: draft.display_link || null,
        instant_form_id: draft.instant_form_id || null,
        whatsapp_message: draft.whatsapp_message || null,
        whatsapp_welcome_message: draft.whatsapp_welcome_message || null,
        status: draft.status || 'draft',
        last_autosaved_at: new Date().toISOString(),
      };

      if (savedDraftId) {
        const { error } = await supabase
          .from('smeksh_meta_campaign_drafts')
          .update(payload as any)
          .eq('id', savedDraftId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('smeksh_meta_campaign_drafts')
          .insert(payload as any)
          .select('id')
          .single();
        if (error) throw error;
        if (data) setSavedDraftId(data.id);
      }
    } catch (err) {
      console.error('Draft save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const validateStep = useCallback((step: number): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const config = CAMPAIGN_TYPE_CONFIG[draft.campaign_type];

    switch (step) {
      case 1: // Assets
        if (!draft.ad_account_id) errors.push('Select an Ad Account');
        if (!draft.page_id) errors.push('Select a Facebook Page');
        if (draft.campaign_type === 'ctwa' && !draft.whatsapp_phone_id) {
          errors.push('Select a WhatsApp number for Click-to-WhatsApp campaigns');
        }
        break;
      case 2: // Objective
        if (!draft.campaign_name?.trim()) errors.push('Enter a campaign name');
        if (!draft.daily_budget && !draft.lifetime_budget) errors.push('Set a budget');
        if (draft.daily_budget && draft.daily_budget < 1) errors.push('Daily budget must be at least $1');
        break;
      case 3: // Ad Set
        if (!draft.adset_name?.trim()) errors.push('Enter an ad set name');
        break;
      case 4: // Creative
        if (!draft.ad_name?.trim()) errors.push('Enter an ad name');
        if (!draft.primary_text?.trim()) errors.push('Enter primary text');
        if (!draft.headline?.trim()) errors.push('Enter a headline');
        if (draft.campaign_type === 'website_traffic' && !draft.destination_url?.trim()) {
          errors.push('Enter a destination URL for Website Traffic campaigns');
        }
        break;
    }

    return { valid: errors.length === 0, errors };
  }, [draft]);

  const goToStep = useCallback((step: number) => {
    updateDraft({ current_step: step });
  }, [updateDraft]);

  const nextStep = useCallback(() => {
    const validation = validateStep(draft.current_step);
    if (!validation.valid) {
      validation.errors.forEach(e => toast.error(e));
      return false;
    }
    if (draft.current_step < 5) {
      updateDraft({ current_step: draft.current_step + 1 });
      return true;
    }
    return false;
  }, [draft.current_step, validateStep, updateDraft]);

  const prevStep = useCallback(() => {
    if (draft.current_step > 1) {
      updateDraft({ current_step: draft.current_step - 1 });
    }
  }, [draft.current_step, updateDraft]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, []);

  return {
    draft,
    updateDraft,
    saveDraft,
    isSaving,
    isLoading,
    savedDraftId,
    validateStep,
    goToStep,
    nextStep,
    prevStep,
  };
}
