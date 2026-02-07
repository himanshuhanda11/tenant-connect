import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import { addOns, addOnCategories, formatINR, type AddOnCategory } from '@/data/addOns';
import { AddOnCard } from './AddOnCard';
import { useEntitlements } from '@/hooks/useEntitlements';
import { useNavigate } from 'react-router-dom';

export function AddOnsSection() {
  const { data: entitlements } = useEntitlements();
  const navigate = useNavigate();
  const planId = entitlements?.plan_id ?? 'free';
  const isFree = planId === 'free';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Add-ons</CardTitle>
            <CardDescription>
              Extend your plan with additional features and capacity
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate('/add-ons')}>
            View All
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {addOns.slice(0, 6).map((addon) => (
            <AddOnCard
              key={addon.id}
              addon={addon}
              locked={isFree || !addon.availableOn.includes(planId as any)}
              compact
            />
          ))}
        </div>
        {addOns.length > 6 && (
          <div className="text-center mt-4">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={() => navigate('/add-ons')}>
              See all {addOns.length} add-ons
              <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
