import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import dashboardGoals from '@/assets/dashboard-goals.png';

interface Goal {
  label: string;
  current: number;
  target: number;
  color: string;
}

interface GoalsCardProps {
  messagesReceived: number;
  contacts7d: number;
  campaignsSent: number;
  automationRuns: number;
  loading?: boolean;
}

export function GoalsCard({ messagesReceived, contacts7d, campaignsSent, automationRuns, loading }: GoalsCardProps) {
  if (loading) {
    return (
      <Card className="border border-border/20 shadow-soft rounded-2xl backdrop-blur-sm bg-card/80">
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-6 w-40" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-full rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const goals: Goal[] = [
    { label: 'Daily Messages', current: messagesReceived, target: 100, color: 'bg-primary' },
    { label: 'New Contacts (7d)', current: contacts7d, target: 50, color: 'bg-emerald-500' },
    { label: 'Campaigns Sent', current: campaignsSent, target: 10, color: 'bg-amber-500' },
    { label: 'Automation Runs', current: automationRuns, target: 200, color: 'bg-violet-500' },
  ];

  return (
    <Card className="border border-border/20 shadow-soft rounded-2xl backdrop-blur-sm bg-card/80 hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <img src={dashboardGoals} alt="Goals" className="h-12 w-12 object-contain" loading="lazy" />
          <div>
            <CardTitle className="text-base font-semibold text-foreground">Monthly Goals</CardTitle>
            <p className="text-xs text-muted-foreground">Track your progress</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.map((goal) => {
          const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
          return (
            <div key={goal.label} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{goal.label}</span>
                <span className="text-xs text-muted-foreground font-semibold">
                  {goal.current}/{goal.target}
                </span>
              </div>
              <div className="h-2.5 bg-muted/60 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${goal.color}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
