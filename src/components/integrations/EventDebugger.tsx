import React, { useState } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import {
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Search,
  Filter,
  RotateCcw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { IntegrationEvent } from '@/types/integration';

interface EventDebuggerProps {
  events: IntegrationEvent[];
  isLoading: boolean;
  onRetry: (eventId: string) => void;
  onRefresh: () => void;
}

const STATUS_CONFIG = {
  received: { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  processing: { icon: RefreshCw, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  processed: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
  failed: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
};

export function EventDebugger({ events, isLoading, onRetry, onRefresh }: EventDebuggerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());

  const filteredEvents = events.filter(event => {
    if (statusFilter !== 'all' && event.status !== statusFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        event.event_type.toLowerCase().includes(query) ||
        event.event_id?.toLowerCase().includes(query) ||
        JSON.stringify(event.payload).toLowerCase().includes(query)
      );
    }
    return true;
  });

  const toggleExpand = (eventId: string) => {
    const updated = new Set(expandedEvents);
    if (updated.has(eventId)) {
      updated.delete(eventId);
    } else {
      updated.add(eventId);
    }
    setExpandedEvents(updated);
  };

  const statusCounts = events.reduce((acc, e) => {
    acc[e.status] = (acc[e.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Event Debugger
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Event Debugger
            </CardTitle>
            <CardDescription>
              Last 20 webhook events received
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 mt-4">
          {Object.entries(statusCounts).map(([status, count]) => {
            const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
            return (
              <Badge key={status} variant="outline" className={cn("gap-1", config?.bg)}>
                <span className={config?.color}>{count}</span>
                <span className="text-muted-foreground">{status}</span>
              </Badge>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="received">Received</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="processed">Processed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Events List */}
        <ScrollArea className="h-[400px]">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No events found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredEvents.map((event) => {
                const config = STATUS_CONFIG[event.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.received;
                const StatusIcon = config.icon;
                const isExpanded = expandedEvents.has(event.id);

                return (
                  <Collapsible
                    key={event.id}
                    open={isExpanded}
                    onOpenChange={() => toggleExpand(event.id)}
                  >
                    <div className={cn(
                      "border rounded-lg transition-colors",
                      event.status === 'failed' && "border-red-500/30 bg-red-500/5"
                    )}>
                      <CollapsibleTrigger asChild>
                        <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted/50 rounded-lg">
                          <div className={cn("p-1.5 rounded-full", config.bg)}>
                            <StatusIcon className={cn("w-4 h-4", config.color)} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <code className="text-sm font-medium truncate">
                                {event.event_type}
                              </code>
                              <Badge variant="outline" className="text-xs capitalize">
                                {event.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                              <span>{formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}</span>
                              {event.event_id && (
                                <span className="truncate max-w-[150px]">ID: {event.event_id}</span>
                              )}
                            </div>
                          </div>

                          {event.status === 'failed' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onRetry(event.id);
                              }}
                              className="text-xs"
                            >
                              <RotateCcw className="w-3 h-3 mr-1" />
                              Retry
                            </Button>
                          )}

                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          )}
                        </button>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <div className="px-3 pb-3 pt-0 space-y-3">
                          {/* Error Message */}
                          {event.error_message && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                              <div className="flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium text-red-600">Error</p>
                                  <p className="text-xs text-red-500">{event.error_message}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Timestamps */}
                          <div className="grid grid-cols-3 gap-4 text-xs">
                            <div>
                              <p className="text-muted-foreground mb-0.5">Received</p>
                              <p className="font-mono">{format(new Date(event.created_at), 'HH:mm:ss')}</p>
                            </div>
                            {event.processing_started_at && (
                              <div>
                                <p className="text-muted-foreground mb-0.5">Started</p>
                                <p className="font-mono">{format(new Date(event.processing_started_at), 'HH:mm:ss')}</p>
                              </div>
                            )}
                            {event.processed_at && (
                              <div>
                                <p className="text-muted-foreground mb-0.5">Completed</p>
                                <p className="font-mono">{format(new Date(event.processed_at), 'HH:mm:ss')}</p>
                              </div>
                            )}
                          </div>

                          {/* Payload */}
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Payload</p>
                            <pre className="p-3 rounded-lg bg-slate-900 text-slate-100 text-xs overflow-x-auto max-h-48">
                              {JSON.stringify(event.payload, null, 2)}
                            </pre>
                          </div>

                          {/* Retry Info */}
                          {event.retry_count > 0 && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <RefreshCw className="w-3 h-3" />
                              <span>Retry attempt: {event.retry_count}</span>
                              {event.next_retry_at && (
                                <span>• Next retry: {format(new Date(event.next_retry_at), 'HH:mm:ss')}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
