import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, Circle, Gift, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface SetupStep {
  id: string;
  title: string;
  status: 'completed' | 'pending' | 'current';
  href?: string;
}

interface SetupProgressCardProps {
  steps: SetupStep[];
  loading?: boolean;
  creditsReward?: number;
}

export function SetupProgressCard({ steps, loading, creditsReward = 200 }: SetupProgressCardProps) {
  const navigate = useNavigate();
  const completedCount = steps.filter(s => s.status === 'completed').length;
  const totalSteps = steps.length;
  const allCompleted = completedCount === totalSteps;
  const progressPercent = (completedCount / totalSteps) * 100;

  if (loading) {
    return (
      <Card className="border border-border/50 shadow-card rounded-2xl">
        <CardContent className="p-6">
          <Skeleton className="h-6 w-64 mb-4" />
          <Skeleton className="h-2 w-full mb-4" />
          <div className="flex gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 flex-1" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "border shadow-card rounded-2xl overflow-hidden",
      allCompleted
        ? "border-emerald-500/30 bg-emerald-500/5"
        : "border-primary/20 bg-gradient-to-r from-primary/5 via-primary/3 to-transparent"
    )}>
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "h-10 w-10 rounded-xl flex items-center justify-center",
              allCompleted
                ? "bg-emerald-500/15"
                : "bg-primary/10"
            )}>
              <Gift className={cn(
                "h-5 w-5",
                allCompleted ? "text-emerald-600" : "text-primary"
              )} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">
                {allCompleted ? 'All steps completed! 🎉' : `Complete ${totalSteps} steps & earn ${creditsReward} free credits`}
              </h3>
              <p className="text-xs text-muted-foreground">
                {allCompleted
                  ? `You earned ${creditsReward} credits!`
                  : `${completedCount} of ${totalSteps} completed`}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
            {completedCount}/{totalSteps}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-muted rounded-full mb-5 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              allCompleted ? "bg-emerald-500" : "bg-primary"
            )}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Steps */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {steps.map((step, index) => {
            const isCompleted = step.status === 'completed';
            const isCurrent = step.status === 'current';

            return (
              <button
                key={step.id}
                onClick={() => step.href && !isCompleted && navigate(step.href)}
                disabled={isCompleted}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl transition-all text-left",
                  isCompleted && "bg-emerald-500/8 opacity-80",
                  isCurrent && "bg-primary/8 ring-1 ring-primary/20 shadow-sm",
                  !isCompleted && !isCurrent && "bg-muted/50 hover:bg-muted/80 cursor-pointer"
                )}
              >
                <div className={cn(
                  "h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all",
                  isCompleted && "bg-emerald-500 text-white",
                  isCurrent && "bg-primary text-primary-foreground",
                  !isCompleted && !isCurrent && "bg-border text-muted-foreground"
                )}>
                  {isCompleted ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <span className="text-xs font-bold">{index + 1}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className={cn(
                    "text-xs font-medium truncate",
                    isCompleted ? "text-emerald-700 dark:text-emerald-400 line-through" : "text-foreground"
                  )}>
                    {step.title}
                  </p>
                  {isCurrent && (
                    <p className="text-[10px] text-primary font-medium flex items-center gap-0.5 mt-0.5">
                      Start <ArrowRight className="h-2.5 w-2.5" />
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
