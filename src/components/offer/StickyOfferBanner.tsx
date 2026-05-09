import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CountdownPill } from './CountdownPill';
import { useLaunchOffer } from '@/hooks/useLaunchOffer';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';

interface Props {
  onClaim: () => void;
}

const HIDE_KEY = 'launch_offer_banner_hidden';

export function StickyOfferBanner({ onClaim }: Props) {
  const { isActive, secondsLeft } = useLaunchOffer();
  const navigate = useNavigate();
  const location = useLocation();
  const [hidden, setHidden] = useState(() => sessionStorage.getItem(HIDE_KEY) === '1');

  // Don't show the banner on pricing-related pages — plans are already the focus.
  const path = location.pathname;
  const onPricing =
    path.startsWith('/pricing') ||
    path.startsWith('/select-plan') ||
    path.startsWith('/choose-plan') ||
    path.startsWith('/plans') ||
    path.startsWith('/billing');
  const visible = isActive && !hidden && !onPricing;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -64, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -64, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="sticky top-0 z-[60] w-full"
        >
          <div className="relative overflow-hidden">
            {/* Animated gradient border */}
            <div
              className="absolute inset-0 -z-10"
              style={{
                background:
                  'linear-gradient(110deg, hsl(152 70% 14%) 0%, hsl(152 60% 22%) 40%, hsl(152 80% 30%) 60%, hsl(152 60% 22%) 100%)',
                backgroundSize: '300% 100%',
                animation: 'banner-shimmer 8s linear infinite',
              }}
            />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-300/60 to-transparent" />

            <div className="container mx-auto px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-white">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <span className="hidden sm:inline-flex w-7 h-7 rounded-full bg-emerald-400/20 items-center justify-center ring-1 ring-emerald-300/40">
                  <Gift className="w-3.5 h-3.5 text-emerald-200" />
                </span>
                <p className="text-[12px] sm:text-sm font-medium truncate">
                  <span className="hidden sm:inline">🚀 </span>
                  <span className="font-semibold">Launch Offer</span>
                  <span className="opacity-80"> — Get 1 month FREE on any plan</span>
                </p>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <CountdownPill secondsLeft={secondsLeft} size="sm" />
                <Button
                  size="sm"
                  className="h-7 text-[11px] sm:text-xs px-3 bg-white text-emerald-900 hover:bg-emerald-100 font-semibold gap-1"
                  onClick={onClaim}
                >
                  <Sparkles className="w-3 h-3" />
                  Claim
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-[11px] sm:text-xs px-2 text-white/90 hover:bg-white/10 hidden sm:inline-flex"
                  onClick={() => navigate('/pricing')}
                >
                  View Plans
                </Button>
                <button
                  aria-label="Hide offer banner"
                  onClick={() => {
                    sessionStorage.setItem(HIDE_KEY, '1');
                    setHidden(true);
                  }}
                  className="text-white/70 hover:text-white p-1 rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
          <style>{`
            @keyframes banner-shimmer {
              0% { background-position: 0% 50%; }
              100% { background-position: 300% 50%; }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
