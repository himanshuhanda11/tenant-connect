import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

async function cleanupLegacyPwaArtifacts() {
  try {
    if (typeof window === "undefined") return;

    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }

    if ("caches" in window) {
      const cacheKeys = await window.caches.keys();
      await Promise.all(cacheKeys.map((key) => window.caches.delete(key)));
    }
  } catch (error) {
    console.warn("PWA cleanup skipped:", error);
  }
}

void cleanupLegacyPwaArtifacts();

// Recover from stale module URLs after Vite dev-server restart
window.addEventListener('vite:preloadError', () => {
  const reloaded = sessionStorage.getItem('vite_preload_reload');
  if (!reloaded) {
    sessionStorage.setItem('vite_preload_reload', '1');
    window.location.reload();
  } else {
    sessionStorage.removeItem('vite_preload_reload');
  }
});

createRoot(document.getElementById("root")!).render(<App />);
