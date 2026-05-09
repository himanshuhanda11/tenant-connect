import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { startVersionPolling } from "./lib/versionCheck";

startVersionPolling();

const CHUNK_ERROR_PATTERNS = [
  "Failed to fetch dynamically imported module",
  "Importing a module script failed",
  "Loading chunk",
  "Loading CSS chunk",
];

const RELOAD_KEY = "__lov_chunk_reload_at";

const isChunkError = (msg: string) =>
  CHUNK_ERROR_PATTERNS.some((p) => msg.includes(p));

const maybeReload = (msg: string) => {
  if (!isChunkError(msg)) return;
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) || "0");
    if (Date.now() - last < 10_000) return; // avoid reload loops
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
    window.location.reload();
  } catch {
    window.location.reload();
  }
};

window.addEventListener("error", (e) => {
  maybeReload(e?.message || String(e?.error || ""));
});
window.addEventListener("unhandledrejection", (e) => {
  const reason: any = e?.reason;
  maybeReload(reason?.message || String(reason || ""));
});

createRoot(document.getElementById("root")!).render(<App />);
