import { Contact, LEAD_STATUS_OPTIONS } from '@/types/contact';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Check, Circle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';

interface LifecycleTrackerProps {
  contact: Contact;
  onStageChange?: (stage: Contact['lead_status']) => void;
}

const LIFECYCLE_STAGES: { value: Contact['lead_status']; label: string; description: string }[] = [
  { value: 'new', label: 'New', description: 'First contact made' },
  { value: 'contacted', label: 'Contacted', description: 'Initial outreach completed' },
  { value: 'qualified', label: 'Qualified', description: 'Lead qualifies for product/service' },
  { value: 'proposal', label: 'Proposal', description: 'Proposal or quote sent' },
  { value: 'negotiation', label: 'Negotiation', description: 'Active deal negotiation' },
  { value: 'won', label: 'Won', description: 'Deal closed successfully' },
];

export function LifecycleTracker({ contact, onStageChange }: LifecycleTrackerProps) {
  const currentStageIndex = LIFECYCLE_STAGES.findIndex(s => s.value === contact.lead_status);
  const isLost = contact.lead_status === 'lost';

  // Calculate time in current stage (mock - would need historical data)
  const timeInStage = contact.updated_at 
    ? formatDistanceToNow(new Date(contact.updated_at), { addSuffix: false })
    : 'Unknown';

  return (
    <div className="space-y-4">
      {/* Stage Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">Lifecycle Stage</h4>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={LEAD_STATUS_OPTIONS.find(s => s.value === contact.lead_status)?.color}>
              {LEAD_STATUS_OPTIONS.find(s => s.value === contact.lead_status)?.label}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {timeInStage} in this stage
            </span>
          </div>
        </div>
      </div>

      {/* Lost State */}
      {isLost && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <div className="flex items-center gap-2 text-red-700">
            <span className="font-medium">Deal Lost</span>
          </div>
          {contact.closed_reason && (
            <p className="text-sm text-red-600 mt-1">
              Reason: {contact.closed_reason}
            </p>
          )}
          {contact.closure_time && (
            <p className="text-xs text-red-500 mt-1">
              Closed on {format(new Date(contact.closure_time), 'PPP')}
            </p>
          )}
        </div>
      )}

      {/* Stage Pipeline */}
      {!isLost && (
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-4 left-4 right-4 h-0.5 bg-muted" />
          <div 
            className="absolute top-4 left-4 h-0.5 bg-primary transition-all duration-500"
            style={{ 
              width: `calc(${(currentStageIndex / (LIFECYCLE_STAGES.length - 1)) * 100}% - 32px)` 
            }}
          />

          {/* Stage Nodes */}
          <div className="relative flex justify-between">
            <TooltipProvider>
              {LIFECYCLE_STAGES.map((stage, index) => {
                const isPast = index < currentStageIndex;
                const isCurrent = index === currentStageIndex;
                const isFuture = index > currentStageIndex;

                return (
                  <Tooltip key={stage.value}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => onStageChange?.(stage.value)}
                        disabled={!onStageChange}
                        className={cn(
                          "relative flex flex-col items-center gap-2 group",
                          onStageChange && "cursor-pointer"
                        )}
                      >
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 z-10",
                            isPast && "bg-primary text-primary-foreground",
                            isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                            isFuture && "bg-muted text-muted-foreground border-2 border-muted-foreground/30",
                            onStageChange && isFuture && "group-hover:border-primary/50"
                          )}
                        >
                          {isPast ? (
                            <Check className="h-4 w-4" />
                          ) : isCurrent ? (
                            <Circle className="h-3 w-3 fill-current" />
                          ) : (
                            <Circle className="h-3 w-3" />
                          )}
                        </div>
                        <span
                          className={cn(
                            "text-[10px] font-medium text-center max-w-[60px] leading-tight",
                            isCurrent && "text-primary",
                            isFuture && "text-muted-foreground"
                          )}
                        >
                          {stage.label}
                        </span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p className="font-medium">{stage.label}</p>
                      <p className="text-xs text-muted-foreground">{stage.description}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </TooltipProvider>
          </div>
        </div>
      )}

      {/* Stage Actions */}
      {!isLost && currentStageIndex < LIFECYCLE_STAGES.length - 1 && onStageChange && (
        <div className="flex items-center justify-center pt-2">
          <button
            onClick={() => onStageChange(LIFECYCLE_STAGES[currentStageIndex + 1].value)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
          >
            Move to {LIFECYCLE_STAGES[currentStageIndex + 1].label}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
