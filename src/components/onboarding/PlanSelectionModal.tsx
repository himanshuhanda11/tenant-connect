import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Sparkles, Check, Rocket, Crown, Zap, ShieldCheck, Loader2, Gift,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  tenantId: string;
  onSelected: (planName: string) => void;
  onPaidIntent: () => void;
}

const FREE_FEATURES = [
  '1 WhatsApp number',
  'Team inbox (2 agents)',
  '1,000 service conversations/mo',
  'Basic auto-replies',
  'Pre-built templates',
];

const PAID_FEATURES = [
  'Unlimited WhatsApp numbers',
  'Unlimited team agents',
  'AI auto-replies + AI lead qualification',
  'Meta Ads attribution + ROI dashboard',
  'Round-robin lead distribution',
  'Bulk broadcast + automation flows',
  'Priority support',
];

export default function PlanSelectionModal({ open, tenantId, onSelected, onPaidIntent }: Props) {
  const [activatingFree, setActivatingFree] = useState(false);

  const handleFree = async () => {
    if (activatingFree) return;
    setActivatingFree(true);
    try {
      // Best-effort: create a free subscription. If it fails, still mark locally so onboarding proceeds.
      try {
        await supabase.from('subscriptions').upsert(
          {
            tenant_id: tenantId,
            plan_id: 'plan_free',
            status: 'active',
          } as any,
          { onConflict: 'tenant_id' },
        );
      } catch (e) {
        console.warn('[PlanSelection] subscription upsert non-fatal:', e);
      }
      onSelected('Free');
      toast.success('Free Lifetime plan activated 🎉');
    } finally {
      setActivatingFree(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="max-w-3xl w-[calc(100vw-1.5rem)] p-0 border-0 bg-transparent shadow-none [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="relative rounded-3xl bg-white shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="relative px-5 sm:px-8 pt-6 sm:pt-8 pb-4 text-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 border-b border-emerald-100">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] sm:text-xs font-semibold mb-3">
              <Sparkles className="w-3 h-3" /> Choose your plan to continue
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
              Pick a plan and unlock your <span className="text-emerald-600">WhatsApp Growth Cloud</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-md mx-auto">
              Start free forever or unlock pro automation. Switch anytime.
            </p>
          </div>

          {/* Plan cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-4 sm:p-6 max-h-[60vh] sm:max-h-none overflow-y-auto">
            {/* Free */}
            <div className="relative rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Gift className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">Free Lifetime</h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-500">Forever free, no card required</p>
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-bold text-slate-900">₹0</span>
                <span className="text-xs text-slate-500">/forever</span>
              </div>
              <ul className="mt-3 space-y-1.5 flex-1">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[11px] sm:text-xs text-slate-700">
                    <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Button
                onClick={handleFree}
                disabled={activatingFree}
                variant="outline"
                className="mt-4 h-11 rounded-xl border-slate-300 hover:bg-slate-50 font-semibold"
              >
                {activatingFree ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Activating…</>
                ) : (
                  <><Gift className="w-4 h-4 mr-2" /> Free Lifetime</>
                )}
              </Button>
            </div>

            {/* Paid */}
            <div className="relative rounded-2xl border-2 border-emerald-500 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4 sm:p-5 flex flex-col shadow-lg shadow-emerald-500/15">
              <div className="absolute -top-3 right-4 px-2.5 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-bold uppercase tracking-wide shadow-md flex items-center gap-1">
                <Crown className="w-3 h-3" /> Most Popular
              </div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Rocket className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">Pro Growth</h3>
                  <p className="text-[10px] sm:text-[11px] text-emerald-700 font-medium">1 month free trial</p>
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-bold text-slate-900">₹0</span>
                <span className="text-xs text-slate-500">for 30 days</span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">then choose your plan from billing</p>
              <ul className="mt-3 space-y-1.5 flex-1">
                {PAID_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[11px] sm:text-xs text-slate-700">
                    <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Button
                onClick={onPaidIntent}
                className="mt-4 h-11 rounded-xl font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/30"
              >
                <Zap className="w-4 h-4 mr-2" /> Start 1 Month Free
              </Button>
            </div>
          </div>

          {/* footer trust */}
          <div className="px-5 sm:px-8 py-3 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-[10px] sm:text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-500" /> Official Meta Partner</span>
            <span className="inline-flex items-center gap-1"><Check className="w-3 h-3 text-emerald-500" /> Cancel anytime</span>
            <span className="inline-flex items-center gap-1"><Sparkles className="w-3 h-3 text-emerald-500" /> No credit card for free</span>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
