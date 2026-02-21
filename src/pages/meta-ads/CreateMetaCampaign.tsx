import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Save, Loader2, Rocket, CloudOff } from 'lucide-react';
import { WizardStepper } from '@/components/meta-ads/wizard/WizardStepper';
import { StepAssets } from '@/components/meta-ads/wizard/StepAssets';
import { StepObjective } from '@/components/meta-ads/wizard/StepObjective';
import { StepAdSet } from '@/components/meta-ads/wizard/StepAdSet';
import { StepCreative } from '@/components/meta-ads/wizard/StepCreative';
import { StepReview } from '@/components/meta-ads/wizard/StepReview';
import { useMetaCampaignDraft } from '@/hooks/useMetaCampaignDraft';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
  } = useMetaCampaignDraft(draftId);

  const [isPublishing, setIsPublishing] = useState(false);

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
    try {
      // Save final state
      await saveDraft(true);
      updateDraft({ status: 'ready' });
      toast.success('Campaign saved and ready for publishing!');
      toast.info('Campaign will be submitted to Meta Ads Manager via the API.', { duration: 5000 });
      navigate('/meta-ads/manager');
    } catch (err) {
      toast.error('Failed to save campaign');
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
              <h1 className="text-lg sm:text-xl font-bold tracking-tight">Create Campaign</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="outline" className="text-[10px]">
                  {draft.campaign_name || 'Untitled'}
                </Badge>
                {isSaving && (
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Loader2 className="h-2.5 w-2.5 animate-spin" />
                    Saving...
                  </span>
                )}
                {savedDraftId && !isSaving && (
                  <span className="text-[10px] text-emerald-600 flex items-center gap-1">
                    <CloudOff className="h-2.5 w-2.5" />
                    Draft saved
                  </span>
                )}
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleSaveDraft} disabled={isSaving} className="gap-1.5">
            <Save className="h-3.5 w-3.5" />
            Save Draft
          </Button>
        </div>

        {/* Stepper */}
        <Card className="border-0 shadow-md p-3 sm:p-4 overflow-x-auto">
          <WizardStepper
            currentStep={draft.current_step}
            onStepClick={goToStep}
            validateStep={validateStep}
          />
        </Card>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={draft.current_step === 1}
            className="gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center gap-3">
            {draft.current_step < 5 ? (
              <Button onClick={nextStep} className="gap-1.5 shadow-lg shadow-primary/25">
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handlePublish}
                disabled={isPublishing}
                className="gap-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/25"
              >
                {isPublishing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Rocket className="h-4 w-4" />
                )}
                {isPublishing ? 'Publishing...' : 'Publish Campaign'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
