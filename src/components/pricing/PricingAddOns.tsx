import { Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { addOns, formatINR } from '@/data/addOns';

export default function PricingAddOns() {
  return (
    <section className="py-10 md:py-14">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-3">
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Add-Ons
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">
            Add power when you need it
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto text-sm sm:text-base">
            Extend your plan with capacity-based add-ons. No forced upgrades.
          </p>
        </div>

        {/* Horizontal scroll on mobile, grid on desktop */}
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-3 lg:grid-cols-4 md:overflow-visible md:pb-0 max-w-6xl mx-auto">
          {addOns.map((addon) => {
            const Icon = addon.icon;
            return (
              <div
                key={addon.id}
                className="min-w-[260px] sm:min-w-0 snap-start group relative rounded-2xl border border-border bg-card p-5 transition-all hover:shadow-lg hover:border-primary/20"
              >
                {addon.badge && (
                  <Badge variant="secondary" className="absolute -top-2 right-3 text-[10px]">
                    {addon.badge}
                  </Badge>
                )}
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 flex-shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground text-sm">{addon.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{addon.benefit}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-sm">
                    <span className="font-bold text-foreground">Starting {formatINR(addon.price)}</span>
                    <span className="text-muted-foreground text-[11px] block">{addon.unit}</span>
                  </span>
                </div>
                <div className="mt-2">
                  <Badge variant="outline" className="text-[10px] font-normal border-border">
                    Works with {addon.availableOn.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' & ')}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
