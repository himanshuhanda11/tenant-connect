import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BillingOverviewCards } from '@/components/billing/BillingOverviewCards';
import { BillingQuickActions } from '@/components/billing/BillingQuickActions';
import { MetaBillingNotice } from '@/components/billing/MetaBillingNotice';
import { UsageOverview } from '@/components/billing/UsageOverview';
import { PlanCard } from '@/components/billing/PlanCard';
import { AddOnsSection } from '@/components/billing/AddOnsSection';
import { MessageCreditsCard } from '@/components/billing/MessageCreditsCard';
import { BillingSettingsForm } from '@/components/billing/BillingSettingsForm';
import { BillingFAQ } from '@/components/billing/BillingFAQ';
import { WorkspacePlanCard } from '@/components/billing/WorkspacePlanCard';
import { usePlans, useSubscription } from '@/hooks/useBilling';
import { useEntitlements } from '@/hooks/useEntitlements';
import { QuickGuide, quickGuides } from '@/components/help/QuickGuide';
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import type { Plan } from '@/types/billing';

export default function Billing() {
  const [isYearly, setIsYearly] = useState(false);
  const { data: plans } = usePlans();
  const { data: subscription } = useSubscription();
  const { data: entitlements } = useEntitlements();
  const currentPlanId = entitlements?.plan_id ?? subscription?.plan_id ?? 'free';

  const handlePlanSelect = (plan: Plan) => {
    if (plan.name === 'Business') {
      toast.info('Contact sales for Business pricing');
    } else {
      toast.info('Stripe integration pending - Upgrade will be available soon');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Quick Guide */}
        <QuickGuide {...quickGuides.billing} />

        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Billing & Subscription</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your subscription, usage, and payment methods
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
          {/* Mobile: horizontal scrollable tabs */}
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex w-auto min-w-max sm:grid sm:w-full sm:grid-cols-4 gap-1">
              <TabsTrigger value="overview" className="text-xs sm:text-sm px-3 sm:px-4">Overview</TabsTrigger>
              <TabsTrigger value="plans" className="text-xs sm:text-sm px-3 sm:px-4">Plans</TabsTrigger>
              <TabsTrigger value="usage" className="text-xs sm:text-sm px-3 sm:px-4">Usage</TabsTrigger>
              <TabsTrigger value="settings" className="text-xs sm:text-sm px-3 sm:px-4">Settings</TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <WorkspacePlanCard />
            <MessageCreditsCard />
            <MetaBillingNotice />
            <BillingOverviewCards />
            <BillingQuickActions />
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
              <UsageOverview />
              <BillingFAQ />
            </div>
          </TabsContent>

          {/* Plans Tab */}
          <TabsContent value="plans" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Choose Your Plan</CardTitle>
                    <CardDescription>
                      Select the plan that best fits your needs
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <Label htmlFor="billing-toggle" className={!isYearly ? 'font-medium' : 'text-muted-foreground'}>
                      Monthly
                    </Label>
                    <Switch
                      id="billing-toggle"
                      checked={isYearly}
                      onCheckedChange={setIsYearly}
                    />
                    <Label htmlFor="billing-toggle" className={isYearly ? 'font-medium' : 'text-muted-foreground'}>
                      Yearly (Save 17%)
                    </Label>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  {plans?.map((plan) => (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      isCurrentPlan={currentPlanId === plan.id}
                      isYearly={isYearly}
                      isRecommended={currentPlanId !== 'business' && plan.name === 'Pro'}
                      onSelect={handlePlanSelect}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
            <AddOnsSection />
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage" className="space-y-6">
            <UsageOverview />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <BillingSettingsForm />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
