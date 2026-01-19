import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { LEAD_STATUS_OPTIONS, PRIORITY_OPTIONS } from '@/types/contact';

interface AddContactModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddContactModal({ open, onClose, onSuccess }: AddContactModalProps) {
  const { currentTenant } = useTenant();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    wa_id: '',
    name: '',
    first_name: '',
    country: '',
    language: '',
    source: 'manual',
    lead_status: 'new',
    priority_level: 'normal',
    opt_in_status: true,
    notes: '',
  });

  const handleSubmit = async () => {
    if (!currentTenant?.id) return;

    if (!formData.wa_id.trim()) {
      toast.error('Phone number is required');
      return;
    }

    // Validate E.164 format (basic)
    const cleanPhone = formData.wa_id.replace(/\D/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from('contacts').insert({
        tenant_id: currentTenant.id,
        wa_id: cleanPhone,
        name: formData.name || null,
        first_name: formData.first_name || null,
        country: formData.country || null,
        language: formData.language || null,
        source: formData.source,
        lead_status: formData.lead_status,
        priority_level: formData.priority_level,
        opt_in_status: formData.opt_in_status,
        opt_in_source: 'manual',
        opt_in_timestamp: formData.opt_in_status ? new Date().toISOString() : null,
        notes: formData.notes || null,
      });

      if (error) throw error;

      toast.success('Contact added successfully');
      setFormData({
        wa_id: '',
        name: '',
        first_name: '',
        country: '',
        language: '',
        source: 'manual',
        lead_status: 'new',
        priority_level: 'normal',
        opt_in_status: true,
        notes: '',
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error adding contact:', error);
      if (error.code === '23505') {
        toast.error('A contact with this phone number already exists');
      } else {
        toast.error('Failed to add contact');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Add New Contact</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Add a new contact to your workspace. Phone number is required.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4 py-3 sm:py-4 max-h-[60vh] overflow-y-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="wa_id">
              Phone Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="wa_id"
              placeholder="+1234567890"
              value={formData.wa_id}
              onChange={(e) => setFormData({ ...formData, wa_id: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Enter the full international phone number
            </p>
          </div>

          {/* Name */}
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                placeholder="John"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          {/* Location */}
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                placeholder="United Arab Emirates"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Input
                id="language"
                placeholder="en"
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              />
            </div>
          </div>

          {/* Status */}
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Lead Status</Label>
              <Select
                value={formData.lead_status}
                onValueChange={(v) => setFormData({ ...formData, lead_status: v })}
              >
                <SelectTrigger className="touch-manipulation">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={formData.priority_level}
                onValueChange={(v) => setFormData({ ...formData, priority_level: v })}
              >
                <SelectTrigger className="touch-manipulation">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Source */}
          <div className="space-y-2">
            <Label>Source</Label>
            <Select
              value={formData.source}
              onValueChange={(v) => setFormData({ ...formData, source: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual Entry</SelectItem>
                <SelectItem value="import">CSV Import</SelectItem>
                <SelectItem value="facebook">Facebook Lead Ads</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="qr">QR Code</SelectItem>
                <SelectItem value="api">API</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Opt-in */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Marketing Opt-in</Label>
              <p className="text-xs text-muted-foreground">
                Contact has consented to receive marketing messages
              </p>
            </div>
            <Switch
              checked={formData.opt_in_status}
              onCheckedChange={(v) => setFormData({ ...formData, opt_in_status: v })}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Internal notes about this contact..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} className="touch-manipulation w-full sm:w-auto">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving} className="touch-manipulation w-full sm:w-auto">
            {saving ? 'Adding...' : 'Add Contact'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
