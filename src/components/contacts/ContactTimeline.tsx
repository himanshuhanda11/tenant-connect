import { ContactTimelineEvent } from '@/types/contact';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Tag,
  UserCheck,
  Settings,
  Bot,
  FileText,
  RefreshCw,
  ArrowRight,
  User,
  Clock
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface ContactTimelineProps {
  events: ContactTimelineEvent[];
  loading: boolean;
}

const EVENT_ICONS: Record<string, React.ReactNode> = {
  message: <MessageSquare className="h-4 w-4" />,
  status_change: <RefreshCw className="h-4 w-4" />,
  intervention: <UserCheck className="h-4 w-4" />,
  tag_added: <Tag className="h-4 w-4" />,
  tag_removed: <Tag className="h-4 w-4" />,
  attribute_update: <Settings className="h-4 w-4" />,
  agent_assigned: <User className="h-4 w-4" />,
  note_added: <FileText className="h-4 w-4" />,
};

const EVENT_COLORS: Record<string, string> = {
  message: 'bg-blue-100 text-blue-600',
  status_change: 'bg-purple-100 text-purple-600',
  intervention: 'bg-orange-100 text-orange-600',
  tag_added: 'bg-green-100 text-green-600',
  tag_removed: 'bg-red-100 text-red-600',
  attribute_update: 'bg-gray-100 text-gray-600',
  agent_assigned: 'bg-indigo-100 text-indigo-600',
  note_added: 'bg-yellow-100 text-yellow-600',
};

const ACTOR_TYPE_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  user: { label: 'User', icon: <User className="h-3 w-3" /> },
  system: { label: 'System', icon: <RefreshCw className="h-3 w-3" /> },
  bot: { label: 'Bot', icon: <Bot className="h-3 w-3" /> },
  automation: { label: 'Automation', icon: <Settings className="h-3 w-3" /> },
};

function getEventDescription(event: ContactTimelineEvent): string {
  const data = event.event_data as Record<string, unknown>;
  
  switch (event.event_type) {
    case 'message':
      return data.direction === 'inbound' 
        ? 'Received a message' 
        : 'Sent a message';
    case 'status_change':
      return `Status changed from "${data.old_status || 'unknown'}" to "${data.new_status || 'unknown'}"`;
    case 'intervention':
      return 'Human agent took over from bot';
    case 'tag_added':
      return `Tag added: ${data.tag_name || 'Unknown tag'}`;
    case 'tag_removed':
      return `Tag removed: ${data.tag_name || 'Unknown tag'}`;
    case 'attribute_update':
      const updates = data.updates as Record<string, unknown>;
      if (updates) {
        const keys = Object.keys(updates).slice(0, 2);
        const summary = keys.map(k => k.replace(/_/g, ' ')).join(', ');
        return `Updated: ${summary}${Object.keys(updates).length > 2 ? ` (+${Object.keys(updates).length - 2} more)` : ''}`;
      }
      return 'Contact details updated';
    case 'agent_assigned':
      return data.agent_id 
        ? 'Agent assigned to contact' 
        : 'Agent unassigned from contact';
    case 'note_added':
      return 'Internal note added';
    default:
      return 'Activity recorded';
  }
}

export function ContactTimeline({ events, loading }: ContactTimelineProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <Clock className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-sm">No activity yet</p>
        <p className="text-muted-foreground text-xs mt-1">
          Activity will appear here as you interact with this contact
        </p>
      </div>
    );
  }

  // Group events by date
  const groupedEvents = events.reduce((acc, event) => {
    const date = format(new Date(event.created_at), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {} as Record<string, ContactTimelineEvent[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedEvents).map(([date, dateEvents]) => (
        <div key={date}>
          <div className="sticky top-0 bg-background py-2 z-10">
            <Badge variant="outline" className="text-xs font-normal">
              {format(new Date(date), 'EEEE, MMMM d, yyyy')}
            </Badge>
          </div>
          <div className="space-y-4 mt-3">
            {dateEvents.map((event, index) => (
              <div key={event.id} className="flex gap-3 group">
                {/* Icon */}
                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${EVENT_COLORS[event.event_type] || 'bg-gray-100 text-gray-600'}`}>
                  {EVENT_ICONS[event.event_type] || <RefreshCw className="h-4 w-4" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">
                        {getEventDescription(event)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {event.actor && (
                          <span className="text-xs text-muted-foreground">
                            by {event.actor.full_name || event.actor.email}
                          </span>
                        )}
                        {!event.actor && event.actor_type && (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            {ACTOR_TYPE_LABELS[event.actor_type]?.icon}
                            {ACTOR_TYPE_LABELS[event.actor_type]?.label || event.actor_type}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {format(new Date(event.created_at), 'h:mm a')}
                    </span>
                  </div>

                  {/* Event Details */}
                  {event.event_type === 'attribute_update' && event.event_data && (
                    <div className="mt-2 p-2 rounded bg-muted/50 text-xs">
                      {Object.entries((event.event_data as Record<string, Record<string, unknown>>).updates || {}).slice(0, 5).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-1">
                          <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}:</span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
