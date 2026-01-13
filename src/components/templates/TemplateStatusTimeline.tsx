import { CheckCircle, Circle, Clock, XCircle, Send, FileEdit, UserCheck, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InternalStatus, MetaStatus, TemplateApproval, TemplateSubmissionLog } from '@/types/template';
import { format } from 'date-fns';

interface TemplateStatusTimelineProps {
  internalStatus: InternalStatus;
  metaStatus: MetaStatus;
  approvals?: TemplateApproval[];
  submissionLogs?: TemplateSubmissionLog[];
  rejectionReason?: string | null;
}

interface TimelineStep {
  id: string;
  label: string;
  icon: React.ReactNode;
  status: 'complete' | 'current' | 'pending' | 'error';
  timestamp?: string;
  description?: string;
}

export function TemplateStatusTimeline({
  internalStatus,
  metaStatus,
  approvals = [],
  submissionLogs = [],
  rejectionReason
}: TemplateStatusTimelineProps) {
  const getSteps = (): TimelineStep[] => {
    const steps: TimelineStep[] = [];
    
    // Draft step
    steps.push({
      id: 'draft',
      label: 'Draft Created',
      icon: <FileEdit className="h-5 w-5" />,
      status: 'complete',
      description: 'Template draft created'
    });

    // Internal Review step
    const latestApproval = approvals[0];
    if (internalStatus === 'draft') {
      steps.push({
        id: 'internal_review',
        label: 'Internal Review',
        icon: <UserCheck className="h-5 w-5" />,
        status: 'pending',
        description: 'Awaiting submission for review'
      });
    } else if (internalStatus === 'in_review') {
      steps.push({
        id: 'internal_review',
        label: 'Internal Review',
        icon: <Clock className="h-5 w-5" />,
        status: 'current',
        timestamp: latestApproval?.requested_at 
          ? format(new Date(latestApproval.requested_at), 'MMM d, yyyy h:mm a')
          : undefined,
        description: 'Under internal review'
      });
    } else if (internalStatus === 'changes_requested') {
      steps.push({
        id: 'internal_review',
        label: 'Changes Requested',
        icon: <AlertCircle className="h-5 w-5" />,
        status: 'error',
        timestamp: latestApproval?.reviewed_at 
          ? format(new Date(latestApproval.reviewed_at), 'MMM d, yyyy h:mm a')
          : undefined,
        description: latestApproval?.comments || 'Revisions needed'
      });
    } else {
      steps.push({
        id: 'internal_review',
        label: 'Internally Approved',
        icon: <CheckCircle className="h-5 w-5" />,
        status: 'complete',
        timestamp: latestApproval?.reviewed_at 
          ? format(new Date(latestApproval.reviewed_at), 'MMM d, yyyy h:mm a')
          : undefined,
        description: 'Approved by internal team'
      });
    }

    // Meta Submission step
    const latestSubmission = submissionLogs[0];
    if (internalStatus !== 'approved') {
      steps.push({
        id: 'meta_submitted',
        label: 'Submit to Meta',
        icon: <Send className="h-5 w-5" />,
        status: 'pending',
        description: 'Requires internal approval first'
      });
    } else if (!latestSubmission) {
      steps.push({
        id: 'meta_submitted',
        label: 'Submit to Meta',
        icon: <Send className="h-5 w-5" />,
        status: 'current',
        description: 'Ready to submit to Meta'
      });
    } else {
      steps.push({
        id: 'meta_submitted',
        label: 'Submitted to Meta',
        icon: <CheckCircle className="h-5 w-5" />,
        status: 'complete',
        timestamp: format(new Date(latestSubmission.created_at), 'MMM d, yyyy h:mm a'),
        description: 'Template submitted for Meta review'
      });
    }

    // Meta Status step
    if (metaStatus === 'PENDING') {
      steps.push({
        id: 'meta_status',
        label: 'Meta Review',
        icon: <Clock className="h-5 w-5" />,
        status: latestSubmission ? 'current' : 'pending',
        description: 'Pending Meta approval'
      });
    } else if (metaStatus === 'APPROVED') {
      steps.push({
        id: 'meta_status',
        label: 'Meta Approved',
        icon: <CheckCircle className="h-5 w-5" />,
        status: 'complete',
        timestamp: latestSubmission?.updated_at 
          ? format(new Date(latestSubmission.updated_at), 'MMM d, yyyy h:mm a')
          : undefined,
        description: 'Template approved by Meta'
      });
    } else if (metaStatus === 'REJECTED') {
      steps.push({
        id: 'meta_status',
        label: 'Meta Rejected',
        icon: <XCircle className="h-5 w-5" />,
        status: 'error',
        timestamp: latestSubmission?.updated_at 
          ? format(new Date(latestSubmission.updated_at), 'MMM d, yyyy h:mm a')
          : undefined,
        description: rejectionReason || latestSubmission?.rejection_reason || 'Template rejected by Meta'
      });
    } else {
      steps.push({
        id: 'meta_status',
        label: 'Meta Status',
        icon: <Circle className="h-5 w-5" />,
        status: 'pending',
        description: `Status: ${metaStatus}`
      });
    }

    return steps;
  };

  const steps = getSteps();

  const getStatusColor = (status: TimelineStep['status']) => {
    switch (status) {
      case 'complete': return 'text-green-500 bg-green-100';
      case 'current': return 'text-blue-500 bg-blue-100';
      case 'error': return 'text-destructive bg-destructive/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getLineColor = (status: TimelineStep['status']) => {
    switch (status) {
      case 'complete': return 'bg-green-500';
      case 'current': return 'bg-blue-500';
      case 'error': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          Template Status
          <Badge 
            variant={metaStatus === 'APPROVED' ? 'default' : metaStatus === 'REJECTED' ? 'destructive' : 'secondary'}
            className={metaStatus === 'APPROVED' ? 'bg-green-500' : ''}
          >
            {metaStatus}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {steps.map((step, index) => (
            <div key={step.id} className="relative flex gap-4 pb-8 last:pb-0">
              {/* Vertical Line */}
              {index < steps.length - 1 && (
                <div 
                  className={`absolute left-5 top-10 w-0.5 h-full -ml-px ${getLineColor(step.status)}`}
                />
              )}
              
              {/* Icon */}
              <div className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full ${getStatusColor(step.status)}`}>
                {step.icon}
              </div>
              
              {/* Content */}
              <div className="flex-1 pt-1.5">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{step.label}</p>
                  {step.status === 'current' && (
                    <Badge variant="outline" className="text-xs">Current</Badge>
                  )}
                </div>
                {step.description && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {step.description}
                  </p>
                )}
                {step.timestamp && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {step.timestamp}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
