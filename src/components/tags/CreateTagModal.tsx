import { useState } from 'react';
import { Tag, TagType, TagApplyTo, TAG_TYPE_OPTIONS, TAG_COLOR_OPTIONS } from '@/types/tag';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface CreateTagModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (tag: Partial<Tag>) => Promise<any>;
  editTag?: Tag | null;
}

const EMOJI_OPTIONS = ['🏷️', '⭐', '🔥', '💬', '🎯', '✅', '❌', '⚡', '🚀', '💡', '🛡️', '📞', '📧', '🌱', '💎', '🎉'];

export function CreateTagModal({ open, onClose, onSubmit, editTag }: CreateTagModalProps) {
  const [formData, setFormData] = useState<Partial<Tag>>({
    name: editTag?.name || '',
    tag_type: editTag?.tag_type || 'custom',
    color: editTag?.color || '#6366f1',
    emoji: editTag?.emoji || '🏷️',
    tag_group: editTag?.tag_group || '',
    apply_to: editTag?.apply_to || 'both',
    description: editTag?.description || '',
    status: editTag?.status || 'active',
  });
  const [enableRule, setEnableRule] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.name?.trim()) return;

    setSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editTag ? 'Edit Tag' : 'Create Tag'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Preview */}
          <div className="flex items-center justify-center p-4 bg-muted/50 rounded-lg">
            <Badge
              className="text-base px-4 py-2"
              style={{ backgroundColor: formData.color || '#6366f1' }}
            >
              <span className="mr-2">{formData.emoji}</span>
              {formData.name || 'Tag Name'}
            </Badge>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Tag Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Hot Lead, VIP Customer"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label>Tag Type</Label>
            <Select
              value={formData.tag_type}
              onValueChange={(value: TagType) => setFormData({ ...formData, tag_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TAG_TYPE_OPTIONS.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <span>{type.emoji}</span>
                      <span>{type.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {TAG_TYPE_OPTIONS.find(t => t.value === formData.tag_type)?.description}
            </p>
          </div>

          {/* Color & Emoji */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-1.5">
                {TAG_COLOR_OPTIONS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={cn(
                      'w-6 h-6 rounded-full transition-all',
                      formData.color === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-110'
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Emoji</Label>
              <div className="flex flex-wrap gap-1.5">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all',
                      formData.emoji === emoji ? 'bg-primary/20 ring-2 ring-primary scale-110' : 'hover:bg-muted hover:scale-110'
                    )}
                    onClick={() => setFormData({ ...formData, emoji })}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Apply To */}
          <div className="space-y-2">
            <Label>Apply To</Label>
            <RadioGroup
              value={formData.apply_to}
              onValueChange={(value: TagApplyTo) => setFormData({ ...formData, apply_to: value })}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="contacts" id="contacts" />
                <Label htmlFor="contacts" className="font-normal cursor-pointer">Contacts</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="conversations" id="conversations" />
                <Label htmlFor="conversations" className="font-normal cursor-pointer">Conversations</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="both" id="both" />
                <Label htmlFor="both" className="font-normal cursor-pointer">Both</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Group */}
          <div className="space-y-2">
            <Label htmlFor="group">Group (Optional)</Label>
            <Input
              id="group"
              placeholder="e.g., Sales, Support, Marketing"
              value={formData.tag_group || ''}
              onChange={(e) => setFormData({ ...formData, tag_group: e.target.value })}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe when this tag should be used..."
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
            />
          </div>

          {/* Enable Auto-Tag Rule */}
          {!editTag && (
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <Label className="text-sm font-medium">Enable Auto-Tag Rule</Label>
                <p className="text-xs text-muted-foreground">Create an automation rule for this tag</p>
              </div>
              <Switch checked={enableRule} onCheckedChange={setEnableRule} />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!formData.name?.trim() || submitting}>
            {submitting ? 'Saving...' : editTag ? 'Save Changes' : 'Create Tag'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
