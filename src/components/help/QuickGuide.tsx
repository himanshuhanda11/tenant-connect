import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickGuideLink {
  label: string;
  url: string;
  external?: boolean;
}

interface QuickGuideProps {
  title?: string;
  description: string;
  links: QuickGuideLink[];
  className?: string;
}

export const QuickGuide: React.FC<QuickGuideProps> = ({
  title = 'Quick Guide',
  description,
  links,
  className,
}) => {
  return (
    <Card className={cn('bg-muted/30 border-border/50', className)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground mb-3">{description}</p>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {links.map((link, index) => (
                link.external ? (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    {link.label}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <Link
                    key={index}
                    to={link.url}
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    {link.label}
                  </Link>
                )
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Pre-configured guides for each section
export const quickGuides = {
  inbox: {
    description: 'Manage all your WhatsApp conversations in one place. Reply to customers, assign chats, and track status.',
    links: [
      { label: 'How to manage conversations?', url: '/help/inbox', external: true },
      { label: 'How to assign chats to agents?', url: '/help/inbox', external: true },
    ],
  },
  contacts: {
    description: 'Build and organize your customer database with profiles, tags, and segments.',
    links: [
      { label: 'How to import contacts?', url: '/help/contacts-tags', external: true },
      { label: 'How to create segments?', url: '/help/contacts-tags', external: true },
    ],
  },
  templates: {
    description: 'Create and manage WhatsApp message templates. All templates must be approved by Meta.',
    links: [
      { label: 'How to create templates?', url: '/help/templates', external: true },
      { label: 'Template best practices', url: '/help/templates', external: true },
    ],
  },
  campaigns: {
    description: 'Send targeted WhatsApp broadcasts to your audience using approved templates.',
    links: [
      { label: 'How to create a campaign?', url: '/help/campaigns', external: true },
      { label: 'Campaign best practices', url: '/help/campaigns', external: true },
    ],
  },
  automation: {
    description: 'Build workflows that automatically respond, tag, and route conversations.',
    links: [
      { label: 'How to create automations?', url: '/help/automation', external: true },
      { label: 'Automation triggers explained', url: '/help/automation', external: true },
    ],
  },
  flows: {
    description: 'Create visual conversation flows with our drag-and-drop builder.',
    links: [
      { label: 'How to build flows?', url: '/help/automation', external: true },
      { label: 'Flow triggers & nodes', url: '/help/automation', external: true },
    ],
  },
  metaAds: {
    description: 'Connect with Facebook to fetch and manage your Click-to-WhatsApp ad leads.',
    links: [
      { label: 'How to connect Meta Ads?', url: '/help/meta-ads', external: true },
      { label: 'How to set up attribution?', url: '/help/meta-ads', external: true },
    ],
  },
  team: {
    description: 'Invite team members, define roles, and set up conversation routing.',
    links: [
      { label: 'How to invite team members?', url: '/help/team', external: true },
      { label: 'How to set up roles?', url: '/help/team', external: true },
    ],
  },
  billing: {
    description: 'Manage your subscription, view usage, and download invoices.',
    links: [
      { label: 'How billing works?', url: '/help/workspaces', external: true },
      { label: 'How to upgrade plans?', url: '/help/workspaces', external: true },
    ],
  },
  phoneNumbers: {
    description: 'Connect and manage your WhatsApp Business phone numbers.',
    links: [
      { label: 'How to connect a number?', url: '/help/phone-numbers', external: true },
      { label: 'Quality rating explained', url: '/help/phone-numbers', external: true },
    ],
  },
  formRules: {
    description: 'Automatically send WhatsApp Forms based on triggers like keywords, ad clicks, or tags.',
    links: [
      { label: 'How do Auto-Form Rules work?', url: '/help/form-rules', external: true },
      { label: 'Trigger types & safety settings', url: '/help/form-rules', external: true },
    ],
  },
  tags: {
    description: 'Create labels to organize contacts and conversations for better targeting.',
    links: [
      { label: 'How to use tags?', url: '/help/contacts-tags', external: true },
      { label: 'Automation with tags', url: '/help/automation', external: true },
    ],
  },
  catalogue: {
    description: 'You can connect with Facebook to fetch catalogue and manage it from our platform.',
    links: [
      { label: 'How to create a catalogue in Commerce Manager?', url: '/help/category/integrations', external: true },
      { label: 'How to manage your Meta catalogue with Shopify?', url: '/help/category/integrations', external: true },
    ],
  },
  integrations: {
    description: 'Connect Shopify, Razorpay, Zapier, and other tools to automate WhatsApp messaging based on events.',
    links: [
      { label: 'How to set up integrations?', url: '/help/category/integrations', external: true },
      { label: 'Event-to-action mapping', url: '/help/category/integrations', external: true },
      { label: 'Webhook debugging', url: '/help/category/integrations', external: true },
    ],
  },
};
