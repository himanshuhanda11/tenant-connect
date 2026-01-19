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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Sparkles,
  Wand2,
  RefreshCw,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FixAndResubmitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: {
    id: string;
    name: string;
    category: string;
    currentBody: string;
    rejectionReason?: string;
  };
  workspaceId: string;
  onSuccess?: () => void;
}

export function FixAndResubmitDialog({
  open,
  onOpenChange,
  template,
  workspaceId,
  onSuccess,
}: FixAndResubmitDialogProps) {
  const [step, setStep] = useState<'analyze' | 'edit' | 'confirm'>('analyze');
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [suggestedBody, setSuggestedBody] = useState<string>('');
  const [editedBody, setEditedBody] = useState(template.currentBody);
  const [suggestedCategory, setSuggestedCategory] = useState<string | null>(null);
  const [issues, setIssues] = useState<Array<{ type: string; message: string; severity: string }>>([]);

  async function analyzeTemplate() {
    setAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke('template-validate', {
        body: {
          workspaceId,
          selectedCategory: template.category,
          body: template.currentBody,
          language: 'en',
        },
      });

      if (error) throw error;

      if (data.ok) {
        setIssues(data.issues || []);
        setSuggestedCategory(data.predictedCategory !== template.category ? data.predictedCategory : null);
        
        if (data.suggestions?.suggestedRewrite) {
          setSuggestedBody(data.suggestions.suggestedRewrite);
        }
        
        setStep('edit');
      } else {
        toast.error('Analysis failed');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      toast.error('Failed to analyze template');
    } finally {
      setAnalyzing(false);
    }
  }

  async function createNewVersion() {
    setSubmitting(true);

    try {
      // Call edge function to apply fixes and create new version
      const { data, error } = await supabase.functions.invoke('template-apply-fixes', {
        body: {
          workspaceId,
          templateId: template.id,
          action: 'apply_rewrite',
        },
      });

      if (error) throw error;

      toast.success('New version created successfully');
      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      console.error('Create version error:', err);
      toast.error('Failed to create new version');
    } finally {
      setSubmitting(false);
    }
  }

  function applySuggestion() {
    if (suggestedBody) {
      setEditedBody(suggestedBody);
      toast.success('AI suggestion applied');
    }
  }

  function reset() {
    setStep('analyze');
    setEditedBody(template.currentBody);
    setSuggestedBody('');
    setSuggestedCategory(null);
    setIssues([]);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            Fix & Resubmit: {template.name}
          </DialogTitle>
          <DialogDescription>
            Create a new version with fixes and resubmit for Meta approval
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4 pr-4">
            {/* Rejection Reason */}
            {template.rejectionReason && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Rejection Reason:</strong> {template.rejectionReason}
                </AlertDescription>
              </Alert>
            )}

            {/* Step 1: Analyze */}
            {step === 'analyze' && (
              <div className="text-center py-8">
                <Wand2 className="h-12 w-12 mx-auto text-primary mb-4" />
                <h3 className="font-medium mb-2">Let AI analyze the issue</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  We'll identify what caused the rejection and suggest fixes
                </p>
                <Button onClick={analyzeTemplate} disabled={analyzing} size="lg">
                  {analyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Analyze & Get Suggestions
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Step 2: Edit */}
            {step === 'edit' && (
              <div className="space-y-4">
                {/* Issues Found */}
                {issues.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Issues Found</Label>
                    <div className="space-y-2">
                      {issues.slice(0, 5).map((issue, idx) => (
                        <div 
                          key={idx} 
                          className={`p-2 rounded text-sm flex items-start gap-2 ${
                            issue.severity === 'error' 
                              ? 'bg-destructive/10 text-destructive' 
                              : 'bg-yellow-500/10 text-yellow-700'
                          }`}
                        >
                          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                          <span>{issue.message}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Category Mismatch */}
                {suggestedCategory && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                      <span>
                        Consider changing category from <Badge variant="outline">{template.category}</Badge> to{' '}
                        <Badge variant="default">{suggestedCategory}</Badge>
                      </span>
                    </AlertDescription>
                  </Alert>
                )}

                <Separator />

                {/* Edit Body */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="body">Template Body</Label>
                    {suggestedBody && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={applySuggestion}
                      >
                        <Wand2 className="h-3 w-3 mr-1" />
                        Apply AI Suggestion
                      </Button>
                    )}
                  </div>
                  <Textarea
                    id="body"
                    value={editedBody}
                    onChange={(e) => setEditedBody(e.target.value)}
                    rows={6}
                    placeholder="Edit your template content..."
                  />
                  <p className="text-xs text-muted-foreground">{editedBody.length}/1024 characters</p>
                </div>

                {/* AI Suggested Rewrite */}
                {suggestedBody && suggestedBody !== editedBody && (
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <Label className="text-xs text-primary mb-2 block">AI Suggested Rewrite</Label>
                    <p className="text-sm whitespace-pre-wrap">{suggestedBody}</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Confirm */}
            {step === 'confirm' && (
              <div className="space-y-4">
                <div className="text-center py-4">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <h3 className="font-medium mb-2">Ready to Create New Version</h3>
                  <p className="text-sm text-muted-foreground">
                    A new draft version will be created with your changes. 
                    You can then submit it to Meta for approval.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-muted">
                  <Label className="text-xs text-muted-foreground">New Content Preview</Label>
                  <p className="text-sm whitespace-pre-wrap mt-2">{editedBody}</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {step === 'analyze' && (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          )}

          {step === 'edit' && (
            <>
              <Button variant="outline" onClick={reset}>
                Start Over
              </Button>
              <Button onClick={() => setStep('confirm')} disabled={!editedBody.trim()}>
                Review Changes
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </>
          )}

          {step === 'confirm' && (
            <>
              <Button variant="outline" onClick={() => setStep('edit')}>
                Back to Edit
              </Button>
              <Button onClick={createNewVersion} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Create New Version
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}