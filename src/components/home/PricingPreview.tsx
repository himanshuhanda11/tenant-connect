import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

const plans = [
  {
    name: 'Starter',
    monthlyPrice: 49,
    yearlyPrice: 39,
    description: 'Perfect for small teams getting started',
    features: [
      '3 team members',
      '1 phone number',
      '5,000 messages/month',
      '3 automation workflows',
      '10,000 contacts',
      'Email support',
    ],
    popular: false,
  },
  {
    name: 'Pro',
    monthlyPrice: 149,
    yearlyPrice: 119,
    description: 'For growing businesses scaling operations',
    features: [
      '10 team members',
      '3 phone numbers',
      '25,000 messages/month',
      'Unlimited automations',
      '100,000 contacts',
      'Priority support',
      'A/B testing',
      'Custom roles',
    ],
    popular: true,
  },
  {
    name: 'Business',
    monthlyPrice: 399,
    yearlyPrice: 319,
    description: 'Enterprise features for large teams',
    features: [
      'Unlimited team members',
      '10 phone numbers',
      '100,000 messages/month',
      'Unlimited automations',
      'Unlimited contacts',
      'Dedicated support',
      'SSO & SAML',
      'Audit logs',
      'Custom SLA',
    ],
    popular: false,
  },
];

export default function PricingPreview() {
  const [isYearly, setIsYearly] = useState(true);
  const [messagesPerMonth, setMessagesPerMonth] = useState([10000]);

  const calculateEstimate = () => {
    const basePrice = isYearly ? 119 : 149;
    const includedMessages = 25000;
    const extraMessages = Math.max(0, messagesPerMonth[0] - includedMessages);
    const extraCost = Math.ceil(extraMessages / 1000) * 2;
    return basePrice + extraCost;
  };

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            Choose the plan that fits your business needs
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-3">
            <span className={`text-sm ${!isYearly ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <Switch 
              checked={isYearly} 
              onCheckedChange={setIsYearly}
            />
            <span className={`text-sm ${isYearly ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              Yearly
            </span>
            {isYearly && (
              <Badge className="bg-green-500/10 text-green-600 border-0">Save 20%</Badge>
            )}
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          {plans.map((plan, index) => (
            <Card 
              key={index}
              className={`relative ${plan.popular ? 'border-primary shadow-xl scale-105' : 'border-border/50'}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="pt-4">
                  <span className="text-4xl font-bold text-foreground">
                    ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full" 
                  variant={plan.popular ? 'default' : 'outline'}
                  asChild
                >
                  <Link to="/signup">Get Started</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Cost Estimator */}
        <div className="max-w-xl mx-auto bg-muted/50 rounded-2xl p-6 md:p-8 border border-border/50">
          <h3 className="text-lg font-semibold text-foreground mb-4 text-center">
            Estimate Your Cost
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <Label>Messages per month</Label>
                <span className="text-sm font-medium text-foreground">
                  {messagesPerMonth[0].toLocaleString()}
                </span>
              </div>
              <Slider
                value={messagesPerMonth}
                onValueChange={setMessagesPerMonth}
                min={5000}
                max={100000}
                step={5000}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>5K</span>
                <span>100K</span>
              </div>
            </div>
            <div className="pt-4 border-t border-border flex items-center justify-between">
              <span className="text-muted-foreground">Estimated monthly cost (Pro plan)</span>
              <span className="text-2xl font-bold text-foreground">${calculateEstimate()}</span>
            </div>
          </div>
        </div>

        <div className="text-center mt-10">
          <Button size="lg" asChild>
            <Link to="/pricing">
              View Full Pricing
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
