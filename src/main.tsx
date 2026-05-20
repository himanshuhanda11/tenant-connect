import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { startVersionPolling } from "./lib/versionCheck";
import { isChunkLoadError, recoverFromChunkLoadError, resetChunkRecoveryState } from "./lib/chunkRecovery";
import "./lib/installPlanErrorInterceptor";

if (window.location.hostname === "www.aireatro.com") {
  const canonicalUrl = new URL(window.location.href);
  canonicalUrl.hostname = "aireatro.com";
  canonicalUrl.protocol = "https:";
  window.location.replace(canonicalUrl.toString());
}

startVersionPolling();

// Reset the reload counter once the app boots successfully.
window.addEventListener("load", () => {
  setTimeout(() => {
    resetChunkRecoveryState();
  }, 8000);
});

window.addEventListener("vite:preloadError", (event) => {
  const preloadError = (event as Event & { payload?: unknown }).payload;
  if (isChunkLoadError(preloadError)) {
    event.preventDefault();
    void recoverFromChunkLoadError(preloadError, "vite:preloadError");
  }
});

window.addEventListener("error", (e) => {
  void recoverFromChunkLoadError(e?.error || e?.message || "", "window:error");
});
window.addEventListener("unhandledrejection", (e) => {
  void recoverFromChunkLoadError(e?.reason, "unhandledrejection");
});

// Remove the initial HTML loader once React is about to mount
const removeInitialLoader = () => {
  const loader = document.getElementById("initial-loader");
  if (!loader) return;
  loader.style.opacity = "0";
  loader.style.visibility = "hidden";
  setTimeout(() => loader.remove(), 500);
};

// Try immediately and also on load
try { removeInitialLoader(); } catch { /* ignore */ }
window.addEventListener("load", removeInitialLoader);

createRoot(document.getElementById("root")!).render(<App />);
