import React from 'react';
import { Check, Lock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  currentStep: 1 | 2 | 3 | 'done';
  className?: string;
}

const STEPS = [
  { n: 1, label: 'Select Plan' },
  { n: 2, label: 'Connect WhatsApp' },
  { n: 3, label: 'Complete Profile' },
] as const;

export default function OnboardingStepBar({ currentStep, className }: Props) {
  const currentN = currentStep === 'done' ? 4 : currentStep;
  const progressPct = currentStep === 'done' ? 100 : ((currentN - 1) / (STEPS.length - 1)) * 100;

  return (
    <div
      className={cn(
        'relative rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/40 shadow-[0_10px_30px_-15px_rgba(16,185,129,0.35)] p-4 sm:p-5 overflow-hidden',
        className,
      )}
    >
      {/* glow */}
      <div className="pointer-events-none absolute -top-12 -right-12 w-40 h-40 rounded-full bg-emerald-300/20 blur-3xl" />

      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div>
          <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide text-emerald-700">Get started</p>
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            {currentStep === 'done' ? "You're all set 🎉" : `Step ${currentN} of ${STEPS.length}`}
          </h3>
        </div>
        <div className="text-right">
          <p className="text-[10px] sm:text-[11px] text-slate-500">Setup time</p>
          <p className="text-xs sm:text-sm font-bold text-emerald-600">&lt; 10 min</p>
        </div>
      </div>

      {/* Progress line + dots */}
      <div className="relative">
        <div className="absolute left-4 right-4 top-4 h-1 rounded-full bg-emerald-100" />
        <div
          className="absolute left-4 top-4 h-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
          style={{ width: `calc((100% - 2rem) * ${progressPct / 100})` }}
        />
        <div className="relative flex items-start justify-between">
          {STEPS.map((s) => {
            const done = currentStep === 'done' || (typeof currentStep === 'number' && s.n < currentStep);
            const active = typeof currentStep === 'number' && s.n === currentStep;
            const locked = typeof currentStep === 'number' && s.n > currentStep;
            return (
              <div key={s.n} className="flex flex-col items-center gap-1.5 z-10 w-20 sm:w-28">
                <div
                  className={cn(
                    'w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all',
                    done && 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30',
                    active && 'bg-white border-2 border-emerald-500 text-emerald-600 shadow-lg shadow-emerald-500/20 ring-4 ring-emerald-100',
                    locked && 'bg-slate-100 text-slate-400 border border-slate-200',
                  )}
                >
                  {done ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : active ? <Loader2 className="w-4 h-4 animate-spin" /> : locked ? <Lock className="w-3.5 h-3.5" /> : s.n}
                </div>
                <span
                  className={cn(
                    'text-[10px] sm:text-[11px] font-medium text-center leading-tight',
                    done && 'text-emerald-700',
                    active && 'text-slate-900 font-semibold',
                    locked && 'text-slate-400',
                  )}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
