import React, { useEffect, useState } from "react";
import { Loader2, Target, HeadphonesIcon, Megaphone, Briefcase, Rocket, CheckCircle2, ShieldCheck } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface CreateWorkspaceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Matches the SplitHero form shape so both flows store the same data.
   * `connectNow` defaults to true — the user can connect WhatsApp from the dashboard.
   */
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
}

const PURPOSES = [
  { value: "sales", label: "Sales", icon: Target },
  { value: "support", label: "Support", icon: HeadphonesIcon },
  { value: "marketing", label: "Marketing", icon: Megaphone },
  { value: "other", label: "Other", icon: Briefcase },
];

export default function CreateWorkspaceModal({
  open,
  onOpenChange,
  onCreateWorkspace,
  isCreating,
  initialName = "",
  initialBusinessName = "",
  initialPurpose = "sales",
}: CreateWorkspaceModalProps) {
  const [workspaceName, setWorkspaceName] = useState(initialName);
  const [businessName, setBusinessName] = useState(initialBusinessName || initialName);
  const [purpose, setPurpose] = useState<string>(initialPurpose || "sales");

  useEffect(() => {
    if (!open) return;
    if (initialName && !workspaceName) setWorkspaceName(initialName);
    const biz = initialBusinessName || initialName;
    if (biz && !businessName) setBusinessName(biz);
    if (initialPurpose && !purpose) setPurpose(initialPurpose);
  }, [open, initialName, initialBusinessName, initialPurpose]);

  const canSubmit =
    workspaceName.trim().length >= 2 && businessName.trim().length >= 2 && !isCreating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    await onCreateWorkspace(
      workspaceName.trim(),
      purpose || "sales",
      true,
      { businessName: businessName.trim() || workspaceName.trim() },
    );
    setWorkspaceName("");
    setBusinessName("");
    setPurpose("sales");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[92vh] overflow-y-auto mx-3 sm:mx-auto w-[calc(100%-1.5rem)] sm:w-full rounded-3xl border-emerald-100 bg-white/95 p-0 shadow-[0_25px_70px_-25px_rgba(16,185,129,0.45)]">
        <DialogHeader className="sr-only">
          <DialogTitle>Create workspace</DialogTitle>
          <DialogDescription>Create a workspace for another brand or team.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="relative overflow-hidden rounded-3xl p-5 sm:p-7">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-60"
            style={{
              background:
                "conic-gradient(from 180deg at 50% 50%, rgba(16,185,129,0.0) 0deg, rgba(16,185,129,0.25) 90deg, rgba(16,185,129,0.0) 180deg, rgba(20,184,166,0.25) 270deg, rgba(16,185,129,0.0) 360deg)",
              WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
              padding: 1,
              borderRadius: "inherit",
            }}
          />

          <div className="relative flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-500/30">
              {(workspaceName.trim() || businessName.trim() || "W").charAt(0).toUpperCase()}
              <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-white flex items-center justify-center shadow">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              </span>
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate">Create Workspace</h2>
              <p className="text-[11px] sm:text-xs text-slate-500 leading-snug">Create your workspace to start growing on WhatsApp.</p>
            </div>
          </div>

          <div className="relative mt-5 space-y-3.5">
            <div className="space-y-1">
              <Label htmlFor="ws-name" className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide">
                Workspace Name
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-sm shadow-emerald-500/30">
                  <Rocket className="w-3.5 h-3.5 text-white" />
                </div>
                <Input
                  id="ws-name"
                  placeholder="e.g., Acme Sales"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="h-11 pl-11 rounded-xl border-emerald-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-400 transition-all"
                  autoFocus
                  maxLength={60}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="biz-name" className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide">
                Business Name <span className="text-slate-400 normal-case font-normal">(as on license)</span>
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-sm shadow-emerald-500/30">
                  <Briefcase className="w-3.5 h-3.5 text-white" />
                </div>
                <Input
                  id="biz-name"
                  placeholder="Your registered company name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="h-11 pl-11 rounded-xl border-emerald-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-400 transition-all"
                  maxLength={80}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide">
                What will you use this workspace for?
              </Label>
              <div className="grid grid-cols-2 gap-2">
              {PURPOSES.map((p) => {
                const Icon = p.icon;
                const isSelected = purpose === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPurpose(p.value)}
                    className={cn(
                      "relative flex h-11 items-center gap-2 rounded-xl border px-3 text-left text-sm font-medium transition-all touch-manipulation",
                      isSelected
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm ring-2 ring-emerald-500/20"
                        : "border-emerald-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/40",
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-4 h-4 flex-shrink-0",
                        isSelected ? "text-emerald-600" : "text-slate-400",
                      )}
                    />
                    <span
                      className={cn(
                        "text-xs sm:text-sm font-semibold",
                        isSelected ? "text-emerald-700" : "text-slate-700",
                      )}
                    >
                      {p.label}
                    </span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto" />}
                  </button>
                );
              })}
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={!canSubmit}
            className="relative mt-5 w-full h-12 rounded-2xl text-[15px] font-semibold text-white overflow-hidden bg-[length:200%_200%] bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 shadow-[0_15px_40px_-12px_rgba(16,185,129,0.55)] hover:shadow-[0_20px_50px_-12px_rgba(16,185,129,0.7)] transition-all duration-300"
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
          </Button>

          <p className="mt-3 text-center text-[11px] text-slate-500">
            No technical setup required · Takes less than 30 seconds
          </p>

          <div className="mt-4 pt-4 border-t border-emerald-100/80 flex items-center justify-center gap-4 text-[10px] sm:text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-500" /> Encrypted</span>
            <span className="inline-flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Official Meta Partner</span>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
