import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BillingOverviewCards } from '@/components/billing/BillingOverviewCards';
import { MetaBillingNotice } from '@/components/billing/MetaBillingNotice';
import { UsageOverview } from '@/components/billing/UsageOverview';
import { PlanCardsGrid } from '@/components/billing/PlanCardsGrid';
import { MonthlyYearlyToggle } from '@/components/billing/MonthlyYearlyToggle';
import { AddOnsSection } from '@/components/billing/AddOnsSection';
import { MessageCreditsCard } from '@/components/billing/MessageCreditsCard';
import { BillingSettingsForm } from '@/components/billing/BillingSettingsForm';
import { BillingFAQ } from '@/components/billing/BillingFAQ';
import { WorkspacePlanCard } from '@/components/billing/WorkspacePlanCard';
import { InvoiceHistory } from '@/components/billing/InvoiceHistory';
import { useSubscription } from '@/hooks/useBilling';
import { useEntitlements } from '@/hooks/useEntitlements';
import { useWorkspaceBilling, useStartCheckout, useOpenBillingPortal, useChangePlan } from '@/hooks/useWorkspaceBilling';
import { useTenant } from '@/contexts/TenantContext';
import { PaymentFailedBanner } from '@/components/billing/PaymentFailedBanner';
import { BillingStatusBadge } from '@/components/billing/BillingStatusBadge';
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { LayoutDashboard, CreditCard, BarChart3, Settings, Sparkles, Receipt, ExternalLink } from 'lucide-react';
import { regionFromCountry, PLAN_RANK, type PlanId } from '@/data/plans.config';

export default function Billing() {
  const [isYearly, setIsYearly] = useState(false);
  const [planLoading, setPlanLoading] = useState<string | null>(null);
  const [params] = useSearchParams();
  const { currentTenant } = useTenant();
  const { data: subscription } = useSubscription();
  const { data: entitlements } = useEntitlements();
  const { data: billing, refetch: refetchBilling } = useWorkspaceBilling();
  const startCheckout = useStartCheckout();
  const openPortal = useOpenBillingPortal();
  const changePlan = useChangePlan();

  const currentPlanId = (billing?.plan_id ?? entitlements?.plan_id ?? subscription?.plan_id ?? 'free').replace(/^plan_/, '');
  const isTopPlan = currentPlanId === 'business';
  const showPaymentFailed = billing?.status === 'past_due' || billing?.status === 'unpaid' || billing?.last_payment_status === 'failed';
  const region = useMemo(() => regionFromCountry((currentTenant as any)?.country), [currentTenant]);
  const country = (currentTenant as any)?.country ?? undefined;

  // Handle Stripe return
  useEffect(() => {
    const status = params.get('status');
    if (status === 'success') {
      toast.success('Subscription activated! 🎉', { description: 'Your trial is now active.' });
      const t = setTimeout(() => refetchBilling(), 1500);
      return () => clearTimeout(t);
    }
    if (status === 'cancelled') {
      toast.info('Checkout cancelled');
    }
  }, [params, refetchBilling]);

  const PLAN_RANK: Record<string, number> = { free: 0, basic: 1, pro: 2, business: 3 };
  const handlePlanSelect = async (plan: Plan) => {
    if (!currentTenant?.id) return;
    if (plan.id === currentPlanId) return;

    const targetRank = PLAN_RANK[plan.id] ?? 0;
    const currentRank = PLAN_RANK[currentPlanId] ?? 0;

    // No active Stripe sub yet → start fresh checkout (works for upgrade from free)
    if (!billing?.has_subscription) {
      if (plan.id === 'free') {
        toast.info('You are already on a free or inactive plan');
        return;
      }
      try {
        const res = await startCheckout.mutateAsync({
          workspaceId: currentTenant.id,
          planId: plan.id,
          billingCycle: isYearly ? 'yearly' : 'monthly',
        });
        if (res?.checkout_url) { window.location.href = res.checkout_url; return; }
        toast.success('Plan updated');
      } catch (e: any) {
        toast.error(e?.message || 'Could not start checkout');
      }
      return;
    }

    // Active sub → change plan via Stripe
    try {
      await changePlan.mutateAsync({
        workspaceId: currentTenant.id,
        planId: plan.id,
        billingCycle: isYearly ? 'yearly' : 'monthly',
      });
      toast.success(targetRank > currentRank ? 'Upgraded! ✨' : 'Downgrade scheduled at period end');
    } catch (e: any) {
      toast.error(e?.message || 'Could not change plan');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              Billing & Subscription
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your plan, usage, invoices, and billing settings
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start">
            {billing && (
              <BillingStatusBadge
                status={(showPaymentFailed ? 'payment_failed' : (billing.is_trialing ? 'trialing' : billing.status)) as any}
                planName={billing.plan_name}
                trialDaysLeft={billing.is_trialing ? billing.trial_days_left : undefined}
              />
            )}
            {billing?.has_subscription && (
              <Button size="sm" variant="outline" className="gap-1.5"
                onClick={() => currentTenant?.id && openPortal.mutate(currentTenant.id)}
                disabled={openPortal.isPending}>
                <ExternalLink className="w-3.5 h-3.5" /> Manage Billing
              </Button>
            )}
            {isTopPlan && (
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 gap-1.5 px-3 py-1.5 text-xs">
                <Sparkles className="h-3.5 w-3.5" /> Business Plan Active
              </Badge>
            )}
          </div>
        </div>

        {showPaymentFailed && currentTenant?.id && (
          <PaymentFailedBanner workspaceId={currentTenant.id} />
        )}

        <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex w-auto min-w-max sm:grid sm:w-full sm:grid-cols-5 gap-1 bg-muted/50 p-1">
              <TabsTrigger value="overview" className="text-xs sm:text-sm px-3 sm:px-4 gap-1.5 data-[state=active]:shadow-sm">
                <LayoutDashboard className="h-3.5 w-3.5 hidden sm:block" /> Overview
              </TabsTrigger>
              <TabsTrigger value="plans" className="text-xs sm:text-sm px-3 sm:px-4 gap-1.5 data-[state=active]:shadow-sm">
                <CreditCard className="h-3.5 w-3.5 hidden sm:block" /> Plans
              </TabsTrigger>
              <TabsTrigger value="usage" className="text-xs sm:text-sm px-3 sm:px-4 gap-1.5 data-[state=active]:shadow-sm">
                <BarChart3 className="h-3.5 w-3.5 hidden sm:block" /> Usage
              </TabsTrigger>
              <TabsTrigger value="invoices" className="text-xs sm:text-sm px-3 sm:px-4 gap-1.5 data-[state=active]:shadow-sm">
                <Receipt className="h-3.5 w-3.5 hidden sm:block" /> Invoices
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-xs sm:text-sm px-3 sm:px-4 gap-1.5 data-[state=active]:shadow-sm">
                <Settings className="h-3.5 w-3.5 hidden sm:block" /> Settings
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-5">
            <WorkspacePlanCard />
            <BillingOverviewCards />
            <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
              <MessageCreditsCard />
              <BillingFAQ />
            </div>
            <MetaBillingNotice />
          </TabsContent>

          {/* Plans Tab */}
          <TabsContent value="plans" className="space-y-5">
            <Card className="overflow-hidden">
              <CardHeader className="bg-muted/30 border-b">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">
                      {isTopPlan ? 'Your Plan' : 'Choose Your Plan'}
                    </CardTitle>
                    <CardDescription>
                      {isTopPlan
                        ? 'You are on the highest tier — all features unlocked'
                        : 'Same plans, prices and features as the public Pricing page.'}
                    </CardDescription>
                  </div>
                  <MonthlyYearlyToggle yearly={isYearly} onChange={setIsYearly} variant="light" />
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <PlanCardsGrid
                  region={region}
                  cycle={isYearly ? 'yearly' : 'monthly'}
                  currentPlanId={currentPlanId}
                  showFree
                  variant="light"
                  showTrialBadge={!billing?.has_subscription}
                  loadingPlanId={planLoading}
                  onSelect={handleSharedPlanSelect}
                />
              </CardContent>
            </Card>
            <AddOnsSection />
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage" className="space-y-5">
            <UsageOverview />
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-5">
            <InvoiceHistory />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-5">
            <BillingSettingsForm />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
