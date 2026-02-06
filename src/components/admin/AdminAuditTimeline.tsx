import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, Ban, Pause, Play, Settings, Eye, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface AuditLog {
  id: string;
  actor_user_id: string;
  actor_role: string;
  action: string;
  workspace_id: string | null;
  target_table: string | null;
  target_id: string | null;
  note: string | null;
  before_data: any;
  after_data: any;
  created_at: string;
}

interface AdminAuditTimelineProps {
  logs: AuditLog[];
}

const actionIcons: Record<string, React.ElementType> = {
  WORKSPACE_SUSPEND: Ban,
  WORKSPACE_UNSUSPEND: Shield,
  SENDING_PAUSE: Pause,
  SENDING_RESUME: Play,
};

const actionColors: Record<string, string> = {
  WORKSPACE_SUSPEND: 'bg-red-50 text-red-600',
  WORKSPACE_UNSUSPEND: 'bg-emerald-50 text-emerald-600',
  SENDING_PAUSE: 'bg-orange-50 text-orange-600',
  SENDING_RESUME: 'bg-blue-50 text-blue-600',
};

function groupByDay(logs: AuditLog[]): Record<string, AuditLog[]> {
  const groups: Record<string, AuditLog[]> = {};
  logs.forEach(log => {
    const day = new Date(log.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    if (!groups[day]) groups[day] = [];
    groups[day].push(log);
  });
  return groups;
}

export function AdminAuditTimeline({ logs }: AdminAuditTimelineProps) {
  const [diffDialog, setDiffDialog] = useState<AuditLog | null>(null);
  const grouped = groupByDay(logs);

  return (
    <>
      <div className="space-y-6">
        {Object.entries(grouped).map(([day, dayLogs]) => (
          <div key={day}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{day}</p>
            <div className="space-y-2">
              {dayLogs.map(log => {
                const Icon = actionIcons[log.action] || Settings;
                const colorClass = actionColors[log.action] || 'bg-muted text-muted-foreground';
                const hasDiff = log.before_data || log.after_data;

                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border/50 hover:shadow-sm transition-shadow"
                  >
                    <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0', colorClass)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className="text-[11px]">{log.action.replace(/_/g, ' ')}</Badge>
                        <Badge variant="outline" className="text-[10px]">{log.actor_role}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {log.note || 'No note'}
                        <span className="ml-2 opacity-60">
                          {new Date(log.created_at).toLocaleTimeString()}
                        </span>
                      </p>
                    </div>
                    {hasDiff && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7 flex-shrink-0"
                        onClick={() => setDiffDialog(log)}
                      >
                        <Eye className="h-3 w-3 mr-1" /> Diff
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No audit logs found
          </div>
        )}
      </div>

      {/* Diff Dialog */}
      <Dialog open={!!diffDialog} onOpenChange={() => setDiffDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Change Diff
              <Badge variant="secondary" className="text-xs">{diffDialog?.action}</Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-red-500 uppercase">Before</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[10px]"
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(diffDialog?.before_data, null, 2) || '{}');
                    toast({ title: 'Copied' });
                  }}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <ScrollArea className="h-64 rounded-lg bg-muted/50 p-3">
                <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                  {JSON.stringify(diffDialog?.before_data, null, 2) || 'null'}
                </pre>
              </ScrollArea>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-emerald-500 uppercase">After</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[10px]"
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(diffDialog?.after_data, null, 2) || '{}');
                    toast({ title: 'Copied' });
                  }}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <ScrollArea className="h-64 rounded-lg bg-muted/50 p-3">
                <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                  {JSON.stringify(diffDialog?.after_data, null, 2) || 'null'}
                </pre>
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
