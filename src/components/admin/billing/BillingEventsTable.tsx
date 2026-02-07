import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

export function BillingEventsTable() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('platform_billing_events')
      .select('*')
      .order('occurred_at', { ascending: false })
      .limit(100);

    if (!error && data) setEvents(data);
    setLoading(false);
  };

  const eventBadge = (type: string) => {
    if (type.includes('succeeded') || type.includes('paid')) return 'default';
    if (type.includes('failed')) return 'destructive';
    if (type.includes('refund')) return 'secondary';
    return 'outline';
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);

  return (
    <Card className="rounded-2xl shadow-sm border-border/50">
      <CardContent className="p-0">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Loading billing events...</div>
        ) : events.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">No billing events recorded yet</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((evt) => (
                <TableRow key={evt.id}>
                  <TableCell>
                    <Badge variant={eventBadge(evt.event_type) as any} className="text-[11px]">
                      {evt.event_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[11px]">{evt.provider}</Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {formatCurrency(evt.amount)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{evt.status}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(evt.occurred_at).toLocaleString('en-IN')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
