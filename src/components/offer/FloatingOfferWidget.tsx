import { motion, AnimatePresence } from 'framer-motion';
import { Gift } from 'lucide-react';
import { useLaunchOffer, formatCountdown } from '@/hooks/useLaunchOffer';

interface Props {
  onClick: () => void;
  hidden?: boolean;
}

export function FloatingOfferWidget({ onClick, hidden }: Props) {
  const { isActive, secondsLeft } = useLaunchOffer();
  const { h, m } = formatCountdown(secondsLeft);

  if (!isActive || hidden) return null;

  return (
    <AnimatePresence>
      <motion.button
        initial={{ scale: 0, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="fixed bottom-5 right-5 z-[55] group"
        aria-label="Open launch offer"
      >
        <span className="absolute inset-0 rounded-full bg-emerald-400/40 blur-xl animate-pulse" />
        <span className="relative flex items-center gap-2 pl-3 pr-4 py-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-primary text-white font-semibold shadow-xl shadow-emerald-500/40 ring-1 ring-white/20">
          <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
            <Gift className="w-4 h-4" />
          </span>
          <span className="flex flex-col items-start leading-tight">
            <span className="text-[10px] uppercase tracking-wider opacity-80">1 month free</span>
            <span className="text-xs font-mono tabular-nums">
              {String(h).padStart(2, '0')}h {String(m).padStart(2, '0')}m left
            </span>
          </span>
        </span>
      </motion.button>
    </AnimatePresence>
  );
}
