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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Filter,
  Plus,
  X,
  Search,
  Save,
  RotateCcw,
  SlidersHorizontal,
  Tag,
  Users,
  Shield,
  Globe,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { LEAD_STATUS_OPTIONS, PRIORITY_OPTIONS, MAU_STATUS_OPTIONS } from '@/types/contact';
import { SegmentFilters } from '@/types/segment';
import { cn } from '@/lib/utils';

interface ContactsAdvancedFiltersProps {
  filters: SegmentFilters;
  onFiltersChange: (filters: SegmentFilters) => void;
  onSaveAsSegment: () => void;
  onReset: () => void;
  availableTags: { id: string; name: string; color: string | null }[];
  sources: string[];
  countries: string[];
}

const SOURCE_LABELS: Record<string, string> = {
  facebook: 'Facebook Ads',
  website: 'Website',
  qr: 'QR Code',
  api: 'API',
  manual: 'Manual Entry',
  import: 'CSV Import',
  whatsapp: 'WhatsApp',
};

export function ContactsAdvancedFilters({
  filters,
  onFiltersChange,
  onSaveAsSegment,
  onReset,
  availableTags,
  sources,
  countries,
}: ContactsAdvancedFiltersProps) {
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
    const active: { key: keyof SegmentFilters; label: string; value: string; color?: string }[] = [];

    if (filters.leadStatus?.length) {
      filters.leadStatus.forEach((s) => {
        const opt = LEAD_STATUS_OPTIONS.find((o) => o.value === s);
        active.push({ key: 'leadStatus', label: 'Status', value: opt?.label || s, color: opt?.color });
      });
    }
    if (filters.priority?.length) {
      filters.priority.forEach((p) => {
        const opt = PRIORITY_OPTIONS.find((o) => o.value === p);
        active.push({ key: 'priority', label: 'Priority', value: opt?.label || p, color: opt?.color });
      });
    }
    if (filters.mauStatus?.length) {
      filters.mauStatus.forEach((m) => {
        const opt = MAU_STATUS_OPTIONS.find((o) => o.value === m);
        active.push({ key: 'mauStatus', label: 'MAU', value: opt?.label || m, color: opt?.color });
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
        active.push({ key: 'source', label: 'Source', value: SOURCE_LABELS[s] || s });
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
    <div className="space-y-3 px-6 py-4 border-b bg-muted/30">
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, email, or tag..."
            value={filters.search || ''}
            onChange={(e) => updateFilter('search', e.target.value || undefined)}
            className="pl-10 h-10 bg-background border-muted-foreground/20 focus:border-primary transition-colors"
          />
          {filters.search && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-muted"
              onClick={() => updateFilter('search', undefined)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Add Filter */}
        <Popover open={showAddFilter} onOpenChange={setShowAddFilter}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2 h-10 border-dashed">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilters.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {activeFilters.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-0" align="start">
            <div className="p-4 border-b bg-muted/50">
              <h4 className="font-semibold flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Advanced Filters
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                Combine multiple filters to find specific contacts
              </p>
            </div>
            <ScrollArea className="h-[400px]">
              <div className="p-4 space-y-5">
                {/* Lead Status */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm font-medium">Lead Status</Label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {LEAD_STATUS_OPTIONS.map((opt) => (
                      <div key={opt.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`lead-${opt.value}`}
                          checked={filters.leadStatus?.includes(opt.value)}
                          onCheckedChange={() => toggleArrayFilter('leadStatus', opt.value)}
                        />
                        <Label htmlFor={`lead-${opt.value}`} className="text-sm cursor-pointer">
                          <Badge variant="secondary" className={cn(opt.color, "text-xs")}>
                            {opt.label}
                          </Badge>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Priority */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm font-medium">Priority Level</Label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {PRIORITY_OPTIONS.map((opt) => (
                      <div key={opt.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`priority-${opt.value}`}
                          checked={filters.priority?.includes(opt.value)}
                          onCheckedChange={() => toggleArrayFilter('priority', opt.value)}
                        />
                        <Label htmlFor={`priority-${opt.value}`} className="text-sm cursor-pointer">
                          <Badge variant="secondary" className={cn(opt.color, "text-xs")}>
                            {opt.label}
                          </Badge>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* MAU Status */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm font-medium">MAU Status</Label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {MAU_STATUS_OPTIONS.map((opt) => (
                      <div key={opt.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`mau-${opt.value}`}
                          checked={filters.mauStatus?.includes(opt.value)}
                          onCheckedChange={() => toggleArrayFilter('mauStatus', opt.value)}
                        />
                        <Label htmlFor={`mau-${opt.value}`} className="text-sm cursor-pointer">
                          <Badge variant="secondary" className={cn(opt.color, "text-xs")}>
                            {opt.label}
                          </Badge>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Tags */}
                {availableTags.length > 0 && (
                  <>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <Label className="text-sm font-medium">Tags</Label>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {availableTags.slice(0, 10).map((tag) => (
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
                                className="text-xs"
                              >
                                {tag.name}
                              </Badge>
                            </Label>
                          </div>
                        ))}
                        {availableTags.length > 10 && (
                          <span className="text-xs text-muted-foreground">
                            +{availableTags.length - 10} more
                          </span>
                        )}
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Compliance */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm font-medium">Compliance</Label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Opt-in Status</Label>
                      <Select
                        value={filters.optInStatus || 'all'}
                        onValueChange={(v) => updateFilter('optInStatus', v as SegmentFilters['optInStatus'])}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="opted_in">Opted In</SelectItem>
                          <SelectItem value="opted_out">Opted Out</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Blocked</Label>
                      <Select
                        value={filters.blocked || 'all'}
                        onValueChange={(v) => updateFilter('blocked', v as SegmentFilters['blocked'])}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="yes">Blocked</SelectItem>
                          <SelectItem value="no">Not Blocked</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Assignment */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm font-medium">Assignment</Label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Agent</Label>
                      <Select
                        value={filters.hasAgent || 'all'}
                        onValueChange={(v) => updateFilter('hasAgent', v as SegmentFilters['hasAgent'])}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="assigned">Assigned</SelectItem>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Intervention</Label>
                      <Select
                        value={filters.intervened || 'all'}
                        onValueChange={(v) => updateFilter('intervened', v as SegmentFilters['intervened'])}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="yes">Intervened</SelectItem>
                          <SelectItem value="no">Bot Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
            {hasFilters && (
              <div className="p-3 border-t bg-muted/30 flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={onReset} className="gap-1.5">
                  <RotateCcw className="h-3.5 w-3.5" />
                  Clear All
                </Button>
                <Button size="sm" onClick={() => { setShowAddFilter(false); onSaveAsSegment(); }} className="gap-1.5">
                  <Save className="h-3.5 w-3.5" />
                  Save as Segment
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        {/* Quick Actions */}
        {hasFilters && (
          <>
            <Button variant="outline" className="gap-2 h-10" onClick={onSaveAsSegment}>
              <Save className="h-4 w-4" />
              Save Segment
            </Button>
            <Button variant="ghost" className="gap-2 h-10" onClick={onReset}>
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </>
        )}
      </div>

      {/* Active Filter Chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter, idx) => (
            <Badge
              key={`${filter.key}-${filter.value}-${idx}`}
              variant="secondary"
              className={cn(
                "gap-1.5 pr-1.5 pl-2.5 py-1 text-sm bg-background border shadow-sm hover:bg-muted transition-colors cursor-default",
                filter.color
              )}
            >
              <span className="text-muted-foreground font-normal">{filter.label}:</span>
              <span className="font-medium">{filter.value}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 hover:bg-destructive/10 hover:text-destructive rounded-full"
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
