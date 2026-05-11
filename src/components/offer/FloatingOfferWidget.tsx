import { motion, AnimatePresence } from 'framer-motion';
import { Gift, X } from 'lucide-react';
import { useState } from 'react';
import { useLaunchOffer, formatCountdown } from '@/hooks/useLaunchOffer';
import { useLocation } from 'react-router-dom';
import { isOfferExcludedPath } from './excludedPaths';

interface Props {
  onClick: () => void;
  hidden?: boolean;
}

const DISMISS_KEY = 'launch_offer_widget_dismissed';

export function FloatingOfferWidget({ onClick, hidden }: Props) {
  const { isActive, secondsLeft } = useLaunchOffer();
  const { h, m } = formatCountdown(secondsLeft);
  const location = useLocation();
  const [dismissed, setDismissed] = useState(() => {
    try { return sessionStorage.getItem(DISMISS_KEY) === '1'; } catch { return false; }
  });

  if (!isActive || hidden || dismissed || isOfferExcludedPath(location.pathname)) return null;

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    try { sessionStorage.setItem(DISMISS_KEY, '1'); } catch {}
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        className="fixed left-3 bottom-[88px] sm:left-auto sm:right-5 sm:bottom-5 z-[55]"
      >
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className="group block"
            aria-label="Open launch offer"
          >
            <span className="absolute inset-0 rounded-full bg-emerald-400/40 blur-xl animate-pulse" />
            <span className="relative flex items-center gap-2 pl-3 pr-4 py-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-primary text-white font-semibold shadow-xl shadow-emerald-500/40 ring-1 ring-white/20">
              <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                <Gift className="w-4 h-4" />
              </span>
              <span className="flex flex-col items-start leading-tight">
                <span className="text-[10px] uppercase tracking-wider opacity-90">1 month free</span>
                <span className="text-xs font-mono tabular-nums">
                  {`${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m left`}
                </span>
              </span>
            </span>
          </motion.button>
          <button
            onClick={handleDismiss}
            aria-label="Dismiss offer"
            className="absolute -top-2 -right-2 z-10 h-6 w-6 rounded-full bg-background border border-border shadow-md flex items-center justify-center text-foreground/80 hover:text-foreground hover:scale-110 transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
