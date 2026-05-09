import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, ShieldCheck, MessageSquare, Users, Zap,
  TrendingUp, Bot, Send,
} from "lucide-react";
import { PremiumWorkspaceForm } from "./CreateWorkspaceModal";

interface CreateWorkspaceSplitHeroProps {
  displayName: string;
  initialName?: string;
  initialBusinessName?: string;
  initialPurpose?: string;
  isCreating: boolean;
  onCreate: (payload: {
    workspaceName: string;
    businessName: string;
    purpose: string;
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

function useCounter(target: number, duration = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
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
  initialPurpose = "",
  isCreating,
  onCreate,
}: CreateWorkspaceSplitHeroProps) {
  const [workspaceName, setWorkspaceName] = useState(initialName);
  const [purpose, setPurpose] = useState<string>(initialPurpose || "sales");
  const [focused, setFocused] = useState(false);
  const [rotIdx, setRotIdx] = useState(0);

  useEffect(() => {
    if (initialName && !workspaceName) setWorkspaceName(initialName);
    if (initialPurpose && !purpose) setPurpose(initialPurpose);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialName, initialPurpose]);

  useEffect(() => {
    const id = setInterval(() => setRotIdx((i) => (i + 1) % ROTATING_WORDS.length), 2200);
    return () => clearInterval(id);
  }, []);

  const canSubmit = workspaceName.trim().length >= 2 && !isCreating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const name = workspaceName.trim();
    await onCreate({
      workspaceName: name,
      businessName: name,
      purpose: purpose || "sales",
    });
  };

  const firstName = useMemo(() => (displayName || "").split(" ")[0] || "there", [displayName]);

  return (
    <section className="relative w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 lg:min-h-[calc(100vh-4rem)] gap-0">
        {/* ============== LEFT — premium marketing ============== */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 lg:rounded-r-[2.5rem] order-2 lg:order-1">
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
          <svg className="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="lhgrid" width="28" height="28" patternUnits="userSpaceOnUse">
                <path d="M28 0H0V28" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#lhgrid)" />
          </svg>

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

        {/* ============== RIGHT — premium form ============== */}
        <div className="relative flex items-center justify-center px-4 sm:px-8 py-8 lg:py-10 order-1 lg:order-2 bg-transparent">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 right-1/4 w-72 h-72 rounded-full bg-emerald-200/30 blur-3xl" />
            <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full bg-teal-200/30 blur-3xl" />
          </div>

          <div className="relative w-full max-w-md">
            <PremiumWorkspaceForm
              workspaceName={workspaceName}
              setWorkspaceName={setWorkspaceName}
              purpose={purpose}
              setPurpose={setPurpose}
              focused={focused}
              setFocused={setFocused}
              isCreating={isCreating}
              canSubmit={canSubmit}
              firstName={firstName}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
