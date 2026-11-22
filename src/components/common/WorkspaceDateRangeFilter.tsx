import { useEffect, useState } from 'react';
import { CalendarClock, Globe2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  DATE_PRESET_LABELS, type DatePreset, type DateRange,
  formatInZone, localInputToUtc, rangeForPreset, timeZoneLabel, utcToLocalInput,
} from '@/lib/workspaceTime';

export interface WorkspaceDateValue {
  preset: DatePreset;
  /** Only used when preset === 'custom' */
  custom?: DateRange;
}

const PRESETS: Exclude<DatePreset, 'custom'>[] = ['today', 'yesterday', 'last_24h', 'last_7d', 'last_30d'];

/** Resolve the selected filter to exact UTC instants, in workspace time. */
export function resolveWorkspaceRange(value: WorkspaceDateValue, timeZone: string, now = new Date()) {
  if (value.preset === 'custom' && value.custom) {
    return { ...value.custom, live: false };
  }
  const preset = value.preset === 'custom' ? 'today' : value.preset;
  const r = rangeForPreset(preset, timeZone, now);
  return { ...r, live: preset !== 'yesterday' };
}

interface Props {
  value: WorkspaceDateValue;
  onChange: (v: WorkspaceDateValue) => void;
  timeZone: string;
  className?: string;
  /** Presets to offer; defaults to all */
  presets?: Exclude<DatePreset, 'custom'>[];
}

export function WorkspaceDateRangeFilter({ value, onChange, timeZone, className, presets = PRESETS }: Props) {
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const base = resolveWorkspaceRange(value, timeZone);
    setFrom(utcToLocalInput(base.start, timeZone));
    setTo(utcToLocalInput(base.end, timeZone));
    setError(null);
  }, [open, value, timeZone]);

  const apply = () => {
    const s = localInputToUtc(from, timeZone);
    const e = localInputToUtc(to, timeZone);
    if (!s || !e) return setError('Pick both a start and an end.');
    if (e <= s) return setError('The end must be after the start.');
    if (e.getTime() - s.getTime() > 400 * 86400_000) return setError('Pick up to 400 days.');
    onChange({ preset: 'custom', custom: { start: s, end: e } });
    setOpen(false);
  };

  const customLabel = value.preset === 'custom' && value.custom
    ? `${formatInZone(value.custom.start, timeZone, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })} – ${formatInZone(value.custom.end, timeZone, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}`
    : DATE_PRESET_LABELS.custom;

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <div className="flex flex-wrap items-center gap-1 rounded-xl border border-border bg-muted/40 p-1">
        {presets.map((p) => (
          <Button
            key={p}
            type="button"
            size="sm"
            variant={value.preset === p ? 'default' : 'ghost'}
            className={cn('h-8 rounded-lg px-3 text-xs font-medium', value.preset !== p && 'text-muted-foreground')}
            onClick={() => onChange({ preset: p })}
          >
            {DATE_PRESET_LABELS[p]}
          </Button>
        ))}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              size="sm"
              variant={value.preset === 'custom' ? 'default' : 'ghost'}
              className={cn('h-8 gap-1.5 rounded-lg px-3 text-xs font-medium', value.preset !== 'custom' && 'text-muted-foreground')}
            >
              <CalendarClock className="h-3.5 w-3.5" />
              <span className="max-w-[220px] truncate">{customLabel}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-80 space-y-3">
            <div>
              <p className="text-sm font-semibold">Custom date &amp; time</p>
              <p className="text-xs text-muted-foreground">Times are in {timeZoneLabel(timeZone)}</p>
            </div>
            <label className="block space-y-1">
              <span className="text-xs font-medium text-muted-foreground">From</span>
              <Input type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium text-muted-foreground">To</span>
              <Input type="datetime-local" value={to} onChange={(e) => setTo(e.target.value)} />
            </label>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={apply}>Apply</Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            <Globe2 className="h-3 w-3" />
            {timeZoneLabel(timeZone)}
          </span>
        </TooltipTrigger>
        <TooltipContent>Dates and “Today” follow your workspace time zone, not this device.</TooltipContent>
      </Tooltip>
    </div>
  );
}
