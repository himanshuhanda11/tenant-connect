import { useState, useMemo } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Filter, X, Bookmark, Save, Trash2 } from 'lucide-react';
import { type CrmFilters, EMPTY_FILTERS, countActiveFilters } from '@/lib/crmFilters';
import { useCrmOwners, useSavedViews } from '@/hooks/useCrmExtras';
import { cn } from '@/lib/utils';

interface Props {
  filters: CrmFilters;
  onChange: (f: CrmFilters) => void;
  allTags: string[];
  allSources: string[];
}

export function CrmFiltersBar({ filters, onChange, allTags, allSources }: Props) {
  const { owners } = useCrmOwners();
  const { views, saveView, deleteView } = useSavedViews();
  const [saveName, setSaveName] = useState('');
  const activeCount = countActiveFilters(filters);

  const toggleIn = (key: keyof CrmFilters, value: string) => {
    const arr = (filters[key] as string[]) || [];
    const next = arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
    onChange({ ...filters, [key]: next });
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Filters popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 gap-1.5">
            <Filter className="h-3.5 w-3.5" /> Filters
            {activeCount > 0 && (
              <Badge className="ml-1 h-4 px-1.5 text-[10px] bg-primary text-primary-foreground">{activeCount}</Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 p-0">
          <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between">
            <span className="text-sm font-semibold">Filters</span>
            {activeCount > 0 && (
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => onChange(EMPTY_FILTERS)}>
                Clear all
              </Button>
            )}
          </div>
          <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
            <FilterGroup label="Priority">
              {(['low','normal','high','urgent'] as const).map(p => (
                <CheckRow key={p} label={p} checked={filters.priority.includes(p)}
                  onChange={() => toggleIn('priority', p)} />
              ))}
            </FilterGroup>

            <FilterGroup label="Status">
              {(['open','won','lost'] as const).map(s => (
                <CheckRow key={s} label={s} checked={filters.status.includes(s)}
                  onChange={() => toggleIn('status', s)} />
              ))}
            </FilterGroup>

            {owners.length > 0 && (
              <FilterGroup label="Owner">
                {owners.map(o => (
                  <CheckRow key={o.id} label={o.name} checked={filters.ownerIds.includes(o.id)}
                    onChange={() => toggleIn('ownerIds', o.id)} />
                ))}
              </FilterGroup>
            )}

            {allTags.length > 0 && (
              <FilterGroup label="Tags">
                {allTags.map(t => (
                  <CheckRow key={t} label={t} checked={filters.tags.includes(t)}
                    onChange={() => toggleIn('tags', t)} />
                ))}
              </FilterGroup>
            )}

            {allSources.length > 0 && (
              <FilterGroup label="Source">
                {allSources.map(s => (
                  <CheckRow key={s} label={s} checked={filters.sources.includes(s)}
                    onChange={() => toggleIn('sources', s)} />
                ))}
              </FilterGroup>
            )}

            <FilterGroup label="Expected close date">
              <div className="grid grid-cols-2 gap-2">
                <Input type="date" value={filters.closeFrom || ''} onChange={(e) => onChange({ ...filters, closeFrom: e.target.value || null })} className="h-8 text-xs" />
                <Input type="date" value={filters.closeTo || ''} onChange={(e) => onChange({ ...filters, closeTo: e.target.value || null })} className="h-8 text-xs" />
              </div>
            </FilterGroup>
          </div>
        </PopoverContent>
      </Popover>

      {/* Saved views */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 gap-1.5">
            <Bookmark className="h-3.5 w-3.5" /> Views
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72 p-0">
          <div className="px-4 py-3 border-b border-border/60">
            <p className="text-sm font-semibold mb-2">Saved views</p>
            <div className="flex gap-1.5">
              <Input value={saveName} onChange={(e) => setSaveName(e.target.value)}
                placeholder="View name" className="h-8 text-xs" />
              <Button size="sm" className="h-8 px-2" disabled={!saveName.trim()}
                onClick={() => { saveView({ name: saveName.trim(), filters }); setSaveName(''); }}>
                <Save className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <div className="max-h-72 overflow-y-auto py-1">
            {views.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No saved views yet</p>
            ) : views.map(v => (
              <div key={v.id} className="group flex items-center gap-2 px-3 py-2 hover:bg-muted/50">
                <button className="flex-1 text-left text-sm truncate" onClick={() => onChange({ ...EMPTY_FILTERS, ...v.filters })}>
                  {v.name}
                </button>
                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100"
                  onClick={() => deleteView(v.id)}>
                  <Trash2 className="h-3 w-3 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Active filter chips */}
      {activeCount > 0 && (
        <Button variant="ghost" size="sm" className="h-9 text-xs text-muted-foreground" onClick={() => onChange(EMPTY_FILTERS)}>
          <X className="h-3 w-3 mr-1" /> Clear
        </Button>
      )}
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{label}</p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function CheckRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center gap-2 px-1 py-1 rounded hover:bg-muted/50 cursor-pointer">
      <Checkbox checked={checked} onCheckedChange={onChange} />
      <span className="text-sm capitalize">{label}</span>
    </label>
  );
}
