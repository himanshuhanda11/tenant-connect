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
import { Sparkles } from 'lucide-react';

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
  const [planModalDismissed, setPlanModalDismissed] = useState(false);

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

  return (
    <div className="space-y-4 sm:space-y-5 max-w-[1100px] mx-auto px-3 py-4 sm:px-6 sm:py-8 animate-fade-in">
      <OnboardingStepBar currentStep={progress.currentStep} />

      {/* Step-specific content */}
      {progress.currentStep === 1 && (
        <div className="rounded-2xl border border-emerald-100 bg-white/70 backdrop-blur p-6 sm:p-10 text-center space-y-4">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-900">Select a plan to continue</h3>
            <p className="text-sm text-slate-500 mt-1">Pick a plan to unlock your full dashboard.</p>
          </div>
          <Button
            onClick={() => setPlanModalDismissed(false)}
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

      {/* Plan selection modal — auto-opens when needed; user can dismiss to stay on step 1 */}
      {tenantId && (
        <PlanSelectionModal
          open={progress.currentStep === 1 && !planModalDismissed}
          tenantId={tenantId}
          onSelected={(name) => {
            progress.markPlanSelected(name);
            setTimeout(() => progress.refresh(), 600);
          }}
          onPaidIntent={() => { /* trial activates inline; no redirect */ }}
          onDismiss={() => setPlanModalDismissed(true)}
        />
      )}
    </div>
  );
}
