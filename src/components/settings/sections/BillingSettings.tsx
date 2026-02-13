import React from 'react';
import { CreditCard, Receipt, TrendingUp, Gauge, Tag, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { useSubscription, useUsage, useInvoices, useTeamUsage, usePhoneUsage } from '@/hooks/useBilling';
import { format } from 'date-fns';

export function BillingSettings() {
  const { data: subscription, isLoading: subLoading } = useSubscription();
  const { data: usage, isLoading: usageLoading } = useUsage();
  const { data: invoices, isLoading: invLoading } = useInvoices();
  const { data: teamUsage } = useTeamUsage();
  const { data: phoneUsage } = usePhoneUsage();

  const isLoading = subLoading || usageLoading || invLoading;

  const planName = subscription?.plan?.name ?? 'Free';
  const planPrice = subscription?.plan?.price_monthly ?? 0;
  const billingCycle = subscription?.billing_cycle ?? 'monthly';

  const teamUsed = teamUsage?.used ?? 0;
  const teamLimit = teamUsage?.limit ?? 1;
  const phoneUsed = phoneUsage?.used ?? 0;
  const phoneLimit = phoneUsage?.limit ?? 1;
  const messagesSent = usage?.messages_sent ?? 0;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6 mt-6">
          {/* Current Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Current Plan
              </CardTitle>
              <CardDescription>Your subscription details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <div className="grid gap-4 md:grid-cols-3">
                    <Skeleton className="h-20" /><Skeleton className="h-20" /><Skeleton className="h-20" />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between p-4 rounded-lg border border-primary/30 bg-primary/5">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold">{planName} Plan</h3>
                        <Badge className="bg-primary text-primary-foreground">
                          {subscription?.status === 'active' ? 'Active' : subscription?.status ?? 'Active'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {planPrice > 0 ? `₹${planPrice.toLocaleString('en-IN')}/${billingCycle === 'yearly' ? 'year' : 'month'}` : 'Free forever'}
                        {billingCycle === 'yearly' && ' • Billed yearly'}
                      </p>
                    </div>
                    <Button asChild>
                      <Link to="/billing">Upgrade</Link>
                    </Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="p-4 rounded-lg border border-border">
                      <p className="text-sm text-muted-foreground">Team Members</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold">{teamUsed}</span>
                        <span className="text-muted-foreground">/ {teamLimit === -1 ? '∞' : teamLimit}</span>
                      </div>
                      {teamLimit > 0 && teamLimit !== -1 && (
                        <Progress value={Math.min(Math.round((teamUsed / teamLimit) * 100), 100)} className="mt-2 h-1.5" />
                      )}
                    </div>
                    <div className="p-4 rounded-lg border border-border">
                      <p className="text-sm text-muted-foreground">Phone Numbers</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold">{phoneUsed}</span>
                        <span className="text-muted-foreground">/ {phoneLimit === -1 ? '∞' : phoneLimit}</span>
                      </div>
                      {phoneLimit > 0 && phoneLimit !== -1 && (
                        <Progress value={Math.min(Math.round((phoneUsed / phoneLimit) * 100), 100)} className="mt-2 h-1.5" />
                      )}
                    </div>
                    <div className="p-4 rounded-lg border border-border">
                      <p className="text-sm text-muted-foreground">Messages (This Month)</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold">{messagesSent.toLocaleString()}</span>
                        <span className="text-muted-foreground">sent</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Meta charges apply separately</p>
                    </div>
                  </div>

                  <Button asChild variant="outline" className="w-full">
                    <Link to="/billing">Manage Billing →</Link>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Invoice History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-primary" />
                Invoice History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full" />)}
                </div>
              ) : invoices && invoices.length > 0 ? (
                <div className="space-y-2">
                  {invoices.slice(0, 5).map((inv: any) => (
                    <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <div>
                        <p className="font-medium">
                          {inv.created_at ? format(new Date(inv.created_at), 'MMM d, yyyy') : 'N/A'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ₹{(inv.amount_paid ?? 0).toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={inv.status === 'paid' ? 'text-green-600' : ''}>
                          {inv.status}
                        </Badge>
                        {inv.invoice_pdf_url && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={inv.invoice_pdf_url} target="_blank" rel="noopener">Download</a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Receipt className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No invoices yet</p>
                  <p className="text-xs mt-1">Invoices will appear here once you have a paid subscription</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No payment method configured</p>
                <p className="text-xs mt-1">Add a payment method when you upgrade your plan</p>
                <Button variant="outline" size="sm" className="mt-4" asChild>
                  <Link to="/billing">Add Payment Method</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Usage-Based Billing
              </CardTitle>
              <CardDescription>Pay-as-you-go pricing for overages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Overage Billing</Label>
                  <p className="text-sm text-muted-foreground">Charge for usage beyond plan limits</p>
                </div>
                <Switch />
              </div>

              <div className="text-center py-4 text-muted-foreground">
                <p className="text-sm">Overage billing settings will be available with paid plans</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="w-5 h-5 text-primary" />
                Usage Limits
              </CardTitle>
              <CardDescription>Configure soft and hard limits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Soft Limit Warning (%)</Label>
                  <Input type="number" defaultValue="80" />
                  <p className="text-xs text-muted-foreground">Alert when usage reaches this %</p>
                </div>
                <div className="space-y-2">
                  <Label>Hard Limit (%)</Label>
                  <Input type="number" defaultValue="100" />
                  <p className="text-xs text-muted-foreground">Stop sending at this %</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-upgrade on Limit</Label>
                  <p className="text-sm text-muted-foreground">Automatically upgrade plan when limit reached</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary" />
                Cost Center Tagging
              </CardTitle>
              <CardDescription>Track costs by department or project</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Cost Centers</Label>
                  <p className="text-sm text-muted-foreground">Tag campaigns and workflows for cost tracking</p>
                </div>
                <Switch />
              </div>

              <div className="space-y-2">
                <Label>Cost Centers</Label>
                <div className="flex flex-wrap gap-2">
                  <Button variant="ghost" size="sm">+ Add Cost Center</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Proration Preview
              </CardTitle>
              <CardDescription>See how plan changes affect your bill</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg border border-border bg-muted/30">
                <p className="text-sm text-muted-foreground">
                  Plan change proration will be calculated automatically when you upgrade or downgrade.
                </p>
              </div>
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link to="/billing">View Upgrade Options</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
