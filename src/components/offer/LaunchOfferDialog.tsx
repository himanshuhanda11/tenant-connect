import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Gift, Sparkles, ShieldCheck } from 'lucide-react';
import { CountdownPill } from './CountdownPill';
import { useLaunchOffer, useTodayClaimCount } from '@/hooks/useLaunchOffer';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BENEFITS = [
  'Official WhatsApp Business API access',
  'Shared team inbox',
  'Bulk messaging & campaigns',
  'CRM, contacts & automations',
  'AI auto-replies & template lint',
  'Instagram + Lead Forms integration',
];

export function LaunchOfferDialog({ open, onOpenChange }: Props) {
  const { isActive, secondsLeft } = useLaunchOffer();
  const { data: claimCount } = useTodayClaimCount();
  const navigate = useNavigate();

  if (!isActive) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden border-emerald-500/30 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 text-white">
        {/* Glow halo */}
        <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-emerald-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-primary/30 blur-3xl" />

        <div className="relative p-6 sm:p-8">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-primary flex items-center justify-center shadow-xl shadow-emerald-500/30 mb-4"
          >
            <Gift className="w-7 h-7 text-white" />
          </motion.div>

          <div className="text-center space-y-2 mb-5">
            <Badge className="bg-emerald-400/15 text-emerald-200 border-emerald-300/30 gap-1">
              <Sparkles className="w-3 h-3" /> Launch Offer
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              🎁 Unlock 1 Month FREE Access
            </h2>
            <p className="text-sm text-white/70">
              Pick any Aireatro plan within your first 24 hours and we'll cover your first month —
              no card required.
            </p>
            <div className="pt-1 flex justify-center">
              <CountdownPill secondsLeft={secondsLeft} size="lg" />
            </div>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mb-6">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm text-white/90">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 mt-0.5 flex-shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <Button
              size="lg"
              className="flex-1 bg-gradient-to-r from-emerald-400 to-primary text-white border-0 font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:scale-[1.02] transition-all"
              onClick={() => {
                onOpenChange(false);
                navigate('/choose-plan');
              }}
            >
              <Sparkles className="w-4 h-4 mr-1" /> Start Free Month
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="flex-1 border-white/20 bg-white/5 text-white hover:bg-white/10"
              onClick={() => {
                onOpenChange(false);
                navigate('/pricing');
              }}
            >
              Compare Plans
            </Button>
          </div>

          <div className="mt-4 flex items-center justify-between text-[11px] text-white/60">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3" />
              No card • No hidden fee • Instant
            </span>
            {typeof claimCount === 'number' && claimCount > 0 && (
              <span>🔥 {claimCount} users claimed today</span>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
