import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

/**
 * Wraps the app and redirects authenticated users with an unclaimed,
 * still-active launch offer to /choose-plan before they reach a workspace.
 *
 * Allowed paths bypass this check (auth, onboarding, marketing, choose-plan itself).
 */
const ALLOW_PREFIXES = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/auth',
  '/onboarding',
  '/invite',
  '/choose-plan',
  '/pricing',
  '/terms',
  '/privacy-policy',
  '/cookie-policy',
  '/refund-policy',
  '/data-deletion',
  '/acceptable-use',
  '/compliance',
  '/security',
  '/help',
  '/blog',
  '/about',
  '/contact',
  '/careers',
  '/features',
  '/products',
  '/why-aireatro',
  '/integrations',
  '/case-studies',
  '/partners',
  '/whatsapp',
  '/click-to-whatsapp',
  '/template-library',
  '/documentation',
  '/install',
  '/admin',
  '/control',
];

const ALLOW_EXACT = new Set(['/', '/index']);

function isAllowed(path: string) {
  if (ALLOW_EXACT.has(path)) return true;
  return ALLOW_PREFIXES.some((p) => path === p || path.startsWith(p + '/') || path.startsWith(p + '?') || path === p);
}

export function RequirePlanSelection({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (loading || !user) return;
    if (isAllowed(location.pathname)) return;

    setChecking(true);
    (async () => {
      const { data, error } = await supabase
        .from('user_offers')
        .select('offer_claimed, offer_expires_at')
        .eq('user_id', user.id)
        .maybeSingle();
      if (cancelled) return;
      setChecking(false);
      if (error) return;
      if (!data) return; // no row — let user through
      const expired = new Date(data.offer_expires_at).getTime() < Date.now();
      if (!data.offer_claimed && !expired) {
        navigate('/choose-plan', { replace: true });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, loading, location.pathname, navigate]);

  return <>{children}</>;
}
