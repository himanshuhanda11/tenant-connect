import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  MessageSquare,
  UserPlus,
  Zap,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPIStat {
  id: string;
  label: string;
  value: number | string;
  icon: React.ElementType;
  href?: string;
  color: string;
  bgColor: string;
}

interface KPIRowProps {
  openChats: number;
  newContacts7d: number;
  automationRuns7d: number;
  templatesPending: number;
  loading?: boolean;
}

export function KPIRow({
  openChats,
  newContacts7d,
  automationRuns7d,
  templatesPending,
  loading,
}: KPIRowProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-0 shadow-card">
            <CardContent className="p-5">
              <Skeleton className="h-10 w-10 rounded-xl mb-3" />
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
      icon: MessageSquare,
      href: '/inbox?status=open',
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10',
    },
    {
      id: 'new-contacts',
      label: 'New Contacts (7d)',
      value: newContacts7d,
      icon: UserPlus,
      href: '/contacts',
      color: 'text-purple-600',
      bgColor: 'bg-purple-500/10',
    },
    {
      id: 'automation-runs',
      label: 'Automation Runs (7d)',
      value: automationRuns7d,
      icon: Zap,
      href: '/automation',
      color: 'text-amber-600',
      bgColor: 'bg-amber-500/10',
    },
    {
      id: 'templates-pending',
      label: 'Templates Pending',
      value: templatesPending,
      icon: FileText,
      href: '/templates',
      color: 'text-pink-600',
      bgColor: 'bg-pink-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.id}
            onClick={() => stat.href && navigate(stat.href)}
            className={cn(
              "border-0 shadow-card hover:shadow-soft transition-all duration-200 group",
              stat.href && "cursor-pointer"
            )}
          >
            <CardContent className="p-5">
              <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center mb-3", stat.bgColor)}>
                <Icon className={cn("h-5 w-5", stat.color)} />
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{stat.label}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
