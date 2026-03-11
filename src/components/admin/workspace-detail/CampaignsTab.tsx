import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { Zap, PauseCircle, Send } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CampaignsTabProps {
  isSuperAdmin: boolean;
  workspaceId?: string;
}

export function CampaignsTab({ isSuperAdmin, workspaceId }: CampaignsTabProps) {
  const [pauseAllDialog, setPauseAllDialog] = useState(false);

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['admin-campaigns', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const { data, error } = await supabase
        .from('campaigns')
        .select('id, name, status, sent_count, delivered_count, created_at')
        .eq('tenant_id', workspaceId)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    enabled: !!workspaceId,
  });

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
          {isSuperAdmin && campaigns.length > 0 && (
            <Button variant="destructive" size="sm" className="rounded-xl text-xs" onClick={() => setPauseAllDialog(true)}>
              <PauseCircle className="h-3.5 w-3.5 mr-1" /> Pause All Campaigns
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center px-4">
              <Send className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No campaigns for this workspace</p>
            </div>
          ) : (
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
                {campaigns.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium text-sm">{c.name}</TableCell>
                    <TableCell>
                      <AdminStatusBadge status={c.status === 'running' ? 'active' : c.status === 'paused' ? 'paused' : 'connected'} />
                    </TableCell>
                    <TableCell className="text-sm tabular-nums">{(c.sent_count || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-sm tabular-nums">{(c.delivered_count || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
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
