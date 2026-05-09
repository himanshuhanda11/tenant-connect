// E2E tests for claim_launch_offer RPC enforcement.
//
// Verifies the workspace-level plan claim flow:
//  1. First paid claim on workspace A → OK, trial consumed.
//  2. Second paid claim on workspace B (same user) → ok:false / reason:trial_already_used.
//  3. Free claim on workspace B → OK (free is always allowed).
//  4. RPC always returns JSON (never an Edge Function 2xx/500 mismatch).
//
// Requires the project's anon + service role keys via env vars.

import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL") ?? Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY =
  Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

// Tests require service role + anon to provision throwaway users. If either is
// missing in the current environment, skip rather than fail the suite.
const CAN_RUN = !!(SUPABASE_URL && SUPABASE_ANON_KEY && SERVICE_ROLE_KEY);
if (!CAN_RUN) {
  console.warn(
    "[claim_launch_offer tests] Skipping — set SUPABASE_SERVICE_ROLE_KEY + VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY to enable.",
  );
}

const admin = CAN_RUN
  ? createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : (null as any);

type ClaimResult = {
  ok: boolean;
  reason?: string;
  message?: string;
  workspace_id?: string;
  plan_id?: string;
};

async function makeUser() {
  const email = `trial-test-${crypto.randomUUID()}@example.com`;
  const password = `Pw_${crypto.randomUUID().slice(0, 12)}!Aa1`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !data.user) throw new Error(`createUser failed: ${error?.message}`);
  return { id: data.user.id, email, password };
}

async function userClient(email: string, password: string) {
  const c = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await c.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`signIn failed: ${error.message}`);
  return c;
}

async function createWorkspace(c: any, name: string) {
  const slug = `${name.toLowerCase().replace(/\s+/g, "-")}-${crypto.randomUUID().slice(0, 6)}`;
  const { data, error } = await c.rpc("create_tenant_with_owner", {
    _name: name,
    _slug: slug,
  });
  if (error) throw new Error(`createWorkspace failed: ${error.message}`);
  const tenant = Array.isArray(data) ? data[0] : data;
  return tenant as { id: string; name: string; slug: string };
}

async function cleanup(userId: string, tenantIds: string[]) {
  // Delete tenants then user. Cascades should cover the rest.
  for (const id of tenantIds) {
    await admin.from("tenants").delete().eq("id", id);
  }
  await admin.auth.admin.deleteUser(userId);
}

Deno.test(
  "claim_launch_offer: enforces one paid trial per user across workspaces",
  async () => {
    const user = await makeUser();
    const c = await userClient(user.email, user.password);
    let wsA: { id: string } | null = null;
    let wsB: { id: string } | null = null;
    try {
      wsA = await createWorkspace(c, "Workspace A");
      wsB = await createWorkspace(c, "Workspace B");

      // 1. First paid claim → ok
      const r1 = await c.rpc("claim_launch_offer", {
        _plan_id: "pro",
        _workspace_id: wsA.id,
      });
      assertEquals(r1.error, null, `first claim returned RPC error: ${r1.error?.message}`);
      const d1 = r1.data as ClaimResult;
      assert(d1?.ok === true, `expected ok:true, got ${JSON.stringify(d1)}`);
      assertEquals(d1.plan_id, "pro");
      assertEquals(d1.workspace_id, wsA.id);

      // 2. Second paid claim on different workspace → blocked
      const r2 = await c.rpc("claim_launch_offer", {
        _plan_id: "basic",
        _workspace_id: wsB.id,
      });
      assertEquals(r2.error, null, `second claim returned RPC error: ${r2.error?.message}`);
      const d2 = r2.data as ClaimResult;
      assertEquals(d2?.ok, false, `expected ok:false, got ${JSON.stringify(d2)}`);
      assertEquals(d2.reason, "trial_already_used");
      assert(typeof d2.message === "string" && d2.message.length > 0, "expected friendly message");

      // 3. Free plan on the second workspace → ok (free never blocked)
      const r3 = await c.rpc("claim_launch_offer", {
        _plan_id: "free",
        _workspace_id: wsB.id,
      });
      assertEquals(r3.error, null, `free claim returned RPC error: ${r3.error?.message}`);
      const d3 = r3.data as ClaimResult;
      assertEquals(d3?.ok, true);
      assertEquals(d3.plan_id, "free");

      // 4. is_trial_eligible reflects consumed trial
      const elig = await c.rpc("is_trial_eligible");
      assertEquals(elig.error, null);
      assertEquals(elig.data, false, "expected eligibility=false after paid claim");
    } finally {
      await cleanup(user.id, [wsA?.id, wsB?.id].filter(Boolean) as string[]);
    }
  },
);

Deno.test(
  "claim_launch_offer: rejects non-members of the workspace",
  async () => {
    const owner = await makeUser();
    const stranger = await makeUser();
    const ownerClient = await userClient(owner.email, owner.password);
    const strangerClient = await userClient(stranger.email, stranger.password);
    let ws: { id: string } | null = null;
    try {
      ws = await createWorkspace(ownerClient, "Owned WS");
      const r = await strangerClient.rpc("claim_launch_offer", {
        _plan_id: "pro",
        _workspace_id: ws.id,
      });
      // Either an error from `RAISE EXCEPTION` or a structured failure — both are acceptable,
      // but it must NEVER silently succeed.
      const succeeded = r.error == null && (r.data as ClaimResult)?.ok === true;
      assertEquals(succeeded, false, "stranger must not be able to claim trial on someone else's workspace");
    } finally {
      await cleanup(owner.id, ws ? [ws.id] : []);
      await cleanup(stranger.id, []);
    }
  },
);

Deno.test(
  "claim_launch_offer: returns a structured JSON response (no 2xx/500 mismatch)",
  async () => {
    const user = await makeUser();
    const c = await userClient(user.email, user.password);
    let ws: { id: string } | null = null;
    try {
      ws = await createWorkspace(c, "Format WS");
      const r = await c.rpc("claim_launch_offer", {
        _plan_id: "free",
        _workspace_id: ws.id,
      });
      // RPC must resolve without throwing — never the "Edge Function 2xx" mismatch.
      assertEquals(r.error, null, `RPC must not return error: ${r.error?.message}`);
      assert(r.data != null, "RPC must return a JSON body");
      assert(typeof (r.data as ClaimResult).ok === "boolean", "response must include `ok` boolean");
    } finally {
      await cleanup(user.id, ws ? [ws.id] : []);
    }
  },
);
