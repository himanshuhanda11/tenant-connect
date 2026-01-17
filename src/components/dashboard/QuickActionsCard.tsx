import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  MessageSquarePlus,
  Users,
  Zap,
  Megaphone,
  FileText,
  ChevronRight,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: string;
  bgColor: string;
  iconBg: string;
  timestamp?: string;
}

const quickActions: QuickAction[] = [
  {
    id: 'send-campaign',
    label: 'Send Campaign',
    description: 'Broadcast to contacts',
    icon: Megaphone,
    href: '/campaigns/create',
    color: 'text-orange-600',
    bgColor: 'hover:bg-orange-50 dark:hover:bg-orange-950/20',
    iconBg: 'bg-orange-100 dark:bg-orange-900/30',
    timestamp: '21m ago',
  },
  {
    id: 'new-conversation',
    label: 'New Message',
    description: 'Start a conversation',
    icon: MessageSquarePlus,
    href: '/inbox',
    color: 'text-blue-600',
    bgColor: 'hover:bg-blue-50 dark:hover:bg-blue-950/20',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    timestamp: '11m ago',
  },
  {
    id: 'add-contact',
    label: 'Add Contact',
    description: 'Import or add new',
    icon: Users,
    href: '/contacts',
    color: 'text-purple-600',
    bgColor: 'hover:bg-purple-50 dark:hover:bg-purple-950/20',
    iconBg: 'bg-purple-100 dark:bg-purple-900/30',
    timestamp: '20m ago',
  },
  {
    id: 'create-automation',
    label: 'Create Flow',
    description: 'Automate responses',
    icon: Zap,
    href: '/flows',
    color: 'text-amber-600',
    bgColor: 'hover:bg-amber-50 dark:hover:bg-amber-950/20',
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    timestamp: '20m ago',
  },
  {
    id: 'create-template',
    label: 'Create Form',
    description: 'Design messages',
    icon: FileText,
    href: '/templates',
    color: 'text-pink-600',
    bgColor: 'hover:bg-pink-50 dark:hover:bg-pink-950/20',
    iconBg: 'bg-pink-100 dark:bg-pink-900/30',
    timestamp: '20m ago',
  },
];

interface QuickActionsCardProps {
  className?: string;
}

export function QuickActionsCard({ className }: QuickActionsCardProps) {
  const navigate = useNavigate();

  return (
    <Card className={cn("border-0 shadow-soft", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-1">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => navigate(action.href)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group",
                action.bgColor
              )}
            >
              <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", action.iconBg)}>
                <Icon className={cn("h-5 w-5", action.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{action.label}</p>
                <p className="text-xs text-muted-foreground truncate">{action.description}</p>
              </div>
              <div className="flex items-center gap-2">
                {action.timestamp && (
                  <span className="text-xs text-muted-foreground">{action.timestamp}</span>
                )}
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
