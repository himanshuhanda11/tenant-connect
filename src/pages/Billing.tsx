import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BillingOverviewCards } from '@/components/billing/BillingOverviewCards';
import { MetaBillingNotice } from '@/components/billing/MetaBillingNotice';
import { UsageOverview } from '@/components/billing/UsageOverview';
import { PlanCard } from '@/components/billing/PlanCard';
import { AddOnsSection } from '@/components/billing/AddOnsSection';
import { MessageCreditsCard } from '@/components/billing/MessageCreditsCard';
import { BillingSettingsForm } from '@/components/billing/BillingSettingsForm';
import { BillingFAQ } from '@/components/billing/BillingFAQ';
import { WorkspacePlanCard } from '@/components/billing/WorkspacePlanCard';
import { InvoiceHistory } from '@/components/billing/InvoiceHistory';
import { usePlans, useSubscription } from '@/hooks/useBilling';
import { useEntitlements } from '@/hooks/useEntitlements';
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { LayoutDashboard, CreditCard, BarChart3, Settings, Sparkles, Receipt } from 'lucide-react';
import type { Plan } from '@/types/billing';

export default function Billing() {
  const [isYearly, setIsYearly] = useState(false);
  const { data: plans } = usePlans();
  const { data: subscription } = useSubscription();
  const { data: entitlements } = useEntitlements();
  const currentPlanId = entitlements?.plan_id ?? subscription?.plan_id ?? 'free';
  const isTopPlan = currentPlanId === 'business';

  const handlePlanSelect = (plan: Plan) => {
    if (plan.name === 'Business') {
      toast.info('Contact sales for Business pricing');
    } else if (isTopPlan) {
      toast.info('You are already on the highest plan');
    } else {
      toast.info('Payment integration pending — upgrade will be available soon');
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
          {isTopPlan && (
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 gap-1.5 px-3 py-1.5 text-xs self-start">
              <Sparkles className="h-3.5 w-3.5" /> Business Plan Active
            </Badge>
          )}
        </div>

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
                        : 'Select the plan that best fits your needs'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3 bg-background rounded-lg px-3 py-2 border">
                    <Label htmlFor="billing-toggle" className={`text-xs ${!isYearly ? 'font-semibold' : 'text-muted-foreground'}`}>
                      Monthly
                    </Label>
                    <Switch
                      id="billing-toggle"
                      checked={isYearly}
                      onCheckedChange={setIsYearly}
                    />
                    <Label htmlFor="billing-toggle" className={`text-xs ${isYearly ? 'font-semibold' : 'text-muted-foreground'}`}>
                      Yearly
                      <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0">-20%</Badge>
                    </Label>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  {plans?.map((plan) => (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      isCurrentPlan={currentPlanId === plan.id}
                      isYearly={isYearly}
                      isRecommended={!isTopPlan && plan.name === 'Pro'}
                      onSelect={handlePlanSelect}
                    />
                  ))}
                </div>
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
