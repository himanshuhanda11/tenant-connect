import { useEffect, useState } from 'react';
import { ArrowDownUp, CalendarClock, Check, ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  DATE_PRESET_LABELS, type DatePreset, type DateRange,
  formatInZone, localInputToUtc, rangeForPreset, timeZoneLabel, utcToLocalInput,
} from '@/lib/workspaceTime';
import {
  INBOX_DATE_FIELD_LABELS, INBOX_SORT_LABELS, type InboxDateField, type InboxFilters, type InboxSort,
} from '@/types/inbox';

export interface InboxTimeFilterValue {
  preset: DatePreset | 'all';
  custom?: DateRange;
  field: InboxDateField;
  sort: InboxSort;
}

export const DEFAULT_INBOX_TIME_FILTER: InboxTimeFilterValue = { preset: 'all', field: 'created_at', sort: 'latest_activity' };

/** Turn the picked time filter into exact UTC bounds for the inbox query. */
export function resolveInboxTimeFilter(v: InboxTimeFilterValue, timeZone: string, now = new Date()): Pick<InboxFilters, 'dateFrom' | 'dateTo' | 'dateField' | 'sort'> {
  const base = { dateField: v.field, sort: v.sort };
  if (v.preset === 'all') return base;
  if (v.preset === 'custom') {
    if (!v.custom) return base;
    return { ...base, dateFrom: v.custom.start.toISOString(), dateTo: v.custom.end.toISOString() };
  }
  const r = rangeForPreset(v.preset, timeZone, now);
  // Ranges that end "now" stay open-ended so new chats keep appearing.
  return v.preset === 'yesterday'
    ? { ...base, dateFrom: r.start.toISOString(), dateTo: r.end.toISOString() }
    : { ...base, dateFrom: r.start.toISOString() };
}

const PRESETS: Exclude<DatePreset, 'custom'>[] = ['today', 'yesterday', 'last_24h', 'last_7d', 'last_30d'];

const chip = (active: boolean) => cn(
  'flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 border',
  active
    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border-border/40',
);

export function InboxTimeFilter({ value, onChange, timeZone }: {
  value: InboxTimeFilterValue; onChange: (v: InboxTimeFilterValue) => void; timeZone: string;
}) {
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const now = new Date();
    const start = value.custom?.start ?? rangeForPreset('today', timeZone, now).start;
    const end = value.custom?.end ?? now;
    setFrom(utcToLocalInput(start, timeZone));
    setTo(utcToLocalInput(end, timeZone));
    setError(null);
  }, [open, value.custom, timeZone]);

  const applyCustom = () => {
    const s = localInputToUtc(from, timeZone);
    const e = localInputToUtc(to, timeZone);
    if (!s || !e) return setError('Pick both a start and an end.');
    if (e <= s) return setError('The end must be after the start.');
    onChange({ ...value, preset: 'custom', custom: { start: s, end: e } });
    setOpen(false);
  };

  const label = value.preset === 'all'
    ? 'Any time'
    : value.preset === 'custom' && value.custom
      ? `${formatInZone(value.custom.start, timeZone, { day: 'numeric', month: 'short' })} – ${formatInZone(value.custom.end, timeZone, { day: 'numeric', month: 'short' })}`
      : DATE_PRESET_LABELS[value.preset];

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button type="button" className={chip(value.preset !== 'all')} aria-label="Filter by date">
            <CalendarClock className="h-3 w-3" />
            <span className="max-w-[120px] truncate">{label}</span>
            <ChevronDown className="h-3 w-3" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-72 space-y-3 p-3">
          <div className="grid grid-cols-2 gap-1.5">
            {(['all', ...PRESETS] as const).map((p) => (
              <Button
                key={p}
                size="sm"
                variant={value.preset === p ? 'default' : 'outline'}
                className="h-8 justify-start text-xs"
                onClick={() => { onChange({ ...value, preset: p, custom: undefined }); setOpen(false); }}
              >
                {p === 'all' ? 'Any time' : DATE_PRESET_LABELS[p]}
              </Button>
            ))}
          </div>

          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Date applies to</p>
            <div className="grid gap-1">
              {(Object.keys(INBOX_DATE_FIELD_LABELS) as InboxDateField[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => onChange({ ...value, field: f })}
                  className={cn(
                    'flex items-center justify-between rounded-md px-2 py-1.5 text-left text-xs transition-colors hover:bg-muted',
                    value.field === f && 'bg-primary/10 font-medium text-primary',
                  )}
                >
                  {INBOX_DATE_FIELD_LABELS[f]}
                  {value.field === f && <Check className="h-3 w-3" />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5 border-t border-border pt-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Custom date &amp; time</p>
            <Input type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} className="h-8 text-xs" aria-label="From" />
            <Input type="datetime-local" value={to} onChange={(e) => setTo(e.target.value)} className="h-8 text-xs" aria-label="To" />
            {error && <p className="text-[11px] text-destructive">{error}</p>}
            <Button size="sm" className="h-8 w-full text-xs" onClick={applyCustom}>Apply custom range</Button>
          </div>
          <p className="text-[10px] text-muted-foreground">Times in {timeZoneLabel(timeZone)}</p>
        </PopoverContent>
      </Popover>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className={chip(false)} aria-label="Sort chats">
            <ArrowDownUp className="h-3 w-3" />
            {INBOX_SORT_LABELS[value.sort]}
            <ChevronDown className="h-3 w-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel className="text-xs">Sort by</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {(Object.keys(INBOX_SORT_LABELS) as InboxSort[]).map((s) => (
            <DropdownMenuItem key={s} onClick={() => onChange({ ...value, sort: s })}>
              {value.sort === s && '✓ '}{INBOX_SORT_LABELS[s]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
