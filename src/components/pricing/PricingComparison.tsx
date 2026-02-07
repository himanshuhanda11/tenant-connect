import React from 'react';
import { Check, Lock as LockIcon, Box, Cpu, Eye, TrendingUp, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PricingComparisonProps {
  isAnnual: boolean;
}

const GROUPS = [
  { title: 'Core', icon: Box },
  { title: 'Automation', icon: Cpu },
  { title: 'AI', icon: Eye },
  { title: 'Growth', icon: TrendingUp },
  { title: 'Security & Compliance', icon: Shield },
];

// For each group, define which plans get a check vs locked
// true = check, false = locked
const groupAccess: Record<string, boolean[]> = {
  'Core':                   [true, true, true, true, true, true],
  'Automation':             [true, true, true, true, true, true],
  'AI':                     [true, true, true, true, true, true],
  'Growth':                 [true, false, false, false, false, false],
  'Security & Compliance':  [true, false, false, false, false, false],
};

// Column headers matching reference: no headers visible (just checkmarks)
// The reference shows 6 columns of checkmarks/locked per row

export default function PricingComparison({ isAnnual }: PricingComparisonProps) {
  return (
    <section id="comparison" className="py-10 md:py-14">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Compare plans
          </h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Expand sections to compare. Locked items can be unlocked via add-ons{' '}
            <span className="font-semibold">or</span> higher plans.
          </p>
        </div>

        <div className="max-w-4xl mx-auto rounded-2xl border border-border overflow-hidden bg-card">
          {GROUPS.map((group, gi) => {
            const access = groupAccess[group.title];
            const Icon = group.icon;
            return (
              <div
                key={group.title}
                className={cn(
                  'flex items-center px-5 py-4',
                  gi > 0 && 'border-t border-border'
                )}
              >
                {/* Category label */}
                <div className="flex items-center gap-2.5 w-[200px] flex-shrink-0">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-semibold text-foreground">{group.title}</span>
                </div>

                {/* Checkmarks / Locked */}
                <div className="flex-1 grid grid-cols-6 gap-2">
                  {access.map((ok, ci) => (
                    <div key={ci} className="flex items-center justify-center">
                      {ok ? (
                        <Check className="w-5 h-5 text-primary" />
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <LockIcon className="w-3 h-3" /> Locked
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
