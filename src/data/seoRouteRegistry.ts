/**
 * Registry of all public routes that should have SEO entries.
 * Used by the SEO dashboard to auto-sync missing pages AND by the
 * build-time prerender script (scripts/prerender-seo.mjs).
 *
 * Single source of truth lives in ./seoRoutesData.mjs so Node and Vite
 * can both consume it without a TS compile step.
 */
// @ts-ignore - .mjs has no .d.ts but Vite/Node both resolve it fine
import { PUBLIC_PAGE_ROUTES as RAW_PUBLIC_PAGE_ROUTES } from './seoRoutesData.mjs';

export interface SeoRouteEntry {
  route_path: string;
  page_key: string;
  page_name: string;
  page_type: 'page' | 'blog';
  is_public: boolean;
  fallbackTitle: string;
  fallbackDescription: string;
}

// All public-facing pages (non-app routes)
export const PUBLIC_PAGE_ROUTES: SeoRouteEntry[] = RAW_PUBLIC_PAGE_ROUTES as SeoRouteEntry[];


/**
 * Generate blog SEO entries from blogPosts data.
 */
export function getBlogSeoEntries(blogPosts: Array<{ slug: string; title: string; excerpt: string }>): SeoRouteEntry[] {
  return blogPosts.map(post => ({
    route_path: `/blog/${post.slug}`,
    page_key: `blog-${post.slug}`,
    page_name: post.title,
    page_type: 'blog' as const,
    is_public: true,
    fallbackTitle: post.title,
    fallbackDescription: post.excerpt,
  }));
}
