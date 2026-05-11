import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { startVersionPolling, forceVersionCheck } from "./lib/versionCheck";
import "./lib/installPlanErrorInterceptor";

startVersionPolling();

const CHUNK_ERROR_PATTERNS = [
  "Failed to fetch dynamically imported module",
  "Importing a module script failed",
  "Loading chunk",
  "Loading CSS chunk",
  "error loading dynamically imported module",
  "ChunkLoadError",
];

const RELOAD_COUNT_KEY = "__lov_chunk_reload_count";
const RELOAD_AT_KEY = "__lov_chunk_reload_at";
const MAX_RELOADS = 3;
const MIN_INTERVAL_MS = 1500; // tiny guard against tight loops only

const isChunkError = (msg: string) =>
  CHUNK_ERROR_PATTERNS.some((p) => msg.toLowerCase().includes(p.toLowerCase()));

let reloading = false;

const triggerRecovery = async (msg: string) => {
  if (reloading) return;
  if (!isChunkError(msg)) return;
  reloading = true;

  try {
    const last = Number(sessionStorage.getItem(RELOAD_AT_KEY) || "0");
    const count = Number(sessionStorage.getItem(RELOAD_COUNT_KEY) || "0");

    // Only stop if we are clearly looping (≥ MAX within a short window)
    if (Date.now() - last < MIN_INTERVAL_MS) {
      reloading = false;
      return;
    }
    if (count >= MAX_RELOADS) {
      console.warn("[chunk-recovery] giving up after", count, "attempts");
      reloading = false;
      return;
    }

    sessionStorage.setItem(RELOAD_AT_KEY, String(Date.now()));
    sessionStorage.setItem(RELOAD_COUNT_KEY, String(count + 1));
  } catch {
    /* ignore */
  }

  // Force a fresh asset URL: bust both cached HTML and JS chunks via a query param.
  try {
    await forceVersionCheck();
  } catch {
    /* ignore — fall through to hard reload */
  }

  try {
    const url = new URL(window.location.href);
    url.searchParams.set("__r", String(Date.now()));
    window.location.replace(url.toString());
  } catch {
    window.location.reload();
  }
};

// Reset the reload counter once the app boots successfully.
window.addEventListener("load", () => {
  setTimeout(() => {
    try { sessionStorage.removeItem(RELOAD_COUNT_KEY); } catch { /* ignore */ }
  }, 8000);
});

window.addEventListener("error", (e) => {
  void triggerRecovery(e?.message || String(e?.error || ""));
});
window.addEventListener("unhandledrejection", (e) => {
  const reason: any = e?.reason;
  void triggerRecovery(reason?.message || String(reason || ""));
});

createRoot(document.getElementById("root")!).render(<App />);
