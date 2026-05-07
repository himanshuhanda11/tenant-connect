import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Loader2, Building2, User, Globe, Phone, Sparkles, MapPin,
  Briefcase, Users as UsersIcon, Clock, Check, ChevronLeft, ChevronRight, ShieldCheck,
} from 'lucide-react';
import aireatroLogo from '@/assets/aireatro-logo.png';
import { cn } from '@/lib/utils';

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

const TIMEZONES = Array.from(new Set([...COUNTRIES.map(c => c.timezone), 'UTC'])).sort();

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

const STEPS = [
  { id: 1, title: 'Personal', icon: User, description: 'Who you are' },
  { id: 2, title: 'Company', icon: Building2, description: 'Your business' },
  { id: 3, title: 'Contact', icon: Phone, description: 'How to reach you' },
  { id: 4, title: 'Confirm', icon: ShieldCheck, description: 'Review & finish' },
];

export default function OrganizationPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStep, setIsCheckingStep] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [autofilledFromGoogle, setAutofilledFromGoogle] = useState(false);

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

  useEffect(() => {
    const init = async () => {
      if (authLoading) return;
      if (!user) { navigate('/signup', { replace: true }); return; }

      const { data: profile } = await supabase
        .from('profiles').select('*').eq('id', user.id).maybeSingle();

      if (profile?.onboarding_step === 'completed') {
        navigate('/select-workspace', { replace: true }); return;
      }
      if (profile?.onboarding_step === 'org_done') {
        navigate('/onboarding/password', { replace: true }); return;
      }

      const meta = (user.user_metadata || {}) as any;
      const metaName = meta.full_name || meta.name || '';
      const wasGoogle = !!(meta.iss?.includes('google') || meta.provider_id || meta.picture);
      const finalName = profile?.full_name || metaName || '';
      setFullName(finalName);
      if (wasGoogle && metaName) setAutofilledFromGoogle(true);

      if ((profile as any)?.company_name) setCompanyName((profile as any).company_name);
      if ((profile as any)?.website_url) setWebsiteUrl((profile as any).website_url);
      if (profile?.industry) setIndustry(profile.industry);
      if (profile?.team_size) setCompanySize(profile.team_size);
      if ((profile as any)?.phone_number) {
        const p = (profile as any).phone_number as string;
        const match = COUNTRIES.find(c => p.startsWith(c.dial));
        if (match) { setDialCode(match.dial); setPhone(p.slice(match.dial.length)); }
        else setPhone(p);
      }

      try {
        const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (browserTz) setTimezone(browserTz);
        const matchByTz = COUNTRIES.find(c => c.timezone === browserTz);
        if (matchByTz) { setCountry(matchByTz.code); setDialCode(matchByTz.dial); }
      } catch {}

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
      } catch {}

      setIsCheckingStep(false);
    };
    init();
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (selectedCountry) {
      setDialCode(selectedCountry.dial);
      setTimezone(prev => prev || selectedCountry.timezone);
    }
  }, [selectedCountry]);

  const validateStep = (s: number): string | null => {
    if (s === 1) {
      if (!fullName.trim()) return 'Please enter your full name';
    }
    if (s === 2) {
      if (!companyName.trim()) return 'Please enter your company name';
      if (!companySize) return 'Please select company size';
      if (!industry) return 'Please select your industry';
    }
    if (s === 3) {
      if (!country) return 'Please select your country';
      if (!phone.trim() || !/^\d{6,15}$/.test(phone.replace(/\D/g, ''))) return 'Please enter a valid phone number';
      if (!timezone) return 'Please select a time zone';
    }
    return null;
  };

  const next = () => {
    const err = validateStep(step);
    if (err) { setError(err); return; }
    setError(null);
    setStep(s => Math.min(4, s + 1));
  };
  const back = () => { setError(null); setStep(s => Math.max(1, s - 1)); };

  const handleSubmit = async () => {
    setError(null);
    for (let s = 1; s <= 3; s++) {
      const err = validateStep(s);
      if (err) { setError(err); setStep(s); return; }
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

  const progress = (step / STEPS.length) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50/40 via-background to-background">
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <img src={aireatroLogo} alt="AiReatro" className="h-7 sm:h-8 w-auto" />
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Onboarding • Step {step} of {STEPS.length}
          </span>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 py-6 sm:py-10">
        <div className="w-full max-w-2xl mx-auto">
          {/* Stepper */}
          <div className="mb-6 sm:mb-8">
            <div className="hidden sm:flex items-center justify-between mb-3">
              {STEPS.map((s, i) => {
                const isActive = step === s.id;
                const isDone = step > s.id;
                const Icon = s.icon;
                return (
                  <React.Fragment key={s.id}>
                    <button
                      type="button"
                      onClick={() => isDone && setStep(s.id)}
                      className={cn(
                        'flex flex-col items-center gap-1.5 group',
                        isDone ? 'cursor-pointer' : 'cursor-default',
                      )}
                    >
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm transition-all border-2',
                        isActive && 'bg-gradient-to-br from-emerald-500 to-green-600 text-white border-emerald-500 shadow-lg shadow-emerald-500/30 scale-110',
                        isDone && 'bg-emerald-500 text-white border-emerald-500',
                        !isActive && !isDone && 'bg-background text-muted-foreground border-muted',
                      )}>
                        {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                      </div>
                      <div className="text-center">
                        <div className={cn('text-xs font-medium', isActive ? 'text-foreground' : 'text-muted-foreground')}>
                          {s.title}
                        </div>
                      </div>
                    </button>
                    {i < STEPS.length - 1 && (
                      <div className={cn(
                        'flex-1 h-0.5 mx-2 -mt-5 transition-colors',
                        step > s.id ? 'bg-emerald-500' : 'bg-muted',
                      )} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
            {/* Mobile compact */}
            <div className="sm:hidden">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span className="font-medium text-foreground">
                  Step {step}: {STEPS[step - 1].title}
                </span>
                <span>{step} / {STEPS.length}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-green-600 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          <Card className="border shadow-2xl shadow-emerald-500/5 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600" />
            <CardContent className="px-4 sm:px-8 py-6 sm:py-8">
              <div className="flex items-center gap-3 mb-5 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-semibold tracking-tight">
                    {step === 1 && 'Tell us about yourself'}
                    {step === 2 && 'About your company'}
                    {step === 3 && 'How can we reach you?'}
                    {step === 4 && 'Review your details'}
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    {STEPS[step - 1].description}
                  </p>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20">
                  {error}
                </div>
              )}

              {/* Step 1: Personal */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName" className="text-sm flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      Full name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="fullName" value={fullName}
                      onChange={(e) => { setFullName(e.target.value); setAutofilledFromGoogle(false); }}
                      placeholder="John Doe" className="h-11" autoComplete="name" autoFocus
                    />
                    {autofilledFromGoogle && (
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Check className="h-3 w-3" /> Auto-filled from your Google account — edit anytime.
                      </p>
                    )}
                    {!autofilledFromGoogle && (
                      <p className="text-[11px] text-muted-foreground">
                        We'll use this on your invoices and team profile.
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">Email</Label>
                    <Input value={user?.email || ''} disabled className="h-11 bg-muted/40" />
                    <p className="text-[11px] text-muted-foreground">Verified — used for sign-in.</p>
                  </div>
                </div>
              )}

              {/* Step 2: Company */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="company" className="text-sm flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                        Company name <span className="text-destructive">*</span>
                      </Label>
                      <Input id="company" value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Acme Inc." className="h-11" autoComplete="organization" autoFocus />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="website" className="text-sm flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                        Website <span className="text-muted-foreground text-xs">(optional)</span>
                      </Label>
                      <Input id="website" type="url" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)}
                        placeholder="https://acme.com" className="h-11" autoComplete="url" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm flex items-center gap-1.5">
                      <UsersIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      Company size <span className="text-destructive">*</span>
                    </Label>
                    <Select value={companySize} onValueChange={setCompanySize}>
                      <SelectTrigger className="h-11"><SelectValue placeholder="Select size" /></SelectTrigger>
                      <SelectContent>
                        {COMPANY_SIZES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                      Industry <span className="text-destructive">*</span>
                    </Label>
                    <Select value={industry} onValueChange={setIndustry}>
                      <SelectTrigger className="h-11"><SelectValue placeholder="Select your industry" /></SelectTrigger>
                      <SelectContent>
                        {INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Step 3: Contact */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      Country <span className="text-destructive">*</span>
                    </Label>
                    <Select value={country} onValueChange={setCountry}>
                      <SelectTrigger className="h-11"><SelectValue placeholder="Select country" /></SelectTrigger>
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
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      Phone number <span className="text-destructive">*</span>
                    </Label>
                    <div className="flex gap-2">
                      <Select value={dialCode} onValueChange={setDialCode}>
                        <SelectTrigger className="h-11 w-[110px] flex-shrink-0"><SelectValue /></SelectTrigger>
                        <SelectContent className="max-h-72">
                          {COUNTRIES.map((c) => (
                            <SelectItem key={`${c.code}-${c.dial}`} value={c.dial}>
                              {c.dial} <span className="text-muted-foreground text-xs">{c.code}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input id="phone" type="tel" inputMode="tel" value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="9876543210" className="h-11 flex-1" autoComplete="tel-national" />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Country code auto-detected from your location.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      Time zone <span className="text-destructive">*</span>
                    </Label>
                    <Select value={timezone} onValueChange={setTimezone}>
                      <SelectTrigger className="h-11"><SelectValue placeholder="Select time zone" /></SelectTrigger>
                      <SelectContent className="max-h-72">
                        {TIMEZONES.map((tz) => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Step 4: Confirm */}
              {step === 4 && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground mb-3">
                    Please confirm everything looks right. You can edit any section before continuing.
                  </p>
                  <ReviewSection title="Personal" onEdit={() => setStep(1)} items={[
                    { label: 'Full name', value: fullName },
                    { label: 'Email', value: user?.email || '' },
                  ]} />
                  <ReviewSection title="Company" onEdit={() => setStep(2)} items={[
                    { label: 'Company', value: companyName },
                    { label: 'Website', value: websiteUrl || '—' },
                    { label: 'Size', value: COMPANY_SIZES.find(s => s.value === companySize)?.label || '—' },
                    { label: 'Industry', value: industry },
                  ]} />
                  <ReviewSection title="Contact" onEdit={() => setStep(3)} items={[
                    { label: 'Country', value: selectedCountry?.name || country },
                    { label: 'Phone', value: `${dialCode} ${phone}` },
                    { label: 'Time zone', value: timezone },
                  ]} />
                </div>
              )}

              {/* Footer nav */}
              <div className="mt-6 sm:mt-8 flex items-center justify-between gap-3">
                <Button
                  type="button" variant="ghost" onClick={back}
                  disabled={step === 1 || isLoading}
                  className="h-11"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Back
                </Button>
                {step < 4 ? (
                  <Button
                    type="button" onClick={next} size="lg"
                    className="h-11 px-6 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg shadow-emerald-500/25"
                  >
                    Continue <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    type="button" onClick={handleSubmit} disabled={isLoading} size="lg"
                    className="h-11 px-6 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg shadow-emerald-500/25"
                  >
                    {isLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                    ) : (
                      <>Confirm & Continue <Check className="h-4 w-4 ml-1" /></>
                    )}
                  </Button>
                )}
              </div>
              <p className="text-[11px] text-center text-muted-foreground pt-4">
                Your information is encrypted and only visible to you and your workspace.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function ReviewSection({
  title, items, onEdit,
}: { title: string; items: { label: string; value: string }[]; onEdit: () => void }) {
  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        <button type="button" onClick={onEdit}
          className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
          Edit
        </button>
      </div>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
        {items.map((it) => (
          <div key={it.label} className="flex justify-between sm:block gap-2">
            <dt className="text-muted-foreground text-xs">{it.label}</dt>
            <dd className="font-medium truncate">{it.value || '—'}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
