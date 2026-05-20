import { forceVersionCheck } from "./versionCheck";

const CHUNK_ERROR_PATTERNS = [
  "Failed to fetch dynamically imported module",
  "Importing a module script failed",
  "error loading dynamically imported module",
  "Loading chunk",
  "Loading CSS chunk",
  "ChunkLoadError",
];

const RELOAD_COUNT_KEY = "__lov_chunk_reload_count";
const RELOAD_AT_KEY = "__lov_chunk_reload_at";
const MAX_RELOADS = 3;
const MIN_INTERVAL_MS = 1500;

let reloading = false;

export const getChunkErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message?: unknown }).message ?? "");
  }
  return String(error ?? "");
};

export const isChunkLoadError = (error: unknown) => {
  const message = getChunkErrorMessage(error).toLowerCase();
  return CHUNK_ERROR_PATTERNS.some((pattern) => message.includes(pattern.toLowerCase()));
};

export async function recoverFromChunkLoadError(error: unknown, source = "chunk-load") {
  if (typeof window === "undefined") return false;
  if (reloading || !isChunkLoadError(error)) return false;
  reloading = true;

  try {
    const last = Number(sessionStorage.getItem(RELOAD_AT_KEY) || "0");
    const count = Number(sessionStorage.getItem(RELOAD_COUNT_KEY) || "0");

    if (Date.now() - last < MIN_INTERVAL_MS) {
      reloading = false;
      return true;
    }

    if (count >= MAX_RELOADS) {
      console.warn("[chunk-recovery] giving up after", count, "attempts", { source });
      reloading = false;
      return false;
    }

    sessionStorage.setItem(RELOAD_AT_KEY, String(Date.now()));
    sessionStorage.setItem(RELOAD_COUNT_KEY, String(count + 1));
  } catch {
    /* ignore storage failures */
  }

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

  return true;
}

export function resetChunkRecoveryState() {
  try {
    sessionStorage.removeItem(RELOAD_COUNT_KEY);
  } catch {
    /* ignore */
  }
}