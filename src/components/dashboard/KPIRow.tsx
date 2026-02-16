import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import kpiOpenChats from '@/assets/kpi-open-chats.png';
import kpiNewContacts from '@/assets/kpi-new-contacts.png';
import kpiAutomation from '@/assets/kpi-automation.png';
import kpiTemplates from '@/assets/kpi-templates.png';

interface KPIStat {
  id: string;
  label: string;
  value: number | string;
  subLabel?: string;
  image: string;
  href?: string;
}

interface KPIRowProps {
  openChats: number;
  newContacts7d: number;
  automationRuns7d: number;
  templatesPending: number;
  totalTemplates?: number;
  messagesReceivedToday?: number;
  messagesRepliedToday?: number;
  totalCampaigns?: number;
  loading?: boolean;
}

export function KPIRow({
  openChats,
  newContacts7d,
  automationRuns7d,
  templatesPending,
  totalTemplates = 0,
  loading,
}: KPIRowProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border border-border/40 shadow-soft rounded-2xl bg-gradient-to-br from-card to-muted/30">
            <CardContent className="p-7">
              <Skeleton className="h-20 w-20 rounded-2xl mb-4 mx-auto" />
              <Skeleton className="h-9 w-20 mb-2 mx-auto" />
              <Skeleton className="h-5 w-28 mx-auto" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats: KPIStat[] = [
    {
      id: 'open-chats',
      label: 'Open Chats',
      value: openChats,
      image: kpiOpenChats,
      href: '/inbox?status=open',
    },
    {
      id: 'new-contacts',
      label: 'New (7 days)',
      value: newContacts7d,
      subLabel: newContacts7d > 0 ? `+${Math.round(newContacts7d * 0.12)}%` : undefined,
      image: kpiNewContacts,
      href: '/contacts',
    },
    {
      id: 'automation-runs',
      label: 'Automation Runs',
      value: automationRuns7d,
      image: kpiAutomation,
      href: '/automation',
    },
    {
      id: 'templates',
      label: 'Templates',
      value: totalTemplates,
      subLabel: templatesPending > 0 ? `${templatesPending} pending` : undefined,
      image: kpiTemplates,
      href: '/templates',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
      {stats.map((stat) => (
        <Card
          key={stat.id}
          onClick={() => stat.href && navigate(stat.href)}
          className={cn(
            "border border-border/30 shadow-soft hover:shadow-lg transition-all duration-300 group rounded-2xl bg-gradient-to-br from-card via-card to-muted/20",
            stat.href && "cursor-pointer"
          )}
        >
          <CardContent className="p-7 flex flex-col items-center text-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <img
                src={stat.image}
                alt={stat.label}
                className="h-20 w-20 object-contain relative z-10 group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
            <div>
              <p className="text-4xl font-bold text-foreground">{stat.value}</p>
              <div className="flex items-center justify-center gap-2 mt-1.5">
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                {stat.subLabel && (
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">{stat.subLabel}</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
