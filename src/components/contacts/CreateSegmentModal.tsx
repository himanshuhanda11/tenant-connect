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
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { SegmentFilters } from '@/types/segment';
import { LEAD_STATUS_OPTIONS, PRIORITY_OPTIONS, MAU_STATUS_OPTIONS } from '@/types/contact';

interface CreateSegmentModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, description: string, filters: SegmentFilters) => void;
  filters: SegmentFilters;
  availableTags: { id: string; name: string; color: string | null }[];
}

export function CreateSegmentModal({
  open,
  onClose,
  onSave,
  filters,
  availableTags,
}: CreateSegmentModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Please enter a segment name');
      return;
    }

    setSaving(true);
    try {
      await onSave(name, description, filters);
      setName('');
      setDescription('');
      onClose();
    } catch (error) {
      console.error('Error saving segment:', error);
    } finally {
      setSaving(false);
    }
  };

  const getFilterSummary = () => {
    const parts: string[] = [];

    if (filters.leadStatus?.length) {
      const labels = filters.leadStatus.map(
        (s) => LEAD_STATUS_OPTIONS.find((o) => o.value === s)?.label || s
      );
      parts.push(`Lead Status: ${labels.join(', ')}`);
    }
    if (filters.priority?.length) {
      const labels = filters.priority.map(
        (p) => PRIORITY_OPTIONS.find((o) => o.value === p)?.label || p
      );
      parts.push(`Priority: ${labels.join(', ')}`);
    }
    if (filters.mauStatus?.length) {
      const labels = filters.mauStatus.map(
        (m) => MAU_STATUS_OPTIONS.find((o) => o.value === m)?.label || m
      );
      parts.push(`MAU: ${labels.join(', ')}`);
    }
    if (filters.tags?.length) {
      const tagNames = filters.tags.map(
        (t) => availableTags.find((at) => at.id === t)?.name || t
      );
      parts.push(`Tags: ${tagNames.join(', ')}`);
    }
    if (filters.optInStatus && filters.optInStatus !== 'all') {
      parts.push(`Opt-in: ${filters.optInStatus === 'opted_in' ? 'Yes' : 'No'}`);
    }
    if (filters.hasAgent && filters.hasAgent !== 'all') {
      parts.push(`Agent: ${filters.hasAgent === 'assigned' ? 'Assigned' : 'Unassigned'}`);
    }

    return parts;
  };

  const filterSummary = getFilterSummary();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save as Segment</DialogTitle>
          <DialogDescription>
            Create a reusable segment from your current filters.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Segment Name</Label>
            <Input
              id="name"
              placeholder="e.g., High Priority Leads"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe this segment..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Active Filters</Label>
            <div className="p-3 bg-muted rounded-lg">
              {filterSummary.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {filterSummary.map((f, i) => (
                    <Badge key={i} variant="secondary">
                      {f}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No filters applied</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !name.trim()}>
            {saving ? 'Saving...' : 'Save Segment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
