import React from 'react';
import { Check, Circle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface OnboardingTimelineData {
  signup_at?: string | null;
  org_done_at?: string | null;
  password_done_at?: string | null;
  workspace_created_at?: string | null;
  completed_at?: string | null;
}

const STEPS: { key: keyof OnboardingTimelineData; label: string }[] = [
  { key: 'signup_at', label: 'Signed up' },
  { key: 'org_done_at', label: 'Details' },
  { key: 'password_done_at', label: 'Password' },
  { key: 'workspace_created_at', label: 'Workspace' },
  { key: 'completed_at', label: 'Completed' },
];

function fmt(ts?: string | null) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function OnboardingTimeline({ data, compact = false }: { data: OnboardingTimelineData; compact?: boolean }) {
  // Determine current step (first missing one is "stuck")
  const firstMissingIdx = STEPS.findIndex(s => !data?.[s.key]);
  const stuckIdx = firstMissingIdx === -1 ? STEPS.length : firstMissingIdx;

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {STEPS.map((s, i) => {
          const done = !!data?.[s.key];
          const stuck = i === stuckIdx;
          return (
            <div
              key={s.key}
              title={`${s.label}${done ? ` • ${fmt(data?.[s.key])}` : stuck ? ' • Stuck here' : ' • Not yet'}`}
              className={cn(
                'h-1.5 w-5 rounded-full transition-colors',
                done && 'bg-emerald-500',
                !done && stuck && 'bg-amber-400',
                !done && !stuck && 'bg-muted',
              )}
            />
          );
        })}
      </div>
    );
  }

  return (
    <ol className="space-y-1.5">
      {STEPS.map((s, i) => {
        const done = !!data?.[s.key];
        const stuck = i === stuckIdx;
        return (
          <li key={s.key} className="flex items-center gap-2 text-[11px]">
            <span className={cn(
              'inline-flex h-4 w-4 items-center justify-center rounded-full',
              done && 'bg-emerald-500 text-white',
              !done && stuck && 'bg-amber-100 text-amber-700 ring-1 ring-amber-400',
              !done && !stuck && 'bg-muted text-muted-foreground',
            )}>
              {done ? <Check className="h-2.5 w-2.5" /> : stuck ? <Clock className="h-2.5 w-2.5" /> : <Circle className="h-2 w-2" />}
            </span>
            <span className={cn('font-medium', !done && !stuck && 'text-muted-foreground')}>{s.label}</span>
            {done && <span className="text-muted-foreground ml-auto">{fmt(data?.[s.key])}</span>}
            {!done && stuck && <span className="text-amber-600 ml-auto">Stuck</span>}
          </li>
        );
      })}
    </ol>
  );
}
