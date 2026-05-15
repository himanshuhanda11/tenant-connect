import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Users, ShieldAlert, Pause, CheckCircle2, CalendarClock } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAgentAvailability } from '@/hooks/useAgentAvailability';
import { PAUSE_DURATIONS, PAUSE_REASONS, formatCountdown, formatResumeAt } from '@/lib/availability';


export function AgentAvailabilityPill({ compact = false }: { compact?: boolean }) {
  const isMobile = useIsMobile();
  const { status, pauseUntil, loading, pause, resume } = useAgentAvailability();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>('');
  const [customReason, setCustomReason] = useState('');
  const [submitting, setSubmitting] = useState<number | null>(null);
  const [errorModal, setErrorModal] = useState<{ open: boolean; canOverride: boolean; pendingDuration?: number } | null>(null);
  const [overrideModal, setOverrideModal] = useState<{ open: boolean; duration: number } | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (status !== 'paused') return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  if (loading) {
    return <div className="h-8 w-24 rounded-full bg-muted/40 animate-pulse" />;
  }

  const pillLabel = status === 'available' ? 'Pause New Chats' : status === 'paused' ? 'Paused' : 'Offline';
  const isIndefinite = status === 'paused' && !pauseUntil;
  const tooltip = status === 'paused'
    ? (isIndefinite ? 'Paused indefinitely — click to resume' : `Paused · resumes ${formatResumeAt(pauseUntil)}`)
    : status === 'available' ? 'Available — click to pause new chats' : 'Offline';

  const doPause = async (minutes: number, opts: { force?: boolean } = {}) => {
    setSubmitting(minutes);
    const res = await pause({
      durationMinutes: minutes,
      reason: reason || null,
      customReason: reason === 'custom' ? customReason : null,
      force: opts.force,
    });
    setSubmitting(null);
    if (!res.ok) {
      if (res.error === 'last_available_agent') {
        const canOverride = !!(res as any).data?.can_admin_override;
        if (canOverride) {
          setOverrideModal({ open: true, duration: minutes });
        } else {
          setErrorModal({ open: true, canOverride: false });
        }
        return;
      }
      toast({ title: 'Could not pause', description: String(res.error || 'Try again'), variant: 'destructive' });
      return;
    }
    setOpen(false);
    if (minutes === 0) {
      toast({
        title: 'Paused indefinitely',
        description: `You won't receive new chats until you resume. Existing chats remain assigned to you.`,
      });
    } else {
      const until = new Date(Date.now() + minutes * 60_000);
      toast({
        title: 'Paused new chats',
        description: `You won't receive new chats until ${formatResumeAt(until)}. Existing chats remain assigned to you.`,
      });
    }
  };

  const doResume = async () => {
    const res = await resume();
    if (!res.ok) {
      toast({ title: 'Could not resume', description: String(res.error || 'Try again'), variant: 'destructive' });
      return;
    }
    setOpen(false);
    toast({ title: 'You are available', description: 'You can receive new chats again.' });
  };

  const trigger = (
    <button
      type="button"
      onClick={() => setOpen(true)}
      title={tooltip}
      aria-label={tooltip}
      className={cn(
        'group relative inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold tracking-tight transition-all duration-200 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-background',
        // Premium gradient + glow per state
        status === 'available' &&
          'text-white bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-[0_4px_14px_-4px_rgba(16,185,129,0.55)] hover:shadow-[0_6px_18px_-4px_rgba(16,185,129,0.7)] hover:from-emerald-500 hover:to-emerald-700 focus-visible:ring-emerald-400',
        status === 'paused' &&
          'text-white bg-gradient-to-br from-amber-500 to-orange-600 shadow-[0_4px_14px_-4px_rgba(245,158,11,0.55)] hover:shadow-[0_6px_18px_-4px_rgba(245,158,11,0.7)] focus-visible:ring-amber-400',
        status === 'offline' &&
          'text-foreground bg-muted/80 border border-border hover:bg-muted',
        compact && 'px-2.5 py-1'
      )}
    >
      <span className="relative flex h-2 w-2">
        {status === 'available' && (
          <span className="absolute inline-flex h-full w-full rounded-full bg-white/70 opacity-75 animate-ping" />
        )}
        <span className={cn(
          'relative inline-flex h-2 w-2 rounded-full',
          status === 'available' && 'bg-white',
          status === 'paused' && 'bg-white',
          status === 'offline' && 'bg-muted-foreground'
        )} />
      </span>
      {status === 'paused' ? (
        <Pause className="h-3 w-3" />
      ) : null}
      <span>{pillLabel}</span>
      {status === 'paused' && pauseUntil && (
        <span className="hidden sm:inline-flex items-center gap-1 ml-0.5 pl-2 border-l border-white/30 text-[10px] tabular-nums opacity-95">
          {formatCountdown(pauseUntil)}
        </span>
      )}
      {status === 'paused' && !pauseUntil && (
        <span className="hidden sm:inline-flex items-center gap-1 ml-0.5 pl-2 border-l border-white/30 text-[10px] opacity-95">
          Indefinite
        </span>
      )}
    </button>
  );

  const Body = (
    <div className="flex flex-col">
      <div className="px-1 pb-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <span className={cn(
            'inline-flex h-6 w-6 items-center justify-center rounded-full',
            status === 'available' && 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
            status === 'paused' && 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
            status === 'offline' && 'bg-muted text-muted-foreground'
          )}>
            {status === 'paused' ? <Pause className="h-3 w-3" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
          </span>
          <h3 className="text-sm font-semibold">Agent Availability</h3>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Pause new chat assignments without affecting your current conversations.
        </p>
        {status === 'paused' && (
          <div className="mt-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 px-3 py-3 text-xs space-y-2.5">
            <div className="flex items-start gap-2.5">
              <CalendarClock className="h-4 w-4 mt-0.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase tracking-wider font-medium text-amber-700/80 dark:text-amber-300/80">
                  {pauseUntil ? 'Resumes' : 'Status'}
                </div>
                {pauseUntil ? (
                  <>
                    <div className="font-semibold text-sm text-amber-700 dark:text-amber-200 leading-tight">
                      {formatResumeAt(pauseUntil)}
                    </div>
                    <div className="text-[11px] text-amber-700/70 dark:text-amber-300/70 mt-0.5">
                      {new Date(pauseUntil).toLocaleString([], { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </div>
                    <div className="text-[11px] text-amber-700/80 dark:text-amber-300/80 tabular-nums mt-0.5">
                      · {formatCountdown(pauseUntil)} remaining
                    </div>
                  </>
                ) : (
                  <>
                    <div className="font-semibold text-sm text-amber-700 dark:text-amber-200 leading-tight">
                      Paused indefinitely
                    </div>
                    <div className="text-[11px] text-amber-700/70 dark:text-amber-300/70 mt-0.5">
                      You won't receive new chats until you resume manually.
                    </div>
                  </>
                )}
              </div>
            </div>
            <Button size="sm" variant="outline" className="w-full border-amber-500/40 hover:bg-amber-500/10" onClick={doResume}>
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Resume now — accept new chats
            </Button>
          </div>
        )}
      </div>

      <div className="px-1 py-3 space-y-2 max-h-[60vh] overflow-y-auto">
        <div className="grid grid-cols-2 gap-2">
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Reason (optional)" /></SelectTrigger>
            <SelectContent>
              {PAUSE_REASONS.map((r) => (
                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {reason === 'custom' && (
            <Input value={customReason} onChange={(e) => setCustomReason(e.target.value)} placeholder="Custom reason" className="h-9 text-xs" maxLength={200} />
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
          {PAUSE_DURATIONS.filter((d) => d.minutes !== 0).map((d) => (
            <Button
              key={d.minutes}
              variant="outline"
              size="sm"
              disabled={submitting !== null}
              onClick={() => doPause(d.minutes)}
              className="justify-center h-10 text-xs hover:border-amber-500/50 hover:bg-amber-500/5"
            >
              {submitting === d.minutes ? '…' : d.short}
            </Button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={submitting !== null}
          onClick={() => doPause(0)}
          className="w-full justify-center h-10 text-xs mt-2 border-dashed border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 hover:border-amber-500/60"
        >
          <Pause className="h-3.5 w-3.5 mr-1.5" />
          {submitting === 0 ? '…' : 'Pause indefinitely · until I resume'}
        </Button>

        {status === 'available' && (
          <p className="text-[11px] text-muted-foreground pt-2">
            You'll keep all existing chats. Round-robin will skip you for new ones.
          </p>
        )}
      </div>
    </div>
  );

  return (
    <>
      {isMobile ? (
        <>
          {trigger}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto">
              <SheetTitle className="sr-only">Agent Availability</SheetTitle>
              {Body}
            </SheetContent>
          </Sheet>
        </>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>{trigger}</PopoverTrigger>
          <PopoverContent align="end" className="w-[360px] p-3 rounded-2xl shadow-xl">
            <AnimatePresence>
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
                {Body}
              </motion.div>
            </AnimatePresence>
          </PopoverContent>
        </Popover>
      )}

      {/* Last-available agent block */}
      <Dialog open={!!errorModal?.open} onOpenChange={(o) => !o && setErrorModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <DialogTitle>Can't pause right now</DialogTitle>
            </div>
            <DialogDescription>
              You are currently the only available agent for this team. To avoid missing customer chats, at least one agent must stay available.
            </DialogDescription>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">
            Pause becomes available when another team member is available.
          </p>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => { setErrorModal(null); navigate('/team'); }}>
              <Users className="h-4 w-4 mr-2" /> View team availability
            </Button>
            <Button onClick={() => setErrorModal(null)}>Okay, stay available</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin override warning */}
      <Dialog open={!!overrideModal?.open} onOpenChange={(o) => !o && setOverrideModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-500" />
              <DialogTitle>All agents will become unavailable</DialogTitle>
            </div>
            <DialogDescription>
              New chats will go to the Unassigned Queue until an agent becomes available again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setOverrideModal(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={async () => {
                const dur = overrideModal!.duration;
                setOverrideModal(null);
                await doPause(dur, { force: true });
              }}
            >
              Pause Anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AgentAvailabilityPill;
