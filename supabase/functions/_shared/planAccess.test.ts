import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
  Deno.env.get("SUPABASE_SERVICE_KEY") ?? "";

// These tests verify the database-side check_plan_access RPC behaves
// correctly. They are skipped when no service key is available locally.
const skip = !SERVICE_KEY;

Deno.test({
  name: "check_plan_access denies unknown tenant",
  ignore: skip,
  async fn() {
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data, error } = await admin.rpc("check_plan_access", {
      p_tenant_id: "00000000-0000-0000-0000-000000000000",
      p_feature_key: "send_campaign",
    });
    assertEquals(error, null);
    // unknown tenant -> not allowed
    assertEquals((data as { allowed: boolean })?.allowed, false);
  },
});

Deno.test({
  name: "check_plan_access denies unknown feature key",
  ignore: skip,
  async fn() {
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data, error } = await admin.rpc("check_plan_access", {
      p_tenant_id: "00000000-0000-0000-0000-000000000000",
      p_feature_key: "this_feature_does_not_exist",
    });
    assertEquals(error, null);
    assertEquals((data as { allowed: boolean })?.allowed, false);
  },
});

Deno.test({
  name: "enforce_subscription_grace_period RPC is callable",
  ignore: skip,
  async fn() {
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { error } = await admin.rpc("enforce_subscription_grace_period");
    assertEquals(error, null);
  },
});
