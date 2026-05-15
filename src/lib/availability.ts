export type AvailabilityStatus = 'available' | 'paused' | 'offline';

export interface PauseDuration {
  label: string;
  short: string;
  minutes: number;
}

export const PAUSE_DURATIONS: PauseDuration[] = [
  { label: 'Pause for 30 minutes', short: '30m', minutes: 30 },
  { label: 'Pause for 1 hour', short: '1h', minutes: 60 },
  { label: 'Pause for 2 hours', short: '2h', minutes: 120 },
  { label: 'Pause for 4 hours', short: '4h', minutes: 240 },
  { label: 'Pause for 8 hours', short: '8h', minutes: 480 },
  { label: 'Pause for 12 hours', short: '12h', minutes: 720 },
  { label: 'Pause for 1 day', short: '1d', minutes: 1440 },
  { label: 'Pause for 2 days', short: '2d', minutes: 2880 },
  { label: 'Pause for 3 days', short: '3d', minutes: 4320 },
  { label: 'Pause for 4 days', short: '4d', minutes: 5760 },
  { label: 'Pause for 7 days', short: '7d', minutes: 10080 },
  { label: 'Pause for 15 days', short: '15d', minutes: 21600 },
  { label: 'Pause for 30 days', short: '30d', minutes: 43200 },
];

export const PAUSE_REASONS = [
  { value: 'break', label: 'Break' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'busy', label: 'Busy' },
  { value: 'leave', label: 'Leave' },
  { value: 'custom', label: 'Custom' },
];

export function formatCountdown(target: string | Date | null | undefined): string {
  if (!target) return '';
  const ms = new Date(target).getTime() - Date.now();
  if (ms <= 0) return 'Resuming…';
  const totalSec = Math.floor(ms / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function formatPausedUntil(target: string | Date | null | undefined): string {
  if (!target) return '';
  const d = new Date(target);
  const sameDay = new Date().toDateString() === d.toDateString();
  if (sameDay) {
    return `Paused until ${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
  }
  return `Paused until ${d.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}`;
}
