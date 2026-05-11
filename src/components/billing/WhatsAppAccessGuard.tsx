import { type ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useWhatsAppConnectionAccess } from '@/hooks/useWhatsAppConnectionAccess';

interface WhatsAppAccessGuardProps {
  children: ReactNode;
}

/**
 * Frontend route guard for /phone-numbers/connect (and any other
 * "Connect WhatsApp API" entrypoint). Blocks access until the active
 * workspace has a valid plan + billing status.
 *
 * Backend protection is also enforced inside the meta-embedded-signup
 * edge function — this is purely UX.
 */
export function WhatsAppAccessGuard({ children }: WhatsAppAccessGuardProps) {
  const access = useWhatsAppConnectionAccess();
  const navigate = useNavigate();
  const isPlan = access.requiredAction === 'choose_plan';
  const isPayment = access.requiredAction === 'complete_payment';

  useEffect(() => {
    if (!access.isLoading && !access.allowed && (isPlan || isPayment) && access.redirectUrl) {
      navigate(access.redirectUrl, { replace: true });
    }
  }, [access.allowed, access.isLoading, access.redirectUrl, isPayment, isPlan, navigate]);

  if (access.isLoading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (access.allowed) return <>{children}</>;

  if (isPlan || isPayment) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  const title = isPlan
    ? 'Choose a plan before connecting WhatsApp API'
    : isPayment
      ? 'Complete your checkout to continue'
      : 'Resolve your billing to continue';

  const description = isPlan
    ? 'To connect your WhatsApp API, please select a plan first. Free plan requires no card. Paid plans include a 30-day trial with card setup.'
    : isPayment
      ? `You picked ${access.currentPlan ?? 'a paid plan'} but checkout wasn't completed. Finish payment to activate your workspace and connect WhatsApp.`
      : `Your subscription is currently ${access.billingStatus ?? 'inactive'}. Update your billing to continue connecting WhatsApp.`;

  const primaryLabel = isPlan ? 'Choose Plan' : isPayment ? 'Complete Payment' : 'Open Billing';

  return (
    <DashboardLayout>
      <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center px-4 py-10">
        <Card className="w-full overflow-hidden border-primary/20 shadow-2xl shadow-primary/10">
          <div className="bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
          </div>
          <CardContent className="space-y-3 p-6">
            <Button
              size="lg"
              className="w-full gap-2 rounded-xl bg-gradient-to-r from-primary to-emerald-500 font-semibold shadow-lg"
              onClick={() => navigate(access.redirectUrl)}
            >
              <Sparkles className="h-4 w-4" />
              {primaryLabel}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full rounded-xl"
              onClick={() => navigate('/pricing')}
            >
              View Pricing
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={() => navigate('/dashboard')}
            >
              Back to dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
