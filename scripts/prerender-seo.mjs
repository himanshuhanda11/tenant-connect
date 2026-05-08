/**
 * Postbuild SEO prerender.
 *
 * For every public marketing route, writes dist/<route>/index.html that is a
 * copy of dist/index.html with route-specific <title>, meta, Open Graph,
 * Twitter, canonical and JSON-LD tags injected directly into the HTML head.
 *
 * Crawlers (Google, Facebook, WhatsApp, Twitter, LinkedIn) and "View Source"
 * see the correct per-page tags. The React SPA still hydrates afterwards, so
 * the dashboard and all client-side behavior remain unchanged.
 *
 * Lovable / Vercel hosting serve the static file when the path matches a real
 * file, and only fall back to index.html (SPA) for unmatched paths — so the
 * dashboard routes (/app, /select-workspace, /login, etc.) stay SPA-only.
 */
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { PUBLIC_PAGE_ROUTES } from '../src/data/seoRoutesData.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, '..', 'dist');
const BASE_URL = 'https://aireatro.com';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;
const SITE_NAME = 'AiReatro Communications';

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildJsonLd(route) {
  const url = `${BASE_URL}${route.route_path === '/' ? '' : route.route_path}`;
  const blocks = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: route.fallbackTitle,
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
  const ogImage = DEFAULT_OG_IMAGE;

  return `
    <title>${escapeHtml(fullTitle)}</title>
    <meta name="title" content="${escapeHtml(fullTitle)}" />
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="author" content="${SITE_NAME}" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${escapeHtml(url)}" />

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:title" content="${escapeHtml(fullTitle)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(url)}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${escapeHtml(route.fallbackTitle)}" />
    <meta property="og:locale" content="en_US" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@AiReatro" />
    <meta name="twitter:creator" content="@AiReatro" />
    <meta name="twitter:title" content="${escapeHtml(fullTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${ogImage}" />

    ${buildJsonLd(route)}
  `.trim();
}

/**
 * Replace the existing <title>, description, canonical, OG, Twitter and any
 * existing JSON-LD blocks in the source index.html with the route-specific
 * head, then write the result to dist/<route>/index.html.
 */
function injectHead(sourceHtml, route) {
  let html = sourceHtml;

  // Strip existing tags we are about to re-emit so we do not double-render.
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
    // Strip the default SEO comment block if present
    /<!--\s*Default SEO Meta[\s\S]*?-->\s*/i,
    /<!--\s*Default Open Graph\s*-->\s*/i,
    /<!--\s*Default Twitter\s*-->\s*/i,
  ];
  for (const re of stripPatterns) html = html.replace(re, '');

  // Inject our head block right after the <meta name="viewport"> line, or
  // failing that, right after <head>.
  const headBlock = buildHead(route);
  const viewportRe = /(<meta\s+name=["']viewport["'][^>]*>\s*)/i;
  if (viewportRe.test(html)) {
    html = html.replace(viewportRe, `$1\n    ${headBlock}\n    `);
  } else {
    html = html.replace(/<head[^>]*>/i, (m) => `${m}\n    ${headBlock}\n    `);
  }
  return html;
}

async function writeRouteHtml(sourceHtml, route) {
  const finalHtml = injectHead(sourceHtml, route);
  let outPath;
  if (route.route_path === '/') {
    outPath = join(DIST, 'index.html'); // overwrite root index.html with home meta
  } else {
    const dir = join(DIST, route.route_path.replace(/^\/+/, ''));
    await mkdir(dir, { recursive: true });
    outPath = join(dir, 'index.html');
  }
  await writeFile(outPath, finalHtml, 'utf8');
  return outPath;
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

  // Keep an untouched copy of the SPA entry so we always have a clean shell.
  const sourceHtml = await readFile(indexPath, 'utf8');
  const shellPath = join(DIST, '__app_shell.html');
  await writeFile(shellPath, sourceHtml, 'utf8');

  let count = 0;
  for (const route of PUBLIC_PAGE_ROUTES) {
    try {
      await writeRouteHtml(sourceHtml, route);
      count++;
    } catch (err) {
      console.error(`[prerender-seo] failed for ${route.route_path}:`, err);
    }
  }
  console.log(`[prerender-seo] wrote ${count} prerendered route(s).`);
}

main().catch((err) => {
  console.error('[prerender-seo] fatal:', err);
  process.exit(1);
});
