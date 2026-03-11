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
import { Separator } from '@/components/ui/separator';
import {
  Filter,
  X,
  Search,
  Save,
  RotateCcw,
  SlidersHorizontal,
  Tag,
  Users,
  Shield,
  Calendar,
  TrendingUp,
  Inbox,
  Settings2,
  Plus,
  Trash2,
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
  availableAgents?: { id: string; full_name: string | null; email: string }[];
  attributeKeys?: string[];
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

const LEAD_STATE_OPTIONS = [
  { value: 'new', label: 'New', className: 'bg-blue-100 text-blue-700' },
  { value: 'assigned_pending', label: 'Assigned Pending', className: 'bg-amber-100 text-amber-700' },
  { value: 'claimed', label: 'Claimed', className: 'bg-emerald-100 text-emerald-700' },
  { value: 'unreplied', label: 'Unreplied', className: 'bg-rose-100 text-rose-700' },
  { value: 'closed', label: 'Closed', className: 'bg-muted text-muted-foreground' },
];

export function ContactsAdvancedFilters({
  filters,
  onFiltersChange,
  onSaveAsSegment,
  onReset,
  availableTags,
  availableAgents = [],
  attributeKeys = [],
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

  const toggleArrayFilter = (key: 'leadStatus' | 'priority' | 'mauStatus' | 'tags' | 'source' | 'country' | 'leadState', value: string) => {
    const current = (filters[key] as string[] | undefined) || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateFilter(key, updated.length > 0 ? updated : undefined);
  };

  const addAttributeFilter = () => {
    const current = filters.attributes || [];
    updateFilter('attributes', [...current, { key: '', value: '' }]);
  };

  const updateAttributeFilter = (index: number, field: 'key' | 'value', val: string) => {
    const current = [...(filters.attributes || [])];
    current[index] = { ...current[index], [field]: val };
    updateFilter('attributes', current);
  };

  const removeAttributeFilter = (index: number) => {
    const current = [...(filters.attributes || [])];
    current.splice(index, 1);
    updateFilter('attributes', current.length > 0 ? current : undefined);
  };

  const getActiveFilters = () => {
    const active: { key: keyof SegmentFilters; label: string; value: string; color?: string }[] = [];

    if (filters.leadState?.length) {
      filters.leadState.forEach((s) => {
        const opt = LEAD_STATE_OPTIONS.find((o) => o.value === s);
        active.push({ key: 'leadState', label: 'Lead State', value: opt?.label || s, color: opt?.className });
      });
    }
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
    if (filters.assignedTo) {
      const agent = availableAgents.find(a => a.id === filters.assignedTo);
      active.push({ key: 'assignedTo', label: 'Assigned', value: agent?.full_name || agent?.email || 'Agent' });
    }
    if (filters.isUnreplied && filters.isUnreplied !== 'all') {
      active.push({ key: 'isUnreplied', label: 'Unreplied', value: filters.isUnreplied === 'yes' ? 'Yes' : 'No' });
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
    if (filters.createdDateFrom) {
      active.push({ key: 'createdDateFrom', label: 'Created From', value: filters.createdDateFrom });
    }
    if (filters.createdDateTo) {
      active.push({ key: 'createdDateTo', label: 'Created To', value: filters.createdDateTo });
    }
    if (filters.attributes?.length) {
      filters.attributes.forEach((attr, i) => {
        if (attr.key) {
          active.push({ key: 'attributes', label: `Attr: ${attr.key}`, value: attr.value || '(any)' });
        }
      });
    }

    return active;
  };

  const activeFilters = getActiveFilters();
  const hasFilters = activeFilters.length > 0 || !!filters.search;

  return (
    <div className="space-y-3 px-3 sm:px-6 py-3 sm:py-4 border-b bg-muted/30">
      {/* Row 1: Search + Filter Button + Quick Date */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search name, phone, tag..."
            value={filters.search || ''}
            onChange={(e) => updateFilter('search', e.target.value || undefined)}
            className="pl-9 h-9 bg-background border-muted-foreground/20 focus:border-primary transition-colors text-sm"
          />
          {filters.search && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 hover:bg-muted"
              onClick={() => updateFilter('search', undefined)}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Inline Date Filters */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="flex items-center gap-2 bg-background border rounded-lg px-3 h-9">
            <Calendar className="h-4 w-4 text-primary shrink-0" />
            <span className="text-xs text-muted-foreground whitespace-nowrap">From</span>
            <Input
              type="date"
              value={filters.createdDateFrom || ''}
              onChange={(e) => updateFilter('createdDateFrom', e.target.value || undefined)}
              className="h-7 border-0 p-0 text-xs w-[130px] bg-transparent focus-visible:ring-0"
            />
          </div>
          <span className="text-xs text-muted-foreground font-medium">→</span>
          <div className="flex items-center gap-2 bg-background border rounded-lg px-3 h-9">
            <Calendar className="h-4 w-4 text-primary shrink-0" />
            <span className="text-xs text-muted-foreground whitespace-nowrap">To</span>
            <Input
              type="date"
              value={filters.createdDateTo || ''}
              onChange={(e) => updateFilter('createdDateTo', e.target.value || undefined)}
              className="h-7 border-0 p-0 text-xs w-[130px] bg-transparent focus-visible:ring-0"
            />
          </div>
        </div>

        {/* All Filters Popover */}
        <Popover open={showAddFilter} onOpenChange={setShowAddFilter}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 h-9 border-dashed">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Filters</span>
              {activeFilters.length > 0 && (
                <Badge variant="secondary" className="ml-0.5 h-5 px-1.5 text-xs bg-primary/10 text-primary">
                  {activeFilters.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[380px] sm:w-[420px] p-0" align="start" sideOffset={8}>
            <div className="p-3 border-b bg-muted/50">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Advanced Filters
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Combine filters to find specific contacts
              </p>
            </div>
            <div className="overflow-y-auto max-h-[55vh]">
              <div className="p-4 space-y-5">
                {/* Lead State (CRM) */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Inbox className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm font-medium">Lead State (CRM)</Label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {LEAD_STATE_OPTIONS.map((opt) => (
                      <div key={opt.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`state-${opt.value}`}
                          checked={filters.leadState?.includes(opt.value)}
                          onCheckedChange={() => toggleArrayFilter('leadState', opt.value)}
                        />
                        <Label htmlFor={`state-${opt.value}`} className="text-sm cursor-pointer">
                          <Badge variant="secondary" className={cn(opt.className, "text-xs")}>
                            {opt.label}
                          </Badge>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

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

                {/* Agent Assignment */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm font-medium">Assignment & Agents</Label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Assigned To</Label>
                      <Select
                        value={filters.assignedTo || 'all'}
                        onValueChange={(v) => updateFilter('assignedTo', v === 'all' ? undefined : v)}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Any agent" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any Agent</SelectItem>
                          {availableAgents.map(a => (
                            <SelectItem key={a.id} value={a.id}>
                              {a.full_name || a.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Unreplied</Label>
                      <Select
                        value={filters.isUnreplied || 'all'}
                        onValueChange={(v) => updateFilter('isUnreplied', v as SegmentFilters['isUnreplied'])}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="yes">Unreplied Only</SelectItem>
                          <SelectItem value="no">Replied</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Has Agent</Label>
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

                <Separator />

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

                {/* Date Filters (also in popover for mobile) */}
                <div className="sm:hidden space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm font-medium">Date Range</Label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Created From</Label>
                      <Input
                        type="date"
                        value={filters.createdDateFrom || ''}
                        onChange={(e) => updateFilter('createdDateFrom', e.target.value || undefined)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Created To</Label>
                      <Input
                        type="date"
                        value={filters.createdDateTo || ''}
                        onChange={(e) => updateFilter('createdDateTo', e.target.value || undefined)}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                  <Separator />
                </div>

                {/* Attribute Filters */}
                {attributeKeys.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Settings2 className="h-4 w-4 text-muted-foreground" />
                          <Label className="text-sm font-medium">Custom Attributes</Label>
                        </div>
                        <Button variant="ghost" size="sm" onClick={addAttributeFilter} className="h-7 gap-1 text-xs">
                          <Plus className="h-3 w-3" />
                          Add
                        </Button>
                      </div>
                      {(filters.attributes || []).map((attr, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Select
                            value={attr.key || ''}
                            onValueChange={(v) => updateAttributeFilter(idx, 'key', v)}
                          >
                            <SelectTrigger className="h-8 flex-1">
                              <SelectValue placeholder="Key" />
                            </SelectTrigger>
                            <SelectContent>
                              {attributeKeys.map(k => (
                                <SelectItem key={k} value={k}>{k}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="Value"
                            value={attr.value}
                            onChange={(e) => updateAttributeFilter(idx, 'value', e.target.value)}
                            className="h-8 flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0 hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => removeAttributeFilter(idx)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
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
            <Button variant="outline" size="sm" className="gap-1.5 h-9 hidden sm:flex" onClick={onSaveAsSegment}>
              <Save className="h-3.5 w-3.5" />
              Save Segment
            </Button>
            <Button variant="ghost" size="sm" className="gap-1.5 h-9" onClick={onReset}>
              <RotateCcw className="h-3.5 w-3.5" />
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
                  if (['leadStatus', 'priority', 'mauStatus', 'tags', 'source', 'country', 'leadState'].includes(filter.key)) {
                    const current = (filters[filter.key as 'leadStatus'] as string[] | undefined) || [];
                    const updated = current.filter((v) => {
                      if (filter.key === 'tags') {
                        const tag = availableTags.find((t) => t.name === filter.value);
                        return v !== tag?.id;
                      }
                      if (filter.key === 'leadState') {
                        const opt = LEAD_STATE_OPTIONS.find(o => o.label === filter.value);
                        return v !== opt?.value && v !== filter.value;
                      }
                      const opts = filter.key === 'leadStatus' ? LEAD_STATUS_OPTIONS :
                                  filter.key === 'priority' ? PRIORITY_OPTIONS :
                                  filter.key === 'mauStatus' ? MAU_STATUS_OPTIONS : [];
                      const opt = opts.find((o) => o.label === filter.value);
                      return v !== opt?.value && v !== filter.value;
                    });
                    updateFilter(filter.key as 'leadStatus', updated.length > 0 ? updated : undefined);
                  } else if (filter.key === 'attributes') {
                    // Remove attribute filter by label match
                    const attrKey = filter.label.replace('Attr: ', '');
                    const current = filters.attributes || [];
                    const updated = current.filter(a => a.key !== attrKey);
                    updateFilter('attributes', updated.length > 0 ? updated : undefined);
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
