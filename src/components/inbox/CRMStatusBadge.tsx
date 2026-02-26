import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CRMStatus, CRM_STATUS_CONFIG } from '@/hooks/useInboxCRM';
import { cn } from '@/lib/utils';

interface CRMStatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
  className?: string;
  agentName?: string;
}

export function CRMStatusBadge({ status, size = 'sm', className, agentName }: CRMStatusBadgeProps) {
  const config = CRM_STATUS_CONFIG[status as CRMStatus] || CRM_STATUS_CONFIG.new;
  
  // For "assigned" status, append agent name if available
  const displayLabel = status === 'assigned' && agentName
    ? `Assigned by ${agentName}`
    : config.label;
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "font-medium border",
        config.bgColor,
        config.color,
        size === 'sm' ? 'text-[10px] px-1.5 py-0' : 'text-xs px-2 py-0.5',
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5 inline-block flex-shrink-0", config.dotColor)} />
      <span className="truncate max-w-[120px]">{displayLabel}</span>
    </Badge>
  );
}
