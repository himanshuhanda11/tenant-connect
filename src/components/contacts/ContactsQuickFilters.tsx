import { LayoutGrid, Table as TableIcon, Rows3, ArrowUpDown, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export type ContactsViewMode = 'table' | 'kanban' | 'compact';
export type ContactsQuickFilter = 'all' | 'hot' | 'engaged' | 'mine' | 'unassigned';

interface Props {
  view: ContactsViewMode;
  onViewChange: (v: ContactsViewMode) => void;
  quickFilter: ContactsQuickFilter;
  onQuickFilterChange: (f: ContactsQuickFilter) => void;
  counts?: Partial<Record<ContactsQuickFilter, number>>;
  sort?: string;
  onSortChange?: (s: string) => void;
  onColumnSettings?: () => void;
}

const QUICK_FILTERS: { id: ContactsQuickFilter; label: string }[] = [
  { id: 'all', label: 'All Contacts' },
  { id: 'hot', label: 'Hot Leads' },
  { id: 'engaged', label: 'Engaged' },
  { id: 'mine', label: 'My Contacts' },
  { id: 'unassigned', label: 'Unassigned' },
];

const VIEWS: { id: ContactsViewMode; icon: React.ComponentType<{ className?: string }>; label: string }[] = [
  { id: 'table', icon: TableIcon, label: 'Table' },
  { id: 'kanban', icon: LayoutGrid, label: 'Kanban' },
  { id: 'compact', icon: Rows3, label: 'Compact' },
];

const SORT_OPTIONS = [
  { id: 'recent', label: 'Most recent activity' },
  { id: 'name_asc', label: 'Name A → Z' },
  { id: 'name_desc', label: 'Name Z → A' },
  { id: 'created_desc', label: 'Newest first' },
  { id: 'created_asc', label: 'Oldest first' },
];

export function ContactsQuickFilters({
  view,
  onViewChange,
  quickFilter,
  onQuickFilterChange,
  counts = {},
  sort = 'recent',
  onSortChange,
  onColumnSettings,
}: Props) {
  const sortLabel = SORT_OPTIONS.find((s) => s.id === sort)?.label || 'Sort';

  return (
    <div className="px-4 md:px-6 py-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between border-b border-border/40">
      {/* Quick filter chips */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {QUICK_FILTERS.map((f) => {
          const active = quickFilter === f.id;
          const count = counts[f.id];
          return (
            <button
              key={f.id}
              onClick={() => onQuickFilterChange(f.id)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 h-8 rounded-full text-xs font-medium transition-all border',
                active
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-card text-muted-foreground border-border/60 hover:text-foreground hover:border-border'
              )}
            >
              <span>{f.label}</span>
              {count !== undefined && (
                <span
                  className={cn(
                    'tabular-nums text-[10px] px-1.5 py-0.5 rounded-full font-semibold',
                    active ? 'bg-primary-foreground/15 text-primary-foreground' : 'bg-muted text-muted-foreground'
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* View switcher + sort + column settings */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-0.5 bg-muted/50 rounded-lg p-0.5">
          {VIEWS.map((v) => {
            const Icon = v.icon;
            const active = view === v.id;
            return (
              <button
                key={v.id}
                onClick={() => onViewChange(v.id)}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 h-7 rounded-md text-xs font-medium transition-all',
                  active ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                )}
                title={v.label}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{v.label}</span>
              </button>
            );
          })}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5">
              <ArrowUpDown className="h-3.5 w-3.5" />
              <span className="hidden md:inline truncate max-w-[140px]">{sortLabel}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {SORT_OPTIONS.map((o) => (
              <DropdownMenuItem key={o.id} onSelect={() => onSortChange?.(o.id)}>
                {o.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" size="icon" className="h-8 w-8" onClick={onColumnSettings} aria-label="Column settings">
          <Settings2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
