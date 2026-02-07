import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Lock } from 'lucide-react';
import { addOns, addOnCategories, type AddOnCategory, type AddOn } from '@/data/addOns';
import { AddOnCard } from '@/components/billing/AddOnCard';
import { useEntitlements } from '@/hooks/useEntitlements';
import { DashboardBreadcrumb } from '@/components/layout/DashboardBreadcrumb';
import { cn } from '@/lib/utils';

const categoryOrder: AddOnCategory[] = ['team', 'automation', 'ai_power', 'growth', 'safety'];

const popularIds = ['extra_agents', 'ai_credits', 'campaign_boost'];

export default function WorkspaceAddOns() {
  const { data: entitlements } = useEntitlements();
  const planId = entitlements?.plan_id ?? 'free';
  const isFree = planId === 'free';

  const grouped: Record<AddOnCategory, AddOn[]> = {
    team: [], automation: [], ai_power: [], growth: [], safety: [],
  };
  addOns.forEach(a => grouped[a.category].push(a));

  const popular = addOns.filter(a => popularIds.includes(a.id));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <DashboardBreadcrumb items={[{ label: 'Add-Ons' }]} className="mb-2" />
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Add-Ons
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Scale when you grow — add more capacity without changing plans.
          </p>
        </div>

        {isFree && (
          <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-500/30 bg-amber-50/60 dark:bg-amber-500/5">
            <Lock className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">Add-ons require a paid plan</p>
              <p className="text-xs text-muted-foreground">Upgrade to Basic or Pro to unlock add-ons for your workspace.</p>
            </div>
          </div>
        )}

        {/* Most Popular */}
        <section>
          <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">Most Popular</Badge>
          </h2>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {popular.map(addon => (
              <AddOnCard
                key={addon.id}
                addon={addon}
                locked={isFree || !addon.availableOn.includes(planId as any)}
              />
            ))}
          </div>
        </section>

        {/* By Category */}
        {categoryOrder.map(cat => {
          const items = grouped[cat];
          if (!items.length) return null;
          const meta = addOnCategories[cat];
          return (
            <section key={cat}>
              <div className="mb-3">
                <h2 className="text-base font-semibold">{meta.label}</h2>
                <p className="text-xs text-muted-foreground">{meta.description}</p>
              </div>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {items.map(addon => (
                  <AddOnCard
                    key={addon.id}
                    addon={addon}
                    locked={isFree || !addon.availableOn.includes(planId as any)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
