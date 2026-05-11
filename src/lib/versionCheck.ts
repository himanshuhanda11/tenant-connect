// Runtime cache-busting: poll /version.json and reload when a new deploy ships.
declare const __BUILD_ID__: string;

const CURRENT_BUILD_ID = typeof __BUILD_ID__ !== "undefined" ? __BUILD_ID__ : "dev";
const POLL_INTERVAL_MS = 2 * 60 * 1000; // every 2 minutes
const RELOAD_GUARD_KEY = "__lov_version_reload_at";
const BUILD_STORAGE_KEY = "__lov_current_build_id";

async function wipeBrowserCaches() {
  try {
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }
  } catch {
    /* ignore */
  }

  try {
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
  } catch {
    /* ignore */
  }
}

let timer: ReturnType<typeof setInterval> | null = null;

async function checkVersion(opts: { force?: boolean } = {}) {
  try {
    const res = await fetch(`/version.json?t=${Date.now()}`, {
      cache: "no-store",
      credentials: "omit",
    });
    if (!res.ok) {
      if (opts.force) await wipeBrowserCaches();
      return;
    }
    const { buildId } = (await res.json()) as { buildId?: string };
    const isNew = !!buildId && buildId !== CURRENT_BUILD_ID;
    if (!isNew && !opts.force) return;

    if (!opts.force) {
      // Avoid reload loops for the background poller
      const last = Number(sessionStorage.getItem(RELOAD_GUARD_KEY) || "0");
      if (Date.now() - last < 30_000) return;
      sessionStorage.setItem(RELOAD_GUARD_KEY, String(Date.now()));
    }

    // Drop any lingering caches before reloading
    await wipeBrowserCaches();
    if (!opts.force) window.location.reload();
  } catch {
    if (opts.force) {
      try { await wipeBrowserCaches(); } catch { /* ignore */ }
    }
  }
}

/**
 * Force-clear caches and check the latest deployed build.
 * Used by the chunk-error recovery path in main.tsx — caller handles reload.
 */
export async function forceVersionCheck() {
  await checkVersion({ force: true });
}

async function clearCachesAfterFreshBuild() {
  try {
    const previousBuildId = localStorage.getItem(BUILD_STORAGE_KEY);
    if (previousBuildId === CURRENT_BUILD_ID) return;
    localStorage.setItem(BUILD_STORAGE_KEY, CURRENT_BUILD_ID);
  } catch {
    /* localStorage may be unavailable */
  }

  await wipeBrowserCaches();
}

export function startVersionPolling() {
  // Only run in production builds (dev has its own HMR).
  if (CURRENT_BUILD_ID === "dev") return;
  if (timer) return;

  void clearCachesAfterFreshBuild();

  // Initial check shortly after load, then on an interval and on tab focus.
  setTimeout(() => { void checkVersion(); }, 5_000);
  timer = setInterval(() => { void checkVersion(); }, POLL_INTERVAL_MS);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") void checkVersion();
  });
  window.addEventListener("focus", () => { void checkVersion(); });
}
