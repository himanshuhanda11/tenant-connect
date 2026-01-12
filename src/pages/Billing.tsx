import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Check } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'For getting started',
    features: ['500 contacts', '1,000 messages/month', '1 phone number', '3 team members'],
    current: true,
  },
  {
    name: 'Pro',
    price: '$49',
    description: 'For growing teams',
    features: ['5,000 contacts', '10,000 messages/month', '3 phone numbers', '10 team members', 'Priority support'],
    current: false,
  },
  {
    name: 'Business',
    price: '$149',
    description: 'For larger organizations',
    features: ['Unlimited contacts', 'Unlimited messages', '10 phone numbers', 'Unlimited team members', 'API access', 'Custom integrations'],
    current: false,
  },
];

export default function Billing() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Billing & Plans</h1>
          <p className="text-muted-foreground">
            Manage your subscription and billing
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.name} className={plan.current ? 'border-primary' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.current && (
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                      Current
                    </span>
                  )}
                </div>
                <div className="mt-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full mt-6"
                  variant={plan.current ? 'outline' : 'default'}
                  disabled={plan.current}
                >
                  {plan.current ? 'Current Plan' : 'Upgrade'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Usage This Month</CardTitle>
            <CardDescription>Your current usage against plan limits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Messages Sent</span>
              <span className="text-sm text-muted-foreground">0 / 1,000</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: '0%' }} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Contacts</span>
              <span className="text-sm text-muted-foreground">0 / 500</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: '0%' }} />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
