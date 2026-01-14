import React from 'react';
import { CreditCard, Receipt, TrendingUp, AlertTriangle, Gauge, Tag, DollarSign, Settings2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';

export function BillingSettings() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Current Plan
              </CardTitle>
              <CardDescription>Your subscription details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg border border-primary/30 bg-primary/5">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold">Growth Plan</h3>
                    <Badge className="bg-primary text-primary-foreground">Active</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">$99/month • Billed monthly</p>
                </div>
                <Button>Upgrade</Button>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">Team Members</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">5</span>
                    <span className="text-muted-foreground">/ 10</span>
                  </div>
                  <Progress value={50} className="mt-2 h-1.5" />
                </div>
                <div className="p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">Phone Numbers</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">2</span>
                    <span className="text-muted-foreground">/ 5</span>
                  </div>
                  <Progress value={40} className="mt-2 h-1.5" />
                </div>
                <div className="p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">Messages</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">8.5K</span>
                    <span className="text-muted-foreground">/ 10K</span>
                  </div>
                  <Progress value={85} className="mt-2 h-1.5" />
                </div>
              </div>

              <Button asChild variant="outline" className="w-full">
                <Link to="/billing">Manage Billing →</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-primary" />
                Invoice History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { date: 'Jan 1, 2025', amount: '$99.00', status: 'Paid' },
                  { date: 'Dec 1, 2024', amount: '$99.00', status: 'Paid' },
                  { date: 'Nov 1, 2024', amount: '$99.00', status: 'Paid' },
                ].map((inv, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div>
                      <p className="font-medium">{inv.date}</p>
                      <p className="text-sm text-muted-foreground">{inv.amount}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-green-600">{inv.status}</Badge>
                      <Button variant="ghost" size="sm">Download</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center text-white text-xs font-bold">VISA</div>
                  <div>
                    <p className="font-medium">•••• •••• •••• 4242</p>
                    <p className="text-sm text-muted-foreground">Expires 12/26</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Update</Button>
              </div>
              <Button variant="ghost" size="sm">+ Add Payment Method</Button>
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
                <Switch defaultChecked />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">Extra Message Rate</p>
                  <p className="text-lg font-bold">$0.005 / message</p>
                </div>
                <div className="p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">This Month Overages</p>
                  <p className="text-lg font-bold">$12.50</p>
                </div>
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
                  <Badge variant="outline">Marketing</Badge>
                  <Badge variant="outline">Sales</Badge>
                  <Badge variant="outline">Support</Badge>
                  <Button variant="ghost" size="sm">+ Add</Button>
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
                <p className="text-sm text-muted-foreground mb-2">If you upgrade to Business today:</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">$150.50</span>
                  <span className="text-muted-foreground">prorated for remaining days</span>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4">View Upgrade Options</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
