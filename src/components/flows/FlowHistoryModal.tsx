import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  History,
  RotateCcw,
  Eye,
  Clock,
  User,
  GitBranch,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Crown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlowHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flowName: string;
  flowId: string;
}

interface VersionEntry {
  id: string;
  version: number;
  publishedAt: string;
  publishedBy: string;
  changes: string[];
  status: 'live' | 'archived';
  nodeCount: number;
  triggerCount: number;
}

// Mock version history
const mockVersions: VersionEntry[] = [
  {
    id: 'v4',
    version: 4,
    publishedAt: '2024-01-14T10:30:00Z',
    publishedBy: 'John Doe',
    changes: ['Added delay node', 'Updated welcome message', 'Fixed condition logic'],
    status: 'live',
    nodeCount: 8,
    triggerCount: 2,
  },
  {
    id: 'v3',
    version: 3,
    publishedAt: '2024-01-12T15:20:00Z',
    publishedBy: 'Jane Smith',
    changes: ['Added A/B split test', 'New template node'],
    status: 'archived',
    nodeCount: 6,
    triggerCount: 2,
  },
  {
    id: 'v2',
    version: 2,
    publishedAt: '2024-01-10T09:00:00Z',
    publishedBy: 'John Doe',
    changes: ['Initial flow structure', 'Basic welcome flow'],
    status: 'archived',
    nodeCount: 4,
    triggerCount: 1,
  },
  {
    id: 'v1',
    version: 1,
    publishedAt: '2024-01-08T14:45:00Z',
    publishedBy: 'John Doe',
    changes: ['Flow created'],
    status: 'archived',
    nodeCount: 2,
    triggerCount: 1,
  },
];

export const FlowHistoryModal: React.FC<FlowHistoryModalProps> = ({
  open,
  onOpenChange,
  flowName,
  flowId,
}) => {
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [isPro] = useState(false); // Would come from subscription status

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleRestore = (versionId: string) => {
    // Would call API to restore version
    console.log('Restoring version:', versionId);
  };

  const handlePreview = (versionId: string) => {
    setSelectedVersion(versionId);
    // Would open version preview
  };

  if (!isPro) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Version History is a Pro Feature</h3>
            <p className="text-muted-foreground mb-6">
              Upgrade to Pro to access version history, rollback to previous versions, and track all changes to your flows.
            </p>
            <div className="space-y-3">
              <Button className="w-full gap-2 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600">
                <Crown className="w-4 h-4" />
                Upgrade to Pro
              </Button>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Maybe Later
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Version History: {flowName}
          </DialogTitle>
          <DialogDescription>
            View and restore previous versions of your flow
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[500px] pr-4">
          <div className="space-y-4">
            {mockVersions.map((version, index) => (
              <div
                key={version.id}
                className={cn(
                  'relative p-4 rounded-xl border-2 transition-all',
                  version.status === 'live'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50',
                  selectedVersion === version.id && 'ring-2 ring-primary ring-offset-2'
                )}
              >
                {/* Version indicator line */}
                {index < mockVersions.length - 1 && (
                  <div className="absolute left-7 top-full h-4 w-0.5 bg-border" />
                )}

                <div className="flex items-start gap-4">
                  {/* Version badge */}
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm shrink-0',
                    version.status === 'live'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}>
                    v{version.version}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">Version {version.version}</span>
                      {version.status === 'live' && (
                        <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Live
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDate(version.publishedAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {version.publishedBy}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitBranch className="w-3.5 h-3.5" />
                        {version.nodeCount} nodes
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Changes:</p>
                      <ul className="space-y-1">
                        {version.changes.map((change, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <ArrowRight className="w-3 h-3 mt-1 text-muted-foreground shrink-0" />
                            {change}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => handlePreview(version.id)}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Preview
                    </Button>
                    {version.status !== 'live' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => handleRestore(version.id)}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Restore
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <Separator />

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {mockVersions.length} versions total
          </span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <AlertTriangle className="w-3.5 h-3.5" />
            Restoring will create a new version
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
