export interface PricingPlan {
  id: string;
  name: string;
  tagline: string;
  price: number | 'custom';
  billing_cycle: string;
  cta: string;
  highlight: boolean;
  badge?: string;
  limits: {
    team_members: number;
    phone_numbers: number;
    contacts: number | 'unlimited';
    tags: number | 'unlimited';
    custom_attributes: number | 'unlimited';
    flows: number | 'unlimited';
    autoforms: number | 'unlimited';
    automations: number | 'unlimited';
    ai_features: 'preview' | 'basic' | 'full' | 'enterprise';
  };
  features: string[];
  addons: string[];
  restrictions?: string[];
}

export const pricingPlans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Get started with WhatsApp',
    price: 0,
    billing_cycle: 'forever',
    cta: 'Start Free',
    highlight: false,
    limits: {
      team_members: 1,
      phone_numbers: 1,
      contacts: 1000,
      tags: 10,
      custom_attributes: 10,
      flows: 0,
      autoforms: 0,
      automations: 0,
      ai_features: 'preview',
    },
    features: [
      'Official WhatsApp Business API connection',
      'Basic inbox (single owner)',
      'Create & submit message templates',
      'Manual replies',
      'Limited campaigns',
      'Basic analytics',
    ],
    addons: [],
    restrictions: [
      'No team members',
      'No flows or automations',
      'No AutoForms',
      'No AI automation',
    ],
  },
  {
    id: 'basic',
    name: 'Basic',
    tagline: 'For small teams starting WhatsApp marketing',
    price: 1499,
    billing_cycle: 'monthly',
    cta: 'Get Basic',
    highlight: false,
    limits: {
      team_members: 5,
      phone_numbers: 1,
      contacts: 10000,
      tags: 10,
      custom_attributes: 30,
      flows: 3,
      autoforms: 3,
      automations: 10,
      ai_features: 'basic',
    },
    features: [
      'Shared team inbox',
      'Round-robin & manual assignment',
      '3 WhatsApp Flows',
      '3 WhatsApp AutoForms',
      'Webhook & Zapier integration',
      'Basic AI replies & template validation',
      'Campaign scheduling',
    ],
    addons: ['extra_agents', 'extra_flows', 'extra_autoforms', 'ai_credits', 'campaign_boost'],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Automation + AI powered growth',
    price: 3499,
    billing_cycle: 'monthly',
    cta: 'Start Pro',
    highlight: true,
    badge: 'Most Popular',
    limits: {
      team_members: 10,
      phone_numbers: 1,
      contacts: 50000,
      tags: 50,
      custom_attributes: 100,
      flows: 20,
      autoforms: 25,
      automations: 200,
      ai_features: 'full',
    },
    features: [
      'Advanced inbox with SLA & priority routing',
      '20 automation flows',
      'AutoForms with CRM sync',
      'AI inbox assist & summaries',
      'AI insights & recommendations',
      'AI template validator + auto-category',
      'Meta Ads (CTWA) attribution',
      'Shopify, WooCommerce, Razorpay integrations',
    ],
    addons: ['extra_agents', 'extra_flows', 'extra_autoforms', 'ai_credits', 'campaign_boost', 'anti_ban_guard', 'advanced_integrations'],
  },
  {
    id: 'business',
    name: 'Business',
    tagline: 'Scale securely with full control',
    price: 'custom',
    billing_cycle: 'custom',
    cta: 'Talk to Sales',
    highlight: false,
    limits: {
      team_members: 25,
      phone_numbers: 1,
      contacts: 'unlimited',
      tags: 'unlimited',
      custom_attributes: 'unlimited',
      flows: 'unlimited',
      autoforms: 'unlimited',
      automations: 'unlimited',
      ai_features: 'enterprise',
    },
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
    addons: ['extra_agents', 'extra_flows', 'extra_autoforms', 'ai_credits', 'campaign_boost', 'anti_ban_guard', 'advanced_integrations'],
  },
];

export const comparisonGroups = [
  {
    category: 'Core',
    features: [
      { name: 'Team Members', free: '1', basic: '5', pro: '10', business: '25+' },
      { name: 'Phone Numbers', free: '1', basic: '1', pro: '1', business: '1' },
      { name: 'Contacts', free: '1,000', basic: '10,000', pro: '50,000', business: 'Unlimited' },
      { name: 'Tags', free: '10', basic: '10', pro: '50', business: 'Unlimited' },
      { name: 'Custom Attributes', free: '10', basic: '30', pro: '100', business: 'Unlimited' },
    ],
  },
  {
    category: 'Automation',
    features: [
      { name: 'WhatsApp Flows', free: '—', basic: '3', pro: '20', business: 'Unlimited' },
      { name: 'AutoForms', free: '—', basic: '3', pro: '25', business: 'Unlimited' },
      { name: 'Automations', free: '—', basic: '10', pro: '200', business: 'Unlimited' },
      { name: 'Campaign Scheduling', free: 'Limited', basic: '✓', pro: '✓', business: '✓' },
    ],
  },
  {
    category: 'AI',
    features: [
      { name: 'AI Replies', free: '—', basic: 'Basic', pro: 'Full', business: 'Enterprise' },
      { name: 'AI Template Validator', free: '—', basic: 'Basic', pro: '✓', business: '✓' },
      { name: 'AI Insights & Recommendations', free: '—', basic: '—', pro: '✓', business: '✓' },
      { name: 'AI Agent Mode', free: '—', basic: '—', pro: '—', business: '✓' },
    ],
  },
  {
    category: 'Growth',
    features: [
      { name: 'Meta Ads (CTWA) Attribution', free: '—', basic: '—', pro: '✓', business: '✓' },
      { name: 'Shopify / WooCommerce', free: '—', basic: '—', pro: '✓', business: '✓' },
      { name: 'Razorpay Integration', free: '—', basic: '—', pro: '✓', business: '✓' },
      { name: 'Webhook & Zapier', free: '—', basic: '✓', pro: '✓', business: '✓' },
    ],
  },
  {
    category: 'Control & Compliance',
    features: [
      { name: 'Audit Logs', free: '—', basic: '—', pro: '—', business: '✓' },
      { name: 'Role Permissions', free: 'Owner only', basic: 'Basic', pro: 'Advanced', business: 'Custom' },
      { name: 'Anti-ban Guardrails', free: '—', basic: '—', pro: '—', business: '✓' },
      { name: 'Support', free: 'Community', basic: 'Email', pro: 'Priority', business: 'Dedicated' },
    ],
  },
];
