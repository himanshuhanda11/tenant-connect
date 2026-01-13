import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Filter,
  Plus,
  X,
  Search,
  Calendar as CalendarIcon,
  Save,
  RotateCcw,
} from 'lucide-react';
import { format } from 'date-fns';
import { LEAD_STATUS_OPTIONS, PRIORITY_OPTIONS, MAU_STATUS_OPTIONS } from '@/types/contact';
import { SegmentFilters } from '@/types/segment';
import { cn } from '@/lib/utils';

interface AdvancedFiltersBarProps {
  filters: SegmentFilters;
  onFiltersChange: (filters: SegmentFilters) => void;
  onSaveAsSegment: () => void;
  onReset: () => void;
  availableTags: { id: string; name: string; color: string | null }[];
  sources: string[];
  countries: string[];
}

type FilterType = 
  | 'leadStatus' 
  | 'priority' 
  | 'mauStatus' 
  | 'tags' 
  | 'source' 
  | 'country'
  | 'optInStatus'
  | 'hasAgent'
  | 'intervened'
  | 'blocked'
  | 'createdDate'
  | 'lastMessage';

const FILTER_OPTIONS: { value: FilterType; label: string; category: string }[] = [
  { value: 'leadStatus', label: 'Lead Status', category: 'Lifecycle' },
  { value: 'priority', label: 'Priority', category: 'Lifecycle' },
  { value: 'mauStatus', label: 'MAU Status', category: 'Engagement' },
  { value: 'tags', label: 'Has Tag', category: 'Tags' },
  { value: 'source', label: 'Source', category: 'Acquisition' },
  { value: 'country', label: 'Country', category: 'Identity' },
  { value: 'optInStatus', label: 'Opt-in Status', category: 'Compliance' },
  { value: 'hasAgent', label: 'Agent Assignment', category: 'System' },
  { value: 'intervened', label: 'Intervention', category: 'System' },
  { value: 'blocked', label: 'Blocked Status', category: 'Compliance' },
  { value: 'createdDate', label: 'Created Date', category: 'System' },
  { value: 'lastMessage', label: 'Last Message Date', category: 'Engagement' },
];

export function AdvancedFiltersBar({
  filters,
  onFiltersChange,
  onSaveAsSegment,
  onReset,
  availableTags,
  sources,
  countries,
}: AdvancedFiltersBarProps) {
  const [showAddFilter, setShowAddFilter] = useState(false);

  const updateFilter = <K extends keyof SegmentFilters>(key: K, value: SegmentFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const removeFilter = (key: keyof SegmentFilters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  const toggleArrayFilter = (key: 'leadStatus' | 'priority' | 'mauStatus' | 'tags' | 'source' | 'country', value: string) => {
    const current = filters[key] || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateFilter(key, updated.length > 0 ? updated : undefined);
  };

  const getActiveFilters = () => {
    const active: { key: keyof SegmentFilters; label: string; value: string }[] = [];

    if (filters.leadStatus?.length) {
      filters.leadStatus.forEach((s) => {
        const opt = LEAD_STATUS_OPTIONS.find((o) => o.value === s);
        active.push({ key: 'leadStatus', label: 'Lead Status', value: opt?.label || s });
      });
    }
    if (filters.priority?.length) {
      filters.priority.forEach((p) => {
        const opt = PRIORITY_OPTIONS.find((o) => o.value === p);
        active.push({ key: 'priority', label: 'Priority', value: opt?.label || p });
      });
    }
    if (filters.mauStatus?.length) {
      filters.mauStatus.forEach((m) => {
        const opt = MAU_STATUS_OPTIONS.find((o) => o.value === m);
        active.push({ key: 'mauStatus', label: 'MAU', value: opt?.label || m });
      });
    }
    if (filters.tags?.length) {
      filters.tags.forEach((t) => {
        const tag = availableTags.find((at) => at.id === t);
        active.push({ key: 'tags', label: 'Tag', value: tag?.name || t });
      });
    }
    if (filters.source?.length) {
      filters.source.forEach((s) => {
        active.push({ key: 'source', label: 'Source', value: s });
      });
    }
    if (filters.optInStatus && filters.optInStatus !== 'all') {
      active.push({ key: 'optInStatus', label: 'Opt-in', value: filters.optInStatus === 'opted_in' ? 'Yes' : 'No' });
    }
    if (filters.hasAgent && filters.hasAgent !== 'all') {
      active.push({ key: 'hasAgent', label: 'Agent', value: filters.hasAgent === 'assigned' ? 'Assigned' : 'Unassigned' });
    }
    if (filters.intervened && filters.intervened !== 'all') {
      active.push({ key: 'intervened', label: 'Intervened', value: filters.intervened === 'yes' ? 'Yes' : 'No' });
    }
    if (filters.blocked && filters.blocked !== 'all') {
      active.push({ key: 'blocked', label: 'Blocked', value: filters.blocked === 'yes' ? 'Yes' : 'No' });
    }

    return active;
  };

  const activeFilters = getActiveFilters();
  const hasFilters = activeFilters.length > 0 || !!filters.search;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, email, tag..."
            value={filters.search || ''}
            onChange={(e) => updateFilter('search', e.target.value || undefined)}
            className="pl-9"
          />
          {filters.search && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
              onClick={() => updateFilter('search', undefined)}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Add Filter */}
        <Popover open={showAddFilter} onOpenChange={setShowAddFilter}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Filter
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <ScrollArea className="h-80">
              <div className="space-y-4 p-1">
                {/* Lead Status */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">LEAD STATUS</Label>
                  <div className="space-y-1">
                    {LEAD_STATUS_OPTIONS.map((opt) => (
                      <div key={opt.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`lead-${opt.value}`}
                          checked={filters.leadStatus?.includes(opt.value)}
                          onCheckedChange={() => toggleArrayFilter('leadStatus', opt.value)}
                        />
                        <Label htmlFor={`lead-${opt.value}`} className="text-sm cursor-pointer">
                          <Badge variant="secondary" className={opt.color}>
                            {opt.label}
                          </Badge>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">PRIORITY</Label>
                  <div className="space-y-1">
                    {PRIORITY_OPTIONS.map((opt) => (
                      <div key={opt.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`priority-${opt.value}`}
                          checked={filters.priority?.includes(opt.value)}
                          onCheckedChange={() => toggleArrayFilter('priority', opt.value)}
                        />
                        <Label htmlFor={`priority-${opt.value}`} className="text-sm cursor-pointer">
                          <Badge variant="secondary" className={opt.color}>
                            {opt.label}
                          </Badge>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* MAU Status */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">MAU STATUS</Label>
                  <div className="space-y-1">
                    {MAU_STATUS_OPTIONS.map((opt) => (
                      <div key={opt.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`mau-${opt.value}`}
                          checked={filters.mauStatus?.includes(opt.value)}
                          onCheckedChange={() => toggleArrayFilter('mauStatus', opt.value)}
                        />
                        <Label htmlFor={`mau-${opt.value}`} className="text-sm cursor-pointer">
                          <Badge variant="secondary" className={opt.color}>
                            {opt.label}
                          </Badge>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                {availableTags.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">TAGS</Label>
                    <div className="space-y-1">
                      {availableTags.map((tag) => (
                        <div key={tag.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`tag-${tag.id}`}
                            checked={filters.tags?.includes(tag.id)}
                            onCheckedChange={() => toggleArrayFilter('tags', tag.id)}
                          />
                          <Label htmlFor={`tag-${tag.id}`} className="text-sm cursor-pointer">
                            <Badge 
                              variant="secondary"
                              style={{ backgroundColor: tag.color || undefined }}
                            >
                              {tag.name}
                            </Badge>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Opt-in Status */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">OPT-IN STATUS</Label>
                  <Select
                    value={filters.optInStatus || 'all'}
                    onValueChange={(v) => updateFilter('optInStatus', v as SegmentFilters['optInStatus'])}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="opted_in">Opted In</SelectItem>
                      <SelectItem value="opted_out">Opted Out</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Agent Assignment */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">AGENT ASSIGNMENT</Label>
                  <Select
                    value={filters.hasAgent || 'all'}
                    onValueChange={(v) => updateFilter('hasAgent', v as SegmentFilters['hasAgent'])}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>

        {/* Save as Segment */}
        {hasFilters && (
          <Button variant="outline" className="gap-2" onClick={onSaveAsSegment}>
            <Save className="h-4 w-4" />
            Save as Segment
          </Button>
        )}

        {/* Reset */}
        {hasFilters && (
          <Button variant="ghost" className="gap-2" onClick={onReset}>
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        )}
      </div>

      {/* Active Filter Chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter, idx) => (
            <Badge
              key={`${filter.key}-${filter.value}-${idx}`}
              variant="secondary"
              className="gap-1 pr-1"
            >
              <span className="text-muted-foreground">{filter.label}:</span>
              {filter.value}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 hover:bg-transparent"
                onClick={() => {
                  if (['leadStatus', 'priority', 'mauStatus', 'tags', 'source', 'country'].includes(filter.key)) {
                    const current = filters[filter.key as 'leadStatus'] || [];
                    const updated = current.filter((v) => {
                      if (filter.key === 'tags') {
                        const tag = availableTags.find((t) => t.name === filter.value);
                        return v !== tag?.id;
                      }
                      const opts = filter.key === 'leadStatus' ? LEAD_STATUS_OPTIONS :
                                  filter.key === 'priority' ? PRIORITY_OPTIONS :
                                  filter.key === 'mauStatus' ? MAU_STATUS_OPTIONS : [];
                      const opt = opts.find((o) => o.label === filter.value);
                      return v !== opt?.value && v !== filter.value;
                    });
                    updateFilter(filter.key as 'leadStatus', updated.length > 0 ? updated : undefined);
                  } else {
                    removeFilter(filter.key);
                  }
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
