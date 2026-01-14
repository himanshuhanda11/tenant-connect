import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  Users,
  Workflow,
  MessageSquare,
  Phone,
  FileText,
  PlusCircle,
} from 'lucide-react';

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: string;
}

const actions: QuickAction[] = [
  {
    id: 'campaign',
    label: 'New Campaign',
    description: 'Send bulk messages',
    icon: Send,
    href: '/campaigns/create',
    color: 'bg-blue-500',
  },
  {
    id: 'contact',
    label: 'Add Contact',
    description: 'Import or create',
    icon: Users,
    href: '/contacts?action=add',
    color: 'bg-emerald-500',
  },
  {
    id: 'flow',
    label: 'Create Flow',
    description: 'Build automation',
    icon: Workflow,
    href: '/flows/new',
    color: 'bg-purple-500',
  },
  {
    id: 'template',
    label: 'New Template',
    description: 'Create message template',
    icon: FileText,
    href: '/templates?action=create',
    color: 'bg-pink-500',
  },
];

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-muted-foreground" />
          <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => navigate(action.href)}
                className="flex flex-col items-center p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all group text-center"
              >
                <div className={`p-2.5 rounded-lg ${action.color} mb-2 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium">{action.label}</span>
                <span className="text-xs text-muted-foreground mt-0.5">
                  {action.description}
                </span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
