// Runtime cache-busting: poll /version.json and reload when a new deploy ships.
declare const __BUILD_ID__: string;

const CURRENT_BUILD_ID = typeof __BUILD_ID__ !== "undefined" ? __BUILD_ID__ : "dev";
const POLL_INTERVAL_MS = 30 * 1000; // every 30 seconds
const RELOAD_GUARD_KEY = "__lov_version_reload_at";
const BUILD_STORAGE_KEY = "__lov_current_build_id";
const CURRENT_BUILD_PARAM = "__build";
const FRESH_BUILD_PARAM = "__fresh";

function currentBuildFromUrl() {
  try {
    const url = new URL(window.location.href);
    return url.searchParams.get(CURRENT_BUILD_PARAM) || url.searchParams.get(FRESH_BUILD_PARAM);
  } catch {
    return null;
  }
}

function ensureBuildScopedUrl() {
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.get(CURRENT_BUILD_PARAM) === CURRENT_BUILD_ID) return;
    url.searchParams.set(CURRENT_BUILD_PARAM, CURRENT_BUILD_ID);
    window.history.replaceState(window.history.state, "", url.toString());
  } catch {
    /* ignore */
  }
}

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

function hardNavigateToFreshBuild() {
  const url = new URL(window.location.href);
  url.searchParams.set(CURRENT_BUILD_PARAM, CURRENT_BUILD_ID);
  url.searchParams.set(FRESH_BUILD_PARAM, String(Date.now()));
  window.location.replace(url.toString());
}

let timer: ReturnType<typeof setInterval> | null = null;

async function checkVersion() {
  try {
    const res = await fetch(`/version.json?t=${Date.now()}`, {
      cache: "no-store",
      credentials: "omit",
    });
    if (!res.ok) return;
    const { buildId } = (await res.json()) as { buildId?: string };
    if (!buildId || buildId === CURRENT_BUILD_ID) return;
    if (buildId === currentBuildFromUrl()) return;

    // Avoid reload loops
    const last = Number(sessionStorage.getItem(RELOAD_GUARD_KEY) || "0");
    if (Date.now() - last < 30_000) return;
    sessionStorage.setItem(RELOAD_GUARD_KEY, String(Date.now()));

    // Drop any lingering caches before reloading
    await wipeBrowserCaches();
    hardNavigateToFreshBuild();
  } catch {
    /* network blip — try again next tick */
  }
}

async function clearCachesAfterFreshBuild() {
  let needsFreshNavigation = false;

  try {
    const previousBuildId = localStorage.getItem(BUILD_STORAGE_KEY);
    if (previousBuildId === CURRENT_BUILD_ID) return;
    localStorage.setItem(BUILD_STORAGE_KEY, CURRENT_BUILD_ID);
    needsFreshNavigation = Boolean(previousBuildId);
  } catch {
    /* localStorage may be unavailable */
  }

  await wipeBrowserCaches();

  if (needsFreshNavigation) hardNavigateToFreshBuild();
}

export function startVersionPolling() {
  // Only run in production builds (dev has its own HMR).
  if (CURRENT_BUILD_ID === "dev") return;
  if (timer) return;

  ensureBuildScopedUrl();

  void clearCachesAfterFreshBuild();

  // Run an immediate check, then on an interval and on tab focus.
  void checkVersion();
  timer = setInterval(checkVersion, POLL_INTERVAL_MS);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") checkVersion();
  });
  window.addEventListener("focus", checkVersion);
}
