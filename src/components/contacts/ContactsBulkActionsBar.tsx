import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  X,
  Tag,
  UserPlus,
  Download,
  Ban,
  Trash2,
  MoreHorizontal,
  FolderPlus,
  CheckCircle,
  ChevronDown,
} from 'lucide-react';
import { Segment } from '@/types/segment';
import { cn } from '@/lib/utils';

interface ContactsBulkActionsBarProps {
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
  availableSegments: Segment[];
}

export function ContactsBulkActionsBar({
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
}: ContactsBulkActionsBarProps) {
  const [showOptOutDialog, setShowOptOutDialog] = useState(false);
  const [showDeletionDialog, setShowDeletionDialog] = useState(false);

  if (selectedCount === 0) return null;

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center gap-3 px-4 py-3 bg-foreground text-background rounded-2xl shadow-2xl border border-background/10">
          <div className="flex items-center gap-2 pr-3 border-r border-background/20">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              {selectedCount}
            </div>
            <span className="text-sm font-medium">
              contact{selectedCount > 1 ? 's' : ''} selected
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-background/70 hover:text-background hover:bg-background/10"
              onClick={onClearSelection}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Add Tag */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-background hover:text-background hover:bg-background/10"
              >
                <Tag className="h-4 w-4" />
                Add Tag
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-48">
              {availableTags.length > 0 ? (
                availableTags.map((tag) => (
                  <DropdownMenuItem
                    key={tag.id}
                    onClick={() => onAddTag(tag.id)}
                    className="gap-2"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: tag.color || '#888' }}
                    />
                    {tag.name}
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled>No tags available</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Assign Agent */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-background hover:text-background hover:bg-background/10"
              >
                <UserPlus className="h-4 w-4" />
                Assign
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-56">
              <DropdownMenuItem onClick={() => onAssignAgent(null)} className="gap-2">
                <X className="h-4 w-4" />
                Unassign
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {availableAgents.length > 0 ? (
                availableAgents.map((agent) => (
                  <DropdownMenuItem
                    key={agent.id}
                    onClick={() => onAssignAgent(agent.id)}
                    className="gap-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    {agent.full_name || agent.email}
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled>No agents available</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Add to Segment */}
          {availableSegments.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-background hover:text-background hover:bg-background/10"
                >
                  <FolderPlus className="h-4 w-4" />
                  Add to Segment
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-48">
                {availableSegments.map((segment) => (
                  <DropdownMenuItem
                    key={segment.id}
                    onClick={() => onAddToSegment(segment.id)}
                    className="gap-2"
                  >
                    <FolderPlus className="h-4 w-4" />
                    {segment.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Export */}
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-background hover:text-background hover:bg-background/10"
            onClick={onExport}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>

          {/* More Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-background hover:text-background hover:bg-background/10"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="gap-2">
                  <Tag className="h-4 w-4" />
                  Remove Tag
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-48">
                  {availableTags.length > 0 ? (
                    availableTags.map((tag) => (
                      <DropdownMenuItem
                        key={tag.id}
                        onClick={() => onRemoveTag(tag.id)}
                        className="gap-2"
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: tag.color || '#888' }}
                        />
                        {tag.name}
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <DropdownMenuItem disabled>No tags</DropdownMenuItem>
                  )}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowOptOutDialog(true)}
                className="gap-2 text-amber-600 focus:text-amber-600"
              >
                <Ban className="h-4 w-4" />
                Mark Opted Out
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowDeletionDialog(true)}
                className="gap-2 text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Request Deletion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Opt-Out Confirmation Dialog */}
      <AlertDialog open={showOptOutDialog} onOpenChange={setShowOptOutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark {selectedCount} contacts as opted out?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the selected contacts as opted out from marketing communications.
              They will no longer receive campaign messages until they opt back in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onMarkOptOut();
                setShowOptOutDialog(false);
              }}
              className="bg-amber-600 hover:bg-amber-700"
            >
              <Ban className="h-4 w-4 mr-2" />
              Mark Opted Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Deletion Confirmation Dialog */}
      <AlertDialog open={showDeletionDialog} onOpenChange={setShowDeletionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Request deletion for {selectedCount} contacts?</AlertDialogTitle>
            <AlertDialogDescription>
              This will flag the selected contacts for data deletion per GDPR/compliance requirements.
              The deletion request will be processed according to your data retention policy.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onRequestDeletion();
                setShowDeletionDialog(false);
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Request Deletion
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
