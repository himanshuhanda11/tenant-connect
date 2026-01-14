import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Lightbulb,
  ChevronRight,
  UserCheck,
  Star,
  Clock,
  Send,
} from 'lucide-react';
import type { NextBestAction } from '@/types/dashboard';
import { cn } from '@/lib/utils';

interface NextBestActionsPanelProps {
  actions: NextBestAction[];
}

const actionTypeConfig: Record<string, { icon: React.ElementType; color: string }> = {
  followup: { icon: Clock, color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30' },
  vip: { icon: Star, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
  sla: { icon: UserCheck, color: 'text-red-600 bg-red-100 dark:bg-red-900/30' },
  campaign: { icon: Send, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
};

const priorityConfig: Record<string, string> = {
  high: 'bg-red-500/10 text-red-600 border-red-200',
  medium: 'bg-amber-500/10 text-amber-600 border-amber-200',
  low: 'bg-blue-500/10 text-blue-600 border-blue-200',
};

export function NextBestActionsPanel({ actions }: NextBestActionsPanelProps) {
  const navigate = useNavigate();

  if (actions.length === 0) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-200/50 dark:border-indigo-800/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-indigo-600" />
          Next Best Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {actions.map((action) => {
            const config = actionTypeConfig[action.type] || actionTypeConfig.followup;
            const Icon = config.icon;

            return (
              <button
                key={action.id}
                onClick={() => navigate(action.href)}
                className="w-full flex items-start gap-3 p-3 rounded-lg bg-white/60 dark:bg-white/5 border hover:border-primary/50 hover:shadow-sm transition-all text-left"
              >
                <div className={cn("p-2 rounded-lg shrink-0", config.color)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-medium text-sm">{action.title}</p>
                    <Badge variant="outline" className={cn("text-[10px]", priorityConfig[action.priority])}>
                      {action.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
