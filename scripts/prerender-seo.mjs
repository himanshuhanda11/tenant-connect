/**
 * Postbuild SEO prerender + sitemap regenerator.
 *
 * 1. For every public marketing route + every blog slug (static + DB),
 *    writes dist/<route>/index.html with route-specific <title>, meta,
 *    Open Graph, Twitter, canonical and JSON-LD baked into HTML head.
 * 2. Regenerates dist/sitemap.xml with all known URLs.
 *
 * Crawlers and "View Source" see the correct per-page tags. The React SPA
 * still hydrates afterwards. Vercel serves these static files first and
 * only falls back to /index.html for unmatched (dashboard) paths.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { PUBLIC_PAGE_ROUTES } from '../src/data/seoRoutesData.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');
const BASE_URL = 'https://aireatro.com';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;
const SITE_NAME = 'AiReatro Communications';

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  '';

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function preserveNoCacheHead(sourceHtml) {
  const tags = sourceHtml.match(
    /<meta\s+http-equiv=["'](?:Cache-Control|Pragma|Expires)["'][^>]*>\s*/gi
  );
  return tags ? tags.join('') : '';
}

function buildJsonLd(route) {
  const url = `${BASE_URL}${route.route_path === '/' ? '' : route.route_path}`;
  const isBlog = route.page_type === 'blog';
  const blocks = [
    {
      '@context': 'https://schema.org',
      '@type': isBlog ? 'BlogPosting' : 'WebPage',
      name: route.fallbackTitle,
      headline: route.fallbackTitle,
      description: route.fallbackDescription,
      url,
      inLanguage: 'en',
      isPartOf: {
        '@type': 'WebSite',
        name: SITE_NAME,
        url: BASE_URL,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SITE_NAME,
      url: BASE_URL,
      logo: `${BASE_URL}/favicon.png`,
    },
  ];
  return blocks
    .map(
      (b) =>
        `<script type="application/ld+json">${JSON.stringify(b).replace(
          /</g,
          '\\u003c'
        )}</script>`
    )
    .join('\n    ');
}

function buildHead(route) {
  const fullTitle = route.fallbackTitle.includes('AiReatro')
    ? route.fallbackTitle
    : `${route.fallbackTitle} | ${SITE_NAME}`;
  const description = route.fallbackDescription;
  const url = `${BASE_URL}${route.route_path === '/' ? '/' : route.route_path}`;
  const ogImage = route.ogImage || DEFAULT_OG_IMAGE;

  return `
    <title>${escapeHtml(fullTitle)}</title>
    <meta name="title" content="${escapeHtml(fullTitle)}" />
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="author" content="${SITE_NAME}" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${escapeHtml(url)}" />

    <meta property="og:type" content="${route.page_type === 'blog' ? 'article' : 'website'}" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:title" content="${escapeHtml(fullTitle)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(url)}" />
    <meta property="og:image" content="${escapeHtml(ogImage)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${escapeHtml(route.fallbackTitle)}" />
    <meta property="og:locale" content="en_US" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@AiReatro" />
    <meta name="twitter:creator" content="@AiReatro" />
    <meta name="twitter:title" content="${escapeHtml(fullTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(ogImage)}" />

    ${buildJsonLd(route)}
  `.trim();
}

function injectHead(sourceHtml, route) {
  let html = sourceHtml;
  const cacheControlHead = preserveNoCacheHead(sourceHtml);
  const stripPatterns = [
    /<title>[\s\S]*?<\/title>\s*/i,
    /<meta\s+name=["']title["'][^>]*>\s*/gi,
    /<meta\s+name=["']description["'][^>]*>\s*/gi,
    /<meta\s+name=["']author["'][^>]*>\s*/gi,
    /<meta\s+name=["']robots["'][^>]*>\s*/gi,
    /<link\s+rel=["']canonical["'][^>]*>\s*/gi,
    /<meta\s+property=["']og:[^"']+["'][^>]*>\s*/gi,
    /<meta\s+name=["']twitter:[^"']+["'][^>]*>\s*/gi,
    /<script\s+type=["']application\/ld\+json["'][\s\S]*?<\/script>\s*/gi,
    /<!--\s*Default SEO Meta[\s\S]*?-->\s*/i,
    /<!--\s*Default Open Graph\s*-->\s*/i,
    /<!--\s*Default Twitter\s*-->\s*/i,
  ];
  for (const re of stripPatterns) html = html.replace(re, '');

  const headBlock = buildHead(route);
  const viewportRe = /(<meta\s+name=["']viewport["'][^>]*>\s*)/i;
  if (viewportRe.test(html)) {
    html = html.replace(viewportRe, `$1\n    ${cacheControlHead}    ${headBlock}\n    `);
  } else {
    html = html.replace(/<head[^>]*>/i, (m) => `${m}\n    ${cacheControlHead}    ${headBlock}\n    `);
  }
  return html;
}

async function writeRouteHtml(sourceHtml, route) {
  const finalHtml = injectHead(sourceHtml, route);
  let outPath;
  if (route.route_path === '/') {
    outPath = join(DIST, 'index.html');
  } else {
    const dir = join(DIST, route.route_path.replace(/^\/+/, ''));
    await mkdir(dir, { recursive: true });
    outPath = join(dir, 'index.html');
  }
  await writeFile(outPath, finalHtml, 'utf8');
  return outPath;
}

/**
 * Parse static src/data/blogPosts.ts to extract {slug, title, excerpt, image}.
 * We only read the fields we need via regex to avoid bundling TS at build time.
 */
async function loadStaticBlogs() {
  const file = resolve(ROOT, 'src/data/blogPosts.ts');
  if (!existsSync(file)) return [];
  const src = await readFile(file, 'utf8');
  const posts = [];
  // Split into top-level object literals between `{` and matching `}` is hard
  // with regex; instead match each `slug: '...'` and grab the surrounding
  // title/excerpt/image lines that follow within the same object.
  const slugRe = /slug:\s*['"]([^'"]+)['"][\s\S]*?title:\s*['"]([^'"]+)['"][\s\S]*?excerpt:\s*['"]([^'"]+)['"](?:[\s\S]*?image:\s*['"]([^'"]+)['"])?/g;
  let m;
  while ((m = slugRe.exec(src)) !== null) {
    posts.push({
      slug: m[1],
      title: m[2],
      excerpt: m[3],
      image: m[4] || null,
    });
  }
  return posts;
}

/**
 * Fetch published blogs from Supabase via PostgREST using the public anon key.
 * Returns [] on any failure so the build never breaks.
 */
async function loadDbBlogs() {
  if (!SUPABASE_URL || !SUPABASE_KEY) return [];
  try {
    const url = `${SUPABASE_URL}/rest/v1/blogs?status=eq.published&select=slug,title,excerpt,seo_title,seo_description,og_image,featured_image,updated_at`;
    const res = await fetch(url, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
    if (!res.ok) return [];
    const rows = await res.json();
    return (rows || []).filter((r) => r.slug);
  } catch {
    return [];
  }
}

function blogToRoute(post) {
  return {
    route_path: `/blog/${post.slug}`,
    page_key: `blog-${post.slug}`,
    page_name: post.title,
    page_type: 'blog',
    is_public: true,
    fallbackTitle: post.seo_title || post.title,
    fallbackDescription:
      post.seo_description ||
      post.excerpt ||
      `Read ${post.title} on the AiReatro blog.`,
    ogImage: post.og_image || post.featured_image || post.image || null,
    lastmod: post.updated_at || null,
  };
}

function buildSitemap(routes) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = routes
    .map((r) => {
      const loc = `${BASE_URL}${r.route_path === '/' ? '/' : r.route_path}`;
      const lastmod = (r.lastmod || today).slice(0, 10);
      const priority = r.route_path === '/' ? '1.0' : r.page_type === 'blog' ? '0.7' : '0.8';
      const changefreq = r.page_type === 'blog' ? 'weekly' : 'monthly';
      return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

async function main() {
  if (!existsSync(DIST)) {
    console.warn('[prerender-seo] dist/ not found, skipping.');
    return;
  }
  const indexPath = join(DIST, 'index.html');
  if (!existsSync(indexPath)) {
    console.warn('[prerender-seo] dist/index.html not found, skipping.');
    return;
  }

  const sourceHtml = await readFile(indexPath, 'utf8');
  await writeFile(join(DIST, '__app_shell.html'), sourceHtml, 'utf8');

  const [staticBlogs, dbBlogs] = await Promise.all([
    loadStaticBlogs(),
    loadDbBlogs(),
  ]);
  // Merge by slug, DB wins over static
  const bySlug = new Map();
  for (const p of staticBlogs) bySlug.set(p.slug, p);
  for (const p of dbBlogs) bySlug.set(p.slug, { ...bySlug.get(p.slug), ...p });
  const blogRoutes = [...bySlug.values()].map(blogToRoute);

  const allRoutes = [...PUBLIC_PAGE_ROUTES, ...blogRoutes];

  let count = 0;
  for (const route of allRoutes) {
    try {
      await writeRouteHtml(sourceHtml, route);
      count++;
    } catch (err) {
      console.error(`[prerender-seo] failed for ${route.route_path}:`, err);
    }
  }

  // Regenerate sitemap.xml
  try {
    const xml = buildSitemap(allRoutes);
    await writeFile(join(DIST, 'sitemap.xml'), xml, 'utf8');
    console.log(`[prerender-seo] wrote sitemap.xml with ${allRoutes.length} URLs.`);
  } catch (err) {
    console.error('[prerender-seo] sitemap write failed:', err);
  }

  console.log(
    `[prerender-seo] wrote ${count} prerendered route(s) (${blogRoutes.length} blog).`
  );
}

main().catch((err) => {
  console.error('[prerender-seo] fatal:', err);
  process.exit(1);
});
