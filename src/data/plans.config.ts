// ============================================================
// SINGLE SOURCE OF TRUTH for all plans across the app.
// Used by: public Pricing page, Onboarding Choose Plan,
// Billing section, Upgrade/Change Plan dialogs.
// ============================================================

export type PlanId = 'free' | 'basic' | 'pro' | 'business';
export type Region = 'IN' | 'GULF' | 'OTHER';
export type Currency = 'INR' | 'AED' | 'USD';
export type BillingCycle = 'monthly' | 'yearly';

export interface RegionPricing {
  currency: Currency;
  symbol: string;            // "₹", "AED ", "$"
  monthly: number;
  yearlyPerMonth: number;    // shown as /mo when annual
}

export interface PlanLimits {
  team_members: number;
  phone_numbers: number;
  contacts: number | 'unlimited';
  flows: number | 'unlimited';
  autoforms: number | 'unlimited';
  automations: number | 'unlimited';
  ai_features: 'preview' | 'basic' | 'full' | 'enterprise';
  tags: number | 'unlimited';
  custom_attributes: number | 'unlimited';
}

export interface PlanConfig {
  id: PlanId;
  name: string;
  tagline: string;
  highlight: boolean;
  badge?: string;
  trialDays: number;
  cta: { free: string; paid: string };
  pricing: Record<Region, RegionPricing>;
  // Stripe Price IDs — region × cycle. Empty string ⇒ falls back to env / DB.
  stripePriceIds: Record<Region, { monthly: string; yearly: string }>;
  features: string[];
  limits: PlanLimits;
}

// ----- Stripe AED Price IDs (currently used for all regions) -----
// Replace per-region entries when you create INR/USD Stripe prices.
const AED_PRICE_IDS = {
  basic:    { monthly: 'price_1TVgjH52Ucx7gNb95xtj6cif', yearly: 'price_1TVgwc52Ucx7gNb9uIPCB0N1' },
  pro:      { monthly: 'price_1TVgxX52Ucx7gNb9oY0DCgM6', yearly: 'price_1TVgyN52Ucx7gNb92HglDQeq' },
  business: { monthly: 'price_1TVgz052Ucx7gNb9uYNsGnvp', yearly: 'price_1TVgzs52Ucx7gNb9kMyBlRF9' },
} as const;

const allRegionsSamePrices = (ids: { monthly: string; yearly: string }) => ({
  IN: ids,
  GULF: ids,
  OTHER: ids,
});

// ----- Display pricing (per region) -----
// Today: AED everywhere (matches Stripe). When INR/USD prices exist in Stripe,
// update the IN.* and OTHER.* numbers and the matching stripePriceIds.
const aedRow = (monthly: number, yearlyPerMonth: number): RegionPricing => ({
  currency: 'AED', symbol: 'AED ', monthly, yearlyPerMonth,
});

export const PLANS: PlanConfig[] = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Get started with WhatsApp',
    highlight: false,
    trialDays: 0,
    cta: { free: 'Free Lifetime', paid: 'Free Lifetime' },
    pricing: {
      IN:    { currency: 'AED', symbol: 'AED ', monthly: 0, yearlyPerMonth: 0 },
      GULF:  { currency: 'AED', symbol: 'AED ', monthly: 0, yearlyPerMonth: 0 },
      OTHER: { currency: 'AED', symbol: 'AED ', monthly: 0, yearlyPerMonth: 0 },
    },
    stripePriceIds: { IN: { monthly: '', yearly: '' }, GULF: { monthly: '', yearly: '' }, OTHER: { monthly: '', yearly: '' } },
    features: [
      'Official WhatsApp Business API',
      'Basic single-owner inbox',
      'Templates + manual replies',
      'Limited campaigns',
      'Basic analytics',
    ],
    limits: {
      team_members: 1, phone_numbers: 1, contacts: 1000,
      flows: 0, autoforms: 0, automations: 0,
      ai_features: 'preview', tags: 10, custom_attributes: 10,
    },
  },
  {
    id: 'basic',
    name: 'Basic',
    tagline: 'For small teams starting WhatsApp',
    highlight: false,
    trialDays: 30,
    cta: { free: 'Get Basic', paid: 'Start Free Trial' },
    pricing: {
      IN: aedRow(350, 280),
      GULF: aedRow(350, 280),
      OTHER: aedRow(350, 280),
    },
    stripePriceIds: allRegionsSamePrices(AED_PRICE_IDS.basic),
    features: [
      'Shared team inbox',
      'Round-robin & manual assignment',
      '3 WhatsApp Flows',
      '3 WhatsApp AutoForms',
      'Webhook & Zapier integration',
      'Basic AI replies & template validation',
      'Campaign scheduling',
    ],
    limits: {
      team_members: 5, phone_numbers: 1, contacts: 10000,
      flows: 3, autoforms: 3, automations: 10,
      ai_features: 'basic', tags: 10, custom_attributes: 30,
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Automation + AI powered growth',
    highlight: true,
    badge: 'Most Popular',
    trialDays: 30,
    cta: { free: 'Start Pro', paid: 'Start Free Trial' },
    pricing: {
      IN: aedRow(550, 440),
      GULF: aedRow(550, 440),
      OTHER: aedRow(550, 440),
    },
    stripePriceIds: allRegionsSamePrices(AED_PRICE_IDS.pro),
    features: [
      'Advanced inbox with SLA & priority routing',
      '20 automation flows',
      'AutoForms with CRM sync',
      'AI inbox assist & summaries',
      'AI insights & recommendations',
      'AI template validator',
      'Meta Ads (CTWA) attribution',
      'Shopify, WooCommerce, Razorpay integrations',
    ],
    limits: {
      team_members: 15, phone_numbers: 1, contacts: 50000,
      flows: 20, autoforms: 25, automations: 200,
      ai_features: 'full', tags: 50, custom_attributes: 100,
    },
  },
  {
    id: 'business',
    name: 'Business',
    tagline: 'Scale securely with full control',
    highlight: false,
    trialDays: 30,
    cta: { free: 'Get Business', paid: 'Start Free Trial' },
    pricing: {
      IN: aedRow(850, 680),
      GULF: aedRow(850, 680),
      OTHER: aedRow(850, 680),
    },
    stripePriceIds: allRegionsSamePrices(AED_PRICE_IDS.business),
    features: [
      'Unlimited automations & AutoForms',
      'AI Agent Mode (auto-resolve + auto-qualify)',
      'Audit logs & approval workflows',
      'Advanced role permissions',
      'Webhook replay & debugging',
      'Anti-ban guardrails',
      'Dedicated success manager',
      'Priority SLA support',
    ],
    limits: {
      team_members: 25, phone_numbers: 1, contacts: 'unlimited',
      flows: 'unlimited', autoforms: 'unlimited', automations: 'unlimited',
      ai_features: 'enterprise', tags: 'unlimited', custom_attributes: 'unlimited',
    },
  },
];

// ============================================================
// Helpers
// ============================================================

const IN_COUNTRIES = new Set(['IN']);
const GULF_COUNTRIES = new Set(['AE', 'SA', 'KW', 'QA', 'BH', 'OM']);

export function regionFromCountry(country?: string | null): Region {
  if (!country) return 'OTHER';
  const c = country.toUpperCase();
  if (IN_COUNTRIES.has(c)) return 'IN';
  if (GULF_COUNTRIES.has(c)) return 'GULF';
  return 'OTHER';
}

export function getPlan(id: string): PlanConfig | undefined {
  const key = id.replace(/^plan_/, '').toLowerCase() as PlanId;
  return PLANS.find((p) => p.id === key);
}

export function getPriceForRegion(plan: PlanConfig, region: Region, cycle: BillingCycle): number {
  const row = plan.pricing[region];
  return cycle === 'yearly' ? row.yearlyPerMonth : row.monthly;
}

export function formatPlanPrice(plan: PlanConfig, region: Region, cycle: BillingCycle): string {
  const row = plan.pricing[region];
  const v = cycle === 'yearly' ? row.yearlyPerMonth : row.monthly;
  if (row.currency === 'INR') return `₹${v.toLocaleString('en-IN')}`;
  if (row.currency === 'AED') return `AED ${v.toLocaleString('en-US')}`;
  return `$${v.toLocaleString('en-US')}`;
}

export const PLAN_RANK: Record<PlanId, number> = { free: 0, basic: 1, pro: 2, business: 3 };
