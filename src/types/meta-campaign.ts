export type MetaCampaignType = 'ctwa' | 'website_traffic' | 'form_leads';

export interface LeadFormQuestion {
  id: string;
  type: 'predefined' | 'custom';
  field: string;
  label: string;
  required: boolean;
}

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
  pixel_name?: string;
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
  cbo_enabled?: boolean;
  
  // Step 3: Ad Set
  adset_name?: string;
  targeting?: Record<string, unknown>;
  age_min?: number;
  age_max?: number;
  genders?: string[];
  languages?: string[];
  locations?: unknown[];
  interests?: unknown[];
  custom_audiences?: unknown[];
  placements?: string;
  manual_placements?: string[];
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
  
  // CTWA-specific
  flow_id?: string;
  flow_name?: string;
  
  // UTM tracking
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  
  // Lead Form Builder (form_leads)
  lead_form_type?: string;
  lead_form_questions?: LeadFormQuestion[];
  lead_form_privacy_url?: string;
  lead_form_thankyou_title?: string;
  lead_form_thankyou_body?: string;
  lead_form_thankyou_cta?: string;
  lead_form_thankyou_url?: string;
  
  // Meta IDs (returned after publish)
  meta_campaign_id?: string;
  meta_adset_id?: string;
  meta_creative_id?: string;
  meta_ad_id?: string;
  meta_lead_form_id?: string;
  
  // Status
  status?: string;
  publish_status?: string;
  publish_error?: string;
  publish_error_code?: string;
  publish_log?: PublishStep[];
  publish_started_at?: string;
  publish_completed_at?: string;
  
  created_at?: string;
  updated_at?: string;
  last_autosaved_at?: string;
}

export interface PublishStep {
  step: string;
  status: 'pending' | 'success' | 'error';
  meta_id?: string;
  error?: string;
  error_code?: string;
}

export interface PublishResult {
  success: boolean;
  meta_campaign_id?: string;
  meta_adset_id?: string;
  meta_creative_id?: string;
  meta_ad_id?: string;
  meta_lead_form_id?: string;
  error?: string;
  error_code?: string;
  error_help?: string;
  log?: PublishStep[];
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

export const SPECIAL_AD_CATEGORY_WARNINGS: Record<string, string> = {
  CREDIT: 'Credit ads have restricted targeting: no age, gender, or zip code targeting. Minimum radius 15 miles.',
  EMPLOYMENT: 'Employment ads have restricted targeting: no age, gender, or zip code targeting. Minimum radius 15 miles.',
  HOUSING: 'Housing ads have restricted targeting: no age, gender, or zip code targeting. Minimum radius 15 miles.',
  SOCIAL_ISSUES_ELECTIONS_POLITICS: 'Political ads require identity verification and "Paid for by" disclaimer. Subject to additional review.',
};

export const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'Arabic' },
  { value: 'fr', label: 'French' },
  { value: 'es', label: 'Spanish' },
  { value: 'de', label: 'German' },
  { value: 'hi', label: 'Hindi' },
  { value: 'ur', label: 'Urdu' },
  { value: 'zh', label: 'Chinese' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'tr', label: 'Turkish' },
  { value: 'it', label: 'Italian' },
  { value: 'nl', label: 'Dutch' },
  { value: 'ru', label: 'Russian' },
];

export const MANUAL_PLACEMENT_OPTIONS = [
  { value: 'facebook_feed', label: 'Facebook Feed' },
  { value: 'facebook_stories', label: 'Facebook Stories' },
  { value: 'facebook_reels', label: 'Facebook Reels' },
  { value: 'facebook_right_column', label: 'Facebook Right Column' },
  { value: 'instagram_feed', label: 'Instagram Feed' },
  { value: 'instagram_stories', label: 'Instagram Stories' },
  { value: 'instagram_reels', label: 'Instagram Reels' },
  { value: 'instagram_explore', label: 'Instagram Explore' },
  { value: 'messenger_inbox', label: 'Messenger Inbox' },
  { value: 'audience_network', label: 'Audience Network' },
];

export const DEFAULT_LEAD_FORM_QUESTIONS: LeadFormQuestion[] = [
  { id: '1', type: 'predefined', field: 'FULL_NAME', label: 'Full Name', required: true },
  { id: '2', type: 'predefined', field: 'PHONE', label: 'Phone Number', required: true },
  { id: '3', type: 'predefined', field: 'EMAIL', label: 'Email', required: false },
];

export const PREDEFINED_FORM_FIELDS = [
  { field: 'FULL_NAME', label: 'Full Name' },
  { field: 'PHONE', label: 'Phone Number' },
  { field: 'EMAIL', label: 'Email' },
  { field: 'CITY', label: 'City' },
  { field: 'STATE', label: 'State' },
  { field: 'COUNTRY', label: 'Country' },
  { field: 'ZIP', label: 'Zip Code' },
  { field: 'JOB_TITLE', label: 'Job Title' },
  { field: 'COMPANY_NAME', label: 'Company Name' },
  { field: 'DOB', label: 'Date of Birth' },
  { field: 'GENDER', label: 'Gender' },
  { field: 'MARITAL_STATUS', label: 'Marital Status' },
  { field: 'MILITARY_STATUS', label: 'Military Status' },
  { field: 'WORK_EMAIL', label: 'Work Email' },
  { field: 'WORK_PHONE_NUMBER', label: 'Work Phone' },
];
