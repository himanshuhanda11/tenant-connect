import React, { useEffect, useState } from "react";
import { Loader2, Building2, Target, HeadphonesIcon, Megaphone, Briefcase, Sparkles } from "lucide-react";
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <DialogContent className="sm:max-w-lg max-h-[92vh] overflow-y-auto mx-3 sm:mx-auto w-[calc(100%-1.5rem)] sm:w-full rounded-3xl p-0 border-emerald-100">
        {/* Premium gradient header */}
        <div className="relative overflow-hidden rounded-t-3xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 p-5 sm:p-6 text-white">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/15 blur-3xl" />
          <div className="absolute -bottom-12 -left-8 w-36 h-36 rounded-full bg-teal-300/25 blur-3xl" />
          <DialogHeader className="relative space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center ring-1 ring-white/20">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-white text-base sm:text-lg font-bold">
                  Create a new workspace
                </DialogTitle>
                <DialogDescription className="text-emerald-50/90 text-xs sm:text-sm">
                  Set up a fresh workspace for another brand or team.
                </DialogDescription>
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 mt-2 w-fit px-2.5 py-1 rounded-full bg-white/15 backdrop-blur text-[10px] sm:text-xs font-semibold">
              <Sparkles className="w-3 h-3" /> Setup in &lt; 10 min
            </div>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5 sm:p-6">
          {/* Workspace Name */}
          <div className="space-y-1.5">
            <Label htmlFor="ws-name" className="text-xs sm:text-sm font-semibold text-slate-800">
              Workspace name <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="ws-name"
              placeholder="e.g., Acme Sales Team"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="h-11 text-sm rounded-xl border-emerald-100 focus-visible:ring-emerald-500/30"
              autoFocus
              maxLength={60}
            />
            <p className="text-[10px] sm:text-[11px] text-slate-500">Internal label — visible only to your team.</p>
          </div>

          {/* Business Name */}
          <div className="space-y-1.5">
            <Label htmlFor="biz-name" className="text-xs sm:text-sm font-semibold text-slate-800">
              Business name <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="biz-name"
              placeholder="e.g., Acme Inc."
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="h-11 text-sm rounded-xl border-emerald-100 focus-visible:ring-emerald-500/30"
              maxLength={80}
            />
            <p className="text-[10px] sm:text-[11px] text-slate-500">Shown to your customers on WhatsApp & invoices.</p>
          </div>

          {/* Purpose */}
          <div className="space-y-2">
            <Label className="text-xs sm:text-sm font-semibold text-slate-800">Primary purpose</Label>
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
                      "flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all touch-manipulation",
                      isSelected
                        ? "border-emerald-500 bg-emerald-50 shadow-sm shadow-emerald-500/10"
                        : "border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/40",
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
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={!canSubmit}
            className="w-full h-12 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg shadow-emerald-500/30"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating workspace...
              </>
            ) : (
              "Create workspace"
            )}
          </Button>

          <p className="text-[10px] sm:text-[11px] text-center text-slate-400">
            Each workspace links to one WhatsApp Business API number.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
