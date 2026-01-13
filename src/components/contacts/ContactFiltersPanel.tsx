import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  X, 
  ChevronDown, 
  Filter,
  RotateCcw,
  Users,
  Tag,
  TrendingUp,
  Shield,
  Bot
} from 'lucide-react';
import { ContactFilters, PRIORITY_OPTIONS, LEAD_STATUS_OPTIONS, MAU_STATUS_OPTIONS } from '@/types/contact';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

interface ContactFiltersPanelProps {
  filters: ContactFilters;
  onFiltersChange: (filters: ContactFilters) => void;
  onReset: () => void;
  activeFilterCount: number;
}

export function ContactFiltersPanel({ 
  filters, 
  onFiltersChange, 
  onReset,
  activeFilterCount 
}: ContactFiltersPanelProps) {
  const { currentTenant } = useTenant();
  const [tags, setTags] = useState<{ id: string; name: string; color: string }[]>([]);
  const [segments, setSegments] = useState<string[]>([]);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      if (!currentTenant?.id) return;

      // Fetch tags
      const { data: tagsData } = await supabase
        .from('tags')
        .select('id, name, color')
        .eq('tenant_id', currentTenant.id)
        .order('name');
      
      if (tagsData) setTags(tagsData);

      // Fetch unique segments
      const { data: segmentsData } = await supabase
        .from('contacts')
        .select('segment')
        .eq('tenant_id', currentTenant.id)
        .not('segment', 'is', null);
      
      if (segmentsData) {
        const uniqueSegments = [...new Set(segmentsData.map(s => s.segment).filter(Boolean))];
        setSegments(uniqueSegments as string[]);
      }
    };

    fetchFilterOptions();
  }, [currentTenant?.id]);

  const updateFilter = <K extends keyof ContactFilters>(key: K, value: ContactFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: 'leadStatus' | 'priority' | 'mauStatus' | 'tags', value: string) => {
    const current = filters[key];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    updateFilter(key, updated);
  };

  return (
    <div className="bg-card border rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Filters</span>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeFilterCount} active
            </Badge>
          )}
        </div>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onReset} className="h-8 text-xs">
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or phone..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="pl-9"
        />
        {filters.search && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
            onClick={() => updateFilter('search', '')}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      <ScrollArea className="h-[calc(100vh-320px)]">
        <div className="space-y-3 pr-4">
          {/* Lead Status */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover:bg-muted/50 rounded px-2 -mx-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Lead Status</span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 space-y-2">
              {LEAD_STATUS_OPTIONS.map((status) => (
                <div key={status.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`lead-${status.value}`}
                    checked={filters.leadStatus.includes(status.value)}
                    onCheckedChange={() => toggleArrayFilter('leadStatus', status.value)}
                  />
                  <Label 
                    htmlFor={`lead-${status.value}`} 
                    className="text-sm cursor-pointer flex-1"
                  >
                    <Badge variant="secondary" className={`${status.color} text-xs`}>
                      {status.label}
                    </Badge>
                  </Label>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>

          {/* Priority */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover:bg-muted/50 rounded px-2 -mx-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Priority</span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 space-y-2">
              {PRIORITY_OPTIONS.map((priority) => (
                <div key={priority.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`priority-${priority.value}`}
                    checked={filters.priority.includes(priority.value)}
                    onCheckedChange={() => toggleArrayFilter('priority', priority.value)}
                  />
                  <Label 
                    htmlFor={`priority-${priority.value}`} 
                    className="text-sm cursor-pointer flex-1"
                  >
                    <Badge variant="secondary" className={`${priority.color} text-xs`}>
                      {priority.label}
                    </Badge>
                  </Label>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>

          {/* MAU Status */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover:bg-muted/50 rounded px-2 -mx-2">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">MAU Status</span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 space-y-2">
              {MAU_STATUS_OPTIONS.map((status) => (
                <div key={status.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`mau-${status.value}`}
                    checked={filters.mauStatus.includes(status.value)}
                    onCheckedChange={() => toggleArrayFilter('mauStatus', status.value)}
                  />
                  <Label 
                    htmlFor={`mau-${status.value}`} 
                    className="text-sm cursor-pointer flex-1"
                  >
                    <Badge variant="secondary" className={`${status.color} text-xs`}>
                      {status.label}
                    </Badge>
                  </Label>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>

          {/* Tags */}
          {tags.length > 0 && (
            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover:bg-muted/50 rounded px-2 -mx-2">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Tags</span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2 space-y-2">
                {tags.map((tag) => (
                  <div key={tag.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tag-${tag.id}`}
                      checked={filters.tags.includes(tag.id)}
                      onCheckedChange={() => toggleArrayFilter('tags', tag.id)}
                    />
                    <Label 
                      htmlFor={`tag-${tag.id}`} 
                      className="text-sm cursor-pointer flex-1"
                    >
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
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Segment */}
          {segments.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Segment</Label>
              <Select 
                value={filters.segment} 
                onValueChange={(value) => updateFilter('segment', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All segments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All segments</SelectItem>
                  {segments.map((segment) => (
                    <SelectItem key={segment} value={segment}>
                      {segment}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Compliance */}
          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover:bg-muted/50 rounded px-2 -mx-2">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Compliance</span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 space-y-3">
              <div className="space-y-2">
                <Label className="text-sm">Opt-in Status</Label>
                <Select 
                  value={filters.optInStatus} 
                  onValueChange={(value: 'all' | 'opted_in' | 'opted_out') => updateFilter('optInStatus', value)}
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
            </CollapsibleContent>
          </Collapsible>

          {/* Agent Assignment */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Agent Assignment</Label>
            <Select 
              value={filters.hasAgent} 
              onValueChange={(value: 'all' | 'assigned' | 'unassigned') => updateFilter('hasAgent', value)}
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

          {/* Intervention Status */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Intervention</Label>
            <Select 
              value={filters.intervened} 
              onValueChange={(value: 'all' | 'yes' | 'no') => updateFilter('intervened', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="yes">Human Intervened</SelectItem>
                <SelectItem value="no">Bot Handled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
