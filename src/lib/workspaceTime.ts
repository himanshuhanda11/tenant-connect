/**
 * Workspace time: every report and date filter is calculated in the
 * workspace's own timezone (from its WhatsApp number), never the device's.
 * Timestamps stay in UTC; these helpers only turn "Today" etc. into exact
 * UTC instants and format UTC instants for display.
 */

export type DatePreset = 'today' | 'yesterday' | 'last_24h' | 'last_7d' | 'last_30d' | 'custom';

export interface DateRange {
  start: Date;
  end: Date;
}

export const DATE_PRESET_LABELS: Record<DatePreset, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  last_24h: 'Last 24 hours',
  last_7d: 'Last 7 days',
  last_30d: 'Last 30 days',
  custom: 'Custom range',
};

const partsCache = new Map<string, Intl.DateTimeFormat>();
function partsFormatter(timeZone: string) {
  let f = partsCache.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
    partsCache.set(timeZone, f);
  }
  return f;
}

export function isValidTimeZone(tz: string | null | undefined): tz is string {
  if (!tz) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** Wall-clock fields of an instant in a timezone. */
export function zonedParts(date: Date, timeZone: string) {
  const out: Record<string, number> = {};
  for (const p of partsFormatter(timeZone).formatToParts(date)) {
    if (p.type !== 'literal') out[p.type] = Number(p.value);
  }
  return {
    year: out.year, month: out.month, day: out.day,
    hour: out.hour === 24 ? 0 : out.hour, minute: out.minute, second: out.second,
  };
}

/** Offset (ms) of the timezone from UTC at a given instant. */
export function timeZoneOffsetMs(date: Date, timeZone: string): number {
  const p = zonedParts(date, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

/** UTC instant for a wall-clock time in a timezone (handles DST). */
export function zonedTimeToUtc(
  year: number, month: number, day: number,
  hour: number, minute: number, timeZone: string,
): Date {
  const guess = Date.UTC(year, month - 1, day, hour, minute, 0);
  let offset = timeZoneOffsetMs(new Date(guess), timeZone);
  let result = guess - offset;
  const offset2 = timeZoneOffsetMs(new Date(result), timeZone);
  if (offset2 !== offset) {
    offset = offset2;
    result = guess - offset;
  }
  return new Date(result);
}

/** Midnight (workspace time) of the day containing `date`, shifted by `addDays`. */
export function startOfZonedDay(date: Date, timeZone: string, addDays = 0): Date {
  const p = zonedParts(date, timeZone);
  // Use a UTC calendar to roll the date (avoids month/year edge cases)
  const d = new Date(Date.UTC(p.year, p.month - 1, p.day + addDays));
  return zonedTimeToUtc(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), 0, 0, timeZone);
}

/**
 * Exact UTC range for a preset. "Last 24 hours" is rolling (now − 24h → now);
 * "Last 7/30 days" include today plus the previous 6/29 calendar days.
 */
export function rangeForPreset(preset: Exclude<DatePreset, 'custom'>, timeZone: string, now = new Date()): DateRange {
  switch (preset) {
    case 'today':
      return { start: startOfZonedDay(now, timeZone), end: now };
    case 'yesterday':
      return { start: startOfZonedDay(now, timeZone, -1), end: startOfZonedDay(now, timeZone) };
    case 'last_24h':
      return { start: new Date(now.getTime() - 24 * 3600 * 1000), end: now };
    case 'last_7d':
      return { start: startOfZonedDay(now, timeZone, -6), end: now };
    case 'last_30d':
      return { start: startOfZonedDay(now, timeZone, -29), end: now };
  }
}

/** "2026-11-22T09:30" typed by the user, read as workspace time → UTC. */
export function localInputToUtc(value: string, timeZone: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/.exec(value.trim());
  if (!m) return null;
  return zonedTimeToUtc(+m[1], +m[2], +m[3], m[4] ? +m[4] : 0, m[5] ? +m[5] : 0, timeZone);
}

/** UTC instant → "2026-11-22T09:30" in workspace time (for datetime-local inputs). */
export function utcToLocalInput(date: Date, timeZone: string): string {
  const p = zonedParts(date, timeZone);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`;
}

/** Format an instant in workspace time, e.g. "22 Nov 2026, 3:45 PM". */
export function formatInZone(
  value: string | Date | null | undefined,
  timeZone: string,
  opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' },
): string {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('en-GB', { ...opts, timeZone }).format(d);
}

/** Short label for a timezone, e.g. "Asia/Dubai (UTC+4)". */
export function timeZoneLabel(timeZone: string, at = new Date()): string {
  const mins = Math.round(timeZoneOffsetMs(at, timeZone) / 60000);
  const sign = mins >= 0 ? '+' : '−';
  const abs = Math.abs(mins);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `${timeZone} (UTC${sign}${h}${m ? `:${String(m).padStart(2, '0')}` : ''})`;
}

/** Human duration for seconds, e.g. "4m", "2h 5m", "3d". */
export function formatDurationSeconds(seconds: number | null | undefined): string {
  if (seconds == null || !Number.isFinite(seconds)) return '—';
  const s = Math.max(0, Math.round(seconds));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return m % 60 ? `${h}h ${m % 60}m` : `${h}h`;
  const d = Math.floor(h / 24);
  return h % 24 ? `${d}d ${h % 24}h` : `${d}d`;
}
