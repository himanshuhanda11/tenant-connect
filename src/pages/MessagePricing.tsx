import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  Globe2,
  Coins,
  Loader2,
  ArrowUpDown,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SEO } from '@/components/seo';

interface RateRow {
  country_code: string;
  country_name: string;
  currency_code: string;
  marketing: RateValue | null;
  utility: RateValue | null;
  authentication: RateValue | null;
}

interface RateValue {
  credits: number;
  localAmount: number;
  currencyCode: string;
}

type SortKey = 'country' | 'marketing' | 'utility' | 'authentication';
type PricingTab = 'all' | 'marketing' | 'utility' | 'authentication';

// Rough country-code → dial code (display only)
const DIAL: Record<string, string> = {
  IN: '+91', US: '+1', CA: '+1', GB: '+44', AE: '+971', SA: '+966', QA: '+974',
  KW: '+965', OM: '+968', BH: '+973', SG: '+65', MY: '+60', TH: '+66', ID: '+62',
  PH: '+63', VN: '+84', PK: '+92', BD: '+880', LK: '+94', NP: '+977', AU: '+61',
  NZ: '+64', JP: '+81', KR: '+82', CN: '+86', HK: '+852', TW: '+886', DE: '+49',
  FR: '+33', IT: '+39', ES: '+34', NL: '+31', SE: '+46', NO: '+47', DK: '+45',
  FI: '+358', CH: '+41', AT: '+43', BE: '+32', PL: '+48', PT: '+351', IE: '+353',
  RU: '+7', TR: '+90', IL: '+972', EG: '+20', ZA: '+27', NG: '+234', KE: '+254',
  GH: '+233', BR: '+55', MX: '+52', AR: '+54', CL: '+56', CO: '+57', PE: '+51',
  VE: '+58', UY: '+598', OTHER: '—',
};

const CREDIT_USD_VALUE = 0.02;

// Reference display rates only: convert Aireatro credit usage into each destination country's currency.
const LOCAL_CURRENCY: Record<string, { code: string; usdRate: number }> = {
  IN: { code: 'INR', usdRate: 83.4 }, US: { code: 'USD', usdRate: 1 }, CA: { code: 'CAD', usdRate: 1.37 },
  GB: { code: 'GBP', usdRate: 0.79 }, AE: { code: 'AED', usdRate: 3.67 }, SA: { code: 'SAR', usdRate: 3.75 },
  QA: { code: 'QAR', usdRate: 3.64 }, KW: { code: 'KWD', usdRate: 0.31 }, OM: { code: 'OMR', usdRate: 0.38 },
  BH: { code: 'BHD', usdRate: 0.38 }, SG: { code: 'SGD', usdRate: 1.35 }, MY: { code: 'MYR', usdRate: 4.72 },
  TH: { code: 'THB', usdRate: 36.2 }, ID: { code: 'IDR', usdRate: 16200 }, PH: { code: 'PHP', usdRate: 57.4 },
  VN: { code: 'VND', usdRate: 25400 }, PK: { code: 'PKR', usdRate: 278 }, BD: { code: 'BDT', usdRate: 117 },
  LK: { code: 'LKR', usdRate: 300 }, NP: { code: 'NPR', usdRate: 133 }, AU: { code: 'AUD', usdRate: 1.52 },
  NZ: { code: 'NZD', usdRate: 1.65 }, JP: { code: 'JPY', usdRate: 155 }, KR: { code: 'KRW', usdRate: 1370 },
  CN: { code: 'CNY', usdRate: 7.25 }, HK: { code: 'HKD', usdRate: 7.82 }, TW: { code: 'TWD', usdRate: 32.3 },
  DE: { code: 'EUR', usdRate: 0.92 }, FR: { code: 'EUR', usdRate: 0.92 }, IT: { code: 'EUR', usdRate: 0.92 },
  ES: { code: 'EUR', usdRate: 0.92 }, NL: { code: 'EUR', usdRate: 0.92 }, BE: { code: 'EUR', usdRate: 0.92 },
  PT: { code: 'EUR', usdRate: 0.92 }, IE: { code: 'EUR', usdRate: 0.92 }, AT: { code: 'EUR', usdRate: 0.92 },
  SE: { code: 'SEK', usdRate: 10.6 }, NO: { code: 'NOK', usdRate: 10.8 }, DK: { code: 'DKK', usdRate: 6.86 },
  FI: { code: 'EUR', usdRate: 0.92 }, CH: { code: 'CHF', usdRate: 0.91 }, PL: { code: 'PLN', usdRate: 4.0 },
  RU: { code: 'RUB', usdRate: 92 }, TR: { code: 'TRY', usdRate: 32.4 }, IL: { code: 'ILS', usdRate: 3.7 },
  EG: { code: 'EGP', usdRate: 47.8 }, ZA: { code: 'ZAR', usdRate: 18.4 }, NG: { code: 'NGN', usdRate: 1500 },
  KE: { code: 'KES', usdRate: 129 }, GH: { code: 'GHS', usdRate: 14.6 }, BR: { code: 'BRL', usdRate: 5.15 },
  MX: { code: 'MXN', usdRate: 17.0 }, AR: { code: 'ARS', usdRate: 1050 }, CL: { code: 'CLP', usdRate: 930 },
  CO: { code: 'COP', usdRate: 3900 }, PE: { code: 'PEN', usdRate: 3.75 }, VE: { code: 'VES', usdRate: 36.5 },
  UY: { code: 'UYU', usdRate: 39.2 }, OTHER: { code: 'USD', usdRate: 1 },
};

const toLocalRate = (countryCode: string, credits: number): RateValue => {
  const local = LOCAL_CURRENCY[countryCode] || LOCAL_CURRENCY.OTHER;
  return {
    credits,
    localAmount: credits * CREDIT_USD_VALUE * local.usdRate,
    currencyCode: local.code,
  };
};

const formatLocalRate = (amount: number, currencyCode: string) => {
  const fractionDigits = amount < 1 ? 4 : amount < 10 ? 3 : 2;
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);
};

export default function MessagePricing() {
  const [rows, setRows] = useState<RateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<PricingTab>('all');
  const [sortKey, setSortKey] = useState<SortKey>('country');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('whatsapp_meta_pricing_rates')
        .select('country_code, country_name, template_category, rate_per_message, credit_multiplier')
        .eq('active', true);
      if (!alive) return;
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      // Pivot
      const map = new Map<string, RateRow>();
      for (const r of data || []) {
        const key = `${r.country_code}|${r.country_name}`;
        if (!map.has(key)) {
          const local = LOCAL_CURRENCY[r.country_code] || LOCAL_CURRENCY.OTHER;
          map.set(key, {
            country_code: r.country_code,
            country_name: r.country_name,
            currency_code: local.code,
            marketing: null,
            utility: null,
            authentication: null,
          });
        }
        const row = map.get(key)!;
        const credits = Number(r.rate_per_message) * Number(r.credit_multiplier ?? 1);
        const localRate = toLocalRate(r.country_code, credits);
        if (r.template_category === 'marketing') row.marketing = localRate;
        else if (r.template_category === 'utility') row.utility = localRate;
        else if (r.template_category === 'authentication') row.authentication = localRate;
      }
      setRows(Array.from(map.values()));
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let r = rows.filter((x) =>
      !q ||
      x.country_name.toLowerCase().includes(q) ||
      x.country_code.toLowerCase().includes(q) ||
      x.currency_code.toLowerCase().includes(q) ||
      (DIAL[x.country_code] || '').includes(q),
    );
    if (tab !== 'all') r = r.filter((x) => x[tab] != null);
    r = [...r].sort((a, b) => {
      let av: number | string;
      let bv: number | string;
      if (sortKey === 'country') {
        av = a.country_name; bv = b.country_name;
      } else {
        av = a[sortKey]?.localAmount ?? Number.POSITIVE_INFINITY;
        bv = b[sortKey]?.localAmount ?? Number.POSITIVE_INFINITY;
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return r;
  }, [rows, search, tab, sortKey, sortDir]);

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(k); setSortDir('asc'); }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <SEO title="WhatsApp Message Pricing — Aireatro" description="Estimated WhatsApp campaign credit usage by country and template category." />
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-background to-background p-6 sm:p-8">
          <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-primary/20 blur-3xl" aria-hidden />
          <div className="relative">
            <Link to="/campaigns/create" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="h-3 w-3" />
              Back to campaign
            </Link>
            <Badge variant="outline" className="mb-3 gap-1">
              <Sparkles className="h-3 w-3 text-amber-500" /> Pricing transparency
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">WhatsApp Message Pricing</h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
              Estimated campaign credit usage based on destination country and message category.
              Credits are deducted only for delivered conversations.
            </p>
            <div className="mt-4 flex items-start gap-2 text-[11px] text-muted-foreground bg-muted/40 border rounded-lg p-3 max-w-2xl">
              <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
              <span>
                Actual Meta pricing may vary slightly depending on Meta updates and conversation category.
                Final credits are calculated server-side at send time.
              </span>
            </div>
          </div>
        </div>

        {/* Category cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <CategoryCard title="Marketing" desc="Promotions, offers, announcements" tone="from-rose-500/10 to-orange-500/5" />
          <CategoryCard title="Utility" desc="Order updates, alerts, OTPs follow-ups" tone="from-blue-500/10 to-indigo-500/5" />
          <CategoryCard title="Authentication" desc="One-time passwords & login codes" tone="from-emerald-500/10 to-teal-500/5" />
        </div>

        {/* Pricing table */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe2 className="h-4 w-4 text-primary" />
                  Country-wise Rates
                </CardTitle>
                <CardDescription className="text-xs">
                  Local currency estimate per delivered conversation, with Aireatro credits shown below.
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search country or +code"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-9"
                />
              </div>
            </div>

            <Tabs value={tab} onValueChange={(v) => setTab(v as PricingTab)} className="mt-3">
              <TabsList className="grid grid-cols-4 w-full sm:w-auto">
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="marketing" className="text-xs">Marketing</TabsTrigger>
                <TabsTrigger value="utility" className="text-xs">Utility</TabsTrigger>
                <TabsTrigger value="authentication" className="text-xs">Auth</TabsTrigger>
              </TabsList>
              <TabsContent value={tab} />
            </Tabs>
          </CardHeader>

          <CardContent className="pt-0">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading pricing…
              </div>
            ) : error ? (
              <p className="text-xs text-destructive py-6 text-center">{error}</p>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-xs">
                        <button onClick={() => toggleSort('country')} className="inline-flex items-center gap-1 hover:text-foreground">
                          Country <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </TableHead>
                      <TableHead className="text-xs">Code</TableHead>
                      <TableHead className="text-xs text-right">
                        <button onClick={() => toggleSort('marketing')} className="inline-flex items-center gap-1 hover:text-foreground ml-auto">
                          Marketing <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </TableHead>
                      <TableHead className="text-xs text-right">
                        <button onClick={() => toggleSort('utility')} className="inline-flex items-center gap-1 hover:text-foreground ml-auto">
                          Utility <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </TableHead>
                      <TableHead className="text-xs text-right">
                        <button onClick={() => toggleSort('authentication')} className="inline-flex items-center gap-1 hover:text-foreground ml-auto">
                          Auth <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-xs text-muted-foreground py-8">
                          No countries match your search.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered.map((r) => (
                        <TableRow key={`${r.country_code}-${r.country_name}`}>
                          <TableCell className="text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{r.country_name}</span>
                              <Badge variant="outline" className="text-[9px] px-1 h-4">{r.country_code}</Badge>
                              <Badge variant="secondary" className="text-[9px] px-1 h-4">{r.currency_code}</Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground tabular-nums">{DIAL[r.country_code] || '—'}</TableCell>
                          <RateCell value={r.marketing} />
                          <RateCell value={r.utility} />
                          <RateCell value={r.authentication} />
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="bg-gradient-to-br from-primary/5 to-background border-primary/20">
          <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold">Top up message credits anytime</p>
                <p className="text-xs text-muted-foreground">
                  Credits never expire. Pay-as-you-go with bulk discounts.
                </p>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button asChild variant="outline" size="sm" className="flex-1 sm:flex-none">
                <Link to="/campaigns/create">Back to Campaign</Link>
              </Button>
              <Button asChild size="sm" className="gap-1 flex-1 sm:flex-none">
                <Link to="/billing?tab=credits">
                  <Coins className="h-3.5 w-3.5" /> Add Credits
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}

function RateCell({ value }: { value: RateValue | null }) {
  if (value == null) {
    return <TableCell className="text-xs text-right text-muted-foreground">—</TableCell>;
  }
  return (
    <TableCell className="text-xs text-right tabular-nums">
      <div className="font-semibold text-foreground">{formatLocalRate(value.localAmount, value.currencyCode)}</div>
      <div className="text-[10px] text-muted-foreground">{value.credits.toFixed(2)} credits</div>
    </TableCell>
  );
}

function CategoryCard({ title, desc, tone }: { title: string; desc: string; tone: string }) {
  return (
    <div className={`rounded-xl border bg-gradient-to-br ${tone} p-4`}>
      <p className="text-sm font-semibold">{title}</p>
      <p className="text-[11px] text-muted-foreground mt-1">{desc}</p>
    </div>
  );
}
