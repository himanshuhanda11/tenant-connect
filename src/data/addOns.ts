import { Users, Workflow, FileText, Brain, Rocket, Shield, Plug } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface AddOn {
  id: string;
  name: string;
  description: string;
  benefit: string;
  icon: LucideIcon;
  category: AddOnCategory;
  price: number;
  unit: string;
  quantitySelectable: boolean;
  availableOn: ('basic' | 'pro' | 'business')[];
  badge?: string;
}

export type AddOnCategory = 'team' | 'automation' | 'ai_power' | 'growth' | 'safety';

export const addOnCategories: Record<AddOnCategory, { label: string; description: string }> = {
  team: { label: 'Team', description: 'Scale your team beyond plan limits' },
  automation: { label: 'Automation', description: 'Extend flows, forms, and campaign capacity' },
  ai_power: { label: 'AI Power', description: 'Unlock AI-driven productivity' },
  growth: { label: 'Growth', description: 'Supercharge campaigns and integrations' },
  safety: { label: 'Safety', description: 'Protect your sender reputation' },
};

export const addOns: AddOn[] = [
  {
    id: 'extra_agents',
    name: 'Extra Agents',
    description: 'Add more team members beyond your plan limit',
    benefit: 'Scale your support team without upgrading plans',
    icon: Users,
    category: 'team',
    price: 499,
    unit: 'per agent/month',
    quantitySelectable: true,
    availableOn: ['basic', 'pro', 'business'],
  },
  {
    id: 'extra_flows',
    name: 'Extra Flows',
    description: 'Unlock additional automation flows',
    benefit: 'Automate more customer journeys and processes',
    icon: Workflow,
    category: 'automation',
    price: 799,
    unit: 'per 5 flows/month',
    quantitySelectable: true,
    availableOn: ['basic', 'pro', 'business'],
  },
  {
    id: 'extra_autoforms',
    name: 'Extra AutoForms',
    description: 'Create more WhatsApp AutoForms for lead capture, orders & bookings',
    benefit: 'Capture more leads directly inside WhatsApp',
    icon: FileText,
    category: 'automation',
    price: 599,
    unit: 'per 5 forms/month',
    quantitySelectable: true,
    availableOn: ['basic', 'pro', 'business'],
  },
  {
    id: 'ai_credits',
    name: 'AI Credits',
    description: 'Usage-based credits for AI replies, summaries, lead qualification, insights & more',
    benefit: 'Power AI features across your entire workspace',
    icon: Brain,
    category: 'ai_power',
    price: 999,
    unit: 'per 1,000 credits/month',
    quantitySelectable: true,
    availableOn: ['basic', 'pro', 'business'],
  },
  {
    id: 'campaign_boost',
    name: 'Campaign Boost',
    description: 'Extra campaign sends, advanced scheduling & A/B testing',
    benefit: 'Run bigger campaigns and optimize delivery',
    icon: Rocket,
    category: 'growth',
    price: 1499,
    unit: 'per month',
    quantitySelectable: false,
    availableOn: ['basic', 'pro', 'business'],
  },
  {
    id: 'anti_ban_guard',
    name: 'Anti-Ban / Quality Guard',
    description: 'AI spam detection, send-rate throttling, quality alerts & template risk warnings',
    benefit: 'Protect your WhatsApp number from bans',
    icon: Shield,
    category: 'safety',
    price: 1999,
    unit: 'per month',
    quantitySelectable: false,
    availableOn: ['pro', 'business'],
    badge: 'Recommended',
  },
  {
    id: 'advanced_integrations',
    name: 'Advanced Integrations',
    description: 'Advanced Shopify sync, LeadSquared bidirectional sync, webhook replay & retry',
    benefit: 'Connect your full tech stack with enterprise reliability',
    icon: Plug,
    category: 'growth',
    price: 2499,
    unit: 'per month',
    quantitySelectable: false,
    availableOn: ['pro', 'business'],
    badge: 'Enterprise',
  },
];

export const formatINR = (val: number) => `₹${val.toLocaleString('en-IN')}`;

export function getAddOnsForPlan(planId: string): AddOn[] {
  if (planId === 'free') return [];
  return addOns.filter(a => a.availableOn.includes(planId as any));
}

export function getAddOnsByCategory(planId?: string): Record<AddOnCategory, AddOn[]> {
  const filtered = planId ? getAddOnsForPlan(planId) : addOns;
  const grouped: Record<AddOnCategory, AddOn[]> = {
    team: [], automation: [], ai_power: [], growth: [], safety: [],
  };
  filtered.forEach(a => grouped[a.category].push(a));
  return grouped;
}
