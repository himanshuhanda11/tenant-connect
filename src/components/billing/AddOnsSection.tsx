import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Phone, Workflow, Server } from 'lucide-react';

const addOns = [
  {
    id: 'extra-seats',
    name: 'Extra Team Seats',
    description: 'Add more team members to your workspace',
    price: 499,
    unit: 'per seat/month',
    icon: Users,
  },
  {
    id: 'extra-numbers',
    name: 'Additional Phone Numbers',
    description: 'Connect more WhatsApp numbers',
    price: 799,
    unit: 'per number/month',
    icon: Phone,
  },
  {
    id: 'extra-automations',
    name: 'Automation Boost',
    description: '1,000 additional automation runs per month',
    price: 1499,
    unit: 'per 1,000 runs/month',
    icon: Workflow,
  },
  {
    id: 'dedicated-ip',
    name: 'Dedicated Webhook IP',
    description: 'Get a dedicated IP for webhook callbacks',
    price: 2999,
    unit: 'per month',
    icon: Server,
    badge: 'Enterprise',
  },
];

const formatINR = (val: number) => `₹${val.toLocaleString('en-IN')}`;

export function AddOnsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add-ons</CardTitle>
        <CardDescription>
          Extend your plan with additional features and capacity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
          {addOns.map((addon) => (
            <div 
              key={addon.id}
              className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors touch-manipulation"
            >
              <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 flex-shrink-0">
                <addon.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-medium text-sm sm:text-base">{addon.name}</h4>
                  {addon.badge && (
                    <Badge variant="secondary" className="text-[10px] sm:text-xs">
                      {addon.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
                  {addon.description}
                </p>
                <div className="flex items-center justify-between mt-2 sm:mt-3 gap-2">
                  <span className="text-xs sm:text-sm">
                    <span className="font-semibold">{formatINR(addon.price)}</span>
                    <span className="text-muted-foreground"> {addon.unit}</span>
                  </span>
                  <Button size="sm" variant="outline" className="h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3">
                    Add
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
