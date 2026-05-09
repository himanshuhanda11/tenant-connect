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
  // Plan selection is no longer forced — users can browse the app freely and
  // claim the launch offer from the floating widget / popup at any time.
  // The component is kept as a passthrough to avoid touching App.tsx structure.
  return <>{children}</>;
}
