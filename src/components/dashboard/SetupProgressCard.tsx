import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, Clock, AlertCircle, Trophy, Sparkles, ArrowRight } from 'lucide-react';
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
  const allCompleted = completedCount === steps.length;

  if (loading) {
    return (
      <Card className="border-0 shadow-soft bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
        <CardContent className="p-6">
          <Skeleton className="h-6 w-64 mb-4" />
          <div className="flex gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-32" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-soft bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-yellow-950/30 overflow-hidden">
      <CardContent className="p-0">
        <div className="p-5 flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Left: Trophy icon + text */}
          <div className="flex items-center gap-4 lg:min-w-[320px]">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-base">
                {allCompleted ? 'Setup Complete! 🎉' : `Complete the steps & win ${creditsReward} Credits`}
              </h3>
              <p className="text-sm text-muted-foreground">
                {allCompleted
                  ? 'You\'re all set to start messaging'
                  : `${steps.length - completedCount} steps left to complete`}
              </p>
            </div>
          </div>

          {/* Right: Steps */}
          <div className="flex-1 flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                {/* Step */}
                <button
                  onClick={() => step.href && step.status !== 'completed' && navigate(step.href)}
                  disabled={step.status === 'completed'}
                  className={cn(
                    "flex flex-col items-center min-w-[100px] p-3 rounded-xl transition-all",
                    step.status === 'completed' && "opacity-80",
                    step.status === 'current' && "bg-white/60 dark:bg-white/10 shadow-sm",
                    step.status === 'pending' && "hover:bg-white/40 dark:hover:bg-white/5 cursor-pointer"
                  )}
                >
                  <div
                    className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center mb-2 transition-all",
                      step.status === 'completed' && "bg-success text-success-foreground",
                      step.status === 'current' && "bg-warning text-warning-foreground animate-pulse",
                      step.status === 'pending' && "bg-muted text-muted-foreground"
                    )}
                  >
                    {step.status === 'completed' ? (
                      <Check className="h-4 w-4" />
                    ) : step.status === 'current' ? (
                      <AlertCircle className="h-4 w-4" />
                    ) : (
                      <Clock className="h-4 w-4" />
                    )}
                  </div>
                  <span className="text-xs text-center font-medium text-foreground/80">
                    Step {index + 1}
                  </span>
                  <span
                    className={cn(
                      "text-xs text-center",
                      step.status === 'current' ? 'text-warning font-semibold' : 'text-muted-foreground'
                    )}
                  >
                    {step.title}
                  </span>
                </button>

                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 w-6 lg:w-10 flex-shrink-0",
                      steps[index + 1].status === 'completed' || step.status === 'completed'
                        ? "bg-success"
                        : "bg-border"
                    )}
                  />
                )}
              </React.Fragment>
            ))}

            {/* Reward */}
            <div className="flex flex-col items-center min-w-[80px] p-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center mb-2 shadow-lg">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-xs text-center font-semibold text-amber-600 dark:text-amber-400">
                {creditsReward} Credits
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
