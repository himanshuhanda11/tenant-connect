import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Building2, User, Globe, Phone, Sparkles, MapPin, Briefcase, Users as UsersIcon, Clock } from 'lucide-react';
import aireatroLogo from '@/assets/aireatro-logo.png';

// Comprehensive country list with dial codes & timezones
type Country = { code: string; name: string; dial: string; timezone: string };

const COUNTRIES: Country[] = [
  { code: 'IN', name: 'India', dial: '+91', timezone: 'Asia/Kolkata' },
  { code: 'US', name: 'United States', dial: '+1', timezone: 'America/New_York' },
  { code: 'GB', name: 'United Kingdom', dial: '+44', timezone: 'Europe/London' },
  { code: 'AE', name: 'United Arab Emirates', dial: '+971', timezone: 'Asia/Dubai' },
  { code: 'SA', name: 'Saudi Arabia', dial: '+966', timezone: 'Asia/Riyadh' },
  { code: 'SG', name: 'Singapore', dial: '+65', timezone: 'Asia/Singapore' },
  { code: 'AU', name: 'Australia', dial: '+61', timezone: 'Australia/Sydney' },
  { code: 'CA', name: 'Canada', dial: '+1', timezone: 'America/Toronto' },
  { code: 'DE', name: 'Germany', dial: '+49', timezone: 'Europe/Berlin' },
  { code: 'FR', name: 'France', dial: '+33', timezone: 'Europe/Paris' },
  { code: 'ES', name: 'Spain', dial: '+34', timezone: 'Europe/Madrid' },
  { code: 'IT', name: 'Italy', dial: '+39', timezone: 'Europe/Rome' },
  { code: 'NL', name: 'Netherlands', dial: '+31', timezone: 'Europe/Amsterdam' },
  { code: 'BR', name: 'Brazil', dial: '+55', timezone: 'America/Sao_Paulo' },
  { code: 'MX', name: 'Mexico', dial: '+52', timezone: 'America/Mexico_City' },
  { code: 'JP', name: 'Japan', dial: '+81', timezone: 'Asia/Tokyo' },
  { code: 'KR', name: 'South Korea', dial: '+82', timezone: 'Asia/Seoul' },
  { code: 'CN', name: 'China', dial: '+86', timezone: 'Asia/Shanghai' },
  { code: 'HK', name: 'Hong Kong', dial: '+852', timezone: 'Asia/Hong_Kong' },
  { code: 'ID', name: 'Indonesia', dial: '+62', timezone: 'Asia/Jakarta' },
  { code: 'PH', name: 'Philippines', dial: '+63', timezone: 'Asia/Manila' },
  { code: 'MY', name: 'Malaysia', dial: '+60', timezone: 'Asia/Kuala_Lumpur' },
  { code: 'TH', name: 'Thailand', dial: '+66', timezone: 'Asia/Bangkok' },
  { code: 'VN', name: 'Vietnam', dial: '+84', timezone: 'Asia/Ho_Chi_Minh' },
  { code: 'PK', name: 'Pakistan', dial: '+92', timezone: 'Asia/Karachi' },
  { code: 'BD', name: 'Bangladesh', dial: '+880', timezone: 'Asia/Dhaka' },
  { code: 'LK', name: 'Sri Lanka', dial: '+94', timezone: 'Asia/Colombo' },
  { code: 'NP', name: 'Nepal', dial: '+977', timezone: 'Asia/Kathmandu' },
  { code: 'ZA', name: 'South Africa', dial: '+27', timezone: 'Africa/Johannesburg' },
  { code: 'NG', name: 'Nigeria', dial: '+234', timezone: 'Africa/Lagos' },
  { code: 'KE', name: 'Kenya', dial: '+254', timezone: 'Africa/Nairobi' },
  { code: 'EG', name: 'Egypt', dial: '+20', timezone: 'Africa/Cairo' },
  { code: 'TR', name: 'Turkey', dial: '+90', timezone: 'Europe/Istanbul' },
  { code: 'IE', name: 'Ireland', dial: '+353', timezone: 'Europe/Dublin' },
  { code: 'CH', name: 'Switzerland', dial: '+41', timezone: 'Europe/Zurich' },
  { code: 'SE', name: 'Sweden', dial: '+46', timezone: 'Europe/Stockholm' },
  { code: 'NO', name: 'Norway', dial: '+47', timezone: 'Europe/Oslo' },
  { code: 'NZ', name: 'New Zealand', dial: '+64', timezone: 'Pacific/Auckland' },
];

// Common IANA timezones for the dropdown
const TIMEZONES = Array.from(new Set([
  ...COUNTRIES.map(c => c.timezone),
  'UTC',
])).sort();

const INDUSTRIES = [
  'E-commerce & Retail', 'Healthcare & Medical', 'Real Estate', 'Education & EdTech',
  'Financial Services', 'Travel & Hospitality', 'Food & Restaurant', 'Automotive',
  'Technology & SaaS', 'Marketing Agency', 'Manufacturing', 'Logistics', 'Other',
];

const COMPANY_SIZES = [
  { value: '1', label: 'Just me' },
  { value: '2-10', label: '2 – 10' },
  { value: '11-50', label: '11 – 50' },
  { value: '51-200', label: '51 – 200' },
  { value: '201-500', label: '201 – 500' },
  { value: '500+', label: '500+' },
];

export default function OrganizationPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStep, setIsCheckingStep] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [country, setCountry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [industry, setIndustry] = useState('');
  const [phone, setPhone] = useState('');
  const [dialCode, setDialCode] = useState('+1');
  const [timezone, setTimezone] = useState('UTC');

  const selectedCountry = useMemo(() => COUNTRIES.find(c => c.code === country), [country]);

  // Auth & onboarding gate + auto-fill
  useEffect(() => {
    const init = async () => {
      if (authLoading) return;
      if (!user) {
        navigate('/signup', { replace: true });
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.onboarding_step === 'completed') {
        navigate('/select-workspace', { replace: true });
        return;
      }
      if (profile?.onboarding_step === 'org_done') {
        navigate('/onboarding/password', { replace: true });
        return;
      }

      // Pre-fill name from profile / Google metadata
      const metaName =
        (user.user_metadata as any)?.full_name ||
        (user.user_metadata as any)?.name ||
        '';
      setFullName(profile?.full_name || metaName || '');
      if ((profile as any)?.company_name) setCompanyName((profile as any).company_name);
      if ((profile as any)?.website_url) setWebsiteUrl((profile as any).website_url);
      if (profile?.industry) setIndustry(profile.industry);
      if (profile?.team_size) setCompanySize(profile.team_size);
      if ((profile as any)?.phone_number) setPhone((profile as any).phone_number);

      // Auto-detect timezone via browser
      try {
        const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (browserTz) setTimezone(browserTz);

        // Map TZ -> country (best effort)
        const matchByTz = COUNTRIES.find(c => c.timezone === browserTz);
        if (matchByTz) {
          setCountry(matchByTz.code);
          setDialCode(matchByTz.dial);
        }
      } catch {
        // ignore
      }

      // Refine country via IP geolocation (free, no key)
      try {
        const res = await fetch('https://ipapi.co/json/');
        if (res.ok) {
          const j = await res.json();
          const cc = (j.country_code || '').toUpperCase();
          const match = COUNTRIES.find(c => c.code === cc);
          if (match) {
            setCountry(prev => prev || match.code);
            setDialCode(match.dial);
            if (j.timezone) setTimezone(j.timezone);
          }
        }
      } catch {
        // ignore network failures
      }

      setIsCheckingStep(false);
    };
    init();
  }, [user, authLoading, navigate]);

  // Update dial code & timezone when user changes country
  useEffect(() => {
    if (selectedCountry) {
      setDialCode(selectedCountry.dial);
      setTimezone(prev => prev || selectedCountry.timezone);
    }
  }, [selectedCountry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) return setError('Please enter your full name');
    if (!companyName.trim()) return setError('Please enter your company name');
    if (!country) return setError('Please select your country');
    if (!companySize) return setError('Please select company size');
    if (!industry) return setError('Please select your industry');
    if (!phone.trim() || !/^\d{6,15}$/.test(phone.replace(/\D/g, ''))) {
      return setError('Please enter a valid phone number');
    }

    setIsLoading(true);
    try {
      const phoneE164 = `${dialCode}${phone.replace(/\D/g, '')}`;
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          company_name: companyName.trim(),
          website_url: websiteUrl.trim() || null,
          country,
          team_size: companySize,
          industry,
          phone_number: phoneE164,
          timezone,
          primary_goal: 'sales',
          onboarding_step: 'org_done',
        } as any)
        .eq('id', user!.id);

      if (profileError) throw profileError;

      navigate('/onboarding/password', { replace: true });
    } catch (err: any) {
      console.error('Profile update error:', err);
      setError(err.message || 'Failed to save details');
      setIsLoading(false);
    }
  };

  if (authLoading || isCheckingStep) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Setting up...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50/40 via-background to-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <img src={aireatroLogo} alt="AiReatro" className="h-7 sm:h-8 w-auto" />
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Step 2 of 3 • Tell us about you
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 px-4 sm:px-6 py-6 sm:py-10">
        <div className="w-full max-w-2xl mx-auto">
          {/* Progress */}
          <div className="mb-5 sm:mb-7">
            <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground mb-1.5">
              <span className="font-medium">Step 2 of 3</span>
              <span>About you & your business</span>
            </div>
            <Progress value={66} className="h-1.5" />
          </div>

          <Card className="border shadow-2xl shadow-emerald-500/5 overflow-hidden">
            {/* Premium gradient top bar */}
            <div className="h-1 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600" />

            <CardHeader className="space-y-1.5 pb-4 sm:pb-6 px-4 sm:px-6 pt-5 sm:pt-7">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-2xl font-semibold tracking-tight">
                    Let's personalize your workspace
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm mt-0.5">
                    Just a few details — takes less than a minute.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="px-4 sm:px-6 pb-6">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20">
                    {error}
                  </div>
                )}

                {/* Full name */}
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-sm flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    Full name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="h-11"
                    autoComplete="name"
                  />
                </div>

                {/* Company + Website */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="company" className="text-sm flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                      Company name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="company"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Acme Inc."
                      className="h-11"
                      autoComplete="organization"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="website" className="text-sm flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                      Website <span className="text-muted-foreground text-xs">(optional)</span>
                    </Label>
                    <Input
                      id="website"
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://acme.com"
                      className="h-11"
                      autoComplete="url"
                    />
                  </div>
                </div>

                {/* Country + Size */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      Country <span className="text-destructive">*</span>
                    </Label>
                    <Select value={country} onValueChange={setCountry}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent className="max-h-72">
                        {COUNTRIES.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            {c.name} <span className="text-muted-foreground">({c.dial})</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm flex items-center gap-1.5">
                      <UsersIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      Company size <span className="text-destructive">*</span>
                    </Label>
                    <Select value={companySize} onValueChange={setCompanySize}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMPANY_SIZES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Industry */}
                <div className="space-y-1.5">
                  <Label className="text-sm flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                    Industry <span className="text-destructive">*</span>
                  </Label>
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((i) => (
                        <SelectItem key={i} value={i}>{i}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Phone with dial code */}
                <div className="space-y-1.5">
                  <Label className="text-sm flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    Phone number <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <Select value={dialCode} onValueChange={setDialCode}>
                      <SelectTrigger className="h-11 w-[110px] flex-shrink-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-72">
                        {COUNTRIES.map((c) => (
                          <SelectItem key={`${c.code}-${c.dial}`} value={c.dial}>
                            {c.dial} <span className="text-muted-foreground text-xs">{c.code}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      id="phone"
                      type="tel"
                      inputMode="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      className="h-11 flex-1"
                      autoComplete="tel-national"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    We'll detect your country code automatically.
                  </p>
                </div>

                {/* Timezone */}
                <div className="space-y-1.5">
                  <Label className="text-sm flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    Time zone <span className="text-destructive">*</span>
                  </Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select time zone" />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {TIMEZONES.map((tz) => (
                        <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground">
                    Auto-detected from your browser. Change if needed.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  size="lg"
                  className="w-full h-12 text-base font-medium bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg shadow-emerald-500/25"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Saving your details...
                    </>
                  ) : (
                    'Continue'
                  )}
                </Button>

                <p className="text-[11px] text-center text-muted-foreground pt-1">
                  Your information is encrypted and never shared with third parties.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
