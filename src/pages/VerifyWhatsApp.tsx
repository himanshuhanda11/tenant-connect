import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, Loader2, ShieldCheck, MessageCircle, Search,
  RefreshCcw, ArrowLeft, Sparkles,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import aireatroLogo from '@/assets/aireatro-logo.png';
import { cn } from '@/lib/utils';

type Country = { code: string; name: string; dial: string; flag: string };

const COUNTRIES: Country[] = [
  { code: 'IN', name: 'India', dial: '+91', flag: '🇮🇳' },
  { code: 'US', name: 'United States', dial: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', dial: '+44', flag: '🇬🇧' },
  { code: 'AE', name: 'United Arab Emirates', dial: '+971', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia', dial: '+966', flag: '🇸🇦' },
  { code: 'SG', name: 'Singapore', dial: '+65', flag: '🇸🇬' },
  { code: 'AU', name: 'Australia', dial: '+61', flag: '🇦🇺' },
  { code: 'CA', name: 'Canada', dial: '+1', flag: '🇨🇦' },
  { code: 'DE', name: 'Germany', dial: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'France', dial: '+33', flag: '🇫🇷' },
  { code: 'ES', name: 'Spain', dial: '+34', flag: '🇪🇸' },
  { code: 'IT', name: 'Italy', dial: '+39', flag: '🇮🇹' },
  { code: 'NL', name: 'Netherlands', dial: '+31', flag: '🇳🇱' },
  { code: 'BR', name: 'Brazil', dial: '+55', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', dial: '+52', flag: '🇲🇽' },
  { code: 'JP', name: 'Japan', dial: '+81', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', dial: '+82', flag: '🇰🇷' },
  { code: 'CN', name: 'China', dial: '+86', flag: '🇨🇳' },
  { code: 'HK', name: 'Hong Kong', dial: '+852', flag: '🇭🇰' },
  { code: 'ID', name: 'Indonesia', dial: '+62', flag: '🇮🇩' },
  { code: 'PH', name: 'Philippines', dial: '+63', flag: '🇵🇭' },
  { code: 'MY', name: 'Malaysia', dial: '+60', flag: '🇲🇾' },
  { code: 'TH', name: 'Thailand', dial: '+66', flag: '🇹🇭' },
  { code: 'VN', name: 'Vietnam', dial: '+84', flag: '🇻🇳' },
  { code: 'PK', name: 'Pakistan', dial: '+92', flag: '🇵🇰' },
  { code: 'BD', name: 'Bangladesh', dial: '+880', flag: '🇧🇩' },
  { code: 'LK', name: 'Sri Lanka', dial: '+94', flag: '🇱🇰' },
  { code: 'NP', name: 'Nepal', dial: '+977', flag: '🇳🇵' },
  { code: 'EG', name: 'Egypt', dial: '+20', flag: '🇪🇬' },
  { code: 'ZA', name: 'South Africa', dial: '+27', flag: '🇿🇦' },
  { code: 'NG', name: 'Nigeria', dial: '+234', flag: '🇳🇬' },
  { code: 'KE', name: 'Kenya', dial: '+254', flag: '🇰🇪' },
  { code: 'TR', name: 'Turkey', dial: '+90', flag: '🇹🇷' },
  { code: 'IL', name: 'Israel', dial: '+972', flag: '🇮🇱' },
  { code: 'NZ', name: 'New Zealand', dial: '+64', flag: '🇳🇿' },
];

const RESEND_COOLDOWN = 60;

export default function VerifyWhatsApp() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState<'enter' | 'otp' | 'success'>('enter');
  const [country, setCountry] = useState<Country>(COUNTRIES[0]);
  const [search, setSearch] = useState('');
  const [number, setNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const tickRef = useRef<number | null>(null);

  const next = params.get('next') || '/select-workspace';

  // Redirect away if already verified or grandfathered
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate(`/login?next=${encodeURIComponent('/verify-whatsapp')}`, { replace: true });
      return;
    }
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('whatsapp_verified, whatsapp_verification_required')
        .eq('id', user.id)
        .maybeSingle();
      if (data && (!data.whatsapp_verification_required || data.whatsapp_verified)) {
        navigate(next, { replace: true });
        return;
      }
      setChecking(false);
    })();
  }, [user, authLoading, navigate, next]);

  useEffect(() => {
    if (cooldown <= 0) return;
    tickRef.current = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => { if (tickRef.current) window.clearTimeout(tickRef.current); };
  }, [cooldown]);

  const filteredCountries = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.dial.includes(q) || c.code.toLowerCase().includes(q),
    );
  }, [search]);

  const sendOtp = async () => {
    setError(null);
    if (!/^\d{6,15}$/.test(number.replace(/\D/g, ''))) {
      setError('Please enter a valid WhatsApp number.');
      return;
    }
    setSending(true);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke('whatsapp-otp-send', {
        body: { country_code: country.dial, number: number.replace(/\D/g, '') },
      });
      if (fnErr || (data as any)?.error) {
        setError((data as any)?.error || fnErr?.message || 'Could not send code. Please try again.');
        return;
      }
      if ((data as any)?.alreadyVerified) {
        navigate(next, { replace: true });
        return;
      }
      setStep('otp');
      setCooldown(RESEND_COOLDOWN);
      setOtp('');
      toast({ title: 'Code sent', description: `We sent a 6-digit code to ${country.dial} ${number}.` });
    } finally {
      setSending(false);
    }
  };

  const verifyOtp = async (codeToVerify?: string) => {
    const code = (codeToVerify ?? otp).trim();
    setError(null);
    if (!/^\d{6}$/.test(code)) {
      setError('Enter the 6-digit code from WhatsApp.');
      return;
    }
    setVerifying(true);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke('whatsapp-otp-verify', {
        body: { code },
      });
      if (fnErr || (data as any)?.error) {
        setError((data as any)?.error || fnErr?.message || 'Verification failed.');
        return;
      }
      setStep('success');
      setTimeout(() => navigate(next, { replace: true }), 1600);
    } finally {
      setVerifying(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />

      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-col items-center justify-center px-4 py-10">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-2"
        >
          <img src={aireatroLogo} alt="Aireatro" className="h-9 w-9 rounded-lg" />
          <span className="text-lg font-semibold tracking-tight">Aireatro</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="w-full"
        >
          <Card className="w-full overflow-hidden border-border/60 bg-card/80 shadow-2xl shadow-primary/5 backdrop-blur-xl">
            <div className="bg-gradient-to-br from-primary/10 via-transparent to-emerald-500/10 px-6 pb-2 pt-7 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-primary/20 ring-1 ring-emerald-500/30">
                <MessageCircle className="h-6 w-6 text-emerald-500" />
              </div>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                {step === 'success' ? 'Verified!' : 'Verify Your WhatsApp Number'}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step === 'success'
                  ? 'WhatsApp verified successfully. Redirecting to your workspace…'
                  : 'Secure your Aireatro workspace with WhatsApp verification before continuing.'}
              </p>
            </div>

            <CardContent className="space-y-4 p-6">
              <AnimatePresence mode="wait">
                {step === 'enter' && (
                  <motion.div
                    key="enter"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="wa-number" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        WhatsApp number
                      </Label>
                      <div className="flex gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              className="flex h-11 min-w-[7.25rem] items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 text-sm font-medium transition hover:bg-accent"
                            >
                              <span className="text-base leading-none">{country.flag}</span>
                              <span>{country.dial}</span>
                              <span className="text-muted-foreground">▾</span>
                            </button>
                          </PopoverTrigger>
                          <PopoverContent align="start" className="w-72 p-0">
                            <div className="border-b p-2">
                              <div className="relative">
                                <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                  placeholder="Search country"
                                  value={search}
                                  onChange={(e) => setSearch(e.target.value)}
                                  className="h-9 pl-8"
                                />
                              </div>
                            </div>
                            <div className="max-h-64 overflow-auto py-1">
                              {filteredCountries.map((c) => (
                                <button
                                  key={c.code}
                                  className={cn(
                                    'flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-accent',
                                    c.code === country.code && 'bg-accent',
                                  )}
                                  onClick={() => {
                                    setCountry(c);
                                    setSearch('');
                                  }}
                                >
                                  <span className="flex items-center gap-2">
                                    <span>{c.flag}</span>
                                    <span>{c.name}</span>
                                  </span>
                                  <span className="text-muted-foreground">{c.dial}</span>
                                </button>
                              ))}
                              {filteredCountries.length === 0 && (
                                <p className="px-3 py-4 text-center text-xs text-muted-foreground">
                                  No countries match
                                </p>
                              )}
                            </div>
                          </PopoverContent>
                        </Popover>
                        <Input
                          id="wa-number"
                          type="tel"
                          inputMode="numeric"
                          autoComplete="tel"
                          placeholder="Phone number"
                          className="h-11 flex-1 text-base"
                          value={number}
                          onChange={(e) => setNumber(e.target.value.replace(/[^\d ]/g, ''))}
                          maxLength={15}
                        />
                      </div>
                    </div>

                    {error && (
                      <p className="text-sm text-destructive" role="alert">{error}</p>
                    )}

                    <Button
                      onClick={sendOtp}
                      disabled={sending || !number}
                      size="lg"
                      className="h-11 w-full gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-primary font-semibold shadow-lg"
                    >
                      {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      Send Verification Code
                    </Button>
                  </motion.div>
                )}

                {step === 'otp' && (
                  <motion.div
                    key="otp"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    className="space-y-4"
                  >
                    <div className="rounded-lg border bg-muted/40 px-3 py-2 text-sm">
                      Sent to <span className="font-medium">{country.dial} {number}</span>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Enter 6-digit code
                      </Label>
                      <div className="flex justify-center">
                        <InputOTP
                          maxLength={6}
                          value={otp}
                          onChange={(v) => {
                            setOtp(v);
                            setError(null);
                            if (v.length === 6) verifyOtp(v);
                          }}
                        >
                          <InputOTPGroup>
                            {[0, 1, 2, 3, 4, 5].map((i) => (
                              <InputOTPSlot key={i} index={i} className="h-12 w-11 text-lg" />
                            ))}
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                    </div>

                    {error && (
                      <p className="text-center text-sm text-destructive" role="alert">{error}</p>
                    )}

                    <Button
                      onClick={() => verifyOtp()}
                      disabled={verifying || otp.length !== 6}
                      size="lg"
                      className="h-11 w-full gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-primary font-semibold shadow-lg"
                    >
                      {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      Verify &amp; Continue
                    </Button>

                    <div className="flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => { setStep('enter'); setOtp(''); setError(null); }}
                        className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Change Number
                      </button>
                      <button
                        type="button"
                        disabled={cooldown > 0 || sending}
                        onClick={sendOtp}
                        className="inline-flex items-center gap-1 text-primary disabled:text-muted-foreground"
                      >
                        <RefreshCcw className="h-3.5 w-3.5" />
                        {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-6"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 220, damping: 14 }}
                      className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 ring-4 ring-emerald-500/20"
                    >
                      <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                    </motion.div>
                    <p className="mt-4 text-sm text-muted-foreground">Taking you to your workspace…</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Trust badges */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[11px] text-muted-foreground">
            {[
              { icon: ShieldCheck, label: 'Secure verification' },
              { icon: CheckCircle2, label: 'No spam' },
              { icon: Sparkles, label: 'Required for workspace access' },
            ].map((b) => (
              <span key={b.label} className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-card/60 px-2.5 py-1 backdrop-blur">
                <b.icon className="h-3 w-3 text-emerald-500" />
                {b.label}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
