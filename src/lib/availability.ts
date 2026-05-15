export type AvailabilityStatus = 'available' | 'paused' | 'offline';

export interface PauseDuration {
  label: string;
  short: string;
  minutes: number;
}

// minutes === 0  → indefinite / permanent (no auto-resume)
export const PAUSE_DURATIONS: PauseDuration[] = [
  { label: 'Pause for 30 minutes', short: '30 min', minutes: 30 },
  { label: 'Pause for 1 hour', short: '1 hr', minutes: 60 },
  { label: 'Pause for 2 hours', short: '2 hr', minutes: 120 },
  { label: 'Pause for 4 hours', short: '4 hr', minutes: 240 },
  { label: 'Pause for 8 hours', short: '8 hr', minutes: 480 },
  { label: 'Pause for 12 hours', short: '12 hr', minutes: 720 },
  { label: 'Pause for 1 day', short: '1 day', minutes: 1440 },
  { label: 'Pause for 2 days', short: '2 days', minutes: 2880 },
  { label: 'Pause for 3 days', short: '3 days', minutes: 4320 },
  { label: 'Pause for 4 days', short: '4 days', minutes: 5760 },
  { label: 'Pause for 7 days', short: '7 days', minutes: 10080 },
  { label: 'Pause for 15 days', short: '15 days', minutes: 21600 },
  { label: 'Pause for 30 days', short: '30 days', minutes: 43200 },
  { label: 'Pause for 60 days', short: '60 days', minutes: 86400 },
  { label: 'Pause for 90 days', short: '90 days', minutes: 129600 },
  { label: 'Pause indefinitely', short: 'Indefinite', minutes: 0 },
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

export function formatResumeAt(target: string | Date | null | undefined): string {
  if (!target) return '';
  const d = new Date(target);
  const now = new Date();
  const sameDay = now.toDateString() === d.toDateString();
  const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = tomorrow.toDateString() === d.toDateString();
  const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (sameDay) return `Today at ${time}`;
  if (isTomorrow) return `Tomorrow at ${time}`;
  return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }) + ` at ${time}`;
}

export function formatPausedUntil(target: string | Date | null | undefined): string {
  if (!target) return '';
  return `Resumes ${formatResumeAt(target).toLowerCase()}`;
}
