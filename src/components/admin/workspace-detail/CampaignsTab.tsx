import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { Zap, PauseCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const MOCK_CAMPAIGNS = [
  { id: '1', name: 'Summer Sale 2025', status: 'active', sent: 12400, delivered: 11800, created_at: new Date().toISOString() },
  { id: '2', name: 'Onboarding Drip', status: 'paused', sent: 3200, delivered: 3100, created_at: new Date().toISOString() },
  { id: '3', name: 'Re-engagement', status: 'completed', sent: 8900, delivered: 8500, created_at: new Date().toISOString() },
];

interface CampaignsTabProps {
  isSuperAdmin: boolean;
}

export function CampaignsTab({ isSuperAdmin }: CampaignsTabProps) {
  const [pauseAllDialog, setPauseAllDialog] = useState(false);

  return (
    <>
      <Card className="rounded-2xl shadow-sm border-border/50">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-orange-50 flex items-center justify-center">
              <Zap className="h-3.5 w-3.5 text-orange-600" />
            </div>
            Campaigns
          </CardTitle>
          {isSuperAdmin && (
            <Button variant="destructive" size="sm" className="rounded-xl text-xs" onClick={() => setPauseAllDialog(true)}>
              <PauseCircle className="h-3.5 w-3.5 mr-1" /> Pause All Campaigns
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Delivered</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_CAMPAIGNS.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium text-sm">{c.name}</TableCell>
                  <TableCell>
                    <AdminStatusBadge status={c.status === 'active' ? 'active' : c.status === 'paused' ? 'paused' : 'connected'} />
                  </TableCell>
                  <TableCell className="text-sm tabular-nums">{c.sent.toLocaleString()}</TableCell>
                  <TableCell className="text-sm tabular-nums">{c.delivered.toLocaleString()}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={pauseAllDialog} onOpenChange={setPauseAllDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pause All Campaigns?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">This will immediately pause all active campaigns for this workspace. Users will be notified.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPauseAllDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { setPauseAllDialog(false); toast({ title: 'All campaigns paused' }); }}>
              Pause All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
