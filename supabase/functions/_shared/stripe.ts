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

export const PLAN_PRICE_ENV: Record<string, { monthly: string; yearly: string }> = {
  basic: {
    monthly: "STRIPE_PRICE_BASIC_MONTHLY",
    yearly: "STRIPE_PRICE_BASIC_YEARLY",
  },
  pro: {
    monthly: "STRIPE_PRICE_PRO_MONTHLY",
    yearly: "STRIPE_PRICE_PRO_YEARLY",
  },
  business: {
    monthly: "STRIPE_PRICE_BUSINESS_MONTHLY",
    yearly: "STRIPE_PRICE_BUSINESS_YEARLY",
  },
};

export function resolveStripePriceId(planId: string, cycle: "monthly" | "yearly"): string | null {
  const map = PLAN_PRICE_ENV[planId];
  if (!map) return null;
  const envName = cycle === "yearly" ? map.yearly : map.monthly;
  return Deno.env.get(envName) ?? null;
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
