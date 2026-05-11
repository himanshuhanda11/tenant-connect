import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '@/contexts/TenantContext';
import { useOnboardingProgress } from '@/hooks/useOnboardingProgress';
import OnboardingStepBar from './OnboardingStepBar';
import PlanSelectionModal from './PlanSelectionModal';
import ConnectWhatsAppCard from './ConnectWhatsAppCard';
import CompleteProfileCard from './CompleteProfileCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowLeft } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  /** Triggered when user clicks "Connect WhatsApp" in step 2 */
  onConnectWhatsApp: () => void;
}

export default function OnboardingGate({ children, onConnectWhatsApp }: Props) {
  const navigate = useNavigate();
  const { currentTenant } = useTenant();
  const tenantId = currentTenant?.id || null;
  const progress = useOnboardingProgress(tenantId);

  // Lets the user re-open the plan picker from step 2 / 3 to upgrade from
  // Free to a paid plan after they've already moved past step 1.
  const [planPickerOpen, setPlanPickerOpen] = useState(false);

  if (progress.loading) {
    return (
      <div className="space-y-3 max-w-[1200px] mx-auto px-3 py-4 sm:px-6 sm:py-6">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  // All done → render the full dashboard
  if (progress.currentStep === 'done') {
    return <>{children}</>;
  }

  const isStep1 = progress.currentStep === 1;
  const showChangePlanLink = !isStep1; // step 2 or step 3
  // Modal opens when: step 1 needs it, OR user explicitly clicked "Change plan".
  const modalOpen =
    (isStep1 && !progress.planSelectionDismissed) || planPickerOpen;

  return (
    <div className="space-y-4 sm:space-y-5 max-w-[1100px] mx-auto px-3 py-4 sm:px-6 sm:py-8 animate-fade-in">
      <OnboardingStepBar currentStep={progress.currentStep} />

      {/* Back to plan selection — visible from step 2 onwards */}
      {showChangePlanLink && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-100 bg-emerald-50/40 px-3 py-2 sm:px-4 sm:py-2.5">
          <div className="min-w-0 flex items-center gap-2 text-xs sm:text-sm text-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span className="truncate">
              On <span className="font-semibold text-slate-900">{progress.planName ?? 'Free'}</span>?
              Want to upgrade to a paid plan?
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPlanPickerOpen(true)}
            className="flex-shrink-0 h-8 gap-1.5 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Change plan
          </Button>
        </div>
      )}

      {/* Step-specific content */}
      {isStep1 && (
        <div className="rounded-2xl border border-emerald-100 bg-white/70 backdrop-blur p-6 sm:p-10 text-center space-y-4">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-900">Select a plan to continue</h3>
            <p className="text-sm text-slate-500 mt-1">Pick a plan to unlock your full dashboard.</p>
          </div>
          <Button
            onClick={progress.reopenPlanSelection}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/30"
          >
            <Sparkles className="w-4 h-4 mr-2" /> Choose your plan
          </Button>
        </div>
      )}

      {progress.currentStep === 2 && (
        <ConnectWhatsAppCard onConnect={onConnectWhatsApp} />
      )}

      {progress.currentStep === 3 && (
        <CompleteProfileCard onMarkDone={progress.markProfileCompleted} phoneId={progress.primaryPhoneId} />
      )}

      {/* Plan selection modal — auto-opens on step 1, or on demand from step 2/3 */}
      {tenantId && (
        <PlanSelectionModal
          open={modalOpen}
          tenantId={tenantId}
          onSelected={(name) => {
            progress.markPlanSelected(name);
            setPlanPickerOpen(false);
            setTimeout(() => progress.refresh(), 600);
          }}
          onPaidIntent={() => { /* trial activates inline; no redirect */ }}
          onDismiss={() => {
            setPlanPickerOpen(false);
            if (isStep1) progress.dismissPlanSelection();
          }}
        />
      )}
    </div>
  );
}
