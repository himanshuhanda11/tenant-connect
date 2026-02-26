import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CRMStatus, CRM_STATUS_CONFIG, JUNK_REASONS, useUpdateCRMStatus } from '@/hooks/useInboxCRM';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface CRMStatusDropdownProps {
  conversationId: string;
  currentStatus: string;
  onStatusChanged?: () => void;
}

export function CRMStatusDropdown({ conversationId, currentStatus, onStatusChanged }: CRMStatusDropdownProps) {
  const { updateStatus } = useUpdateCRMStatus();
  const [followupDialog, setFollowupDialog] = useState(false);
  const [junkDialog, setJunkDialog] = useState(false);
  const [followupDate, setFollowupDate] = useState<Date>();
  const [followupNotes, setFollowupNotes] = useState('');
  const [junkReason, setJunkReason] = useState('');
  const [pendingStatus, setPendingStatus] = useState<CRMStatus | null>(null);

  const handleStatusChange = async (newStatus: string) => {
    const status = newStatus as CRMStatus;
    
    if (status === 'follow_up_required' || status === 'call_scheduled') {
      setPendingStatus(status);
      setFollowupDialog(true);
      return;
    }

    if (status === 'junk') {
      setPendingStatus(status);
      setJunkDialog(true);
      return;
    }

    const ok = await updateStatus(conversationId, status);
    if (ok) onStatusChanged?.();
  };

  const handleFollowupConfirm = async () => {
    if (!pendingStatus || !followupDate) return;
    const ok = await updateStatus(conversationId, pendingStatus, {
      followupAt: followupDate.toISOString(),
      followupNotes,
    });
    if (ok) {
      setFollowupDialog(false);
      setFollowupDate(undefined);
      setFollowupNotes('');
      setPendingStatus(null);
      onStatusChanged?.();
    }
  };

  const handleJunkConfirm = async () => {
    if (!junkReason) return;
    const ok = await updateStatus(conversationId, 'junk', { junkReason });
    if (ok) {
      setJunkDialog(false);
      setJunkReason('');
      setPendingStatus(null);
      onStatusChanged?.();
    }
  };

  const config = CRM_STATUS_CONFIG[currentStatus as CRMStatus] || CRM_STATUS_CONFIG.new;

  return (
    <>
      <Select value={currentStatus} onValueChange={handleStatusChange}>
        <SelectTrigger className={cn("h-8 text-xs font-medium border", config.bgColor, config.color, "w-[180px]")}>
          <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5", config.dotColor)} />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(CRM_STATUS_CONFIG).map(([key, cfg]) => (
            <SelectItem key={key} value={key} className="text-xs">
              <span className="flex items-center gap-2">
                <span className={cn("w-2 h-2 rounded-full", cfg.dotColor)} />
                {cfg.label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Follow-up Dialog */}
      <Dialog open={followupDialog} onOpenChange={setFollowupDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Follow-up</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-medium">Follow-up Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal mt-1", !followupDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {followupDate ? format(followupDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={followupDate}
                    onSelect={setFollowupDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label className="text-xs font-medium">Notes</Label>
              <Textarea
                placeholder="Add follow-up notes..."
                value={followupNotes}
                onChange={e => setFollowupNotes(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFollowupDialog(false)}>Cancel</Button>
            <Button onClick={handleFollowupConfirm} disabled={!followupDate}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Junk Dialog */}
      <Dialog open={junkDialog} onOpenChange={setJunkDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mark as Junk</DialogTitle>
          </DialogHeader>
          <div>
            <Label className="text-xs font-medium">Reason</Label>
            <RadioGroup value={junkReason} onValueChange={setJunkReason} className="mt-2 space-y-2">
              {JUNK_REASONS.map(r => (
                <div key={r.value} className="flex items-center gap-2">
                  <RadioGroupItem value={r.value} id={r.value} />
                  <Label htmlFor={r.value} className="text-sm font-normal cursor-pointer">{r.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setJunkDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleJunkConfirm} disabled={!junkReason}>Mark as Junk</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
