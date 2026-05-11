export interface SupportWidgetSettings {
  id: string;
  enabled: boolean;
  whatsapp_number: string;
  display_name: string;
  welcome_message: string;
  cta_text: string;
  full_widget_title: string;
  full_widget_subtitle: string;
  full_widget_message: string;
  icon_only_tooltip: string;
  position: 'bottom-right' | 'bottom-left';
  brand_color: string;
  show_on_public_site: boolean;
  show_inside_dashboard: boolean;
  show_inside_onboarding: boolean;
  show_inside_billing: boolean;
  show_for_paid_users: boolean;
  show_for_free_users: boolean;
  show_for_incomplete_users: boolean;
  prefilled_message_paid: string;
  prefilled_message_new: string;
  show_book_demo: boolean;
  collect_lead_before_chat: boolean;
  step_name_label: string;
  step_name_placeholder: string;
  step_phone_label: string;
  step_phone_placeholder: string;
  step_connect_message: string;
}

export type SupportWidgetMode = 'hidden' | 'icon_only' | 'full_widget';

export interface SupportWidgetContext {
  settings: SupportWidgetSettings | null;
  pathname: string;
  isAuthenticated: boolean;
  hasActivePlan: boolean; // paid plan in active/trialing
  hasWhatsApp: boolean;
  onboardingComplete: boolean;
  isPaidPlan: boolean;
}

const PUBLIC_PREFIXES = [
  '/', '/index', '/pricing', '/about', '/contact', '/features', '/products',
  '/blog', '/help', '/docs', '/integrations', '/security', '/case-studies',
  '/whatsapp', '/why-', '/free-', '/click-to', '/template-library', '/partners',
  '/careers', '/privacy', '/terms', '/cookie', '/refund', '/compliance',
  '/acceptable-use', '/data-deletion', '/install', '/documentation',
];

const HIDDEN_PREFIXES = [
  '/control', '/login', '/signup', '/forgot-password', '/reset-password',
  '/auth/callback', '/~oauth', '/widgets', '/invite/accept',
];

const ONBOARDING_PREFIXES = [
  '/onboarding', '/choose-plan', '/select-workspace-plan',
  '/create-workspace', '/select-workspace',
];

function routeCategory(pathname: string): 'hidden' | 'public' | 'dashboard' | 'onboarding' | 'billing' {
  if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return 'hidden';
  if (pathname === '/billing' || pathname.startsWith('/billing')) return 'billing';
  if (ONBOARDING_PREFIXES.some((p) => pathname.startsWith(p))) return 'onboarding';
  // public marketing/help/blog routes
  if (PUBLIC_PREFIXES.some((p) => p === '/' ? pathname === '/' || pathname === '/index' : pathname.startsWith(p))) {
    return 'public';
  }
  // default: any other authenticated app route
  return 'dashboard';
}

export function getSupportWidgetMode(ctx: SupportWidgetContext): SupportWidgetMode {
  const { settings, pathname } = ctx;
  if (!settings || !settings.enabled) return 'hidden';

  const cat = routeCategory(pathname);
  if (cat === 'hidden') return 'hidden';
  if (cat === 'public' && !settings.show_on_public_site) return 'hidden';
  if (cat === 'dashboard' && !settings.show_inside_dashboard) return 'hidden';
  if (cat === 'onboarding' && !settings.show_inside_onboarding) return 'hidden';
  if (cat === 'billing' && !settings.show_inside_billing) return 'hidden';

  // Decide mode based on user state
  // Paid + active OR has WhatsApp connected → compact icon
  if (ctx.isAuthenticated && (ctx.hasActivePlan || ctx.hasWhatsApp)) {
    return settings.show_for_paid_users ? 'icon_only' : 'hidden';
  }

  // Otherwise (anon visitor, free plan, incomplete onboarding, no WA)
  const allowFree = settings.show_for_free_users || settings.show_for_incomplete_users;
  if (!ctx.isAuthenticated) {
    return settings.show_for_free_users ? 'full_widget' : 'hidden';
  }
  if (!ctx.onboardingComplete) {
    return settings.show_for_incomplete_users ? 'full_widget' : 'hidden';
  }
  if (!ctx.isPaidPlan) {
    return settings.show_for_free_users ? 'full_widget' : 'hidden';
  }
  return allowFree ? 'full_widget' : 'hidden';
}

export function buildWaLink(number: string, message: string): string {
  const cleaned = (number || '').replace(/[^\d]/g, '');
  const text = encodeURIComponent(message || '');
  return `https://wa.me/${cleaned}${text ? `?text=${text}` : ''}`;
}

export function interpolatePrefill(
  template: string,
  vars: { email?: string | null; workspace?: string | null; plan?: string | null },
): string {
  return (template || '')
    .split('{{email}}').join(vars.email || 'unknown')
    .split('{{workspace}}').join(vars.workspace || 'n/a')
    .split('{{plan}}').join(vars.plan || 'n/a');
}
