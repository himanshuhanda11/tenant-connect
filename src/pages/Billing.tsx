import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BillingOverviewCards } from '@/components/billing/BillingOverviewCards';
import { BillingQuickActions } from '@/components/billing/BillingQuickActions';
import { MetaBillingNotice } from '@/components/billing/MetaBillingNotice';
import { UsageOverview } from '@/components/billing/UsageOverview';
import { PlanCard } from '@/components/billing/PlanCard';
import { AddOnsSection } from '@/components/billing/AddOnsSection';
import { InvoicesTable } from '@/components/billing/InvoicesTable';
import { PaymentMethodsCard } from '@/components/billing/PaymentMethodsCard';
import { BillingSettingsForm } from '@/components/billing/BillingSettingsForm';
import { SubscriptionActions } from '@/components/billing/SubscriptionActions';
import { BillingFAQ } from '@/components/billing/BillingFAQ';
import { usePlans, useSubscription } from '@/hooks/useBilling';
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

  const handlePlanSelect = (plan: Plan) => {
    if (plan.name === 'Enterprise') {
      toast.info('Contact sales for Enterprise pricing');
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
            <TabsList className="inline-flex w-auto min-w-max sm:grid sm:w-full sm:grid-cols-3 lg:grid-cols-6 gap-1">
              <TabsTrigger value="overview" className="text-xs sm:text-sm px-3 sm:px-4">Overview</TabsTrigger>
              <TabsTrigger value="plans" className="text-xs sm:text-sm px-3 sm:px-4">Plans</TabsTrigger>
              <TabsTrigger value="usage" className="text-xs sm:text-sm px-3 sm:px-4">Usage</TabsTrigger>
              <TabsTrigger value="invoices" className="text-xs sm:text-sm px-3 sm:px-4">Invoices</TabsTrigger>
              <TabsTrigger value="payment" className="text-xs sm:text-sm px-3 sm:px-4">Payment</TabsTrigger>
              <TabsTrigger value="settings" className="text-xs sm:text-sm px-3 sm:px-4">Settings</TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
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
                      isCurrentPlan={subscription?.plan_id === plan.id}
                      isYearly={isYearly}
                      isRecommended={plan.name === 'Growth'}
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

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Invoices</CardTitle>
                <CardDescription>
                  View and download your billing history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InvoicesTable />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Tab */}
          <TabsContent value="payment" className="space-y-6">
            <PaymentMethodsCard />
            <SubscriptionActions />
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
