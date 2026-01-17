import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  PhoneCall,
  Zap,
  FileText,
  Layout,
  ChevronRight,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface VIPAction {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: string;
  bgColor: string;
}

const vipActions: VIPAction[] = [
  {
    id: 'vip-message',
    label: 'New message from VIP customer',
    description: '10 regarding order data at 12345',
    icon: MessageSquare,
    href: '/inbox',
    color: 'text-red-600',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
  },
  {
    id: 'follow-up',
    label: 'Follow up to close attieduled',
    description: 'Agina with about contacts contacts',
    icon: PhoneCall,
    href: '/inbox',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  {
    id: 'create-flow',
    label: 'Create Flow',
    description: 'Montitanti esugees reserge',
    icon: Zap,
    href: '/flows',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
  },
  {
    id: 'create-form',
    label: 'Create Form',
    description: 'New menancts ocation',
    icon: FileText,
    href: '/templates',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
  },
  {
    id: 'new-template',
    label: 'New Template',
    description: 'Areriasnitinscleis contacts',
    icon: Layout,
    href: '/templates',
    color: 'text-pink-600',
    bgColor: 'bg-pink-100 dark:bg-pink-900/30',
  },
];

interface VIPQuickActionsProps {
  className?: string;
}

export function VIPQuickActions({ className }: VIPQuickActionsProps) {
  const navigate = useNavigate();

  return (
    <Card className={cn("border-0 shadow-soft", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-7 text-xs">
              •••
            </Button>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {vipActions.map((action) => {
          const Icon = action.icon;
          return (
            <div
              key={action.id}
              onClick={() => navigate(action.href)}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer group"
            >
              <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", action.bgColor)}>
                <Icon className={cn("h-5 w-5", action.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{action.label}</p>
                <p className="text-xs text-muted-foreground truncate">{action.description}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
