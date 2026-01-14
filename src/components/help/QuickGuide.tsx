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
      { label: 'How to manage conversations?', url: '/help/inbox-guide' },
      { label: 'How to assign chats to agents?', url: '/help/team-management' },
    ],
  },
  contacts: {
    description: 'Build and organize your customer database with profiles, tags, and segments.',
    links: [
      { label: 'How to import contacts?', url: '/help/contacts-management' },
      { label: 'How to create segments?', url: '/help/tags-and-segments' },
    ],
  },
  templates: {
    description: 'Create and manage WhatsApp message templates. All templates must be approved by Meta.',
    links: [
      { label: 'How to create templates?', url: '/help/templates-guide' },
      { label: 'Template best practices', url: '/help/templates-guide' },
    ],
  },
  campaigns: {
    description: 'Send targeted WhatsApp broadcasts to your audience using approved templates.',
    links: [
      { label: 'How to create a campaign?', url: '/help/campaigns-guide' },
      { label: 'Campaign best practices', url: '/help/campaigns-guide' },
    ],
  },
  automation: {
    description: 'Build workflows that automatically respond, tag, and route conversations.',
    links: [
      { label: 'How to create automations?', url: '/help/automation-workflows' },
      { label: 'Automation triggers explained', url: '/help/automation-workflows' },
    ],
  },
  flows: {
    description: 'Create visual conversation flows with our drag-and-drop builder.',
    links: [
      { label: 'How to build flows?', url: '/help/flows-guide' },
      { label: 'Flow triggers & nodes', url: '/help/flows-guide' },
    ],
  },
  metaAds: {
    description: 'Connect with Facebook to fetch and manage your Click-to-WhatsApp ad leads.',
    links: [
      { label: 'How to connect Meta Ads?', url: '/help/meta-ads-guide' },
      { label: 'How to set up attribution?', url: '/help/meta-ads-guide' },
    ],
  },
  team: {
    description: 'Invite team members, define roles, and set up conversation routing.',
    links: [
      { label: 'How to invite team members?', url: '/help/team-management' },
      { label: 'How to set up roles?', url: '/help/team-management' },
    ],
  },
  billing: {
    description: 'Manage your subscription, view usage, and download invoices.',
    links: [
      { label: 'How billing works?', url: '/help/billing-guide' },
      { label: 'How to upgrade plans?', url: '/help/billing-guide' },
    ],
  },
  phoneNumbers: {
    description: 'Connect and manage your WhatsApp Business phone numbers.',
    links: [
      { label: 'How to connect a number?', url: '/help/phone-numbers-setup' },
      { label: 'Quality rating explained', url: '/help/phone-numbers-setup' },
    ],
  },
  tags: {
    description: 'Create labels to organize contacts and conversations for better targeting.',
    links: [
      { label: 'How to use tags?', url: '/help/tags-and-segments' },
      { label: 'Automation with tags', url: '/help/automation-workflows' },
    ],
  },
  catalogue: {
    description: 'You can connect with Facebook to fetch catalogue and manage it from our platform.',
    links: [
      { label: 'How to create a catalogue in Commerce Manager?', url: '/help/catalogue-guide' },
      { label: 'How to manage your Meta catalogue with Shopify?', url: '/help/shopify-integration' },
    ],
  },
};
