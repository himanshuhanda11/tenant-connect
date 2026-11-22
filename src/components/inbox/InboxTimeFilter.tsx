import { useEffect, useState } from 'react';
import { ArrowDownUp, CalendarDays, Check, ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  type DatePreset, type DateRange,
  formatInZone, localInputToUtc, rangeForPreset, timeZoneLabel, utcToLocalInput,
} from '@/lib/workspaceTime';
import { inboxSortOrder, type InboxFilters, type InboxSort } from '@/types/inbox';

export interface InboxTimeFilterValue {
  preset: DatePreset | 'all';
  custom?: DateRange;
  sort: InboxSort;
}

export const DEFAULT_INBOX_TIME_FILTER: InboxTimeFilterValue = { preset: 'all', sort: 'latest_activity' };

/**
 * Turn the picked date + sort into exact UTC bounds for the inbox query.
 * The date always applies to the same time the list is sorted by, so
 * "Today" + "Newest chats" = chats received today, and
 * "Today" + "Latest message" = chats with a message today.
 */
export function resolveInboxTimeFilter(v: InboxTimeFilterValue, timeZone: string, now = new Date()): Pick<InboxFilters, 'dateFrom' | 'dateTo' | 'dateField' | 'sort'> {
  const base = { dateField: inboxSortOrder(v.sort).column, sort: v.sort };
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

/** Plain-language summary, e.g. "75 new chats today". */
export function describeInboxCount(count: number, v: InboxTimeFilterValue, timeZone: string): string {
  const n = count.toLocaleString('en-US');
  const byReceived = inboxSortOrder(v.sort).column === 'created_at';
  const one = count === 1;
  if (v.preset === 'all') return `${n} ${one ? 'chat' : 'chats'}`;
  const noun = byReceived ? (one ? 'new chat' : 'new chats') : (one ? 'chat with messages' : 'chats with messages');
  const when: Record<Exclude<DatePreset, 'custom'>, string> = {
    today: 'today', yesterday: 'yesterday', last_24h: 'in the last 24 hours',
    last_7d: 'in the last 7 days', last_30d: 'in the last 30 days',
  };
  if (v.preset === 'custom') {
    if (!v.custom) return `${n} ${noun}`;
    const f = (d: Date) => formatInZone(d, timeZone, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
    return `${n} ${noun} · ${f(v.custom.start)} – ${f(v.custom.end)}`;
  }
  return `${n} ${noun} ${when[v.preset]}`;
}

export const SORT_OPTIONS: { value: InboxSort; label: string; hint: string }[] = [
  { value: 'latest_activity', label: 'Latest message first', hint: 'Chats with the newest message on top' },
  { value: 'newest_received', label: 'Newest chats first', hint: 'Newly received chats on top' },
  { value: 'oldest_received', label: 'Oldest chats first', hint: 'Chats waiting longest on top' },
];

const QUICK: { value: InboxTimeFilterValue['preset']; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last_7d', label: '7 days' },
];
const MORE: { value: Exclude<DatePreset, 'custom'>; label: string }[] = [
  { value: 'last_24h', label: 'Last 24 hours' },
  { value: 'last_30d', label: 'Last 30 days' },
];

/** Segmented date picker: All · Today · Yesterday · 7 days · [calendar]. */
export function InboxDateTabs({ value, onChange, timeZone }: {
  value: InboxTimeFilterValue; onChange: (v: InboxTimeFilterValue) => void; timeZone: string;
}) {
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const now = new Date();
    setFrom(utcToLocalInput(value.custom?.start ?? rangeForPreset('today', timeZone, now).start, timeZone));
    setTo(utcToLocalInput(value.custom?.end ?? now, timeZone));
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

  const moreActive = value.preset === 'custom' || MORE.some((m) => m.value === value.preset);
  const moreLabel = value.preset === 'custom' && value.custom
    ? `${formatInZone(value.custom.start, timeZone, { day: 'numeric', month: 'short' })}–${formatInZone(value.custom.end, timeZone, { day: 'numeric', month: 'short' })}`
    : MORE.find((m) => m.value === value.preset)?.label;

  return (
    <div role="tablist" aria-label="Show chats from" className="flex items-center gap-0.5 rounded-lg bg-muted/60 p-0.5">
      {QUICK.map((q) => {
        const active = value.preset === q.value;
        return (
          <button
            key={q.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange({ ...value, preset: q.value, custom: undefined })}
            className={cn(
              'flex-1 whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium transition-colors',
              active ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {q.label}
          </button>
        );
      })}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="More dates"
            className={cn(
              'flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium transition-colors',
              moreActive ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <CalendarDays className="h-3.5 w-3.5" />
            {moreActive && <span className="max-w-[84px] truncate">{moreLabel}</span>}
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72 space-y-3 p-3">
          <div className="grid grid-cols-2 gap-1.5">
            {MORE.map((m) => (
              <Button
                key={m.value}
                size="sm"
                variant={value.preset === m.value ? 'default' : 'outline'}
                className="h-8 text-xs"
                onClick={() => { onChange({ ...value, preset: m.value, custom: undefined }); setOpen(false); }}
              >
                {m.label}
              </Button>
            ))}
          </div>
          <div className="space-y-1.5 border-t border-border pt-3">
            <p className="text-xs font-semibold text-foreground">Pick dates</p>
            <label className="block text-[11px] text-muted-foreground">From
              <Input type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-0.5 h-8 text-xs" />
            </label>
            <label className="block text-[11px] text-muted-foreground">To
              <Input type="datetime-local" value={to} onChange={(e) => setTo(e.target.value)} className="mt-0.5 h-8 text-xs" />
            </label>
            {error && <p className="text-[11px] text-destructive">{error}</p>}
            <Button size="sm" className="h-8 w-full text-xs" onClick={applyCustom}>Show these dates</Button>
          </div>
          <p className="text-[10px] text-muted-foreground">Times in {timeZoneLabel(timeZone)}</p>
        </PopoverContent>
      </Popover>
    </div>
  );
}

/** "Sort" menu with plain explanations. */
export function InboxSortMenu({ value, onChange }: { value: InboxSort; onChange: (s: InboxSort) => void }) {
  const [open, setOpen] = useState(false);
  const current = SORT_OPTIONS.find((o) => o.value === value) ?? SORT_OPTIONS[0];
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" aria-label="Sort chats" className="flex min-w-0 items-center gap-1 rounded-md border border-border/60 bg-card px-2 py-1 text-xs font-medium text-foreground hover:bg-muted">
          <ArrowDownUp className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
          <span className="truncate">{current.label}</span>
          <ChevronDown className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-1">
        {SORT_OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => { onChange(o.value); setOpen(false); }}
            className={cn('flex w-full items-start gap-2 rounded-md px-2 py-2 text-left hover:bg-muted', o.value === value && 'bg-primary/10')}
          >
            <Check className={cn('mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary', o.value !== value && 'invisible')} />
            <span>
              <span className="block text-xs font-medium text-foreground">{o.label}</span>
              <span className="block text-[11px] text-muted-foreground">{o.hint}</span>
            </span>
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
