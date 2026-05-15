import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Pause, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PAUSE_DURATIONS, formatCountdown, formatPausedUntil } from '@/lib/availability';

interface TeamAgent {
  id: string;
  user_id: string;
  display_name: string | null;
  role: string | null;
  is_active: boolean;
  status: string | null;
  availability_status: 'available' | 'paused' | 'offline';
  pause_reason: string | null;
  pause_until: string | null;
  paused_at: string | null;
  last_active_at: string | null;
  last_available_at: string | null;
}

export function TeamAvailabilityPanel() {
  const { currentTenant } = useTenant();
  const { toast } = useToast();
  const [tick, setTick] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['team-availability', currentTenant?.id],
    enabled: !!currentTenant,
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('agent-availability', {
        body: { action: 'list_team' },
      });
      if (error) throw error;
      return (data?.agents || []) as TeamAgent[];
    },
  });

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Realtime
  useEffect(() => {
    if (!currentTenant) return;
    const channel = supabase
      .channel(`team-availability-${currentTenant.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agents', filter: `tenant_id=eq.${currentTenant.id}` }, () => refetch())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [currentTenant, refetch]);

  const forcePause = async (userId: string, minutes: number) => {
    setBusy(userId);
    const { data, error } = await supabase.functions.invoke('agent-availability', {
      body: { action: 'pause', agent_user_id: userId, duration_minutes: minutes, force: true },
    });
    setBusy(null);
    if (error) {
      toast({ title: 'Pause failed', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Agent paused' });
    refetch();
  };

  const forceResume = async (userId: string) => {
    setBusy(userId);
    const { error } = await supabase.functions.invoke('agent-availability', {
      body: { action: 'resume', agent_user_id: userId },
    });
    setBusy(null);
    if (error) {
      toast({ title: 'Resume failed', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Agent resumed' });
    refetch();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Team Availability</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-6 justify-center">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading team…
          </div>
        ) : !data || data.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No team members yet.</p>
        ) : (
          <div className="divide-y divide-border/60">
            {data.map((a) => {
              const isPaused = a.availability_status === 'paused' && a.pause_until && new Date(a.pause_until).getTime() > Date.now();
              return (
                <div key={a.id} className="py-3 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm truncate">{a.display_name || a.user_id.slice(0, 8)}</span>
                      <Badge variant="outline" className="text-[10px] capitalize">{a.role || 'agent'}</Badge>
                      <Badge
                        className={
                          isPaused
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                            : a.availability_status === 'available'
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                            : 'bg-muted text-muted-foreground border-border'
                        }
                      >
                        {isPaused ? 'Paused' : a.availability_status === 'available' ? 'Available' : 'Offline'}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                      {isPaused ? (
                        <>
                          <span>{formatPausedUntil(a.pause_until)}</span>
                          <span className="tabular-nums">{formatCountdown(a.pause_until)} left</span>
                          {a.pause_reason && <span>· {a.pause_reason}</span>}
                        </>
                      ) : a.last_active_at ? (
                        <span>Last seen {new Date(a.last_active_at).toLocaleString()}</span>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isPaused ? (
                      <Button size="sm" variant="outline" disabled={busy === a.user_id} onClick={() => forceResume(a.user_id)}>
                        <Play className="h-3.5 w-3.5 mr-1" /> Resume
                      </Button>
                    ) : (
                      <Select onValueChange={(v) => forcePause(a.user_id, Number(v))} disabled={busy === a.user_id}>
                        <SelectTrigger className="h-8 w-[150px] text-xs">
                          <SelectValue placeholder="Force pause…" />
                        </SelectTrigger>
                        <SelectContent>
                          {PAUSE_DURATIONS.map((d) => (
                            <SelectItem key={d.minutes} value={String(d.minutes)}>{d.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default TeamAvailabilityPanel;
