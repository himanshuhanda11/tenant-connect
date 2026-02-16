import React from 'react';
import { ExternalLink, BookOpen, Video, FileText, MessageCircleQuestion, Rocket } from 'lucide-react';

const guideLinks = [
  {
    title: 'Getting Started',
    description: 'Set up your WhatsApp API and send your first message.',
    icon: Rocket,
    href: '/help/getting-started',
  },
  {
    title: 'Templates Guide',
    description: 'Create and manage message templates for approval.',
    icon: FileText,
    href: '/help/templates',
  },
  {
    title: 'Automation & Flows',
    description: 'Build automated workflows to engage customers.',
    icon: BookOpen,
    href: '/help/automation',
  },
  {
    title: 'Video Tutorials',
    description: 'Watch step-by-step walkthroughs of key features.',
    icon: Video,
    href: '/help/videos',
  },
  {
    title: 'FAQs',
    description: 'Answers to the most common questions.',
    icon: MessageCircleQuestion,
    href: '/help/faq',
  },
];

interface GuideCardProps {
  loading?: boolean;
}

export function GuideCard({ loading }: GuideCardProps) {
  if (loading) return null;

  return (
    <div className="rounded-2xl border border-border/10 bg-card/40 backdrop-blur-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Help & Guide</h3>
        </div>
        <a
          href="/help"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-primary hover:underline flex items-center gap-1"
        >
          View all <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {guideLinks.map(link => (
          <a
            key={link.title}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col gap-2 p-3 rounded-xl border border-border/10 bg-card/30 hover:bg-card/60 hover:border-border/20 transition-all duration-150"
          >
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <link.icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-[12px] font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                {link.title}
                <ExternalLink className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
              <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">{link.description}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
