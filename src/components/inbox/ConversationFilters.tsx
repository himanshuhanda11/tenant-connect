import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ConversationFilter } from '@/hooks/useConversations';

interface ConversationFiltersProps {
  filter: ConversationFilter;
  onFilterChange: (filter: ConversationFilter) => void;
}

const filters: { value: ConversationFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'unassigned', label: 'Unassigned' },
];

export function ConversationFilters({
  filter,
  onFilterChange,
}: ConversationFiltersProps) {
  return (
    <div className="flex gap-1 overflow-x-auto pb-1">
      {filters.map((f) => (
        <Button
          key={f.value}
          variant={filter === f.value ? 'default' : 'ghost'}
          size="sm"
          className={cn(
            'h-7 px-3 text-xs whitespace-nowrap',
            filter === f.value && 'bg-primary text-primary-foreground'
          )}
          onClick={() => onFilterChange(f.value)}
        >
          {f.label}
        </Button>
      ))}
    </div>
  );
}
