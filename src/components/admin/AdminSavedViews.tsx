import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ShieldAlert, AlertTriangle, BarChart3, Star, Filter,
  PauseCircle, Crown, Sparkles, Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SavedView {
  id: string;
  label: string;
  icon: React.ElementType;
  group?: 'status' | 'plan' | 'time';
  tone?: 'default' | 'danger' | 'warning' | 'success' | 'premium';
}

const defaultViews: SavedView[] = [
  { id: 'all', label: 'All', icon: Filter, group: 'status' },
  { id: 'suspended', label: 'Suspended', icon: ShieldAlert, group: 'status', tone: 'danger' },
  { id: 'paused', label: 'Sending Paused', icon: PauseCircle, group: 'status', tone: 'warning' },
  { id: 'pending-numbers', label: 'Pending Numbers', icon: AlertTriangle, group: 'status', tone: 'warning' },
  { id: 'free', label: 'Free', icon: Sparkles, group: 'plan' },
  { id: 'pro', label: 'Pro', icon: Star, group: 'plan', tone: 'success' },
  { id: 'business', label: 'Business', icon: Crown, group: 'plan', tone: 'premium' },
  { id: 'high-revenue', label: 'High Revenue', icon: BarChart3, group: 'plan', tone: 'success' },
  { id: 'new-week', label: 'New this week', icon: Clock, group: 'time' },
];

const toneClasses: Record<NonNullable<SavedView['tone']>, string> = {
  default: 'data-[active=true]:bg-primary data-[active=true]:text-primary-foreground',
  danger: 'data-[active=true]:bg-red-600 data-[active=true]:text-white border-red-200 text-red-700 dark:text-red-400',
  warning: 'data-[active=true]:bg-amber-500 data-[active=true]:text-white border-amber-200 text-amber-700 dark:text-amber-400',
  success: 'data-[active=true]:bg-emerald-600 data-[active=true]:text-white border-emerald-200 text-emerald-700 dark:text-emerald-400',
  premium: 'data-[active=true]:bg-violet-600 data-[active=true]:text-white border-violet-200 text-violet-700 dark:text-violet-400',
};

interface AdminSavedViewsProps {
  activeView: string;
  counts?: Record<string, number>;
  onViewChange: (view: SavedView) => void;
}

export function AdminSavedViews({ activeView, counts, onViewChange }: AdminSavedViewsProps) {
  const groups: Array<{ key: string; label: string; views: SavedView[] }> = [
    { key: 'status', label: 'Status', views: defaultViews.filter(v => v.group === 'status') },
    { key: 'plan', label: 'Plan', views: defaultViews.filter(v => v.group === 'plan') },
    { key: 'time', label: 'Time', views: defaultViews.filter(v => v.group === 'time') },
  ];

  return (
    <div className="space-y-2">
      {groups.map((g) => (
        <div key={g.key} className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold w-14 shrink-0">
            {g.label}
          </span>
          {g.views.map(view => {
            const isActive = activeView === view.id;
            const count = counts?.[view.id];
            const tone = view.tone || 'default';
            return (
              <Button
                key={view.id}
                data-active={isActive}
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  'h-7 text-xs rounded-lg gap-1.5 font-medium transition-colors',
                  !isActive && 'bg-card hover:bg-muted',
                  toneClasses[tone],
                )}
                onClick={() => onViewChange(view)}
              >
                <view.icon className="h-3 w-3" />
                {view.label}
                {typeof count === 'number' && (
                  <Badge
                    variant="secondary"
                    className={cn(
                      'h-4 px-1 text-[10px] font-semibold ml-0.5',
                      isActive ? 'bg-white/20 text-current' : 'bg-muted',
                    )}
                  >
                    {count}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export { defaultViews };
