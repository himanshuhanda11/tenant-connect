import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function normalizeSlug(input: unknown) {
  return String(input || "").trim().replace(/^\/+|\/+$/g, "").slice(0, 120);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    let slug = normalizeSlug(url.searchParams.get("slug"));
    if (!slug && req.method !== "GET") {
      const body = await req.json().catch(() => ({}));
      slug = normalizeSlug(body.slug);
    }

    if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
      return json({ error: "A valid blog slug is required." }, 400);
    }

    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: platformAdmin } = await admin
      .from("platform_admins")
      .select("role,is_active")
      .eq("user_id", claimsData.claims.sub)
      .maybeSingle();

    if (!platformAdmin?.is_active || !["super_admin", "support"].includes(platformAdmin.role)) {
      return json({ error: "Forbidden" }, 403);
    }

    const { data: dbRows, error: dbError } = await admin
      .from("blogs")
      .select("id,title,slug,status,published_at,created_at,updated_at,featured_image")
      .eq("slug", slug)
      .limit(2);
    if (dbError) throw dbError;

    const inserted = (dbRows || []).length > 0;
    const duplicateSlug = (dbRows || []).length > 1;
    const row = inserted ? dbRows![0] : null;
    const published = row?.status === "published" && !!row?.published_at;

    const publicClient = createClient(supabaseUrl, anonKey);
    const { data: publicRows, error: publicError } = await publicClient
      .from("blogs")
      .select("id,title,slug,excerpt,featured_image,status,author,category,read_time,published_at,created_at")
      .eq("status", "published")
      .eq("slug", slug)
      .order("published_at", { ascending: false });
    if (publicError) throw publicError;

    const { data: publicListingRows, error: listingError } = await publicClient
      .from("blogs")
      .select("id,slug,status,published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false });
    if (listingError) throw listingError;

    const publicVisible = (publicRows || []).some((post) => post.slug === slug);
    const reasons: string[] = [];
    if (!inserted) reasons.push("No row exists in the blogs table for this slug.");
    if (duplicateSlug) reasons.push("More than one row matched this slug; slug should be unique.");
    if (inserted && row?.status !== "published") reasons.push(`Status is '${row?.status}', not 'published'.`);
    if (inserted && row?.status === "published" && !row?.published_at) reasons.push("published_at is empty.");
    if (published && !publicVisible) reasons.push("The row is published but the public /blog query cannot read it; check public visibility policy.");
    if (inserted && !row?.featured_image) reasons.push("Featured image is empty; listing can still show fallback image.");

    return json({
      slug,
      tenantScoped: false,
      tenantVisibilityNote: "blogs has no tenant_id column; /blog visibility is global public visibility for published rows.",
      inserted,
      published,
      publicVisible,
      publicListingCount: publicListingRows?.length || 0,
      row,
      reasons,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("blog-visibility-check error", error);
    return json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});
