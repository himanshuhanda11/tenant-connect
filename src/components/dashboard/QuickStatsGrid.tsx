import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Users,
  Zap,
  Send,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickStat {
  id: string;
  label: string;
  value: string | number;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: 'messages' | 'contacts' | 'automations' | 'campaigns' | 'response' | 'resolved';
  href?: string;
  color: 'primary' | 'blue' | 'purple' | 'orange' | 'pink' | 'cyan';
}

interface QuickStatsGridProps {
  stats: QuickStat[];
  loading?: boolean;
}

const iconMap = {
  messages: MessageSquare,
  contacts: Users,
  automations: Zap,
  campaigns: Send,
  response: Clock,
  resolved: CheckCircle,
};

const colorMap = {
  primary: {
    bg: 'bg-primary/10',
    text: 'text-primary',
    border: 'border-primary/20',
    gradient: 'from-primary/20 to-primary/5',
  },
  blue: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/20',
    gradient: 'from-blue-500/20 to-blue-500/5',
  },
  purple: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-500/20',
    gradient: 'from-purple-500/20 to-purple-500/5',
  },
  orange: {
    bg: 'bg-orange-500/10',
    text: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-500/20',
    gradient: 'from-orange-500/20 to-orange-500/5',
  },
  pink: {
    bg: 'bg-pink-500/10',
    text: 'text-pink-600 dark:text-pink-400',
    border: 'border-pink-500/20',
    gradient: 'from-pink-500/20 to-pink-500/5',
  },
  cyan: {
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-600 dark:text-cyan-400',
    border: 'border-cyan-500/20',
    gradient: 'from-cyan-500/20 to-cyan-500/5',
  },
};

export function QuickStatsGrid({ stats, loading }: QuickStatsGridProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="border-0 shadow-soft">
            <CardContent className="p-3 sm:p-4">
              <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl mb-2 sm:mb-3" />
              <Skeleton className="h-6 w-12 sm:h-7 sm:w-16 mb-1" />
              <Skeleton className="h-3 w-16 sm:h-4 sm:w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {stats.map((stat) => {
        const Icon = iconMap[stat.icon];
        const colors = colorMap[stat.color];
        const TrendIcon =
          stat.changeType === 'positive'
            ? TrendingUp
            : stat.changeType === 'negative'
            ? TrendingDown
            : Minus;

        return (
          <Card
            key={stat.id}
            onClick={() => stat.href && navigate(stat.href)}
            className={cn(
              "border-0 shadow-soft bg-gradient-to-br transition-all duration-200 hover:shadow-lg group",
              colors.gradient,
              stat.href && "cursor-pointer hover:scale-[1.02]"
            )}
          >
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className={cn("h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl flex items-center justify-center", colors.bg)}>
                  <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5", colors.text)} />
                </div>
                {stat.change !== undefined && (
                  <div
                    className={cn(
                      "flex items-center gap-0.5 text-[10px] sm:text-xs font-medium",
                      stat.changeType === 'positive' && "text-success",
                      stat.changeType === 'negative' && "text-destructive",
                      stat.changeType === 'neutral' && "text-muted-foreground"
                    )}
                  >
                    <TrendIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    {stat.change > 0 ? '+' : ''}{stat.change}%
                  </div>
                )}
              </div>
              <p className="text-lg sm:text-2xl font-bold text-foreground mb-0.5">{stat.value}</p>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">{stat.label}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
