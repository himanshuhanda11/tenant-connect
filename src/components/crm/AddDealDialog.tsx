import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { PipelineStage, DealPriority } from '@/types/crm';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  stages: PipelineStage[];
  defaultStageId?: string | null;
  pipelineId: string;
  onCreate: (input: any) => Promise<any>;
}

export function AddDealDialog({ open, onOpenChange, stages, defaultStageId, pipelineId, onCreate }: Props) {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [value, setValue] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [stageId, setStageId] = useState<string>(defaultStageId || stages[0]?.id || '');
  const [priority, setPriority] = useState<DealPriority>('normal');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(''); setCompany(''); setValue(''); setPriority('normal');
      setStageId(defaultStageId || stages[0]?.id || '');
    }
  }, [open, defaultStageId, stages]);

  const submit = async () => {
    if (!title.trim() || !stageId) return;
    setSaving(true);
    await onCreate({
      title: title.trim(),
      company_name: company.trim() || null,
      value: Number(value) || 0,
      currency,
      stage_id: stageId,
      pipeline_id: pipelineId,
      priority,
    });
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Add new deal</DialogTitle></DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="d-title">Deal title *</Label>
            <Input id="d-title" autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Acme Corp - WhatsApp API" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="d-company">Company / contact</Label>
            <Input id="d-company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Optional" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="d-value">Value</Label>
              <Input id="d-value" type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <Label>Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['USD','EUR','GBP','INR','AED','SGD'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Stage</Label>
              <Select value={stageId} onValueChange={setStageId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {stages.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as DealPriority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={!title.trim() || saving}>
            {saving ? 'Creating...' : 'Create deal'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
