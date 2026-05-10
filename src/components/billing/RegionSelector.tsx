import { useEffect, useState } from 'react';
import { Globe2, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export type PricingRegion = 'IN' | 'GULF' | 'OTHER';
export type PricingCurrency = 'INR' | 'AED' | 'USD';

export const REGION_FOR_COUNTRY: Record<string, PricingRegion> = {
  IN: 'IN',
  AE: 'GULF', SA: 'GULF', KW: 'GULF', QA: 'GULF', BH: 'GULF', OM: 'GULF',
};

export const CURRENCY_FOR_REGION: Record<PricingRegion, PricingCurrency> = {
  IN: 'INR', GULF: 'AED', OTHER: 'USD',
};

const COUNTRIES: { code: string; name: string; region: PricingRegion }[] = [
  { code: 'IN', name: 'India', region: 'IN' },
  { code: 'AE', name: 'United Arab Emirates', region: 'GULF' },
  { code: 'SA', name: 'Saudi Arabia', region: 'GULF' },
  { code: 'KW', name: 'Kuwait', region: 'GULF' },
  { code: 'QA', name: 'Qatar', region: 'GULF' },
  { code: 'BH', name: 'Bahrain', region: 'GULF' },
  { code: 'OM', name: 'Oman', region: 'GULF' },
  { code: 'US', name: 'United States', region: 'OTHER' },
  { code: 'GB', name: 'United Kingdom', region: 'OTHER' },
  { code: 'CA', name: 'Canada', region: 'OTHER' },
  { code: 'AU', name: 'Australia', region: 'OTHER' },
  { code: 'DE', name: 'Germany', region: 'OTHER' },
  { code: 'FR', name: 'France', region: 'OTHER' },
  { code: 'SG', name: 'Singapore', region: 'OTHER' },
  { code: 'NL', name: 'Netherlands', region: 'OTHER' },
  { code: 'BR', name: 'Brazil', region: 'OTHER' },
  { code: 'MX', name: 'Mexico', region: 'OTHER' },
  { code: 'JP', name: 'Japan', region: 'OTHER' },
  { code: 'OTHER', name: 'Other / Rest of World', region: 'OTHER' },
];

export function regionFromCountry(c?: string | null): PricingRegion {
  if (!c) return 'OTHER';
  return REGION_FOR_COUNTRY[c.toUpperCase()] ?? 'OTHER';
}

interface Props {
  workspaceId?: string | null;
  initialCountry?: string | null;
  onChange?: (v: { country: string; region: PricingRegion; currency: PricingCurrency }) => void;
  className?: string;
  compact?: boolean;
}

/** Country selector that drives pricing region + currency and persists to the tenant. */
export default function RegionSelector({
  workspaceId, initialCountry, onChange, className, compact,
}: Props) {
  const [country, setCountry] = useState<string>(
    (initialCountry || localStorage.getItem('preferred_country') || 'OTHER').toUpperCase(),
  );
  const region = regionFromCountry(country);
  const currency = CURRENCY_FOR_REGION[region];

  useEffect(() => {
    onChange?.({ country, region, currency });
    try { localStorage.setItem('preferred_country', country); } catch (_) {}
    try { localStorage.setItem('region_override', region); } catch (_) {}
  }, [country, region, currency, onChange]);

  const handleChange = async (val: string) => {
    setCountry(val);
    if (workspaceId) {
      const r = regionFromCountry(val);
      await supabase.from('tenants').update({
        country: val,
        pricing_region: r,
        currency: CURRENCY_FOR_REGION[r],
      }).eq('id', workspaceId);
    }
  };

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <Globe2 className="w-4 h-4 text-white/60" />
      <Select value={country} onValueChange={handleChange}>
        <SelectTrigger className={cn(
          'h-8 bg-white/10 border-white/15 text-white text-xs hover:bg-white/15 rounded-full',
          compact ? 'min-w-[180px]' : 'min-w-[220px]',
        )}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-72">
          {COUNTRIES.map((c) => (
            <SelectItem key={c.code} value={c.code}>
              <span className="flex items-center justify-between gap-3 w-full">
                <span>{c.name}</span>
                <span className="text-[10px] text-muted-foreground">
                  {CURRENCY_FOR_REGION[c.region]}
                </span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-[10px] text-white/60 inline-flex items-center gap-1">
        <Check className="w-3 h-3 text-emerald-300" /> {currency}
      </span>
    </div>
  );
}
