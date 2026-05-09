import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Rocket, ShieldCheck, MessageSquare, Users, Zap,
  TrendingUp, Bot, Send, CheckCircle2, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface CreateWorkspaceSplitHeroProps {
  displayName: string;
  initialName?: string;
  initialCategory?: string;
  initialTeamSize?: string;
  isCreating: boolean;
  onCreate: (payload: {
    workspaceName: string;
    businessName: string;
    category: string;
    teamSize: string;
  }) => Promise<void> | void;
}

const ROTATING_WORDS = [
  "Boost Sales 5X",
  "Automate Replies",
  "Convert More Leads",
  "Scale Your Team",
  "Grow Faster",
];

const BENEFITS = [
  { icon: ShieldCheck, label: "Official WhatsApp API" },
  { icon: Users, label: "Team Inbox" },
  { icon: Bot, label: "AI Auto Replies" },
  { icon: Send, label: "Bulk Messaging" },
  { icon: Zap, label: "CRM Automation" },
  { icon: TrendingUp, label: "Lead Distribution" },
];

const CATEGORIES = [
  "E-commerce", "Education", "Real Estate", "Healthcare",
  "Travel & Tourism", "SaaS / Tech", "Finance", "Marketing Agency",
  "Retail", "Other",
];

const TEAM_SIZES = ["Just me", "2-5", "6-20", "21-50", "50+"];

/** Animated counter (0 → target). */
function useCounter(target: number, duration = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

function TrustStat({ value, suffix, label }: { value: number; suffix?: string; label: string }) {
  const v = useCounter(value);
  return (
    <div className="text-center">
      <div className="text-lg sm:text-xl font-bold text-white tabular-nums">
        {v.toLocaleString()}{suffix}
      </div>
      <div className="text-[10px] sm:text-[11px] text-emerald-100/80 font-medium leading-tight mt-0.5">
        {label}
      </div>
    </div>
  );
}

export default function CreateWorkspaceSplitHero({
  displayName,
  initialName = "",
  initialCategory = "",
  initialTeamSize = "",
  isCreating,
  onCreate,
}: CreateWorkspaceSplitHeroProps) {
  const [workspaceName, setWorkspaceName] = useState(initialName);
  const [businessName, setBusinessName] = useState(initialName);
  const [category, setCategory] = useState(initialCategory);
  const [teamSize, setTeamSize] = useState(initialTeamSize);
  const [rotIdx, setRotIdx] = useState(0);

  // Sync prefill when the parent finishes loading the profile.
  useEffect(() => {
    if (initialName && !workspaceName) setWorkspaceName(initialName);
    if (initialName && !businessName) setBusinessName(initialName);
    if (initialCategory && !category) setCategory(initialCategory);
    if (initialTeamSize && !teamSize) setTeamSize(initialTeamSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialName, initialCategory, initialTeamSize]);

  // Rotating headline
  useEffect(() => {
    const id = setInterval(() => setRotIdx((i) => (i + 1) % ROTATING_WORDS.length), 2200);
    return () => clearInterval(id);
  }, []);

  const canSubmit = workspaceName.trim().length >= 2 && !isCreating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    await onCreate({
      workspaceName: workspaceName.trim(),
      businessName: businessName.trim() || workspaceName.trim(),
      category,
      teamSize,
    });
  };

  const firstName = useMemo(() => (displayName || "").split(" ")[0] || "there", [displayName]);

  return (
    <section className="relative w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 lg:min-h-[calc(100vh-4rem)] gap-0">
        {/* ============== LEFT — premium marketing ============== */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 lg:rounded-r-[2.5rem] order-2 lg:order-1">
          {/* Animated gradient blobs */}
          <motion.div
            className="absolute -top-32 -left-24 w-[28rem] h-[28rem] rounded-full bg-emerald-300/30 blur-3xl"
            animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-32 -right-20 w-[26rem] h-[26rem] rounded-full bg-teal-300/30 blur-3xl"
            animate={{ x: [0, -30, 0], y: [0, -40, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Subtle grid */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="lhgrid" width="28" height="28" patternUnits="userSpaceOnUse">
                <path d="M28 0H0V28" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#lhgrid)" />
          </svg>

          {/* Floating chat bubbles (decorative, hidden on small) */}
          <motion.div
            className="absolute top-[14%] right-[10%] hidden md:flex items-center gap-2 px-3 py-2 rounded-2xl rounded-tr-sm bg-white/95 shadow-2xl shadow-emerald-900/30 backdrop-blur"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: [0, -8, 0] }}
            transition={{ opacity: { duration: 0.6, delay: 0.3 }, y: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center">
              <MessageSquare className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="text-[11px] text-slate-700">
              <div className="font-semibold leading-none">New lead 🎉</div>
              <div className="text-slate-500 mt-0.5">+2 from automation</div>
            </div>
          </motion.div>

          <motion.div
            className="absolute bottom-[6%] left-[6%] hidden xl:flex items-center gap-2 px-3 py-2 rounded-2xl rounded-bl-sm bg-white/95 shadow-2xl shadow-emerald-900/30 backdrop-blur"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: [0, 8, 0] }}
            transition={{ opacity: { duration: 0.6, delay: 0.6 }, y: { duration: 5, repeat: Infinity, ease: "easeInOut" } }}
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="text-[11px] text-slate-700">
              <div className="font-semibold leading-none">+18% replies</div>
              <div className="text-slate-500 mt-0.5">vs last week</div>
            </div>
          </motion.div>

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-10 lg:px-14 py-10 lg:py-14 text-white">
            <motion.span
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur border border-white/20 text-[11px] font-semibold w-fit"
            >
              <Sparkles className="w-3 h-3" />
              Aireatro · WhatsApp Growth Cloud
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-4 text-3xl sm:text-4xl lg:text-[2.7rem] font-bold tracking-tight leading-[1.1]"
            >
              Build Your WhatsApp <br className="hidden sm:block" />
              Growth Workspace{" "}
              <span className="inline-block">🚀</span>
            </motion.h1>

            {/* Rotating subline */}
            <div className="mt-3 h-7 sm:h-8 overflow-hidden text-emerald-50 text-base sm:text-lg font-medium">
              <AnimatePresence mode="wait">
                <motion.span
                  key={rotIdx}
                  initial={{ y: 24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -24, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="block"
                >
                  → {ROTATING_WORDS[rotIdx]}
                </motion.span>
              </AnimatePresence>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-4 text-sm sm:text-base text-emerald-50/90 max-w-md leading-relaxed"
            >
              Just <span className="font-semibold text-white">1 step away</span> from launching
              your premium WhatsApp API workspace and automating your business like a top brand.
            </motion.p>

            {/* Benefit pills */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-6 flex flex-wrap gap-2 max-w-md"
            >
              {BENEFITS.map((b, i) => (
                <motion.span
                  key={b.label}
                  whileHover={{ y: -2, scale: 1.04 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/10 backdrop-blur border border-white/15 text-[11px] sm:text-xs font-medium text-white shadow-sm"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <b.icon className="w-3.5 h-3.5 text-emerald-100" />
                  {b.label}
                </motion.span>
              ))}
            </motion.div>

            {/* Trust bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.6 }}
              className="mt-7 lg:mt-9 grid grid-cols-4 gap-2 sm:gap-3 max-w-md py-3 px-3 sm:px-4 rounded-2xl bg-white/10 backdrop-blur border border-white/15"
            >
              <TrustStat value={2000} suffix="+" label="Businesses" />
              <TrustStat value={98} suffix="%" label="Open Rate" />
              <TrustStat value={0} suffix=" ₹" label="Platform Fee" />
              <TrustStat value={10} suffix=" min" label="Setup" />
            </motion.div>
          </div>
        </div>

        {/* ============== RIGHT — compact form ============== */}
        <div className="relative flex items-center justify-center px-4 sm:px-8 py-8 lg:py-10 order-1 lg:order-2 bg-transparent">
          {/* soft glow behind card */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 right-1/4 w-72 h-72 rounded-full bg-emerald-200/30 blur-3xl" />
          </div>

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="relative w-full max-w-md rounded-3xl bg-white/85 backdrop-blur-2xl border border-emerald-100 shadow-[0_25px_70px_-25px_rgba(16,185,129,0.35)] p-5 sm:p-7"
          >
            {/* animated border glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-60"
              style={{
                background:
                  "conic-gradient(from 180deg at 50% 50%, rgba(16,185,129,0.0) 0deg, rgba(16,185,129,0.25) 90deg, rgba(16,185,129,0.0) 180deg, rgba(20,184,166,0.25) 270deg, rgba(16,185,129,0.0) 360deg)",
                WebkitMask:
                  "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
                padding: 1,
                borderRadius: "inherit",
              }}
            />

            {/* Welcome */}
            <div className="flex items-center gap-3">
              <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-500/30">
                {(firstName || "?").charAt(0).toUpperCase()}
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
                  className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-white flex items-center justify-center shadow"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                </motion.span>
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                  Welcome, {firstName} 👋
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-500 leading-snug">
                  Create your workspace to start growing on WhatsApp.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3.5">
              {/* Workspace Name */}
              <div className="space-y-1">
                <Label htmlFor="ws-name" className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide">
                  Workspace Name
                </Label>
                <Input
                  id="ws-name"
                  placeholder="e.g., Acme Sales"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="h-11 rounded-xl border-emerald-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-400 transition-all"
                  autoFocus
                />
              </div>

              {/* Business Name */}
              <div className="space-y-1">
                <Label htmlFor="biz-name" className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide">
                  Business Name
                </Label>
                <Input
                  id="biz-name"
                  placeholder="Your company name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="h-11 rounded-xl border-emerald-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-400 transition-all"
                />
              </div>

              {/* Category + Team Size */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide">
                    Category
                  </Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-11 rounded-xl border-emerald-200 bg-white text-sm text-slate-900 [&>span]:text-slate-900 data-[placeholder]:[&>span]:text-slate-500">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-slate-900 z-[60]">
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c} className="text-slate-900 focus:bg-emerald-50 focus:text-emerald-700">{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide">
                    Team Size
                  </Label>
                  <Select value={teamSize} onValueChange={setTeamSize}>
                    <SelectTrigger className="h-11 rounded-xl border-emerald-200 bg-white text-sm text-slate-900 [&>span]:text-slate-900 data-[placeholder]:[&>span]:text-slate-500">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-slate-900 z-[60]">
                      {TEAM_SIZES.map((t) => (
                        <SelectItem key={t} value={t} className="text-slate-900 focus:bg-emerald-50 focus:text-emerald-700">{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* CTA */}
            <motion.div
              whileHover={canSubmit ? { scale: 1.01 } : undefined}
              whileTap={canSubmit ? { scale: 0.99 } : undefined}
              className="mt-5"
            >
              <Button
                type="submit"
                disabled={!canSubmit}
                className={cn(
                  "relative w-full h-12 rounded-2xl text-[15px] font-semibold text-white overflow-hidden",
                  "bg-[length:200%_200%] bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500",
                  "shadow-[0_15px_40px_-12px_rgba(16,185,129,0.55)]",
                  "hover:shadow-[0_20px_50px_-12px_rgba(16,185,129,0.7)]",
                  "transition-all duration-300",
                  "animate-[gradientShift_4s_ease_infinite]"
                )}
                style={{ backgroundSize: "200% 200%" }}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Launching your workspace...
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4 mr-2" />
                    Launch My Workspace
                  </>
                )}
                {/* shimmer */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -translate-x-full hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                />
              </Button>
            </motion.div>

            <p className="mt-3 text-center text-[11px] text-slate-500">
              No technical setup required · Takes less than 30 seconds
            </p>

            {/* tiny trust row */}
            <div className="mt-4 pt-4 border-t border-emerald-100/80 flex items-center justify-center gap-4 text-[10px] sm:text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-500" /> Encrypted</span>
              <span className="inline-flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Official Meta Partner</span>
              <span className="inline-flex items-center gap-1"><Sparkles className="w-3 h-3 text-emerald-500" /> Free to start</span>
            </div>
          </motion.form>
        </div>
      </div>

      {/* Local keyframes for the CTA gradient */}
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </section>
  );
}
