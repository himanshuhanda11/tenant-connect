import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, AlertTriangle, CheckCircle2, Upload, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FlowIssue } from '@/lib/flowValidation';

interface FlowValidationPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  issues: FlowIssue[];
  publishing?: boolean;
  onPublish: () => void;
  onFocusNode?: (nodeKey: string) => void;
}

export const FlowValidationPanel: React.FC<FlowValidationPanelProps> = ({
  open, onOpenChange, issues, publishing, onPublish, onFocusNode,
}) => {
  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');
  const canPublish = errors.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-3 border-b">
          <DialogTitle className="flex items-center gap-2">
            {canPublish ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-destructive" />
            )}
            Pre-publish checklist
          </DialogTitle>
          <DialogDescription>
            {canPublish
              ? warnings.length
                ? `Looks good. ${warnings.length} warning${warnings.length > 1 ? 's' : ''} to review (optional).`
                : 'Everything checks out. Your flow is ready to publish.'
              : `Fix ${errors.length} error${errors.length > 1 ? 's' : ''} before publishing.`}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[420px] px-6 py-4">
          {issues.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-7 h-7 text-emerald-500" />
              </div>
              <p className="font-medium">No issues found</p>
              <p className="text-xs text-muted-foreground mt-1">Your flow is well-formed and ready to go live.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {[...errors, ...warnings].map((i) => (
                <div
                  key={i.id}
                  className={cn(
                    'rounded-lg border p-3 text-sm space-y-1.5',
                    i.severity === 'error'
                      ? 'border-destructive/30 bg-destructive/5'
                      : 'border-amber-500/30 bg-amber-500/5'
                  )}
                >
                  <div className="flex items-start gap-2">
                    {i.severity === 'error' ? (
                      <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{i.message}</p>
                      {i.fix && <p className="text-xs text-muted-foreground mt-0.5">{i.fix}</p>}
                    </div>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {i.severity}
                    </Badge>
                  </div>
                  {i.nodeKey && onFocusNode && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-[11px]"
                      onClick={() => {
                        onFocusNode(i.nodeKey!);
                        onOpenChange(false);
                      }}
                    >
                      Reveal node
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="border-t px-6 py-3 bg-muted/30 sm:justify-between">
          <div className="text-xs text-muted-foreground">
            {errors.length} error · {warnings.length} warning
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              {canPublish ? 'Cancel' : 'Close'}
            </Button>
            <Button size="sm" onClick={onPublish} disabled={!canPublish || publishing}>
              {publishing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
              {canPublish ? 'Publish now' : 'Fix errors to publish'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
