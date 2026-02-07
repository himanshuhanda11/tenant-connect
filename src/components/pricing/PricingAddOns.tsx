import { ChevronRight } from 'lucide-react';
import addonExtraAgents from '@/assets/addon-extra-agents.png';
import addonExtraFlows from '@/assets/addon-extra-flows.png';
import addonAutoforms from '@/assets/addon-autoforms.png';
import addonAiCredits from '@/assets/addon-ai-credits.png';
import addonCampaignBoost from '@/assets/addon-campaign-boost.png';
import addonQualityGuard from '@/assets/addon-quality-guard.png';

const addons = [
  { key: 'extra_agents', title: 'Extra Agents', price: 'Starting from ₹…', image: addonExtraAgents },
  { key: 'extra_flows', title: 'Extra Flows', price: 'Starting from ₹…', image: addonExtraFlows },
  { key: 'extra_autoforms', title: 'Extra AutoForms', price: 'Starting from ₹…', image: addonAutoforms },
  { key: 'ai_credits', title: 'AI Credits', price: 'Starting from ₹…', image: addonAiCredits },
  { key: 'campaign_boost', title: 'Campaign Boost', price: 'Starting from ₹…', image: addonCampaignBoost },
  { key: 'quality_guard', title: 'Anti-Ban / Quality Guard', price: 'Starting from ₹…', image: addonQualityGuard },
];

export default function PricingAddOns() {
  return (
    <section className="py-10 md:py-14">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Add power when you need it
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Extend your plan with capacity add-ons — no forced upgrades.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
          {addons.map((addon) => (
            <div
              key={addon.key}
              className="flex flex-col items-center text-center rounded-2xl border border-border bg-card p-4 hover:shadow-lg hover:border-primary/20 transition-all"
            >
              <div className="w-16 h-16 mb-3 rounded-xl overflow-hidden bg-muted/30 flex items-center justify-center">
                <img src={addon.image} alt={addon.title} className="w-14 h-14 object-contain" />
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-1">{addon.title}</h3>
              <p className="text-xs text-muted-foreground mb-3">{addon.price}</p>
              <button className="inline-flex items-center gap-1 text-xs text-muted-foreground border border-border rounded-full px-3 py-1.5 hover:bg-muted/30 transition-colors">
                Locked <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
