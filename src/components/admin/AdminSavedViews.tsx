import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ShieldAlert, AlertTriangle, BarChart3, CreditCard, Star, Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SavedView {
  id: string;
  label: string;
  icon: React.ElementType;
  filter: Record<string, string>;
  count?: number;
}

const defaultViews: SavedView[] = [
  { id: 'all', label: 'All Workspaces', icon: Filter, filter: {} },
  { id: 'suspended', label: 'Suspended', icon: ShieldAlert, filter: { status: 'suspended' } },
  { id: 'pending-numbers', label: 'Pending Numbers', icon: AlertTriangle, filter: { phone_status: 'pending' } },
  { id: 'pro', label: 'Pro Plan Clients', icon: Star, filter: { plan: 'pro' } },
  { id: 'high-revenue', label: 'High Revenue', icon: BarChart3, filter: { revenue: 'high' } },
];

interface AdminSavedViewsProps {
  activeView: string;
  onViewChange: (view: SavedView) => void;
}

export function AdminSavedViews({ activeView, onViewChange }: AdminSavedViewsProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {defaultViews.map(view => {
        const isActive = activeView === view.id;
        return (
          <Button
            key={view.id}
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'h-7 text-xs rounded-lg gap-1.5 font-medium',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'bg-card hover:bg-muted'
            )}
            onClick={() => onViewChange(view)}
          >
            <view.icon className="h-3 w-3" />
            {view.label}
          </Button>
        );
      })}
    </div>
  );
}

export { defaultViews };
