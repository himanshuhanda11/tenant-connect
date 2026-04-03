import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Unregister all existing service workers to prevent stale cache issues
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((r) => r.unregister());
  });
  // Clear all caches
  caches.keys().then((names) => {
    names.forEach((name) => caches.delete(name));
  });
}

createRoot(document.getElementById("root")!).render(<App />);
