/**
 * Registry of all public routes that should have SEO entries.
 * Used by the SEO dashboard to auto-sync missing pages.
 */
export interface SeoRouteEntry {
  route_path: string;
  page_key: string;
  page_name: string;
  page_type: 'page' | 'blog';
  is_public: boolean;
  fallbackTitle: string;
  fallbackDescription: string;
}

// All public-facing pages (non-app routes)
export const PUBLIC_PAGE_ROUTES: SeoRouteEntry[] = [
  { route_path: '/', page_key: 'home', page_name: 'Home', page_type: 'page', is_public: true, fallbackTitle: 'AiReatro — Free WhatsApp API Lifetime', fallbackDescription: 'Get Free WhatsApp API Lifetime access with AiReatro. Automate conversations, send campaigns, and manage customer relationships.' },
  { route_path: '/about', page_key: 'about', page_name: 'About Us', page_type: 'page', is_public: true, fallbackTitle: 'About AiReatro Communications', fallbackDescription: 'Meet the team behind AiReatro — an AI-powered WhatsApp Cloud API platform helping businesses automate messaging and grow faster.' },
  { route_path: '/contact', page_key: 'contact', page_name: 'Contact', page_type: 'page', is_public: true, fallbackTitle: 'Contact AiReatro — Talk to Our WhatsApp API Experts', fallbackDescription: 'Have questions about AiReatro WhatsApp Business API? Reach out for sales inquiries, support, or partnership opportunities.' },
  { route_path: '/blog', page_key: 'blog', page_name: 'Blog', page_type: 'page', is_public: true, fallbackTitle: 'AiReatro Blog — WhatsApp Marketing Tips & API Guides', fallbackDescription: 'Expert tips on WhatsApp Business API, marketing automation, chatbot strategies, and customer engagement from AiReatro.' },
  { route_path: '/careers', page_key: 'careers', page_name: 'Careers', page_type: 'page', is_public: true, fallbackTitle: 'Careers at AiReatro — Join Our Remote-First Team', fallbackDescription: 'Explore open positions at AiReatro. Join a remote-first team building WhatsApp Business automation and AI-powered engagement.' },
  { route_path: '/features', page_key: 'features', page_name: 'Features', page_type: 'page', is_public: true, fallbackTitle: 'Features — WhatsApp API Inbox, Automation & Campaigns', fallbackDescription: 'Discover AiReatro features: shared team inbox, no-code automation, broadcast campaigns, analytics, CRM, and template management.' },
  { route_path: '/pricing', page_key: 'pricing', page_name: 'Pricing', page_type: 'page', is_public: true, fallbackTitle: 'Pricing — Affordable WhatsApp API Plans', fallbackDescription: 'Choose the right AiReatro plan. Free tier available. Team inbox, automation, campaigns, and API access at competitive prices.' },
  { route_path: '/products', page_key: 'products', page_name: 'Products', page_type: 'page', is_public: true, fallbackTitle: 'Products — AiReatro WhatsApp Business Suite', fallbackDescription: 'Explore AiReatro product suite: Team Inbox, Flow Builder, Broadcast Campaigns, Lead CRM, WhatsApp Forms, and Meta Ads integration.' },
  { route_path: '/integrations', page_key: 'integrations', page_name: 'Integrations', page_type: 'page', is_public: true, fallbackTitle: 'Integrations — Connect Shopify, Razorpay, Zapier & More', fallbackDescription: 'Connect AiReatro with Shopify, Razorpay, Zapier, LeadSquared, and more. Automate workflows across your entire tech stack.' },
  { route_path: '/security', page_key: 'security', page_name: 'Security', page_type: 'page', is_public: true, fallbackTitle: 'Security & Compliance — Enterprise-Grade Data Protection', fallbackDescription: 'AiReatro ensures enterprise-grade security with encryption, GDPR compliance, SOC 2 standards, and role-based access control.' },
  { route_path: '/partners', page_key: 'partners', page_name: 'Partners', page_type: 'page', is_public: true, fallbackTitle: 'Partner Program — Earn 30% Recurring Commission', fallbackDescription: 'Join AiReatro partner program and earn up to 30% recurring commission. Resell WhatsApp API solutions and grow your revenue.' },
  { route_path: '/case-studies', page_key: 'case-studies', page_name: 'Case Studies', page_type: 'page', is_public: true, fallbackTitle: 'Case Studies — Real Results with AiReatro', fallbackDescription: 'See how businesses achieved 3x faster response times and 45% higher conversions using AiReatro WhatsApp Business API.' },
  { route_path: '/template-library', page_key: 'template-library', page_name: 'Template Library', page_type: 'page', is_public: true, fallbackTitle: 'WhatsApp Template Library — 40+ Ready-to-Use Templates', fallbackDescription: 'Browse 40+ pre-approved WhatsApp message templates for marketing, support, alerts, and transactional use cases.' },
  { route_path: '/documentation', page_key: 'documentation', page_name: 'Documentation', page_type: 'page', is_public: true, fallbackTitle: 'API Documentation — AiReatro Developer Docs', fallbackDescription: 'Explore AiReatro developer documentation, REST API reference, webhooks, SDKs, and integration guides.' },
  { route_path: '/help', page_key: 'help', page_name: 'Help Center', page_type: 'page', is_public: true, fallbackTitle: 'Help Center — AiReatro Guides & Tutorials', fallbackDescription: 'Step-by-step guides for inbox management, automation setup, campaigns, templates, and team configuration.' },
  { route_path: '/whatsapp-forms', page_key: 'whatsapp-forms', page_name: 'WhatsApp Forms', page_type: 'page', is_public: true, fallbackTitle: 'WhatsApp Forms — Collect Data via Chat', fallbackDescription: 'Create interactive forms inside WhatsApp conversations. Collect leads, feedback, and orders without leaving the chat.' },
  { route_path: '/whatsapp-business-api', page_key: 'whatsapp-business-api', page_name: 'WhatsApp Business API', page_type: 'page', is_public: true, fallbackTitle: 'WhatsApp Business API — Complete Guide & Setup', fallbackDescription: 'Everything you need to know about WhatsApp Business API. Setup guide, pricing, features, and how AiReatro simplifies it.' },
  { route_path: '/click-to-whatsapp', page_key: 'click-to-whatsapp', page_name: 'Click to WhatsApp Ads', page_type: 'page', is_public: true, fallbackTitle: 'Click-to-WhatsApp Ads — Drive Leads from Meta Ads', fallbackDescription: 'Run Click-to-WhatsApp ad campaigns on Facebook and Instagram. Capture leads directly in WhatsApp and automate follow-ups.' },
  { route_path: '/why-whatsapp-marketing', page_key: 'why-whatsapp-marketing', page_name: 'Why WhatsApp Marketing', page_type: 'page', is_public: true, fallbackTitle: 'Why WhatsApp Marketing — 98% Open Rates', fallbackDescription: 'Discover why WhatsApp marketing outperforms email and SMS. 98% open rates, 45% reply rates, and direct customer conversations.' },
  { route_path: '/why-aireatro', page_key: 'why-aireatro', page_name: 'Why AiReatro', page_type: 'page', is_public: true, fallbackTitle: 'Why AiReatro — The Best WhatsApp API Platform', fallbackDescription: 'Compare AiReatro with alternatives. Free lifetime access, team inbox, automation, and the most affordable WhatsApp API platform.' },
  { route_path: '/free-whatsapp-api-lifetime', page_key: 'free-whatsapp-api-lifetime', page_name: 'Free WhatsApp API Lifetime', page_type: 'page', is_public: true, fallbackTitle: 'Free WhatsApp API — Lifetime Access', fallbackDescription: 'Get lifetime free access to WhatsApp Business API with AiReatro. No credit card required. Start automating today.' },
  { route_path: '/cookies', page_key: 'cookies', page_name: 'Cookie Policy', page_type: 'page', is_public: true, fallbackTitle: 'Cookie Policy — AiReatro', fallbackDescription: 'Learn about how AiReatro uses cookies and tracking technologies on our website.' },
  { route_path: '/features/inbox', page_key: 'features-inbox', page_name: 'Feature: Team Inbox', page_type: 'page', is_public: true, fallbackTitle: 'Team Inbox — Shared WhatsApp Inbox for Teams', fallbackDescription: 'Manage all WhatsApp conversations in one shared inbox. Assign agents, track SLAs, and collaborate in real-time.' },
  { route_path: '/features/contacts', page_key: 'features-contacts', page_name: 'Feature: Contacts & CRM', page_type: 'page', is_public: true, fallbackTitle: 'Contact Management — WhatsApp CRM', fallbackDescription: 'Manage contacts, segment audiences, and track lead lifecycle with AiReatro built-in WhatsApp CRM.' },
  { route_path: '/features/templates', page_key: 'features-templates', page_name: 'Feature: Templates', page_type: 'page', is_public: true, fallbackTitle: 'WhatsApp Message Templates — Create & Manage', fallbackDescription: 'Create, submit, and manage WhatsApp message templates. Pre-approved templates for marketing, support, and alerts.' },
  { route_path: '/features/campaigns', page_key: 'features-campaigns', page_name: 'Feature: Campaigns', page_type: 'page', is_public: true, fallbackTitle: 'Broadcast Campaigns — WhatsApp Mass Messaging', fallbackDescription: 'Send targeted WhatsApp broadcast campaigns to thousands of contacts. A/B testing, scheduling, and delivery analytics.' },
  { route_path: '/features/automation', page_key: 'features-automation', page_name: 'Feature: Automation', page_type: 'page', is_public: true, fallbackTitle: 'WhatsApp Automation — No-Code Workflow Builder', fallbackDescription: 'Build powerful WhatsApp automations without code. Auto-replies, lead qualification, drip campaigns, and smart routing.' },
  { route_path: '/features/integrations', page_key: 'features-integrations', page_name: 'Feature: Integrations', page_type: 'page', is_public: true, fallbackTitle: 'Integrations — Connect Your Tools', fallbackDescription: 'Integrate AiReatro with Shopify, Razorpay, Zapier, and more. Seamless data sync across your business tools.' },
  { route_path: '/features/analytics', page_key: 'features-analytics', page_name: 'Feature: Analytics', page_type: 'page', is_public: true, fallbackTitle: 'Analytics Dashboard — WhatsApp Performance Metrics', fallbackDescription: 'Track message delivery, response times, agent performance, campaign ROI, and customer engagement analytics.' },
  { route_path: '/features/phone-numbers', page_key: 'features-phone-numbers', page_name: 'Feature: Phone Numbers', page_type: 'page', is_public: true, fallbackTitle: 'WhatsApp Phone Number Management', fallbackDescription: 'Manage multiple WhatsApp Business numbers. Quality ratings, messaging limits, and number health monitoring.' },
  { route_path: '/features/team-roles', page_key: 'features-team-roles', page_name: 'Feature: Team & Roles', page_type: 'page', is_public: true, fallbackTitle: 'Team Management — Roles & Permissions', fallbackDescription: 'Manage team members with role-based access control. Admin, Manager, and Agent roles with granular permissions.' },
  { route_path: '/features/audit-logs', page_key: 'features-audit-logs', page_name: 'Feature: Audit Logs', page_type: 'page', is_public: true, fallbackTitle: 'Audit Logs — Track All Team Activity', fallbackDescription: 'Complete audit trail for every action. Track who did what, when, and maintain compliance with detailed activity logs.' },
  { route_path: '/help/inbox', page_key: 'help-inbox', page_name: 'Guide: Inbox', page_type: 'page', is_public: true, fallbackTitle: 'Inbox Guide — Getting Started with Team Inbox', fallbackDescription: 'Learn how to use AiReatro shared inbox. Manage conversations, assign agents, and resolve customer issues faster.' },
  { route_path: '/help/templates', page_key: 'help-templates', page_name: 'Guide: Templates', page_type: 'page', is_public: true, fallbackTitle: 'Templates Guide — Create WhatsApp Message Templates', fallbackDescription: 'Step-by-step guide to creating, submitting, and managing WhatsApp message templates on AiReatro.' },
  { route_path: '/help/automation', page_key: 'help-automation', page_name: 'Guide: Automation', page_type: 'page', is_public: true, fallbackTitle: 'Automation Guide — Build WhatsApp Workflows', fallbackDescription: 'Learn to build automated WhatsApp workflows. Auto-replies, lead routing, drip campaigns, and scheduled messages.' },
  { route_path: '/help/contacts-tags', page_key: 'help-contacts-tags', page_name: 'Guide: Contacts & Tags', page_type: 'page', is_public: true, fallbackTitle: 'Contacts & Tags Guide — Organize Your Audience', fallbackDescription: 'Learn to manage contacts, create tags, segment audiences, and organize your WhatsApp customer database.' },
  { route_path: '/help/meta-ads', page_key: 'help-meta-ads', page_name: 'Guide: Meta Ads', page_type: 'page', is_public: true, fallbackTitle: 'Meta Ads Guide — Click-to-WhatsApp Campaigns', fallbackDescription: 'Set up Meta Ads integration, run Click-to-WhatsApp campaigns, and track ad-to-conversation attribution.' },
  { route_path: '/help/workspaces', page_key: 'help-workspaces', page_name: 'Guide: Workspaces', page_type: 'page', is_public: true, fallbackTitle: 'Workspaces Guide — Multi-Team Management', fallbackDescription: 'Learn to create and manage multiple workspaces. Separate teams, brands, or departments with isolated environments.' },
  { route_path: '/help/team', page_key: 'help-team', page_name: 'Guide: Team', page_type: 'page', is_public: true, fallbackTitle: 'Team Guide — Manage Members & Permissions', fallbackDescription: 'Add team members, assign roles, configure permissions, and set up routing rules for your WhatsApp support team.' },
  { route_path: '/help/campaigns', page_key: 'help-campaigns', page_name: 'Guide: Campaigns', page_type: 'page', is_public: true, fallbackTitle: 'Campaigns Guide — WhatsApp Broadcast Messaging', fallbackDescription: 'Create and manage WhatsApp broadcast campaigns. Audience targeting, scheduling, and performance tracking.' },
  { route_path: '/help/form-rules', page_key: 'help-form-rules', page_name: 'Guide: Form Rules', page_type: 'page', is_public: true, fallbackTitle: 'Form Rules Guide — Automated Data Collection', fallbackDescription: 'Set up conversational forms in WhatsApp. Collect data, qualify leads, and trigger actions based on responses.' },
  { route_path: '/help/phone-numbers', page_key: 'help-phone-numbers', page_name: 'Guide: Phone Numbers', page_type: 'page', is_public: true, fallbackTitle: 'Phone Numbers Guide — Connect & Manage', fallbackDescription: 'Connect WhatsApp Business numbers, manage quality ratings, and monitor messaging limits.' },
];

/**
 * Generate blog SEO entries from blogPosts data.
 */
export function getBlogSeoEntries(blogPosts: Array<{ slug: string; title: string; excerpt: string }>): SeoRouteEntry[] {
  return blogPosts.map(post => ({
    route_path: `/blog/${post.slug}`,
    page_key: `blog-${post.slug}`,
    page_name: post.title,
    page_type: 'blog' as const,
    is_public: true,
    fallbackTitle: post.title,
    fallbackDescription: post.excerpt,
  }));
}
