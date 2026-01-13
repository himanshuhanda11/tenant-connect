import { useQuery } from '@tanstack/react-query';
import { useTenant } from '@/contexts/TenantContext';
import type { Plan, Subscription, Invoice, PaymentMethod, UsageCounter, BillingSettings } from '@/types/billing';

// Mock data for development (Stripe integration pending)
const mockPlans: Plan[] = [
  {
    id: 'plan_starter',
    name: 'Starter',
    description: 'Perfect for small teams getting started',
    price_monthly: 29,
    price_yearly: 290,
    is_active: true,
    sort_order: 1,
    limits_json: {
      max_phone_numbers: 1,
      max_team_members: 3,
      max_contacts: 1000,
      monthly_messages: 5000,
      max_campaigns: 5,
      max_automations: 3,
      api_access: false,
      audit_logs_days: 7,
      support_level: 'email',
    },
  },
  {
    id: 'plan_growth',
    name: 'Growth',
    description: 'For growing businesses with more needs',
    price_monthly: 79,
    price_yearly: 790,
    is_active: true,
    sort_order: 2,
    limits_json: {
      max_phone_numbers: 3,
      max_team_members: 10,
      max_contacts: 10000,
      monthly_messages: 25000,
      max_campaigns: 20,
      max_automations: 10,
      api_access: true,
      audit_logs_days: 30,
      support_level: 'chat',
    },
  },
  {
    id: 'plan_business',
    name: 'Business',
    description: 'Full-featured for larger organizations',
    price_monthly: 199,
    price_yearly: 1990,
    is_active: true,
    sort_order: 3,
    limits_json: {
      max_phone_numbers: 10,
      max_team_members: 50,
      max_contacts: 100000,
      monthly_messages: 100000,
      max_campaigns: -1,
      max_automations: -1,
      api_access: true,
      audit_logs_days: 90,
      support_level: 'priority',
    },
  },
  {
    id: 'plan_enterprise',
    name: 'Enterprise',
    description: 'Custom solutions for large enterprises',
    price_monthly: 0,
    price_yearly: 0,
    is_active: true,
    sort_order: 4,
    limits_json: {
      max_phone_numbers: -1,
      max_team_members: -1,
      max_contacts: -1,
      monthly_messages: -1,
      max_campaigns: -1,
      max_automations: -1,
      api_access: true,
      audit_logs_days: 365,
      support_level: 'priority',
    },
  },
];

const mockSubscription: Subscription = {
  id: 'sub_1',
  tenant_id: 'tenant_1',
  plan_id: 'plan_growth',
  stripe_customer_id: null,
  stripe_subscription_id: null,
  status: 'active',
  current_period_start: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  current_period_end: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
  cancel_at_period_end: false,
  canceled_at: null,
  billing_cycle: 'monthly',
  created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  updated_at: new Date().toISOString(),
  plan: mockPlans[1],
};

const mockInvoices: Invoice[] = [
  {
    id: 'inv_1',
    tenant_id: 'tenant_1',
    stripe_invoice_id: 'in_1234567890',
    invoice_number: 'INV-2026-001',
    amount_due: 7900,
    amount_paid: 7900,
    currency: 'usd',
    status: 'paid',
    hosted_invoice_url: '#',
    invoice_pdf_url: '#',
    due_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    paid_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    period_start: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    period_end: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    line_items: [
      { description: 'Growth Plan - Monthly', quantity: 1, unit_amount: 7900, amount: 7900 },
    ],
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'inv_2',
    tenant_id: 'tenant_1',
    stripe_invoice_id: 'in_0987654321',
    invoice_number: 'INV-2025-012',
    amount_due: 7900,
    amount_paid: 7900,
    currency: 'usd',
    status: 'paid',
    hosted_invoice_url: '#',
    invoice_pdf_url: '#',
    due_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    paid_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    period_start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    period_end: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    line_items: [
      { description: 'Growth Plan - Monthly', quantity: 1, unit_amount: 7900, amount: 7900 },
    ],
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const mockPaymentMethods: PaymentMethod[] = [
  {
    id: 'pm_1',
    tenant_id: 'tenant_1',
    stripe_payment_method_id: 'pm_1234567890',
    type: 'card',
    card_brand: 'visa',
    card_last4: '4242',
    card_exp_month: 12,
    card_exp_year: 2027,
    is_default: true,
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const mockUsage: UsageCounter = {
  id: 'usage_1',
  tenant_id: 'tenant_1',
  year_month: new Date().toISOString().slice(0, 7),
  messages_sent: 8450,
  messages_received: 12300,
  campaigns_created: 8,
  contacts_added: 3200,
  automation_runs: 156,
  template_submissions: 12,
  api_calls: 45000,
  storage_bytes: 524288000, // 500MB
};

const mockBillingSettings: BillingSettings = {
  id: 'bs_1',
  tenant_id: 'tenant_1',
  business_name: 'Acme Corp LLC',
  billing_email: 'billing@acmecorp.com',
  address_line1: '123 Business Bay',
  address_line2: 'Tower A, Floor 15',
  city: 'Dubai',
  state: 'Dubai',
  postal_code: '00000',
  country: 'AE',
  tax_id: 'TRN123456789',
  vat_enabled: true,
  vat_percentage: 5,
  invoice_notes: 'Thank you for your business!',
  enforcement_mode: 'soft',
};

export function usePlans() {
  return useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      // TODO: Replace with actual Supabase query when ready
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockPlans;
    },
  });
}

export function useSubscription() {
  const { currentTenant } = useTenant();
  
  return useQuery({
    queryKey: ['subscription', currentTenant?.id],
    queryFn: async () => {
      // TODO: Replace with actual Supabase query when ready
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockSubscription;
    },
    enabled: !!currentTenant,
  });
}

export function useInvoices() {
  const { currentTenant } = useTenant();
  
  return useQuery({
    queryKey: ['invoices', currentTenant?.id],
    queryFn: async () => {
      // TODO: Replace with actual Supabase query when ready
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockInvoices;
    },
    enabled: !!currentTenant,
  });
}

export function usePaymentMethods() {
  const { currentTenant } = useTenant();
  
  return useQuery({
    queryKey: ['payment-methods', currentTenant?.id],
    queryFn: async () => {
      // TODO: Replace with actual Supabase query when ready
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockPaymentMethods;
    },
    enabled: !!currentTenant,
  });
}

export function useUsage() {
  const { currentTenant } = useTenant();
  
  return useQuery({
    queryKey: ['usage', currentTenant?.id],
    queryFn: async () => {
      // TODO: Replace with actual Supabase query when ready
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockUsage;
    },
    enabled: !!currentTenant,
  });
}

export function useBillingSettings() {
  const { currentTenant } = useTenant();
  
  return useQuery({
    queryKey: ['billing-settings', currentTenant?.id],
    queryFn: async () => {
      // TODO: Replace with actual Supabase query when ready
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockBillingSettings;
    },
    enabled: !!currentTenant,
  });
}

export function useTeamUsage() {
  const { currentTenant } = useTenant();
  
  return useQuery({
    queryKey: ['team-usage', currentTenant?.id],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { used: 7, limit: 10 };
    },
    enabled: !!currentTenant,
  });
}

export function usePhoneUsage() {
  const { currentTenant } = useTenant();
  
  return useQuery({
    queryKey: ['phone-usage', currentTenant?.id],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { used: 2, limit: 3 };
    },
    enabled: !!currentTenant,
  });
}

export function useContactsUsage() {
  const { currentTenant } = useTenant();
  
  return useQuery({
    queryKey: ['contacts-usage', currentTenant?.id],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { used: 4850, limit: 10000 };
    },
    enabled: !!currentTenant,
  });
}
