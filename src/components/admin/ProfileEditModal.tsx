import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save } from 'lucide-react';
import { useAdminApi } from '@/hooks/useAdminApi';
import { toast } from '@/hooks/use-toast';

interface Props {
  open: boolean; onClose: () => void; onSaved?: () => void;
  userId: string; profile: any;
}

const FIELDS: [string, string][] = [
  ['full_name', 'Full name'], ['company_name', 'Company'],
  ['phone', 'Phone'], ['country', 'Country'],
  ['industry', 'Industry'], ['team_size', 'Team size'], ['timezone', 'Timezone'],
];

export function ProfileEditModal({ open, onClose, onSaved, userId, profile }: Props) {
  const { post } = useAdminApi();
  const [form, setForm] = useState<any>(() => Object.fromEntries(FIELDS.map(([k]) => [k, profile?.[k] || ''])));
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!reason || reason.length < 4) { toast({ title: 'Reason required', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      await post(`users/${userId}/profile`, { ...form, reason });
      toast({ title: 'Profile updated' });
      onSaved?.(); onClose();
    } catch (e: any) {
      toast({ title: 'Update failed', description: e.message, variant: 'destructive' });
    } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Edit profile</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          {FIELDS.map(([k, label]) => (
            <div key={k} className={k === 'full_name' || k === 'company_name' ? 'col-span-2' : ''}>
              <Label className="text-[11px]">{label}</Label>
              <Input className="rounded-lg" value={form[k] || ''}
                onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
            </div>
          ))}
        </div>
        <div>
          <Label>Reason <span className="text-red-600">*</span></Label>
          <Input className="rounded-lg" value={reason} onChange={(e) => setReason(e.target.value)}
            placeholder="Why is this change being made?" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving || !reason}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />} Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
