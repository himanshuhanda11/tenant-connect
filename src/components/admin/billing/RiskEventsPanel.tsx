import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { ShieldAlert, AlertTriangle, Clock } from 'lucide-react';

export function RiskEventsPanel() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRiskEvents();
  }, []);

  const fetchRiskEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('platform_risk_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (!error && data) setEvents(data);
    setLoading(false);
  };

  const actionBadge = (action: string) => {
    switch (action) {
      case 'payment_failed': return 'destructive';
      case 'workspace_create_attempt': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl shadow-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-destructive" />
            Risk Events & Fraud Detection
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground text-sm">Loading risk events...</div>
          ) : events.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              <ShieldAlert className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
              No suspicious activity detected
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((evt) => (
                  <TableRow key={evt.id}>
                    <TableCell>
                      <Badge variant={actionBadge(evt.action) as any} className="text-[11px]">
                        {evt.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {evt.actor_user_id ? evt.actor_user_id.slice(0, 8) + '...' : '—'}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{evt.ip || '—'}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-48 truncate">
                      {evt.meta ? JSON.stringify(evt.meta).slice(0, 60) : '—'}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(evt.created_at).toLocaleString('en-IN')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
