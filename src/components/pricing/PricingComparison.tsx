import React from 'react';
import {
  Check, X, Sparkles, Zap, BarChart3,
  Gift, Rocket, Crown, Building2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { comparisonGroups } from '@/data/pricingPlans';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PricingComparisonProps {
  isAnnual: boolean;
}

export default function PricingComparison({ isAnnual }: PricingComparisonProps) {
  const navigate = useNavigate();

  return (
    <section id="comparison" className="py-10 md:py-14 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-3">
            <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
            Feature Comparison
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">
            Compare Plans Side by Side
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto text-sm">
            Every feature, every limit — at a glance
          </p>
        </div>

        {/* Mobile: Collapsible groups */}
        <div className="block md:hidden max-w-lg mx-auto space-y-3">
          {comparisonGroups.map((group, gi) => (
            <Accordion key={gi} type="single" collapsible>
              <AccordionItem value={`cg-${gi}`} className="border border-border rounded-2xl overflow-hidden bg-card shadow-sm">
                <AccordionTrigger className="px-5 py-3.5 text-sm font-semibold text-foreground hover:no-underline hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                      <BarChart3 className="w-3.5 h-3.5 text-primary" />
                    </div>
                    {group.category}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-4">
                  <div className="space-y-3">
                    {group.features.map((feature, fi) => (
                      <div key={fi} className="rounded-xl border border-border/50 overflow-hidden">
                        <div className="bg-muted/30 px-3.5 py-2">
                          <p className="text-sm font-medium text-foreground">{feature.name}</p>
                        </div>
                        <div className="grid grid-cols-4 divide-x divide-border/40">
                          {(['free', 'basic', 'pro', 'business'] as const).map((tier) => (
                            <div key={tier} className={cn(
                              'text-center py-2.5 px-1.5',
                              tier === 'pro' && 'bg-primary/5'
                            )}>
                              <p className={cn(
                                'text-[9px] uppercase tracking-wider mb-0.5 font-medium',
                                tier === 'pro' ? 'text-primary' : 'text-muted-foreground'
                              )}>{tier}</p>
                              <div className="text-xs font-semibold text-foreground">
                                {renderCellMobile(feature[tier], tier === 'pro')}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ))}
        </div>

        {/* Desktop: Premium table */}
        <div className="hidden md:block max-w-6xl mx-auto">
          <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50">
                    <th className="text-left py-5 px-6 w-[280px]">
                      <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Feature</span>
                    </th>
                    <th className="text-center py-5 px-3 w-[140px]">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                          <Gift className="w-4 h-4 text-slate-500" />
                        </div>
                        <span className="text-sm font-bold text-foreground">Free</span>
                        <span className="text-[11px] text-muted-foreground">₹0/mo</span>
                      </div>
                    </th>
                    <th className="text-center py-5 px-3 w-[140px]">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                          <Rocket className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-sm font-bold text-foreground">Basic</span>
                        <span className="text-[11px] text-muted-foreground">{isAnnual ? '₹1,199' : '₹1,499'}/mo</span>
                      </div>
                    </th>
                    <th className="text-center py-5 px-3 w-[140px] relative">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-emerald-500" />
                      <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 -translate-y-full">
                        <Badge className="bg-gradient-to-r from-primary to-emerald-500 text-primary-foreground text-[10px] px-2.5 py-0.5 rounded-full shadow-lg gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          Popular
                        </Badge>
                      </div>
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center ring-2 ring-primary/20">
                          <Crown className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-sm font-bold text-primary">Pro</span>
                        <span className="text-[11px] text-primary font-medium">{isAnnual ? '₹2,799' : '₹3,499'}/mo</span>
                      </div>
                    </th>
                    <th className="text-center py-5 px-3 w-[140px]">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-amber-600" />
                        </div>
                        <span className="text-sm font-bold text-foreground">Business</span>
                        <span className="text-[11px] text-muted-foreground">Custom</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonGroups.map((group, gi) => (
                    <React.Fragment key={group.category}>
                      <tr>
                        <td colSpan={5} className={cn('px-6 pt-5 pb-2', gi > 0 && 'border-t border-border/50')}>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                              <Zap className="w-3 h-3 text-primary" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest text-primary">
                              {group.category}
                            </span>
                          </div>
                        </td>
                      </tr>
                      {group.features.map((feature, idx) => (
                        <tr key={idx} className="border-b border-border/15 last:border-b-0 hover:bg-muted/20 transition-colors">
                          <td className="py-3 px-6 text-sm text-foreground font-medium">{feature.name}</td>
                          <td className="py-3 px-3 text-center">{renderCellDesktop(feature.free, false)}</td>
                          <td className="py-3 px-3 text-center">{renderCellDesktop(feature.basic, false)}</td>
                          <td className="py-3 px-3 text-center bg-primary/[0.02]">{renderCellDesktop(feature.pro, true)}</td>
                          <td className="py-3 px-3 text-center">{renderCellDesktop(feature.business, false)}</td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                  <tr className="border-t border-border/50">
                    <td className="py-4 px-6" />
                    <td className="py-4 px-3 text-center">
                      <Button size="sm" variant="outline" className="text-xs h-8 px-4 rounded-lg" onClick={() => navigate('/signup')}>Start Free</Button>
                    </td>
                    <td className="py-4 px-3 text-center">
                      <Button size="sm" variant="outline" className="text-xs h-8 px-4 rounded-lg" onClick={() => navigate('/signup')}>Get Basic</Button>
                    </td>
                    <td className="py-4 px-3 text-center bg-primary/[0.02]">
                      <Button size="sm" className="text-xs h-8 px-4 rounded-lg bg-gradient-to-r from-primary to-emerald-500 shadow-md" onClick={() => navigate('/signup')}>Start Pro</Button>
                    </td>
                    <td className="py-4 px-3 text-center">
                      <Button size="sm" variant="outline" className="text-xs h-8 px-4 rounded-lg" onClick={() => navigate('/contact')}>Contact Sales</Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function renderCellDesktop(value: string, isPro: boolean) {
  if (value === '✓') {
    return (
      <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10">
        <Check className="w-4 h-4 text-primary" />
      </div>
    );
  }
  if (value === '—') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-muted/50 cursor-help">
              <X className="w-3.5 h-3.5 text-muted-foreground/30" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Available via add-on or higher plan</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  if (value === 'Unlimited') {
    return <span className={cn('text-sm font-bold', isPro ? 'text-primary' : 'text-foreground')}>∞</span>;
  }
  return (
    <span className={cn('text-sm font-medium', isPro ? 'text-primary font-semibold' : 'text-foreground')}>
      {value}
    </span>
  );
}

function renderCellMobile(value: string, isPro: boolean) {
  if (value === '✓') return <Check className={cn('w-3.5 h-3.5 mx-auto', 'text-primary')} />;
  if (value === '—') return <X className="w-3 h-3 mx-auto text-muted-foreground/30" />;
  if (value === 'Unlimited') return <span className={cn('text-[11px] font-bold', isPro ? 'text-primary' : '')}>∞</span>;
  return <span className={cn('text-[11px]', isPro ? 'text-primary font-bold' : '')}>{value}</span>;
}
