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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border border-border/50 shadow-card rounded-2xl">
            <CardContent className="p-5">
              <Skeleton className="h-12 w-12 rounded-xl mb-3" />
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-4 w-24" />
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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card
          key={stat.id}
          onClick={() => stat.href && navigate(stat.href)}
          className={cn(
            "border border-border/50 shadow-card hover:shadow-soft transition-all duration-200 group rounded-2xl",
            stat.href && "cursor-pointer"
          )}
        >
          <CardContent className="p-6 flex items-center gap-5">
            <img
              src={stat.image}
              alt={stat.label}
              className="h-16 w-16 object-contain flex-shrink-0"
              loading="lazy"
            />
            <div>
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                {stat.subLabel && (
                  <span className="text-xs font-medium text-emerald-600">{stat.subLabel}</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
