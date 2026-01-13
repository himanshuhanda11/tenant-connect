export interface Plan {
  id: string;
  name: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number | null;
  limits_json: PlanLimits;
  is_active: boolean;
  sort_order: number | null;
}

export interface PlanLimits {
  max_phone_numbers: number;
  max_team_members: number;
  max_contacts: number;
  monthly_messages: number;
  max_campaigns: number;
  max_automations: number;
  api_access: boolean;
  audit_logs_days: number;
  support_level: 'email' | 'chat' | 'priority';
}

export interface Subscription {
  id: string;
  tenant_id: string;
  plan_id: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: 'active' | 'canceled' | 'past_due' | 'paused' | 'trialing';
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  billing_cycle: 'monthly' | 'yearly';
  created_at: string;
  updated_at: string;
  plan?: Plan;
}

export interface Invoice {
  id: string;
  tenant_id: string;
  stripe_invoice_id: string | null;
  invoice_number: string;
  amount_due: number;
  amount_paid: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  hosted_invoice_url: string | null;
  invoice_pdf_url: string | null;
  due_date: string | null;
  paid_at: string | null;
  period_start: string | null;
  period_end: string | null;
  line_items: InvoiceLineItem[];
  created_at: string;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit_amount: number;
  amount: number;
}

export interface PaymentMethod {
  id: string;
  tenant_id: string;
  stripe_payment_method_id: string | null;
  type: string;
  card_brand: string | null;
  card_last4: string | null;
  card_exp_month: number | null;
  card_exp_year: number | null;
  is_default: boolean;
  created_at: string;
}

export interface UsageCounter {
  id: string;
  tenant_id: string;
  year_month: string;
  messages_sent: number;
  messages_received: number;
  campaigns_created: number;
  contacts_added: number;
  automation_runs: number;
  template_submissions: number;
  api_calls: number;
  storage_bytes: number;
}

export interface BillingSettings {
  id: string;
  tenant_id: string;
  business_name: string | null;
  billing_email: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string;
  tax_id: string | null;
  vat_enabled: boolean;
  vat_percentage: number;
  invoice_notes: string | null;
  enforcement_mode: 'soft' | 'hard';
}

export interface UsageMetric {
  key: string;
  label: string;
  used: number;
  limit: number;
  unit?: string;
  icon?: React.ComponentType<{ className?: string }>;
}
