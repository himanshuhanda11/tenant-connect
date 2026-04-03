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

createRoot(document.getElementById("root")!).render(<App />);
