import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useLaunchOffer } from '@/hooks/useLaunchOffer';
import { StickyOfferBanner } from './StickyOfferBanner';
import { LaunchOfferDialog } from './LaunchOfferDialog';
import { FloatingOfferWidget } from './FloatingOfferWidget';

interface LaunchOfferCtx {
  openDialog: () => void;
  closeDialog: () => void;
}

const Ctx = createContext<LaunchOfferCtx>({ openDialog: () => {}, closeDialog: () => {} });

const SHOWN_KEY = 'launch_offer_dialog_last_shown_at';
const POPUP_INTERVAL_MS = 30 * 60 * 1000; // 30 min

export function LaunchOfferProvider({ children }: { children: ReactNode }) {
  const { isActive } = useLaunchOffer();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const autoFiredRef = useRef(false);

  const openDialog = useCallback(() => setOpen(true), []);
  const closeDialog = useCallback(() => {
    setOpen(false);
    sessionStorage.setItem(SHOWN_KEY, String(Date.now()));
  }, []);

  // Auto-show on first activation per session and every 30 min thereafter
  useEffect(() => {
    if (!isActive) return;
    // Skip on the choose-plan page itself — UI is already focused on it
    if (location.pathname.startsWith('/choose-plan')) return;

    const last = Number(sessionStorage.getItem(SHOWN_KEY) ?? '0');
    const elapsed = Date.now() - last;

    if (!autoFiredRef.current || elapsed >= POPUP_INTERVAL_MS) {
      autoFiredRef.current = true;
      const t = setTimeout(() => setOpen(true), 1200);
      return () => clearTimeout(t);
    }
  }, [isActive, location.pathname]);

  return (
    <Ctx.Provider value={{ openDialog, closeDialog }}>
      <StickyOfferBanner onClaim={openDialog} />
      {children}
      <FloatingOfferWidget onClick={openDialog} hidden={open} />
      <LaunchOfferDialog open={open} onOpenChange={(v) => (v ? setOpen(true) : closeDialog())} />
    </Ctx.Provider>
  );
}

export function useLaunchOfferUI() {
  return useContext(Ctx);
}
