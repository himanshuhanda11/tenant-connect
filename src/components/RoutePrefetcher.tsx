import { useEffect } from "react";
import { prefetchRoute, warmCommonRoutes } from "@/lib/routePrefetch";

/**
 * Mount once near the app root. Warms common routes on idle and
 * prefetches any internal link the user hovers/touches before clicking.
 */
export default function RoutePrefetcher() {
  useEffect(() => {
    warmCommonRoutes();

    const getInternalPath = (target: EventTarget | null): string | null => {
      const el = (target as HTMLElement | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!el) return null;
      const href = el.getAttribute("href");
      if (!href || !href.startsWith("/") || href.startsWith("//")) return null;
      // Strip query/hash
      return href.split("?")[0].split("#")[0];
    };

    const onPointer = (e: Event) => {
      const path = getInternalPath(e.target);
      if (path) prefetchRoute(path);
    };

    window.addEventListener("pointerenter", onPointer, { capture: true, passive: true });
    window.addEventListener("touchstart", onPointer, { capture: true, passive: true });
    window.addEventListener("focusin", onPointer, { capture: true });

    return () => {
      window.removeEventListener("pointerenter", onPointer, { capture: true } as any);
      window.removeEventListener("touchstart", onPointer, { capture: true } as any);
      window.removeEventListener("focusin", onPointer, { capture: true } as any);
    };
  }, []);

  return null;
}
