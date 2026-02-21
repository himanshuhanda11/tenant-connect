import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { WIZARD_STEPS } from '@/types/meta-campaign';

interface WizardStepperProps {
  currentStep: number;
  onStepClick: (step: number) => void;
  validateStep: (step: number) => { valid: boolean; errors: string[] };
}

export function WizardStepper({ currentStep, onStepClick, validateStep }: WizardStepperProps) {
  return (
    <nav className="flex items-center gap-1" aria-label="Campaign wizard steps">
      {WIZARD_STEPS.map((step, i) => {
        const isCompleted = step.id < currentStep;
        const isCurrent = step.id === currentStep;
        const isClickable = step.id <= currentStep;

        return (
          <div key={step.id} className="flex items-center">
            <button
              onClick={() => isClickable && onStepClick(step.id)}
              disabled={!isClickable}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all",
                isCurrent && "bg-primary/10 text-primary ring-1 ring-primary/20",
                isCompleted && "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 cursor-pointer",
                !isCurrent && !isCompleted && "text-muted-foreground/50 cursor-not-allowed"
              )}
            >
              <div className={cn(
                "flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold shrink-0 transition-all",
                isCurrent && "bg-primary text-primary-foreground",
                isCompleted && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50",
                !isCurrent && !isCompleted && "bg-muted text-muted-foreground/50"
              )}>
                {isCompleted ? <Check className="h-3.5 w-3.5" /> : step.id}
              </div>
              <div className="hidden sm:block text-left">
                <p className="leading-none">{step.label}</p>
                <p className={cn(
                  "text-[10px] font-normal mt-0.5",
                  isCurrent ? "text-primary/70" : "text-muted-foreground/50"
                )}>{step.description}</p>
              </div>
            </button>
            {i < WIZARD_STEPS.length - 1 && (
              <div className={cn(
                "w-6 h-px mx-0.5",
                step.id < currentStep ? "bg-emerald-300" : "bg-border"
              )} />
            )}
          </div>
        );
      })}
    </nav>
  );
}
