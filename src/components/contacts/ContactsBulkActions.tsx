import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tag,
  UserPlus,
  Download,
  Trash2,
  Ban,
  X,
  ChevronDown,
  FolderPlus,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

interface ContactsBulkActionsProps {
  selectedCount: number;
  onClearSelection: () => void;
  onAddTag: (tagId: string) => void;
  onRemoveTag: (tagId: string) => void;
  onAssignAgent: (agentId: string | null) => void;
  onAddToSegment: (segmentId: string) => void;
  onExport: () => void;
  onMarkOptOut: () => void;
  onRequestDeletion: () => void;
  availableTags: { id: string; name: string; color: string | null }[];
  availableAgents: { id: string; full_name: string | null; email: string }[];
  availableSegments: { id: string; name: string }[];
}

export function ContactsBulkActions({
  selectedCount,
  onClearSelection,
  onAddTag,
  onRemoveTag,
  onAssignAgent,
  onAddToSegment,
  onExport,
  onMarkOptOut,
  onRequestDeletion,
  availableTags,
  availableAgents,
  availableSegments,
}: ContactsBulkActionsProps) {
  const [showOptOutConfirm, setShowOptOutConfirm] = useState(false);
  const [showDeletionConfirm, setShowDeletionConfirm] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');

  if (selectedCount === 0) return null;

  const handleAssign = () => {
    onAssignAgent(selectedAgentId || null);
    setShowAssignDialog(false);
    setSelectedAgentId('');
  };

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-3 px-4 py-3 bg-background border rounded-xl shadow-lg">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              {selectedCount} selected
            </Badge>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClearSelection}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="h-6 w-px bg-border" />

          {/* Add Tag */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Tag className="h-4 w-4" />
                Add Tag
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              {availableTags.map((tag) => (
                <DropdownMenuItem key={tag.id} onClick={() => onAddTag(tag.id)}>
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: tag.color || '#gray' }}
                  />
                  {tag.name}
                </DropdownMenuItem>
              ))}
              {availableTags.length === 0 && (
                <DropdownMenuItem disabled>No tags available</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Remove Tag */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Tag className="h-4 w-4" />
                Remove Tag
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              {availableTags.map((tag) => (
                <DropdownMenuItem key={tag.id} onClick={() => onRemoveTag(tag.id)}>
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: tag.color || '#gray' }}
                  />
                  {tag.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Assign Agent */}
          <Button variant="outline" size="sm" className="gap-1" onClick={() => setShowAssignDialog(true)}>
            <UserPlus className="h-4 w-4" />
            Assign
          </Button>

          {/* Add to Segment */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <FolderPlus className="h-4 w-4" />
                Add to Segment
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              {availableSegments.map((segment) => (
                <DropdownMenuItem key={segment.id} onClick={() => onAddToSegment(segment.id)}>
                  {segment.name}
                </DropdownMenuItem>
              ))}
              {availableSegments.length === 0 && (
                <DropdownMenuItem disabled>No segments available</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Export */}
          <Button variant="outline" size="sm" className="gap-1" onClick={onExport}>
            <Download className="h-4 w-4" />
            Export
          </Button>

          <div className="h-6 w-px bg-border" />

          {/* Compliance Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1 text-destructive border-destructive/50">
                <Ban className="h-4 w-4" />
                Compliance
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowOptOutConfirm(true)} className="text-destructive">
                Mark as Opted Out
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowDeletionConfirm(true)} className="text-destructive">
                Request Data Deletion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Opt-Out Confirmation */}
      <AlertDialog open={showOptOutConfirm} onOpenChange={setShowOptOutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark contacts as opted out?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark {selectedCount} contact(s) as opted out. They will no longer receive
              marketing messages. This action is logged for compliance purposes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onMarkOptOut} className="bg-destructive text-destructive-foreground">
              Mark Opted Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Deletion Request Confirmation */}
      <AlertDialog open={showDeletionConfirm} onOpenChange={setShowDeletionConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Request data deletion?</AlertDialogTitle>
            <AlertDialogDescription>
              This will flag {selectedCount} contact(s) for data deletion. Their data will be
              scheduled for removal within 30 days as per GDPR requirements. This action is
              irreversible and logged for compliance purposes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onRequestDeletion} className="bg-destructive text-destructive-foreground">
              Request Deletion
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Assign Agent Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Agent</DialogTitle>
            <DialogDescription>
              Select an agent to assign to {selectedCount} selected contact(s).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Agent</Label>
              <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassign</SelectItem>
                  {availableAgents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.full_name || agent.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssign}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
