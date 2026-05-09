import { useState, useEffect, useMemo } from 'react';

export type Region = 'IN' | 'GULF' | 'OTHER';
export type CurrencyCode = 'INR' | 'AED' | 'USD';

interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  rate: number; // legacy USD conversion (unused for explicit prices)
}

export const currencyConfigs: Record<Region, CurrencyConfig> = {
  IN: { code: 'INR', symbol: '₹', rate: 83 },
  GULF: { code: 'AED', symbol: 'AED ', rate: 3.67 },
  OTHER: { code: 'USD', symbol: '$', rate: 1 },
};

// ============================================================
// Explicit, per-currency price tables (no conversion math)
// ============================================================

export type PlanId = 'free' | 'basic' | 'pro' | 'business';

export const PLAN_PRICES: Record<PlanId, Record<CurrencyCode, number>> = {
  free:     { INR: 0,    AED: 0,   USD: 0 },
  basic:    { INR: 1499, AED: 350, USD: 50 },
  pro:      { INR: 3499, AED: 550, USD: 150 },
  business: { INR: 5500, AED: 850, USD: 220 },
};

export type AddOnPriceKey =
  | 'extra_agents'
  | 'extra_flows'
  | 'extra_autoforms'
  | 'ai_credits'
  | 'campaign_boost'
  | 'anti_ban_guard'
  | 'advanced_integrations';

export const ADDON_PRICES: Record<AddOnPriceKey, Record<CurrencyCode, number>> = {
  extra_agents:          { INR: 499,  AED: 25,  USD: 10 },
  extra_flows:           { INR: 799,  AED: 100, USD: 25 },
  extra_autoforms:       { INR: 599,  AED: 75,  USD: 20 },
  ai_credits:            { INR: 999,  AED: 125, USD: 35 },
  campaign_boost:        { INR: 1499, AED: 200, USD: 55 },
  anti_ban_guard:        { INR: 1999, AED: 250, USD: 70 },
  advanced_integrations: { INR: 2499, AED: 300, USD: 85 },
};

const GULF_TIMEZONES = [
  'Asia/Dubai', 'Asia/Abu_Dhabi', 'Asia/Riyadh', 'Asia/Kuwait',
  'Asia/Qatar', 'Asia/Bahrain', 'Asia/Muscat',
];

const GULF_LOCALES = ['ae', 'sa', 'kw', 'qa', 'bh', 'om'];

export function useGeoLocation() {
  const [region, setRegion] = useState<Region>('OTHER');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // Manual override (debug / testing)
      const override = (typeof window !== 'undefined' && localStorage.getItem('region_override')) as Region | null;
      if (override === 'IN' || override === 'GULF' || override === 'OTHER') {
        setRegion(override);
        setLoading(false);
        return;
      }

      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if (tz === 'Asia/Kolkata' || tz === 'Asia/Calcutta') {
        setRegion('IN');
      } else if (GULF_TIMEZONES.includes(tz)) {
        setRegion('GULF');
      } else {
        const lang = (navigator.language || navigator.languages?.[0] || '').toLowerCase();
        const country = lang.split('-')[1] || '';
        if (country === 'in' || lang === 'hi') setRegion('IN');
        else if (GULF_LOCALES.includes(country)) setRegion('GULF');
        else setRegion('OTHER');
      }
    } catch {
      setRegion('OTHER');
    } finally {
      setLoading(false);
    }
  }, []);

  const currency = currencyConfigs[region];

  const formatAmount = (amount: number): string => {
    if (currency.code === 'INR') {
      return `₹${amount.toLocaleString('en-IN')}`;
    }
    if (currency.code === 'AED') {
      return `AED ${amount.toLocaleString('en-US')}`;
    }
    return `$${amount.toLocaleString('en-US')}`;
  };

  const helpers = useMemo(() => ({
    /** Get a plan price (monthly) in the active currency. */
    getPlanPrice: (planId: PlanId, isYearly = false): number => {
      const base = PLAN_PRICES[planId]?.[currency.code] ?? 0;
      if (!base) return 0;
      return isYearly ? Math.round(base * 0.8) : base;
    },
    /** Format plan price string. */
    formatPlanPrice: (planId: PlanId, isYearly = false): string => {
      const base = PLAN_PRICES[planId]?.[currency.code] ?? 0;
      if (!base) return formatAmount(0);
      const v = isYearly ? Math.round(base * 0.8) : base;
      return formatAmount(v);
    },
    /** Get add-on price in active currency. */
    getAddOnPrice: (key: string): number => {
      return ADDON_PRICES[key as AddOnPriceKey]?.[currency.code] ?? 0;
    },
    formatAddOnPrice: (key: string): string => {
      const v = ADDON_PRICES[key as AddOnPriceKey]?.[currency.code];
      if (v == null) return '';
      return formatAmount(v);
    },
    formatAmount,
  }), [currency.code]);

  // Backwards compatible helper
  const formatPrice = (usdPrice: number): string => formatAmount(Math.round(usdPrice * currency.rate));
  const getCurrency = () => currency;

  return { region, loading, currency, formatPrice, getCurrency, setRegion, ...helpers };
}
