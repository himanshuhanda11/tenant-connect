import type { WidgetConfig } from '@/types/widget';

export interface WidgetTemplate {
  id: string;
  name: string;
  category: 'ecommerce' | 'saas' | 'realestate' | 'education' | 'healthcare' | 'agency' | 'restaurant' | 'fitness';
  tagline: string;
  preview: { primary: string; bg: string };
  config: Partial<WidgetConfig>;
}

export const WIDGET_TEMPLATES: WidgetTemplate[] = [
  {
    id: 'ecom-conversion',
    name: 'E-commerce Conversion',
    category: 'ecommerce',
    tagline: 'Recover carts and answer product questions in real time',
    preview: { primary: '#10B981', bg: '#ffffff' },
    config: {
      type: 'floating-bubble',
      brandName: 'Store Support',
      subtitle: 'Replies in under a minute',
      greeting: 'Hey! 👋 Need help choosing a product or tracking an order?',
      ctaText: 'Chat on WhatsApp',
      prefilledMessage: 'Hi, I have a question about a product on your site.',
      primaryColor: '#10B981', accentColor: '#059669',
      animation: 'pulse', exitIntent: true, openDelay: 8, autoOpen: true,
    },
  },
  {
    id: 'saas-demo',
    name: 'SaaS Demo Booking',
    category: 'saas',
    tagline: 'Convert pricing-page visitors into qualified demos',
    preview: { primary: '#6366F1', bg: '#0f172a' },
    config: {
      type: 'agent-bubble',
      brandName: 'Sales Team',
      subtitle: 'Avg. response < 5 min',
      greeting: 'Want a 1:1 walkthrough? We can answer pricing & integration questions on WhatsApp.',
      ctaText: 'Book a Demo',
      prefilledMessage: 'Hi, I’d like a quick demo and pricing details.',
      primaryColor: '#6366F1', accentColor: '#4F46E5', darkMode: true,
      animation: 'glow', collectLead: true, fieldEmail: true,
    },
  },
  {
    id: 'real-estate-leads',
    name: 'Real Estate Lead Magnet',
    category: 'realestate',
    tagline: 'Capture buyer/renter intent on listing pages',
    preview: { primary: '#0EA5E9', bg: '#ffffff' },
    config: {
      type: 'sticky-bar',
      brandName: 'Property Advisor',
      subtitle: 'Site visits & price negotiation',
      greeting: 'Interested in this property? Get floor plans, pricing & a site visit instantly.',
      ctaText: 'Talk to Advisor',
      prefilledMessage: 'Hi, I’m interested in the property I just viewed.',
      primaryColor: '#0EA5E9', accentColor: '#0284C7',
      animation: 'float', collectLead: true, requirePhone: true,
    },
  },
  {
    id: 'education-counsel',
    name: 'Education Counselling',
    category: 'education',
    tagline: 'Pre-qualify students for courses and admissions',
    preview: { primary: '#F59E0B', bg: '#ffffff' },
    config: {
      type: 'multi-agent',
      brandName: 'Admissions Team',
      subtitle: 'Counsellors online now',
      greeting: 'Confused about the right course? Our counsellors will guide you in 2 minutes.',
      ctaText: 'Talk to Counsellor',
      prefilledMessage: 'Hi, I’d like guidance on choosing the right course.',
      primaryColor: '#F59E0B', accentColor: '#D97706',
      animation: 'bounce', collectLead: true,
    },
  },
  {
    id: 'healthcare-appt',
    name: 'Clinic Appointment',
    category: 'healthcare',
    tagline: 'Book consultations directly via WhatsApp',
    preview: { primary: '#14B8A6', bg: '#ffffff' },
    config: {
      type: 'floating-bubble',
      brandName: 'Patient Care',
      subtitle: 'Book in seconds',
      greeting: 'Hi 👋 Book an appointment, get reports or ask about treatments.',
      ctaText: 'Book Appointment',
      prefilledMessage: 'Hello, I’d like to book an appointment.',
      primaryColor: '#14B8A6', accentColor: '#0F766E',
      animation: 'pulse',
    },
  },
  {
    id: 'agency-quote',
    name: 'Agency Quick Quote',
    category: 'agency',
    tagline: 'Capture project briefs from website visitors',
    preview: { primary: '#EC4899', bg: '#ffffff' },
    config: {
      type: 'full-popup',
      brandName: 'New Business',
      subtitle: 'Custom quote in 1 hour',
      greeting: 'Tell us about your project — get a tailored quote on WhatsApp today.',
      ctaText: 'Get Quote',
      prefilledMessage: 'Hi, I’d like a quote for a new project.',
      primaryColor: '#EC4899', accentColor: '#BE185D',
      animation: 'glow', collectLead: true, fieldEmail: true,
    },
  },
  {
    id: 'restaurant-reservation',
    name: 'Restaurant Reservation',
    category: 'restaurant',
    tagline: 'Take bookings & catering enquiries',
    preview: { primary: '#EF4444', bg: '#ffffff' },
    config: {
      type: 'sticky-bar',
      brandName: 'Reservations',
      subtitle: 'Hot tables tonight',
      greeting: 'Reserve a table or order catering — chat with us instantly.',
      ctaText: 'Reserve Now',
      prefilledMessage: 'Hi, I’d like to book a table.',
      primaryColor: '#EF4444', accentColor: '#B91C1C',
      animation: 'pulse',
    },
  },
  {
    id: 'fitness-trial',
    name: 'Fitness Free Trial',
    category: 'fitness',
    tagline: 'Drive trial sign-ups for gyms & studios',
    preview: { primary: '#22C55E', bg: '#ffffff' },
    config: {
      type: 'floating-bubble',
      brandName: 'Trainer',
      subtitle: 'Free 7-day trial',
      greeting: 'Claim your FREE 7-day trial — chat with a trainer right now 💪',
      ctaText: 'Claim Free Trial',
      prefilledMessage: 'Hi, I’d like to claim the free 7-day trial.',
      primaryColor: '#22C55E', accentColor: '#15803D',
      animation: 'bounce', exitIntent: true,
    },
  },
];
