import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity } from 'lucide-react';
import type { ConversationHeatmapData } from '@/types/dashboard';
import { cn } from '@/lib/utils';

interface ConversationHeatmapProps {
  data: ConversationHeatmapData[];
  loading?: boolean;
}

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const hours = Array.from({ length: 24 }, (_, i) => i);

export function ConversationHeatmap({ data, loading }: ConversationHeatmapProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  const maxCount = Math.max(...data.map(d => d.count), 1);

  const getIntensity = (count: number) => {
    const ratio = count / maxCount;
    if (ratio === 0) return 'bg-muted';
    if (ratio < 0.25) return 'bg-green-200 dark:bg-green-900';
    if (ratio < 0.5) return 'bg-green-400 dark:bg-green-700';
    if (ratio < 0.75) return 'bg-green-500 dark:bg-green-600';
    return 'bg-green-600 dark:bg-green-500';
  };

  const getCount = (day: number, hour: number) => {
    const item = data.find(d => d.day === day && d.hour === hour);
    return item?.count || 0;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-600" />
          Conversation Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Hour labels */}
            <div className="flex gap-0.5 mb-1 ml-10">
              {hours.filter((_, i) => i % 3 === 0).map((hour) => (
                <div
                  key={hour}
                  className="text-[10px] text-muted-foreground"
                  style={{ width: `${(100 / 8)}%` }}
                >
                  {hour.toString().padStart(2, '0')}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="space-y-0.5">
              {days.map((day, dayIndex) => (
                <div key={day} className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground w-8 shrink-0">{day}</span>
                  <div className="flex gap-0.5 flex-1">
                    {hours.map((hour) => {
                      const count = getCount(dayIndex, hour);
                      return (
                        <div
                          key={`${day}-${hour}`}
                          className={cn(
                            "flex-1 h-4 rounded-sm transition-colors cursor-pointer",
                            getIntensity(count)
                          )}
                          title={`${day} ${hour}:00 - ${count} conversations`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-2 mt-3">
              <span className="text-xs text-muted-foreground">Less</span>
              <div className="flex gap-0.5">
                <div className="w-3 h-3 rounded-sm bg-muted" />
                <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900" />
                <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-700" />
                <div className="w-3 h-3 rounded-sm bg-green-500 dark:bg-green-600" />
                <div className="w-3 h-3 rounded-sm bg-green-600 dark:bg-green-500" />
              </div>
              <span className="text-xs text-muted-foreground">More</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
