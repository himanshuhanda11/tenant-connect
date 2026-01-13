import { useState } from 'react';
import { Tag as TagIcon, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';
import { Tag } from '@/types/tag';
import { cn } from '@/lib/utils';

interface BulkTagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'apply' | 'remove';
  allTags: Tag[];
  selectedCount: number;
  onConfirm: (tagIds: string[]) => Promise<boolean>;
}

export function BulkTagDialog({
  open,
  onOpenChange,
  mode,
  allTags,
  selectedCount,
  onConfirm,
}: BulkTagDialogProps) {
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [processing, setProcessing] = useState(false);

  const complianceTags = allTags.filter(t => t.tag_type === 'compliance');
  const hasComplianceTag = Array.from(selectedTags).some(id => 
    complianceTags.some(t => t.id === id)
  );

  const handleToggleTag = (tagId: string) => {
    const newSet = new Set(selectedTags);
    if (newSet.has(tagId)) {
      newSet.delete(tagId);
    } else {
      newSet.add(tagId);
    }
    setSelectedTags(newSet);
  };

  const handleConfirm = async () => {
    if (selectedTags.size === 0) return;
    
    setProcessing(true);
    const success = await onConfirm(Array.from(selectedTags));
    setProcessing(false);
    
    if (success) {
      setSelectedTags(new Set());
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setSelectedTags(new Set());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TagIcon className="h-5 w-5" />
            {mode === 'apply' ? 'Apply Tags' : 'Remove Tags'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'apply' 
              ? `Select tags to apply to ${selectedCount} conversations`
              : `Select tags to remove from ${selectedCount} conversations`
            }
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[300px] py-4">
          <div className="space-y-2 pr-4">
            {allTags.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <TagIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>No tags available</p>
              </div>
            ) : (
              allTags.map((tag) => {
                const isSelected = selectedTags.has(tag.id);
                const isCompliance = tag.tag_type === 'compliance';
                
                return (
                  <label
                    key={tag.id}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                      isSelected ? 'border-primary bg-primary/5' : 'hover:bg-accent',
                      isCompliance && 'border-amber-500/30'
                    )}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleToggleTag(tag.id)}
                    />
                    <div className="flex-1 flex items-center gap-2">
                      {tag.emoji ? (
                        <span>{tag.emoji}</span>
                      ) : (
                        <span
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: tag.color || '#6366f1' }}
                        />
                      )}
                      <span className="font-medium">{tag.name}</span>
                      {isCompliance && (
                        <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-500/50">
                          Compliance
                        </Badge>
                      )}
                    </div>
                  </label>
                );
              })
            )}
          </div>
        </ScrollArea>

        {hasComplianceTag && (
          <Alert variant="destructive" className="bg-amber-50 border-amber-200 text-amber-800">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              You're about to {mode} compliance-related tags. This action will be logged for audit purposes.
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={processing}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedTags.size === 0 || processing}
            variant={mode === 'remove' ? 'destructive' : 'default'}
          >
            {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {mode === 'apply' ? 'Apply' : 'Remove'} {selectedTags.size > 0 && `(${selectedTags.size})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
