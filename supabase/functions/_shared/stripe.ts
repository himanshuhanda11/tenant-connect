// Shared helpers for Stripe-backed billing edge functions.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

export type PricingRegion = "IN" | "GULF" | "OTHER";
export type PricingCycle = "monthly" | "yearly";

export const REGION_CURRENCY: Record<PricingRegion, "INR" | "AED" | "USD"> = {
  IN: "INR",
  GULF: "AED",
  OTHER: "USD",
};

/**
 * Resolve the Stripe price ID for a (plan, cycle, region) tuple.
 * Lookup order:
 *   1. platform_plans.stripe_prices JSON  →  { IN: { monthly, yearly }, GULF: {...}, OTHER: {...} }
 *   2. Region-suffixed env var, e.g. STRIPE_PRICE_BASIC_MONTHLY_IN
 *   3. Legacy unsuffixed env var, e.g. STRIPE_PRICE_BASIC_MONTHLY
 */
export async function resolveStripePriceId(
  service: ReturnType<typeof getServiceClient>,
  planId: string,
  cycle: PricingCycle,
  region: PricingRegion = "OTHER",
): Promise<string | null> {
  // 1. DB-driven config
  try {
    const { data } = await service
      .from("platform_plans")
      .select("stripe_prices")
      .eq("id", planId)
      .maybeSingle();
    const map = (data?.stripe_prices ?? {}) as Record<string, Record<string, string>>;
    const fromDb = map?.[region]?.[cycle] || map?.[region.toLowerCase()]?.[cycle];
    if (fromDb) return fromDb;
  } catch (_) { /* fall through */ }

  // 2. Region-suffixed env
  const base = `STRIPE_PRICE_${planId.toUpperCase()}_${cycle.toUpperCase()}`;
  const suffixed = Deno.env.get(`${base}_${region}`);
  if (suffixed) return suffixed;

  // 3. Legacy fallback
  return Deno.env.get(base) ?? null;
}

export async function getStripe() {
  const key = Deno.env.get("STRIPE_SECRET_KEY");
  if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
  const { default: Stripe } = await import("https://esm.sh/stripe@14.21.0?target=deno");
  return new Stripe(key, { apiVersion: "2023-10-16" });
}

export function getServiceClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

export async function getAuthedUser(req: Request) {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const anon = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!
  );
  const { data, error } = await anon.auth.getUser(auth.replace("Bearer ", ""));
  if (error || !data?.user) return null;
  return data.user;
}

export async function assertWorkspaceAdmin(
  service: ReturnType<typeof getServiceClient>,
  workspaceId: string,
  userId: string
): Promise<boolean> {
  const { data, error } = await service.rpc("is_workspace_admin", {
    _workspace_id: workspaceId,
    _user_id: userId,
  });
  if (error) return false;
  return Boolean(data);
}

export function appUrl(): string {
  return (
    Deno.env.get("APP_URL") ||
    "https://app.aireatro.com"
  );
}
