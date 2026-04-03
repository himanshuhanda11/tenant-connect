import { useState, forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CRMStatusDropdown } from './CRMStatusDropdown';
import {
  Phone,
  Globe,
  Calendar,
  Clock,
  MapPin,
  Zap,
  Target,
  CalendarClock,
  CheckCircle2,
  XCircle,
  Trash2,
  PhoneCall,
  FileCheck,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { InboxConversation } from '@/types/inbox';
import { CRMStatus, useUpdateCRMStatus } from '@/hooks/useInboxCRM';
import { cn } from '@/lib/utils';

interface InboxCRMOverviewProps {
  conversation: InboxConversation;
  onStatusChanged?: () => void;
}

const LEAD_SCORE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  hot: { label: 'Hot', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
  warm: { label: 'Warm', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  cold: { label: 'Cold', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
};

function getLeadTemp(score: number): 'hot' | 'warm' | 'cold' {
  if (score >= 70) return 'hot';
  if (score >= 40) return 'warm';
  return 'cold';
}

export function InboxCRMOverview({ conversation, onStatusChanged }: InboxCRMOverviewProps) {
  const { updateStatus } = useUpdateCRMStatus();
  const leadTemp = getLeadTemp(conversation.lead_score || 0);
  const tempConfig = LEAD_SCORE_CONFIG[leadTemp];

  const quickActions: { label: string; status: CRMStatus; icon: React.ReactNode; variant?: string }[] = [
    { label: 'Mark Contacted', status: 'contacted', icon: <PhoneCall className="h-3.5 w-3.5" /> },
    { label: 'Set Follow-up', status: 'follow_up_required', icon: <CalendarClock className="h-3.5 w-3.5" /> },
    { label: 'Mark Qualified', status: 'qualified', icon: <Target className="h-3.5 w-3.5" /> },
    { label: 'Mark Converted', status: 'converted', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
    { label: 'Not Interested', status: 'not_interested', icon: <XCircle className="h-3.5 w-3.5" /> },
    { label: 'Mark Junk', status: 'junk', icon: <Trash2 className="h-3.5 w-3.5" />, variant: 'destructive' },
  ];

  return (
    <div className="h-full overflow-auto">
      <div className="p-4 space-y-5">
        {/* Status Section */}
        <div className="space-y-2.5">
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Lead Status
          </h4>
          <CRMStatusDropdown
            conversationId={conversation.id}
            currentStatus={conversation.crm_status || 'new'}
            onStatusChanged={onStatusChanged}
          />
        </div>

        {/* Lead Score */}
        <div className="space-y-2.5">
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Lead Score
          </h4>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  leadTemp === 'hot' && "bg-red-500",
                  leadTemp === 'warm' && "bg-amber-500",
                  leadTemp === 'cold' && "bg-blue-400"
                )}
                style={{ width: `${Math.min(conversation.lead_score || 0, 100)}%` }}
              />
            </div>
            <Badge variant="outline" className={cn("text-[10px] px-2 py-0.5 font-semibold", tempConfig.color, tempConfig.bg)}>
              {tempConfig.label} · {conversation.lead_score || 0}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Key Dates */}
        <div className="space-y-2.5">
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Timeline
          </h4>
          <div className="space-y-2">
            <InfoRow icon={<Calendar className="h-3.5 w-3.5" />} label="Created" value={conversation.created_at ? formatDistanceToNow(new Date(conversation.created_at), { addSuffix: true }) : '—'} />
            <InfoRow icon={<Clock className="h-3.5 w-3.5" />} label="Last Message" value={conversation.last_message_at ? formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true }) : '—'} />
            <InfoRow icon={<PhoneCall className="h-3.5 w-3.5" />} label="Last Contacted" value={conversation.last_contacted_at ? formatDistanceToNow(new Date(conversation.last_contacted_at), { addSuffix: true }) : conversation.last_message_at ? formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true }) : '—'} />
            {conversation.next_followup_at && (
              <InfoRow
                icon={<CalendarClock className="h-3.5 w-3.5" />}
                label="Next Follow-up"
                value={format(new Date(conversation.next_followup_at), 'PPp')}
                highlight={new Date(conversation.next_followup_at) < new Date()}
              />
            )}
          </div>
        </div>

        <Separator />

        {/* Details */}
        <div className="space-y-2.5">
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Details
          </h4>
          <div className="space-y-2">
            <InfoRow icon={<Phone className="h-3.5 w-3.5" />} label="Phone" value={`+${conversation.contact?.wa_id || '—'}`} />
            {conversation.country_interest && (
              <InfoRow icon={<MapPin className="h-3.5 w-3.5" />} label="Country Interest" value={conversation.country_interest} />
            )}
            <InfoRow icon={<Globe className="h-3.5 w-3.5" />} label="Source" value={(conversation.contact?.source || conversation.source)?.replace(/_/g, ' ') || 'Direct'} />
            {conversation.contact?.language && (
              <InfoRow icon={<Globe className="h-3.5 w-3.5" />} label="Language" value={conversation.contact.language.toUpperCase()} />
            )}
          </div>
        </div>

        {conversation.followup_notes && (
          <>
            <Separator />
            <div className="space-y-2.5">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Follow-up Notes
              </h4>
              <p className="text-sm text-foreground/80 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                {conversation.followup_notes}
              </p>
            </div>
          </>
        )}

        {conversation.junk_reason && (
          <>
            <Separator />
            <div className="space-y-2.5">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Junk Reason
              </h4>
              <Badge variant="outline" className="text-xs bg-gray-100 text-gray-600">
                {conversation.junk_reason.replace(/_/g, ' ')}
              </Badge>
            </div>
          </>
        )}

        <Separator />

        {/* Quick Actions */}
        <div className="space-y-2.5">
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Quick Actions
          </h4>
          <div className="grid grid-cols-2 gap-1.5">
            {quickActions.map(action => {
              const isCurrentStatus = conversation.crm_status === action.status;
              return (
                <Button
                  key={action.status}
                  variant={isCurrentStatus ? "default" : action.variant as any || "outline"}
                  size="sm"
                  className={cn(
                    "h-8 text-[11px] justify-start gap-1.5",
                    isCurrentStatus && "ring-2 ring-primary/30"
                  )}
                  onClick={() => {
                    if (action.status !== 'follow_up_required' && action.status !== 'junk') {
                      updateStatus(conversation.id, action.status).then(ok => {
                        if (ok) onStatusChanged?.();
                      });
                    }
                  }}
                  disabled={isCurrentStatus}
                >
                  {action.icon}
                  {isCurrentStatus ? '✓ ' : ''}{action.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

const InfoRow = forwardRef<HTMLDivElement, { icon: React.ReactNode; label: string; value: string; highlight?: boolean }>(
  ({ icon, label, value, highlight }, ref) => (
    <div ref={ref} className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <span className={cn(
        "text-xs text-right max-w-[60%] truncate",
        highlight ? "text-destructive font-medium" : "text-foreground/80"
      )}>
        {value}
      </span>
    </div>
  )
);
InfoRow.displayName = 'InfoRow';
