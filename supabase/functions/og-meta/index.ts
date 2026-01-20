import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Common social media crawler user agents
const crawlerPatterns = [
  "facebookexternalhit",
  "Facebot",
  "Twitterbot",
  "WhatsApp",
  "LinkedInBot",
  "Slackbot",
  "TelegramBot",
  "Discordbot",
  "Pinterest",
  "Googlebot",
  "bingbot",
];

function isCrawler(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return crawlerPatterns.some((pattern) =>
    userAgent.toLowerCase().includes(pattern.toLowerCase())
  );
}

interface SeoMeta {
  title: string;
  description: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  og_type: string;
  twitter_card: string;
  twitter_title: string | null;
  twitter_description: string | null;
  twitter_image: string | null;
  canonical_url: string | null;
  robots: string;
}

function generateMetaHtml(meta: SeoMeta, url: string): string {
  const baseUrl = "https://aireatro.com";
  const title = meta.title || "AiReatro - WhatsApp Business API Platform";
  const description = meta.description || "Connect, engage, and grow with WhatsApp Business API. Automate conversations, send campaigns, and manage customer relationships.";
  const ogTitle = meta.og_title || title;
  const ogDescription = meta.og_description || description;
  const ogImage = meta.og_image || `${baseUrl}/og-image.png`;
  const ogType = meta.og_type || "website";
  const twitterCard = meta.twitter_card || "summary_large_image";
  const twitterTitle = meta.twitter_title || ogTitle;
  const twitterDescription = meta.twitter_description || ogDescription;
  const twitterImage = meta.twitter_image || ogImage;
  const canonicalUrl = meta.canonical_url || url;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="${meta.robots || 'index,follow'}">
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}">
  
  <!-- Open Graph -->
  <meta property="og:type" content="${escapeHtml(ogType)}">
  <meta property="og:url" content="${escapeHtml(url)}">
  <meta property="og:title" content="${escapeHtml(ogTitle)}">
  <meta property="og:description" content="${escapeHtml(ogDescription)}">
  <meta property="og:image" content="${escapeHtml(ogImage)}">
  <meta property="og:site_name" content="AiReatro">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="${escapeHtml(twitterCard)}">
  <meta name="twitter:url" content="${escapeHtml(url)}">
  <meta name="twitter:title" content="${escapeHtml(twitterTitle)}">
  <meta name="twitter:description" content="${escapeHtml(twitterDescription)}">
  <meta name="twitter:image" content="${escapeHtml(twitterImage)}">
  
  <!-- Redirect to actual page after crawlers get meta -->
  <meta http-equiv="refresh" content="0;url=${escapeHtml(url)}">
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(description)}</p>
  <a href="${escapeHtml(url)}">Visit ${escapeHtml(title)}</a>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.searchParams.get("path") || "/";
    const userAgent = req.headers.get("user-agent");
    const fullUrl = `https://aireatro.com${path}`;

    // Check if this is a crawler request
    if (!isCrawler(userAgent)) {
      // Not a crawler, redirect to actual page
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          Location: fullUrl,
        },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Normalize path for lookup
    const normalizedPath = path === "/" ? "/" : path.replace(/\/$/, "");

    // Fetch SEO meta from database
    const { data: pageData, error: pageError } = await supabase
      .from("seo_pages")
      .select(`
        id,
        route_path,
        seo_meta(
          title,
          description,
          og_title,
          og_description,
          og_image,
          og_type,
          twitter_card,
          twitter_title,
          twitter_description,
          twitter_image,
          canonical_url,
          robots
        )
      `)
      .eq("route_path", normalizedPath)
      .eq("is_public", true)
      .single();

    let meta: SeoMeta;

    if (pageError || !pageData || !pageData.seo_meta?.[0]) {
      // Use default meta if page not found
      meta = {
        title: "AiReatro - WhatsApp Business API Platform",
        description: "Connect, engage, and grow with WhatsApp Business API. Automate conversations, send campaigns, and manage customer relationships.",
        og_title: null,
        og_description: null,
        og_image: null,
        og_type: "website",
        twitter_card: "summary_large_image",
        twitter_title: null,
        twitter_description: null,
        twitter_image: null,
        canonical_url: null,
        robots: "index,follow",
      };
    } else {
      meta = pageData.seo_meta[0] as SeoMeta;
    }

    const html = generateMetaHtml(meta, fullUrl);

    return new Response(html, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("OG Meta Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
