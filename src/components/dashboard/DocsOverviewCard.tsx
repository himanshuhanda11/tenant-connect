import React from 'react';
import { ExternalLink, MessageSquare, Megaphone, Workflow, Users, CreditCard, BarChart3, Bot, BookOpen } from 'lucide-react';

const featureDocs = [
  {
    title: 'Inbox & Conversations',
    summary: 'Manage WhatsApp conversations, assign agents, track response times, and handle SLA.',
    icon: MessageSquare,
    href: '/help/inbox',
  },
  {
    title: 'Campaigns & Bulk Messaging',
    summary: 'Send bulk template messages, schedule deliveries, A/B test, and track campaign performance.',
    icon: Megaphone,
    href: '/help/campaigns',
  },
  {
    title: 'Automation & Flows',
    summary: 'Build automated workflows with triggers, conditions, delays, and multi-step actions.',
    icon: Workflow,
    href: '/help/automation',
  },
  {
    title: 'Contacts, Tags & Segments',
    summary: 'Organize contacts with tags, custom attributes, segments, and opt-in management.',
    icon: Users,
    href: '/help/contacts-tags',
  },
  {
    title: 'Template Management',
    summary: 'Create, preview, and submit WhatsApp message templates for Meta approval.',
    icon: BookOpen,
    href: '/help/templates',
  },
  {
    title: 'Meta Ads & CTWA',
    summary: 'Set up Click-to-WhatsApp ads, track lead attribution, and automate follow-ups.',
    icon: Bot,
    href: '/help/meta-ads',
  },
  {
    title: 'Team Management',
    summary: 'Invite members, assign roles, set up routing, SLA policies, and audit logs.',
    icon: CreditCard,
    href: '/help/team',
  },
  {
    title: 'Phone Numbers',
    summary: 'Connect, configure, and monitor your WhatsApp Business phone numbers.',
    icon: BarChart3,
    href: '/help/phone-numbers',
  },
];

interface DocsOverviewCardProps {
  loading?: boolean;
}

export function DocsOverviewCard({ loading }: DocsOverviewCardProps) {
  if (loading) return null;

  return (
    <div className="rounded-2xl border border-border/10 bg-card/40 backdrop-blur-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Feature Documentation</h3>
        </div>
        <a
          href="/help"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-primary hover:underline flex items-center gap-1"
        >
          View all docs <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      <p className="text-[11px] text-muted-foreground mb-4">
        Learn how each feature works — click any card to read the full documentation.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {featureDocs.map(doc => (
          <a
            key={doc.title}
            href={doc.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-3 p-3 rounded-xl border border-border/10 bg-card/30 hover:bg-card/60 hover:border-border/20 transition-all duration-150"
          >
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <doc.icon className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                {doc.title}
                <ExternalLink className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </p>
              <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">{doc.summary}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
