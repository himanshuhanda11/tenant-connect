import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { differenceInMinutes, differenceInSeconds, formatDistanceToNow } from 'date-fns';

interface SLATimerProps {
  firstResponseDue?: string;
  firstResponseAt?: string;
  slaBreached: boolean;
  createdAt: string;
  className?: string;
}

export function SLATimer({
  firstResponseDue,
  firstResponseAt,
  slaBreached,
  createdAt,
  className,
}: SLATimerProps) {
  // If first response already sent
  if (firstResponseAt) {
    const responseTime = differenceInMinutes(new Date(firstResponseAt), new Date(createdAt));
    const metSLA = !slaBreached;

    return (
      <Tooltip>
        <TooltipTrigger>
          <Badge 
            variant="outline" 
            className={`text-xs gap-1 ${
              metSLA 
                ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                : 'bg-red-100 text-red-700 border-red-200'
            } ${className}`}
          >
            {metSLA ? (
              <CheckCircle2 className="w-3 h-3" />
            ) : (
              <AlertTriangle className="w-3 h-3" />
            )}
            {responseTime}m
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          {metSLA 
            ? `First response in ${responseTime}m - SLA met ✓` 
            : `First response in ${responseTime}m - SLA breached`
          }
        </TooltipContent>
      </Tooltip>
    );
  }

  // No SLA due date set
  if (!firstResponseDue) {
    return null;
  }

  const now = new Date();
  const dueDate = new Date(firstResponseDue);
  const totalSeconds = differenceInSeconds(dueDate, now);
  const minutes = Math.floor(Math.abs(totalSeconds) / 60);
  const seconds = Math.abs(totalSeconds) % 60;
  const isOverdue = totalSeconds < 0;

  // Calculate progress for visual indicator
  const startDate = new Date(createdAt);
  const totalDuration = differenceInSeconds(dueDate, startDate);
  const elapsed = differenceInSeconds(now, startDate);
  const progressPercent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

  const getUrgencyLevel = () => {
    if (isOverdue) return 'critical';
    if (totalSeconds < 120) return 'urgent'; // Less than 2 minutes
    if (totalSeconds < 300) return 'warning'; // Less than 5 minutes
    return 'normal';
  };

  const urgency = getUrgencyLevel();

  const urgencyConfig = {
    critical: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', progress: 'bg-red-500' },
    urgent: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', progress: 'bg-orange-500' },
    warning: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', progress: 'bg-amber-500' },
    normal: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', progress: 'bg-blue-500' },
  };

  const config = urgencyConfig[urgency];

  return (
    <Tooltip>
      <TooltipTrigger>
        <div className={`flex items-center gap-1.5 ${className}`}>
          <Badge 
            variant="outline" 
            className={`text-xs gap-1 ${config.bg} ${config.text} ${config.border} ${
              urgency === 'critical' || urgency === 'urgent' ? 'animate-pulse' : ''
            }`}
          >
            <Clock className="w-3 h-3" />
            {isOverdue ? '-' : ''}
            {minutes}:{seconds.toString().padStart(2, '0')}
          </Badge>
          
          {/* Mini progress bar */}
          <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden hidden sm:block">
            <div 
              className={`h-full ${config.progress} transition-all duration-1000`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        {isOverdue 
          ? `SLA breached ${formatDistanceToNow(dueDate, { addSuffix: true })}` 
          : `First response due in ${minutes}m ${seconds}s`
        }
      </TooltipContent>
    </Tooltip>
  );
}
