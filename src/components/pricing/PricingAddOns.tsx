import { Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { addOns, formatINR } from '@/data/addOns';
import addonExtraAgents from '@/assets/addon-extra-agents.png';
import addonExtraFlows from '@/assets/addon-extra-flows.png';
import addonAutoforms from '@/assets/addon-autoforms.png';
import addonAiCredits from '@/assets/addon-ai-credits.png';
import addonCampaignBoost from '@/assets/addon-campaign-boost.png';
import addonQualityGuard from '@/assets/addon-quality-guard.png';
import addonIntegrations from '@/assets/addon-integrations.png';
import addonsBanner from '@/assets/pricing-addons-banner.png';

const addonImages: Record<string, string> = {
  extra_agents: addonExtraAgents,
  extra_flows: addonExtraFlows,
  extra_autoforms: addonAutoforms,
  ai_credits: addonAiCredits,
  campaign_boost: addonCampaignBoost,
  anti_ban_guard: addonQualityGuard,
  advanced_integrations: addonIntegrations,
};

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

        {/* Banner image */}
        <div className="max-w-2xl mx-auto mb-8">
          <img src={addonsBanner} alt="Add-ons overview" className="w-full rounded-2xl" />
        </div>

        {/* Responsive grid: 2 cols on mobile, 3-4 on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 max-w-6xl mx-auto">
          {addOns.map((addon) => {
            const image = addonImages[addon.id];
            return (
              <div
                key={addon.id}
                className="group relative rounded-2xl border border-border bg-card p-3 sm:p-5 transition-all hover:shadow-lg hover:border-primary/20"
              >
                {addon.badge && (
                  <Badge variant="secondary" className="absolute -top-2 right-3 text-[10px]">
                    {addon.badge}
                  </Badge>
                )}
                <div className="flex flex-col items-center sm:items-start sm:flex-row gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {image ? (
                      <img src={image} alt={addon.name} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <addon.icon className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="min-w-0 text-center sm:text-left">
                    <h3 className="font-semibold text-foreground text-xs sm:text-sm">{addon.name}</h3>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 line-clamp-2 hidden sm:block">{addon.benefit}</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between mt-auto gap-1">
                  <span className="text-xs sm:text-sm text-center sm:text-left">
                    <span className="font-bold text-foreground">{formatINR(addon.price)}</span>
                    <span className="text-muted-foreground text-[10px] sm:text-[11px] block">{addon.unit}</span>
                  </span>
                </div>
                <div className="mt-1.5 sm:mt-2 text-center sm:text-left">
                  <Badge variant="outline" className="text-[9px] sm:text-[10px] font-normal border-border">
                    {addon.availableOn.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' & ')}
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
