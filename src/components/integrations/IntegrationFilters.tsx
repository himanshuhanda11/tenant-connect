import React from 'react';
import { 
  Code, 
  ShoppingCart, 
  CreditCard, 
  Users, 
  Megaphone, 
  Zap,
  LayoutGrid,
  CheckCircle2,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { IntegrationCategory } from '@/types/integration';

interface FilterOption {
  key: IntegrationCategory | 'all' | 'connected';
  label: string;
  icon: React.ElementType;
}

const FILTER_OPTIONS: FilterOption[] = [
  { key: 'all', label: 'All', icon: LayoutGrid },
  { key: 'connected', label: 'Connected', icon: CheckCircle2 },
  { key: 'api', label: 'API', icon: Code },
  { key: 'ecommerce', label: 'E-commerce', icon: ShoppingCart },
  { key: 'payments', label: 'Payments', icon: CreditCard },
  { key: 'crm', label: 'CRM', icon: Users },
  { key: 'marketing', label: 'Marketing', icon: Megaphone },
  { key: 'automation', label: 'Automation', icon: Zap },
];

interface IntegrationFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  counts: Record<string, number>;
}

export function IntegrationFilters({
  activeFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  counts,
}: IntegrationFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search integrations..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-background"
        />
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {FILTER_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isActive = activeFilter === option.key;
          const count = counts[option.key] || 0;

          return (
            <Button
              key={option.key}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFilterChange(option.key)}
              className={cn(
                "gap-1.5 transition-all",
                isActive && "shadow-sm",
                !isActive && "hover:bg-primary/5 hover:border-primary/30"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{option.label}</span>
              {count > 0 && (
                <Badge 
                  variant={isActive ? 'secondary' : 'outline'} 
                  className={cn(
                    "ml-1 h-5 min-w-[20px] px-1.5 text-xs",
                    isActive && "bg-white/20 text-white border-0"
                  )}
                >
                  {count}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
