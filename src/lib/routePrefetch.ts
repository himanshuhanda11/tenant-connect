/**
 * Route prefetcher — warms lazy chunks in the background so navigation
 * feels instant. Safe to call repeatedly; the browser/Vite caches modules.
 */

type Importer = () => Promise<unknown>;

// Registry of high-traffic routes to warm up. Keep in sync with App.tsx lazy imports.
const ROUTES: Record<string, Importer> = {
  "/login": () => import("@/pages/Login"),
  "/signup": () => import("@/pages/onboarding/SignupPage"),
  "/select-workspace": () => import("@/pages/SelectWorkspace"),
  "/dashboard": () => import("@/pages/Dashboard"),
  "/inbox": () => import("@/pages/InboxPage"),
  "/contacts": () => import("@/pages/Contacts"),
  "/templates": () => import("@/pages/Templates"),
  "/campaigns": () => import("@/pages/campaigns/CampaignsList"),
  "/automation": () => import("@/pages/AutomationWorkflows"),
  "/pricing": () => import("@/pages/Pricing"),
  "/features": () => import("@/pages/Features"),
  "/help": () => import("@/pages/Help"),
  "/blog": () => import("@/pages/Blog"),
  "/products": () => import("@/pages/Products"),
  "/why-aireatro": () => import("@/pages/WhyAireatro"),
  "/whatsapp-business-api": () => import("@/pages/WhatsAppBusinessApi"),
  "/click-to-whatsapp": () => import("@/pages/ClickToWhatsApp"),
  "/why-whatsapp-marketing": () => import("@/pages/WhyWhatsAppMarketing"),
  "/whatsapp-forms": () => import("@/pages/WhatsAppForms"),
  "/integrations": () => import("@/pages/Integrations"),
  "/documentation": () => import("@/pages/Documentation"),
  "/case-studies": () => import("@/pages/CaseStudies"),
  "/template-library": () => import("@/pages/TemplateLibrary"),
  "/contact": () => import("@/pages/Contact"),
  "/about": () => import("@/pages/About"),
};

const warmed = new Set<string>();

function run(importer: Importer, key: string) {
  if (warmed.has(key)) return;
  warmed.add(key);
  // Swallow errors — prefetch is best-effort.
  importer().catch(() => warmed.delete(key));
}

/** Prefetch a single route by path prefix match. Call on link hover/touch. */
export function prefetchRoute(path: string) {
  // Find the longest matching registered path (handles dynamic segments).
  const match = Object.keys(ROUTES)
    .filter((p) => path === p || path.startsWith(p + "/"))
    .sort((a, b) => b.length - a.length)[0];
  if (match) run(ROUTES[match], match);
}

/** Warm a curated list of common routes during browser idle time. */
export function warmCommonRoutes() {
  if (typeof window === "undefined") return;

  // Skip on slow connections / data saver.
  const conn = (navigator as any).connection;
  if (conn?.saveData) return;
  if (conn?.effectiveType && /^(slow-2g|2g)$/.test(conn.effectiveType)) return;

  const idle: (cb: () => void) => void =
    (window as any).requestIdleCallback?.bind(window) ??
    ((cb: () => void) => setTimeout(cb, 1500));

  const queue = Object.entries(ROUTES);
  const tick = () => {
    const next = queue.shift();
    if (!next) return;
    const [key, importer] = next;
    run(importer, key);
    idle(tick);
  };
  idle(tick);
}
