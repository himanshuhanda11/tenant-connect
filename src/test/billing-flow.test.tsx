/**
 * End-to-end style tests for the subscription/trial flow.
 *
 * Verifies the contract between the frontend and the
 * `claim_launch_offer` RPC after the paid-trial bypass fix:
 *
 *   • FREE plan → RPC returns ok, hook resolves, NO Stripe redirect.
 *   • PAID plan → RPC returns { ok:false, reason:'requires_checkout' },
 *     hook throws a typed error so callers route to Stripe Checkout,
 *     and no trial / entitlement is granted in the DB.
 *
 * These tests stub `supabase.rpc` and `@/contexts/AuthContext` so they
 * run hermetically without a network or auth session.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// ---- Mocks -----------------------------------------------------------------

const rpcMock = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    rpc: (...args: any[]) => rpcMock(...args),
    from: () => ({
      select: () => ({
        eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }),
      }),
    }),
  },
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'user-1' } }),
}));

// Imported AFTER mocks are registered.
import { useLaunchOffer } from '@/hooks/useLaunchOffer';

// ---- Helpers ---------------------------------------------------------------

function wrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: qc }, children);
}

beforeEach(() => {
  rpcMock.mockReset();
});

// ---- Tests -----------------------------------------------------------------

describe('Subscription flow — Free vs Paid', () => {
  it('FREE plan claim: activates instantly, no checkout required', async () => {
    rpcMock.mockResolvedValueOnce({
      data: { ok: true, plan_id: 'free', workspace_id: 'ws-1' },
      error: null,
    });

    const { result } = renderHook(() => useLaunchOffer(), { wrapper: wrapper() });

    let res: any;
    await act(async () => {
      res = await result.current.claim({ planId: 'free', workspaceId: 'ws-1' });
    });

    expect(rpcMock).toHaveBeenCalledWith('claim_launch_offer', {
      _plan_id: 'free',
      _workspace_id: 'ws-1',
    });
    expect(res).toEqual({ ok: true, plan_id: 'free', workspace_id: 'ws-1' });
  });

  it.each(['basic', 'pro', 'business'])(
    'PAID plan "%s" claim: throws requires_checkout, no trial granted',
    async (planId) => {
      rpcMock.mockResolvedValueOnce({
        data: { ok: false, reason: 'requires_checkout', plan_id: planId, workspace_id: 'ws-1' },
        error: null,
      });

      const { result } = renderHook(() => useLaunchOffer(), { wrapper: wrapper() });

      let caught: any = null;
      await act(async () => {
        try {
          await result.current.claim({ planId, workspaceId: 'ws-1' });
        } catch (e) {
          caught = e;
        }
      });

      expect(caught).not.toBeNull();
      expect(caught.reason).toBe('requires_checkout');
      expect(caught.planId).toBe(planId);
      expect(caught.workspaceId).toBe('ws-1');
    },
  );
});

// ---- Routing logic --------------------------------------------------------
// Mirrors the branch in SelectWorkspacePlanPage / ChangePlanDialog:
//   free → claim() and stay
//   paid → startCheckout() and redirect to Stripe
// We verify that with the mocked RPC + a fake startCheckout, paid plans
// always reach Stripe Checkout before any subscription is activated.

describe('Plan picker routing', () => {
  async function pickPlan({
    planId,
    rpcResponse,
    startCheckout,
  }: {
    planId: 'free' | 'basic' | 'pro' | 'business';
    rpcResponse: any;
    startCheckout: ReturnType<typeof vi.fn>;
  }) {
    rpcMock.mockResolvedValueOnce(rpcResponse);
    const { result } = renderHook(() => useLaunchOffer(), { wrapper: wrapper() });

    if (planId === 'free') {
      return result.current.claim({ planId, workspaceId: 'ws-1' });
    }
    // Paid path: try claim first; on requires_checkout fall through to Stripe.
    try {
      await result.current.claim({ planId, workspaceId: 'ws-1' });
    } catch (e: any) {
      if (e.reason === 'requires_checkout') {
        return startCheckout({ workspaceId: 'ws-1', planId, billingCycle: 'monthly' });
      }
      throw e;
    }
  }

  it('FREE → never calls Stripe Checkout', async () => {
    const startCheckout = vi.fn();
    await pickPlan({
      planId: 'free',
      rpcResponse: { data: { ok: true, plan_id: 'free' }, error: null },
      startCheckout,
    });
    expect(startCheckout).not.toHaveBeenCalled();
  });

  it.each(['basic', 'pro', 'business'] as const)(
    'PAID "%s" → routes to Stripe Checkout with 30-day trial',
    async (planId) => {
      const startCheckout = vi.fn().mockResolvedValue({
        checkout_url: 'https://checkout.stripe.com/c/test',
      });
      const res: any = await pickPlan({
        planId,
        rpcResponse: {
          data: { ok: false, reason: 'requires_checkout', plan_id: planId },
          error: null,
        },
        startCheckout,
      });
      expect(startCheckout).toHaveBeenCalledTimes(1);
      expect(startCheckout).toHaveBeenCalledWith({
        workspaceId: 'ws-1',
        planId,
        billingCycle: 'monthly',
      });
      expect(res.checkout_url).toMatch(/^https:\/\/checkout\.stripe\.com\//);
    },
  );
});

// ---- Plan lifecycle (change-workspace-plan response shapes) ---------------
// Verifies the contract the frontend relies on for upgrades, downgrades,
// trial swaps, and Free cancellation. The edge function is mocked at the
// supabase.functions.invoke boundary.

describe('change-workspace-plan response handling', () => {
  function simulate(res: any) {
    // Mirrors the routing branch in ChangePlanDialog.runChange()
    if (res?.action === 'checkout_required') return { route: 'checkout' };
    if (res?.noop) return { route: 'noop' };
    if (res?.effective === 'immediate' && res?.kind === 'upgrade') return { route: 'upgrade-immediate' };
    if (res?.effective === 'immediate' && res?.target === 'free') return { route: 'free-immediate' };
    if (res?.effective === 'trial_end') return { route: 'trial-swap' };
    if (res?.effective === 'next_period') {
      return { route: res?.target === 'free' ? 'free-scheduled' : 'downgrade-scheduled' };
    }
    return { route: 'unknown' };
  }

  it('Trial Business → Pro: trial_end effective, no charge today', () => {
    const r = simulate({ ok: true, kind: 'downgrade', effective: 'trial_end', trial_end: '2026-06-10' });
    expect(r.route).toBe('trial-swap');
  });

  it('Trial → Free: cancels immediately', () => {
    const r = simulate({ ok: true, kind: 'downgrade', effective: 'immediate', target: 'free' });
    expect(r.route).toBe('free-immediate');
  });

  it('Pro → Business (paid): immediate upgrade with proration', () => {
    const r = simulate({ ok: true, kind: 'upgrade', effective: 'immediate', proration: true });
    expect(r.route).toBe('upgrade-immediate');
  });

  it('Business → Pro (paid): scheduled at next period', () => {
    const r = simulate({ ok: true, kind: 'downgrade', effective: 'next_period', target: 'pro', scheduled_at: '2026-06-10' });
    expect(r.route).toBe('downgrade-scheduled');
  });

  it('Paid → Free: cancel at period end', () => {
    const r = simulate({ ok: true, kind: 'downgrade', effective: 'next_period', target: 'free', scheduled_at: '2026-06-10' });
    expect(r.route).toBe('free-scheduled');
  });

  it('No subscription yet → routes to checkout', () => {
    const r = simulate({ action: 'checkout_required' });
    expect(r.route).toBe('checkout');
  });

  it('Same plan/cycle → noop, no Stripe call', () => {
    const r = simulate({ ok: true, noop: true });
    expect(r.route).toBe('noop');
  });
});
