import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, ArrowRight, Save, Loader2, Rocket, CloudOff, AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react';
import { WizardStepper } from '@/components/meta-ads/wizard/WizardStepper';
import { StepAssets } from '@/components/meta-ads/wizard/StepAssets';
import { StepObjective } from '@/components/meta-ads/wizard/StepObjective';
import { StepAdSet } from '@/components/meta-ads/wizard/StepAdSet';
import { StepCreative } from '@/components/meta-ads/wizard/StepCreative';
import { StepReview } from '@/components/meta-ads/wizard/StepReview';
import { useMetaCampaignDraft } from '@/hooks/useMetaCampaignDraft';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { PublishResult, PublishStep } from '@/types/meta-campaign';

const STEP_LABELS: Record<string, string> = {
  lead_form: 'Lead Form',
  campaign: 'Campaign',
  adset: 'Ad Set',
  creative: 'Creative',
  ad: 'Ad',
};

export default function CreateMetaCampaign() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const draftId = searchParams.get('draft') || undefined;

  const {
    draft,
    updateDraft,
    saveDraft,
    isSaving,
    isLoading,
    savedDraftId,
    validateStep,
    goToStep,
    nextStep,
    prevStep,
    publishToMeta,
  } = useMetaCampaignDraft(draftId);

  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<PublishResult | null>(null);

  const handlePublish = async () => {
    // Validate all steps
    for (let i = 1; i <= 4; i++) {
      const { valid, errors } = validateStep(i);
      if (!valid) {
        errors.forEach(e => toast.error(e));
        goToStep(i);
        return;
      }
    }

    setIsPublishing(true);
    setPublishResult(null);

    try {
      const result = await publishToMeta();
      setPublishResult(result);

      if (result.success) {
        toast.success('Campaign published to Meta!', { duration: 6000 });
        toast.info('Campaign is created as PAUSED. Activate it in Meta Ads Manager when ready.', { duration: 8000 });
      } else {
        toast.error(result.error || 'Failed to publish campaign');
      }
    } catch (err: any) {
      toast.error(err.message || 'Publish failed');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSaveDraft = async () => {
    await saveDraft(true);
    toast.success('Draft saved');
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const renderStepContent = () => {
    switch (draft.current_step) {
      case 1: return <StepAssets draft={draft} updateDraft={updateDraft} />;
      case 2: return <StepObjective draft={draft} updateDraft={updateDraft} />;
      case 3: return <StepAdSet draft={draft} updateDraft={updateDraft} />;
      case 4: return <StepCreative draft={draft} updateDraft={updateDraft} />;
      case 5: return <StepReview draft={draft} validateStep={validateStep} />;
      default: return null;
    }
  };

  const isPublished = draft.publish_status === 'published' || publishResult?.success;

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/meta-ads/manager')} className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight">
                {isPublished ? 'Campaign Published' : 'Create Campaign'}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="outline" className="text-[10px]">
                  {draft.campaign_name || 'Untitled'}
                </Badge>
                {isSaving && (
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Loader2 className="h-2.5 w-2.5 animate-spin" /> Saving...
                  </span>
                )}
                {savedDraftId && !isSaving && (
                  <span className="text-[10px] text-emerald-600 flex items-center gap-1">
                    <CloudOff className="h-2.5 w-2.5" /> Draft saved
                  </span>
                )}
              </div>
            </div>
          </div>
          {!isPublished && (
            <Button variant="outline" size="sm" onClick={handleSaveDraft} disabled={isSaving} className="gap-1.5">
              <Save className="h-3.5 w-3.5" /> Save Draft
            </Button>
          )}
        </div>

        {/* Publish Result Banner */}
        {publishResult && (
          <PublishResultBanner result={publishResult} />
        )}

        {/* Stepper */}
        <Card className="border-0 shadow-md p-3 sm:p-4 overflow-x-auto">
          <WizardStepper currentStep={draft.current_step} onStepClick={goToStep} validateStep={validateStep} />
        </Card>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        {!isPublished && (
          <div className="flex items-center justify-between pt-4 border-t">
            <Button variant="outline" onClick={prevStep} disabled={draft.current_step === 1} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <div className="flex items-center gap-3">
              {draft.current_step < 5 ? (
                <Button onClick={nextStep} className="gap-1.5 shadow-lg shadow-primary/25">
                  Next <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="gap-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/25"
                >
                  {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
                  {isPublishing ? 'Publishing to Meta...' : 'Publish Campaign'}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Published → Go to manager */}
        {isPublished && (
          <div className="flex justify-center pt-4">
            <Button onClick={() => navigate('/meta-ads/manager')} className="gap-1.5">
              Go to Ads Manager <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function PublishResultBanner({ result }: { result: PublishResult }) {
  if (result.success) {
    return (
      <Alert className="border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30">
        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        <AlertDescription className="text-sm">
          <p className="font-medium text-emerald-700 dark:text-emerald-300">Campaign published successfully!</p>
          <div className="mt-2 space-y-1 text-xs text-emerald-600 dark:text-emerald-400">
            {result.log?.map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3" />
                <span>{STEP_LABELS[step.step] || step.step}</span>
                {step.meta_id && <Badge variant="outline" className="text-[9px] font-mono">{step.meta_id}</Badge>}
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Campaign is created as <strong>PAUSED</strong>. Go to Meta Ads Manager to activate it.
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-red-200 bg-red-50 dark:bg-red-950/30">
      <AlertCircle className="h-4 w-4 text-red-600" />
      <AlertDescription className="text-sm">
        <p className="font-medium text-red-700 dark:text-red-300">Publishing failed</p>
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{result.error}</p>
        {result.error_code && (
          <Badge variant="destructive" className="mt-1 text-[9px] font-mono">Error {result.error_code}</Badge>
        )}
        {result.error_help && (
          <p className="mt-2 text-xs text-muted-foreground bg-red-100 dark:bg-red-900/30 rounded p-2">
            💡 {result.error_help}
          </p>
        )}

        {/* Show partial progress */}
        {result.log && result.log.length > 0 && (
          <div className="mt-3 space-y-1">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Progress</p>
            {result.log.map((step, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                {step.status === 'success' ? (
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                ) : step.status === 'error' ? (
                  <AlertCircle className="h-3 w-3 text-red-500" />
                ) : (
                  <div className="h-3 w-3 rounded-full border border-muted-foreground/30" />
                )}
                <span className={cn(step.status === 'error' && 'text-red-600 font-medium')}>
                  {STEP_LABELS[step.step] || step.step}
                </span>
                {step.meta_id && <Badge variant="outline" className="text-[9px] font-mono">{step.meta_id}</Badge>}
                {step.error && <span className="text-red-500 text-[10px] truncate max-w-[200px]">{step.error}</span>}
              </div>
            ))}
          </div>
        )}

        <p className="mt-3 text-xs text-muted-foreground">
          You can fix the issue and retry — already-created objects will be reused.
        </p>
      </AlertDescription>
    </Alert>
  );
}
