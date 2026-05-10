export type WidgetStatus = 'draft' | 'published' | 'paused';
export type WidgetType =
  | 'floating-bubble'
  | 'full-popup'
  | 'agent-bubble'
  | 'multi-agent'
  | 'minimal-icon'
  | 'sticky-bar'
  | 'mobile-cta';

export interface WidgetConfig {
  type?: WidgetType;
  brandName?: string;
  subtitle?: string;
  greeting?: string;
  ctaText?: string;
  prefilledMessage?: string;

  primaryColor?: string;
  accentColor?: string;
  bgColor?: string;
  textColor?: string;
  radius?: number;
  darkMode?: boolean;
  logoUrl?: string;

  position?: 'bottom-right' | 'bottom-left';
  visibility?: 'desktop' | 'mobile' | 'both';
  animation?: 'pulse' | 'glow' | 'bounce' | 'float' | 'slide' | 'none';
  showTyping?: boolean;
  online?: boolean;

  openDelay?: number;
  autoOpen?: boolean;
  exitIntent?: boolean;
  scrollTrigger?: number;
  includePaths?: string[];
  excludePaths?: string[];

  collectLead?: boolean;
  fieldName?: boolean;
  fieldPhone?: boolean;
  fieldEmail?: boolean;
  requireName?: boolean;
  requirePhone?: boolean;

  hideBranding?: boolean;

  businessHours?: {
    enabled?: boolean;
    timezone?: string;
    schedule?: Record<string, { start: string; end: string } | null>;
    offlineMessage?: string;
  };
}

export interface Widget {
  id: string;
  tenant_id: string;
  public_key: string;
  name: string;
  status: WidgetStatus;
  whatsapp_number: string | null;
  config: WidgetConfig;
  created_at: string;
  updated_at: string;
}

export interface WidgetAgent {
  id: string;
  widget_id: string;
  tenant_id: string;
  name: string;
  role: string | null;
  department: string | null;
  avatar_url: string | null;
  phone_e164: string;
  prefilled_message: string | null;
  priority: number;
  is_active: boolean;
}

export interface WidgetLead {
  id: string;
  widget_id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  message: string | null;
  page_url: string | null;
  device: string | null;
  created_at: string;
}

export interface WidgetEvent {
  id: string;
  widget_id: string;
  event_type: 'view' | 'open' | 'click' | 'lead' | 'close';
  page_url: string | null;
  device: string | null;
  created_at: string;
}

export const DEFAULT_WIDGET_CONFIG: WidgetConfig = {
  type: 'floating-bubble',
  brandName: 'Aireatro Team',
  subtitle: 'Typically replies in minutes',
  greeting: 'Hi 👋\nHow can we help you today?',
  ctaText: 'Start Chat on WhatsApp',
  prefilledMessage: 'Hello, I came from your website.',
  primaryColor: '#10B981',
  accentColor: '#059669',
  bgColor: '#ffffff',
  textColor: '#0f172a',
  radius: 20,
  darkMode: false,
  position: 'bottom-right',
  visibility: 'both',
  animation: 'pulse',
  showTyping: true,
  online: true,
  openDelay: 3,
  autoOpen: false,
  exitIntent: false,
  collectLead: false,
  fieldName: true,
  fieldPhone: true,
  fieldEmail: false,
  requireName: true,
  requirePhone: true,
  hideBranding: false,
};
