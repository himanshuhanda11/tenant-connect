import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const crawlerPatterns = [
  "facebookexternalhit", "Facebot", "Twitterbot", "WhatsApp",
  "LinkedInBot", "Slackbot", "TelegramBot", "Discordbot",
  "Pinterest", "Googlebot", "bingbot",
];

function isCrawler(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return crawlerPatterns.some((p) => userAgent.toLowerCase().includes(p.toLowerCase()));
}

interface MetaInfo {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  canonicalUrl: string;
  robots: string;
}

const BASE_URL = "https://aireatro.com";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;

function defaults(path: string): MetaInfo {
  return {
    title: "AiReatro - WhatsApp Business API Platform",
    description: "Connect, engage, and grow with WhatsApp Business API. Automate conversations, send campaigns, and manage customer relationships.",
    ogTitle: "AiReatro - WhatsApp Business API Platform",
    ogDescription: "Connect, engage, and grow with WhatsApp Business API.",
    ogImage: DEFAULT_OG_IMAGE,
    ogType: "website",
    twitterCard: "summary_large_image",
    twitterTitle: "AiReatro - WhatsApp Business API Platform",
    twitterDescription: "Connect, engage, and grow with WhatsApp Business API.",
    twitterImage: DEFAULT_OG_IMAGE,
    canonicalUrl: `${BASE_URL}${path}`,
    robots: "index,follow",
  };
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function generateHtml(m: MetaInfo, url: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(m.title)}</title>
  <meta name="description" content="${escapeHtml(m.description)}">
  <meta name="robots" content="${escapeHtml(m.robots)}">
  <link rel="canonical" href="${escapeHtml(m.canonicalUrl)}">
  <meta property="og:type" content="${escapeHtml(m.ogType)}">
  <meta property="og:url" content="${escapeHtml(url)}">
  <meta property="og:title" content="${escapeHtml(m.ogTitle)}">
  <meta property="og:description" content="${escapeHtml(m.ogDescription)}">
  <meta property="og:image" content="${escapeHtml(m.ogImage)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="AiReatro Communications">
  <meta name="twitter:card" content="${escapeHtml(m.twitterCard)}">
  <meta name="twitter:site" content="@AiReatro">
  <meta name="twitter:url" content="${escapeHtml(url)}">
  <meta name="twitter:title" content="${escapeHtml(m.twitterTitle)}">
  <meta name="twitter:description" content="${escapeHtml(m.twitterDescription)}">
  <meta name="twitter:image" content="${escapeHtml(m.twitterImage)}">
  <meta http-equiv="refresh" content="0;url=${escapeHtml(url)}">
</head>
<body>
  <h1>${escapeHtml(m.title)}</h1>
  <p>${escapeHtml(m.description)}</p>
  <a href="${escapeHtml(url)}">Visit ${escapeHtml(m.title)}</a>
</body>
</html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.searchParams.get("path") || "/";
    const userAgent = req.headers.get("user-agent");
    const normalizedPath = path === "/" ? "/" : path.replace(/\/$/, "");
    const fullUrl = `${BASE_URL}${normalizedPath}`;

    // Non-crawlers → redirect
    if (!isCrawler(userAgent)) {
      return new Response(null, { status: 302, headers: { ...corsHeaders, Location: fullUrl } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let meta = defaults(normalizedPath);

    // Check if it's a blog route
    const blogMatch = normalizedPath.match(/^\/blog\/(.+)$/);

    if (blogMatch) {
      const slug = blogMatch[1];
      const { data: blog } = await supabase
        .from("blogs")
        .select("title, excerpt, seo_title, seo_description, seo_keywords, og_title, og_description, og_image, twitter_title, twitter_description, twitter_image, featured_image, canonical_url, schema_jsonld")
        .eq("slug", slug)
        .eq("status", "published")
        .single();

      if (blog) {
        const blogTitle = blog.seo_title || blog.title || meta.title;
        const blogDesc = blog.seo_description || blog.excerpt || meta.description;
        const blogImage = blog.og_image || blog.featured_image || DEFAULT_OG_IMAGE;

        meta = {
          title: blogTitle.includes("AiReatro") ? blogTitle : `${blogTitle} | AiReatro`,
          description: blogDesc,
          ogTitle: blog.og_title || blogTitle,
          ogDescription: blog.og_description || blogDesc,
          ogImage: blogImage,
          ogType: "article",
          twitterCard: "summary_large_image",
          twitterTitle: blog.twitter_title || blogTitle,
          twitterDescription: blog.twitter_description || blogDesc,
          twitterImage: blog.twitter_image || blogImage,
          canonicalUrl: blog.canonical_url || fullUrl,
          robots: "index,follow",
        };
      }
    } else {
      // Try seo_pages table for other routes
      const { data: pageData } = await supabase
        .from("seo_pages")
        .select(`id, route_path, seo_meta(title, description, og_title, og_description, og_image, og_type, twitter_card, twitter_title, twitter_description, twitter_image, canonical_url, robots)`)
        .eq("route_path", normalizedPath)
        .eq("is_public", true)
        .single();

      if (pageData?.seo_meta?.[0]) {
        const s = pageData.seo_meta[0];
        meta = {
          title: s.title || meta.title,
          description: s.description || meta.description,
          ogTitle: s.og_title || s.title || meta.ogTitle,
          ogDescription: s.og_description || s.description || meta.ogDescription,
          ogImage: s.og_image || meta.ogImage,
          ogType: s.og_type || meta.ogType,
          twitterCard: s.twitter_card || meta.twitterCard,
          twitterTitle: s.twitter_title || s.title || meta.twitterTitle,
          twitterDescription: s.twitter_description || s.description || meta.twitterDescription,
          twitterImage: s.twitter_image || s.og_image || meta.twitterImage,
          canonicalUrl: s.canonical_url || fullUrl,
          robots: s.robots || meta.robots,
        };
      }
    }

    return new Response(generateHtml(meta, fullUrl), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=3600" },
    });
  } catch (error) {
    console.error("OG Meta Error:", error);
    const fallback = defaults("/");
    return new Response(generateHtml(fallback, BASE_URL), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=300" },
    });
  }
});
