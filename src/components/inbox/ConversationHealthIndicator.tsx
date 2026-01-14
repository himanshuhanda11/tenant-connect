import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

export type ConversationHealth = 'good' | 'warning' | 'critical';

interface ConversationHealthIndicatorProps {
  health: ConversationHealth;
  reason?: string;
  className?: string;
}

const HEALTH_CONFIG: Record<ConversationHealth, {
  icon: React.ElementType;
  label: string;
  color: string;
  bg: string;
  border: string;
}> = {
  good: {
    icon: CheckCircle2,
    label: 'Healthy',
    color: 'text-emerald-600',
    bg: 'bg-emerald-100',
    border: 'border-emerald-200',
  },
  warning: {
    icon: AlertCircle,
    label: 'At Risk',
    color: 'text-amber-600',
    bg: 'bg-amber-100',
    border: 'border-amber-200',
  },
  critical: {
    icon: XCircle,
    label: 'Critical',
    color: 'text-red-600',
    bg: 'bg-red-100',
    border: 'border-red-200',
  },
};

export function ConversationHealthIndicator({
  health,
  reason,
  className,
}: ConversationHealthIndicatorProps) {
  const config = HEALTH_CONFIG[health];
  const Icon = config.icon;

  return (
    <Tooltip>
      <TooltipTrigger>
        <Badge 
          variant="outline" 
          className={`text-xs gap-1 ${config.color} ${config.bg} ${config.border} ${className}`}
        >
          <Icon className="w-3 h-3" />
          {config.label}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        {reason || `Conversation health: ${config.label}`}
      </TooltipContent>
    </Tooltip>
  );
}

// Simple visual indicator (circle only)
export function HealthDot({ health, className }: { health: ConversationHealth; className?: string }) {
  const colors: Record<ConversationHealth, string> = {
    good: 'bg-emerald-500',
    warning: 'bg-amber-500',
    critical: 'bg-red-500',
  };

  return (
    <Tooltip>
      <TooltipTrigger>
        <span 
          className={`inline-block w-2 h-2 rounded-full ${colors[health]} ${
            health === 'critical' ? 'animate-pulse' : ''
          } ${className}`}
        />
      </TooltipTrigger>
      <TooltipContent>
        Conversation health: {HEALTH_CONFIG[health].label}
      </TooltipContent>
    </Tooltip>
  );
}
