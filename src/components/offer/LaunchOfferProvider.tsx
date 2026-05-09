import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
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
const POPUP_INTERVAL_MS = 10 * 60 * 1000; // re-show on navigation if 10+ min passed
const FIRST_DELAY_MS = 1500;

export function LaunchOfferProvider({ children }: { children: ReactNode }) {
  const { isActive } = useLaunchOffer();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const openDialog = useCallback(() => setOpen(true), []);
  const closeDialog = useCallback(() => {
    setOpen(false);
    sessionStorage.setItem(SHOWN_KEY, String(Date.now()));
  }, []);

  // Only auto-popup on public marketing pages — never inside the app.
  useEffect(() => {
    if (!isActive) return;
    const path = location.pathname;

    // Allowlist: marketing/landing routes only.
    const marketingRoots = ['/', '/features', '/products', '/blog', '/about', '/why-aireatro'];
    const isMarketing =
      marketingRoots.includes(path) ||
      path.startsWith('/features/') ||
      path.startsWith('/blog/') ||
      path.startsWith('/products/');

    if (!isMarketing) return;

    const last = Number(sessionStorage.getItem(SHOWN_KEY) ?? '0');
    const elapsed = Date.now() - last;

    if (elapsed >= POPUP_INTERVAL_MS) {
      const t = setTimeout(() => setOpen(true), FIRST_DELAY_MS);
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
