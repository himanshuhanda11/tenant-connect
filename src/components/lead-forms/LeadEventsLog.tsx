import { useLeadEvents } from '@/hooks/useLeadForms';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, ScrollText, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';

const STATUS_COLORS: Record<string, string> = {
  received: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
  processing: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
  failed: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
  skipped: 'bg-gray-100 text-gray-700 dark:bg-gray-950/30 dark:text-gray-400',
};

export function LeadEventsLog() {
  const { events, loading, refetch } = useLeadEvents();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ScrollText className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Webhook Event Logs</h3>
          <Badge variant="secondary">{events.length}</Badge>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <ScrollText className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="font-semibold text-lg mb-2">No Events Yet</h3>
            <p className="text-muted-foreground text-sm max-w-md">
              Webhook events will appear here when Meta sends lead form submissions.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>Lead ID</TableHead>
                <TableHead>Form</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <>
                  <TableRow key={event.id} className="cursor-pointer" onClick={() => setExpandedId(expandedId === event.id ? null : event.id)}>
                    <TableCell>
                      {expandedId === event.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{event.lead_id?.slice(0, 12) || '—'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{event.form_id?.slice(0, 12) || '—'}</TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[event.status] || ''} variant="secondary">
                        {event.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {event.processing_duration_ms ? `${event.processing_duration_ms}ms` : '—'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-sm text-red-600 max-w-[200px] truncate">
                      {event.error_text || '—'}
                    </TableCell>
                  </TableRow>
                  {expandedId === event.id && (
                    <TableRow key={`${event.id}-detail`}>
                      <TableCell colSpan={7} className="bg-muted/30 p-4">
                        <div className="space-y-2">
                          {event.normalized_data && (
                            <div>
                              <p className="text-xs font-semibold mb-1">Normalized Data</p>
                              <pre className="text-xs bg-background p-2 rounded border overflow-auto max-h-40">
                                {JSON.stringify(event.normalized_data, null, 2)}
                              </pre>
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-semibold mb-1">Raw Payload</p>
                            <pre className="text-xs bg-background p-2 rounded border overflow-auto max-h-40">
                              {JSON.stringify(event.raw_payload, null, 2)}
                            </pre>
                          </div>
                          {event.contact_id && <p className="text-xs text-muted-foreground">Contact: {event.contact_id}</p>}
                          {event.conversation_id && <p className="text-xs text-muted-foreground">Conversation: {event.conversation_id}</p>}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
