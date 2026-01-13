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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  Send, 
  AlertCircle,
  Clock,
  User
} from 'lucide-react';
import { LintValidationResult } from '@/types/template';
import { TemplateApproval, InternalStatus } from '@/types/template';
import { format } from 'date-fns';

interface InternalReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'request' | 'review';
  templateName: string;
  internalStatus: InternalStatus;
  lintResults: LintValidationResult[];
  approvalHistory: TemplateApproval[];
  onRequestReview: () => Promise<boolean>;
  onApprove: (comments?: string) => Promise<boolean>;
  onRequestChanges: (comments: string) => Promise<boolean>;
}

export function InternalReviewModal({
  open,
  onOpenChange,
  mode,
  templateName,
  internalStatus,
  lintResults,
  approvalHistory,
  onRequestReview,
  onApprove,
  onRequestChanges
}: InternalReviewModalProps) {
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);

  const hasErrors = lintResults.some(r => r.severity === 'error');
  const hasWarnings = lintResults.some(r => r.severity === 'warning');

  const handleRequestReview = async () => {
    setLoading(true);
    const success = await onRequestReview();
    setLoading(false);
    if (success) {
      onOpenChange(false);
    }
  };

  const handleApprove = async () => {
    setLoading(true);
    const success = await onApprove(comments || undefined);
    setLoading(false);
    if (success) {
      setComments('');
      onOpenChange(false);
    }
  };

  const handleRequestChanges = async () => {
    if (!comments.trim()) return;
    setLoading(true);
    const success = await onRequestChanges(comments);
    setLoading(false);
    if (success) {
      setComments('');
      onOpenChange(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'changes_requested':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Changes Requested</Badge>;
      case 'in_review':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />In Review</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === 'request' ? 'Request Internal Review' : 'Review Template'}
          </DialogTitle>
          <DialogDescription>
            Template: <strong>{templateName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Validation Status */}
          <div className="space-y-2">
            <Label>Validation Status</Label>
            {hasErrors ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Template has {lintResults.filter(r => r.severity === 'error').length} validation errors. 
                  Fix all errors before requesting review.
                </AlertDescription>
              </Alert>
            ) : hasWarnings ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Template has {lintResults.filter(r => r.severity === 'warning').length} warnings. 
                  Review is possible but consider addressing them.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="border-green-500 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-700">
                  All validation checks passed.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Approval History */}
          {approvalHistory.length > 0 && (
            <div className="space-y-2">
              <Label>Approval History</Label>
              <ScrollArea className="h-[200px] border rounded-lg p-3">
                <div className="space-y-3">
                  {approvalHistory.map((approval) => (
                    <div key={approval.id} className="border-b pb-3 last:border-b-0">
                      <div className="flex items-center justify-between">
                        {getStatusBadge(approval.status)}
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(approval.created_at), 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>
                          Requested by: {approval.requested_by_profile?.full_name || approval.requested_by_profile?.email || 'Unknown'}
                        </span>
                      </div>
                      {approval.reviewed_by_profile && (
                        <div className="mt-1 flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>
                            Reviewed by: {approval.reviewed_by_profile.full_name || approval.reviewed_by_profile.email}
                          </span>
                        </div>
                      )}
                      {approval.comments && (
                        <div className="mt-2 p-2 bg-muted rounded text-sm">
                          {approval.comments}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Comments */}
          <div className="space-y-2">
            <Label htmlFor="comments">
              {mode === 'request' ? 'Notes for Reviewer (Optional)' : 'Review Comments'}
              {mode === 'review' && <span className="text-muted-foreground"> (required for requesting changes)</span>}
            </Label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder={
                mode === 'request' 
                  ? 'Add any notes for the reviewer...' 
                  : 'Provide feedback or request specific changes...'
              }
              rows={4}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          
          {mode === 'request' ? (
            <Button 
              onClick={handleRequestReview}
              disabled={loading || hasErrors}
            >
              <Send className="h-4 w-4 mr-2" />
              {loading ? 'Submitting...' : 'Submit for Review'}
            </Button>
          ) : (
            <>
              <Button 
                variant="destructive"
                onClick={handleRequestChanges}
                disabled={loading || !comments.trim()}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Request Changes
              </Button>
              <Button 
                onClick={handleApprove}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {loading ? 'Approving...' : 'Approve'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
