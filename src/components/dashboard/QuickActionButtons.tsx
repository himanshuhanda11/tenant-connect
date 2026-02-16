import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  Inbox,
  Workflow,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
  color: string;
  bgColor: string;
}

const actions: QuickAction[] = [
  {
    id: 'campaign',
    label: 'Send Campaign',
    icon: Send,
    href: '/campaigns/create',
    color: 'text-orange-600',
    bgColor: 'bg-orange-500/10 hover:bg-orange-500/15',
  },
  {
    id: 'inbox',
    label: 'View Inbox',
    icon: Inbox,
    href: '/inbox',
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10 hover:bg-blue-500/15',
  },
  {
    id: 'flow',
    label: 'Create Flow',
    icon: Workflow,
    href: '/flows/new',
    color: 'text-purple-600',
    bgColor: 'bg-purple-500/10 hover:bg-purple-500/15',
  },
  {
    id: 'template',
    label: 'Create Template',
    icon: FileText,
    href: '/templates?action=create',
    color: 'text-pink-600',
    bgColor: 'bg-pink-500/10 hover:bg-pink-500/15',
  },
];

export function QuickActionButtons() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.id}
            onClick={() => navigate(action.href)}
            className={cn(
              "flex items-center gap-3 p-5 rounded-2xl transition-all duration-300 group border border-border/20 backdrop-blur-sm bg-card/60 hover:shadow-lg hover:scale-[1.02]",
              action.bgColor
            )}
          >
            <Icon className={cn("h-6 w-6 flex-shrink-0", action.color)} />
            <span className="text-sm font-semibold text-foreground">{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}
