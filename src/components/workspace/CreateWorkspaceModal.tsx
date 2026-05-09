import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Loader2, Target, HeadphonesIcon, Megaphone, Briefcase, Rocket,
  CheckCircle2, ShieldCheck, Sparkles, Zap, Users, Bot,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface CreateWorkspaceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateWorkspace: (
    name: string,
    purpose: string,
    connectNow: boolean,
    extra?: { businessName?: string },
  ) => Promise<void>;
  isCreating: boolean;
  initialName?: string;
  initialBusinessName?: string;
  initialPurpose?: string;
  displayName?: string;
}

const PURPOSES = [
  { value: "sales", label: "Sales", icon: Target, hint: "Close more deals" },
  { value: "support", label: "Support", icon: HeadphonesIcon, hint: "Help customers" },
  { value: "marketing", label: "Marketing", icon: Megaphone, hint: "Run campaigns" },
  { value: "automation", label: "Automation", icon: Zap, hint: "Auto-reply bots" },
  { value: "crm", label: "CRM", icon: Users, hint: "Manage leads" },
  { value: "other", label: "Other", icon: Briefcase, hint: "Something else" },
];

export default function CreateWorkspaceModal({
  open,
  onOpenChange,
  onCreateWorkspace,
  isCreating,
  initialName = "",
  initialPurpose = "sales",
  displayName = "",
}: CreateWorkspaceModalProps) {
  const [workspaceName, setWorkspaceName] = useState(initialName);
  const [purpose, setPurpose] = useState<string>(initialPurpose || "sales");
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (initialName && !workspaceName) setWorkspaceName(initialName);
    if (initialPurpose && !purpose) setPurpose(initialPurpose);
  }, [open, initialName, initialPurpose]);

  const canSubmit = workspaceName.trim().length >= 2 && !isCreating;
  const firstName = (displayName || "").split(" ")[0] || "there";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const name = workspaceName.trim();
    await onCreateWorkspace(name, purpose || "sales", true, { businessName: name });
    setWorkspaceName("");
    setPurpose("sales");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[94vh] overflow-y-auto mx-3 sm:mx-auto w-[calc(100%-1.5rem)] sm:w-full rounded-[28px] border-0 bg-transparent p-0 shadow-none">
        <DialogHeader className="sr-only">
          <DialogTitle>Create workspace</DialogTitle>
          <DialogDescription>Create a premium AI WhatsApp workspace.</DialogDescription>
        </DialogHeader>

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
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------- */
/* Shared premium form (also used by SplitHero)       */
/* -------------------------------------------------- */
export function PremiumWorkspaceForm({
  workspaceName,
  setWorkspaceName,
  purpose,
  setPurpose,
  focused,
  setFocused,
  isCreating,
  canSubmit,
  firstName,
  onSubmit,
  compact = false,
}: {
  workspaceName: string;
  setWorkspaceName: (v: string) => void;
  purpose: string;
  setPurpose: (v: string) => void;
  focused: boolean;
  setFocused: (v: boolean) => void;
  isCreating: boolean;
  canSubmit: boolean;
  firstName: string;
  onSubmit: (e: React.FormEvent) => void;
  compact?: boolean;
}) {
  return (
    <motion.form
      onSubmit={onSubmit}
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative w-full overflow-hidden rounded-[28px]",
        "bg-gradient-to-b from-white/95 via-white/90 to-emerald-50/60",
        "backdrop-blur-2xl border border-white/60",
        "shadow-[0_30px_80px_-20px_rgba(16,185,129,0.35),0_8px_30px_-12px_rgba(0,0,0,0.12)]",
        compact ? "p-5 sm:p-7" : "p-6 sm:p-8",
      )}
    >
      {/* gradient border glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-70"
        style={{
          background:
            "conic-gradient(from 140deg at 50% 50%, rgba(16,185,129,0) 0deg, rgba(16,185,129,0.45) 90deg, rgba(20,184,166,0.4) 180deg, rgba(16,185,129,0) 280deg, rgba(16,185,129,0.45) 360deg)",
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          padding: 1.5,
          borderRadius: "inherit",
        }}
      />

      {/* floating blur orbs */}
      <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-300/40 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-teal-300/30 blur-3xl" />

      {/* Step indicator */}
      <div className="relative flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-700/80">
        <span className="inline-flex h-5 items-center gap-1 rounded-full bg-emerald-100/70 px-2">
          <Sparkles className="h-3 w-3" /> Step 1 of 3
        </span>
        <span className="text-slate-400">Create · Plan · Connect</span>
      </div>

      {/* Hero header */}
      <div className="relative mt-4 flex items-center gap-4">
        <motion.div
          initial={{ scale: 0.6, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 12 }}
          className="relative h-14 w-14 shrink-0"
        >
          <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 blur-md opacity-70 animate-pulse" />
          <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-extrabold text-xl shadow-xl shadow-emerald-500/40 ring-1 ring-white/40">
            {(firstName || "?").charAt(0).toUpperCase()}
            <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-white flex items-center justify-center shadow-md ring-2 ring-emerald-100">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            </span>
          </div>
        </motion.div>

        <div className="min-w-0 flex-1">
          <h2 className="text-[22px] sm:text-2xl font-extrabold tracking-tight leading-tight">
            <span className="bg-gradient-to-r from-slate-900 via-emerald-700 to-teal-600 bg-clip-text text-transparent">
              Welcome, {firstName}
            </span>{" "}
            <span className="inline-block">👋</span>
          </h2>
          <p className="mt-1 text-[12.5px] sm:text-sm text-slate-500 leading-snug">
            One step away from your AI-powered WhatsApp workspace.
          </p>
        </div>
      </div>

      {/* Workspace name — premium floating input */}
      <div className="relative mt-7">
        <div
          className={cn(
            "group relative rounded-2xl transition-all duration-300",
            focused
              ? "bg-white shadow-[0_0_0_4px_rgba(16,185,129,0.18),0_12px_30px_-12px_rgba(16,185,129,0.45)] ring-1 ring-emerald-400"
              : "bg-white/80 ring-1 ring-emerald-100 hover:ring-emerald-200",
          )}
        >
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-md shadow-emerald-500/30">
            <Rocket className="h-4 w-4 text-white" />
          </div>
          <Label
            htmlFor="ws-name-premium"
            className={cn(
              "pointer-events-none absolute left-[58px] transition-all duration-200",
              workspaceName || focused
                ? "top-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-600"
                : "top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium",
            )}
          >
            {workspaceName || focused ? "Workspace name" : "Enter your workspace name"}
          </Label>
          <Input
            id="ws-name-premium"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            maxLength={60}
            autoFocus
            className="h-[64px] pl-[58px] pr-4 pt-5 pb-1 text-[15px] font-semibold text-slate-900 bg-transparent border-0 rounded-2xl focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-transparent"
          />
        </div>
      </div>

      {/* Purpose grid */}
      <div className="relative mt-6">
        <div className="flex items-center justify-between mb-3">
          <Label className="text-[11px] font-bold text-slate-700 uppercase tracking-[0.14em]">
            Workspace Purpose
          </Label>
          <span className="text-[10px] text-slate-400">Pick one</span>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
          {PURPOSES.map((p) => {
            const Icon = p.icon;
            const active = purpose === p.value;
            return (
              <motion.button
                key={p.value}
                type="button"
                onClick={() => setPurpose(p.value)}
                whileTap={{ scale: 0.96 }}
                className={cn(
                  "group relative flex flex-col items-center justify-center gap-1.5 px-2 py-3.5 rounded-2xl border text-center transition-all touch-manipulation overflow-hidden",
                  active
                    ? "border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-[0_10px_25px_-12px_rgba(16,185,129,0.55)] -translate-y-0.5"
                    : "border-slate-200/80 bg-white/70 hover:border-emerald-300 hover:bg-emerald-50/50 hover:-translate-y-0.5",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="purpose-glow"
                    aria-hidden
                    className="absolute inset-0 rounded-2xl bg-emerald-400/15 blur-md"
                  />
                )}
                <div
                  className={cn(
                    "relative flex h-9 w-9 items-center justify-center rounded-xl transition-all",
                    active
                      ? "bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-md shadow-emerald-500/40"
                      : "bg-slate-100 text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-600",
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </div>
                <span
                  className={cn(
                    "relative text-[11.5px] font-bold leading-none",
                    active ? "text-emerald-700" : "text-slate-700",
                  )}
                >
                  {p.label}
                </span>
                {active && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 14 }}
                    className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 shadow"
                  >
                    <CheckCircle2 className="h-3 w-3 text-white" />
                  </motion.span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <motion.div
        whileHover={canSubmit ? { scale: 1.01 } : undefined}
        whileTap={canSubmit ? { scale: 0.99 } : undefined}
        className="relative mt-7"
      >
        <Button
          type="submit"
          disabled={!canSubmit}
          className={cn(
            "relative w-full h-14 rounded-2xl text-base font-bold text-white overflow-hidden",
            "bg-[length:200%_200%] bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500",
            "shadow-[0_18px_45px_-12px_rgba(16,185,129,0.7),inset_0_1px_0_rgba(255,255,255,0.25)]",
            "hover:shadow-[0_22px_55px_-12px_rgba(16,185,129,0.85)]",
            "transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed",
            "animate-[gradientShift_4s_ease_infinite]",
          )}
          style={{ backgroundSize: "200% 200%" }}
        >
          {isCreating ? (
            <span className="relative z-10 inline-flex items-center">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Launching your workspace...
            </span>
          ) : (
            <span className="relative z-10 inline-flex items-center tracking-tight">
              Launch My Workspace
              <Rocket className="w-5 h-5 ml-2" />
            </span>
          )}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 skew-x-12 bg-gradient-to-r from-transparent via-white/35 to-transparent animate-[shimmer_2.6s_ease-in-out_infinite]"
          />
        </Button>
      </motion.div>

      {/* Trust footer */}
      <div className="relative mt-4 flex items-center justify-center gap-4 text-[10.5px] text-slate-500">
        <span className="inline-flex items-center gap-1">
          <ShieldCheck className="h-3 w-3 text-emerald-500" /> Encrypted
        </span>
        <span className="text-slate-300">·</span>
        <span className="inline-flex items-center gap-1">
          <Bot className="h-3 w-3 text-emerald-500" /> AI-powered
        </span>
        <span className="text-slate-300">·</span>
        <span className="inline-flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Meta Partner
        </span>
      </div>

      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes shimmer {
          0% { transform: translateX(0) skewX(12deg); }
          60%, 100% { transform: translateX(420%) skewX(12deg); }
        }
      `}</style>
    </motion.form>
  );
}
