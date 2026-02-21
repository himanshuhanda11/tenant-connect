export type MetaCampaignType = 'ctwa' | 'website_traffic' | 'form_leads';

export interface MetaCampaignDraft {
  id?: string;
  workspace_id: string;
  campaign_type: MetaCampaignType;
  current_step: number;
  
  // Step 1: Assets
  ad_account_id?: string;
  page_id?: string;
  page_name?: string;
  instagram_account_id?: string;
  pixel_id?: string;
  whatsapp_phone_id?: string;
  whatsapp_phone_display?: string;
  
  // Step 2: Objective
  campaign_name?: string;
  objective?: string;
  buying_type?: string;
  special_ad_categories?: string[];
  daily_budget?: number;
  lifetime_budget?: number;
  budget_type?: string;
  
  // Step 3: Ad Set
  adset_name?: string;
  targeting?: Record<string, unknown>;
  age_min?: number;
  age_max?: number;
  genders?: string[];
  locations?: unknown[];
  interests?: unknown[];
  custom_audiences?: unknown[];
  placements?: string;
  optimization_goal?: string;
  bid_strategy?: string;
  schedule_start?: string;
  schedule_end?: string;
  
  // Step 4: Creative
  ad_name?: string;
  creative_type?: string;
  headline?: string;
  primary_text?: string;
  description?: string;
  call_to_action?: string;
  media_url?: string;
  media_type?: string;
  destination_url?: string;
  display_link?: string;
  instant_form_id?: string;
  whatsapp_message?: string;
  whatsapp_welcome_message?: string;
  
  // Status
  status?: string;
  publish_error?: string;
  
  created_at?: string;
  updated_at?: string;
  last_autosaved_at?: string;
}

export const CAMPAIGN_TYPE_CONFIG: Record<MetaCampaignType, {
  label: string;
  description: string;
  icon: string;
  objective: string;
  callToAction: string;
  optimizationGoal: string;
  requiredAssets: string[];
  color: string;
}> = {
  ctwa: {
    label: 'Click-to-WhatsApp',
    description: 'Drive WhatsApp conversations from ads',
    icon: '💬',
    objective: 'MESSAGES',
    callToAction: 'SEND_WHATSAPP_MESSAGE',
    optimizationGoal: 'CONVERSATIONS',
    requiredAssets: ['ad_account_id', 'page_id', 'whatsapp_phone_id'],
    color: 'emerald',
  },
  website_traffic: {
    label: 'Website Traffic',
    description: 'Send people to your website or landing page',
    icon: '🌐',
    objective: 'TRAFFIC',
    callToAction: 'LEARN_MORE',
    optimizationGoal: 'LINK_CLICKS',
    requiredAssets: ['ad_account_id', 'page_id'],
    color: 'blue',
  },
  form_leads: {
    label: 'Form Sales Leads',
    description: 'Collect leads with instant forms on Facebook/Instagram',
    icon: '📋',
    objective: 'LEAD_GENERATION',
    callToAction: 'SIGN_UP',
    optimizationGoal: 'LEAD_GENERATION',
    requiredAssets: ['ad_account_id', 'page_id'],
    color: 'violet',
  },
};

export const WIZARD_STEPS = [
  { id: 1, label: 'Assets', description: 'Select ad account & pages' },
  { id: 2, label: 'Objective', description: 'Campaign name & budget' },
  { id: 3, label: 'Ad Set', description: 'Targeting & placements' },
  { id: 4, label: 'Creative', description: 'Ad content & media' },
  { id: 5, label: 'Review', description: 'Review & publish' },
];

export const CALL_TO_ACTION_OPTIONS: Record<MetaCampaignType, { value: string; label: string }[]> = {
  ctwa: [
    { value: 'SEND_WHATSAPP_MESSAGE', label: 'Send WhatsApp Message' },
    { value: 'WHATSAPP_MESSAGE', label: 'WhatsApp Message' },
  ],
  website_traffic: [
    { value: 'LEARN_MORE', label: 'Learn More' },
    { value: 'SHOP_NOW', label: 'Shop Now' },
    { value: 'SIGN_UP', label: 'Sign Up' },
    { value: 'BOOK_TRAVEL', label: 'Book Now' },
    { value: 'CONTACT_US', label: 'Contact Us' },
    { value: 'GET_QUOTE', label: 'Get Quote' },
  ],
  form_leads: [
    { value: 'SIGN_UP', label: 'Sign Up' },
    { value: 'SUBSCRIBE', label: 'Subscribe' },
    { value: 'GET_QUOTE', label: 'Get Quote' },
    { value: 'APPLY_NOW', label: 'Apply Now' },
    { value: 'LEARN_MORE', label: 'Learn More' },
    { value: 'DOWNLOAD', label: 'Download' },
  ],
};
