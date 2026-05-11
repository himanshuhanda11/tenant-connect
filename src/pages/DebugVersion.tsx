import { useEffect, useState } from "react";

declare const __BUILD_ID__: string;
const CURRENT_BUILD_ID = typeof __BUILD_ID__ !== "undefined" ? __BUILD_ID__ : "dev";

type State = {
  latestBuildId: string | null;
  fetchedAt: string | null;
  error: string | null;
  loading: boolean;
};

function getUrlParam(name: string) {
  try {
    return new URL(window.location.href).searchParams.get(name);
  } catch {
    return null;
  }
}

export default function DebugVersion() {
  const [state, setState] = useState<State>({
    latestBuildId: null,
    fetchedAt: null,
    error: null,
    loading: true,
  });

  const fetchVersion = async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await fetch(`/version.json?t=${Date.now()}`, {
        cache: "no-store",
        credentials: "omit",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { buildId?: string };
      setState({
        latestBuildId: json.buildId ?? null,
        fetchedAt: new Date().toISOString(),
        error: null,
        loading: false,
      });
    } catch (e: unknown) {
      setState((s) => ({
        ...s,
        loading: false,
        error: e instanceof Error ? e.message : String(e),
      }));
    }
  };

  useEffect(() => {
    void fetchVersion();
  }, []);

  const urlBuild = getUrlParam("__build");
  const urlFresh = getUrlParam("__fresh");
  const storedBuild =
    typeof localStorage !== "undefined" ? localStorage.getItem("__lov_current_build_id") : null;

  const latest = state.latestBuildId;
  const isStale =
    !!latest &&
    latest !== CURRENT_BUILD_ID &&
    latest !== urlBuild &&
    latest !== urlFresh;

  const rows: Array<[string, string]> = [
    ["Current build (bundled)", CURRENT_BUILD_ID],
    ["Latest build (/version.json)", state.loading ? "loading…" : latest ?? "—"],
    ["URL __build param", urlBuild ?? "—"],
    ["URL __fresh param", urlFresh ?? "—"],
    ["localStorage build", storedBuild ?? "—"],
    ["Last fetched at", state.fetchedAt ?? "—"],
    ["Fetch error", state.error ?? "—"],
    ["Shell stale?", state.loading ? "checking…" : isStale ? "YES" : "no"],
    ["User agent", typeof navigator !== "undefined" ? navigator.userAgent : "—"],
  ];

  const forceReload = async () => {
    try {
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
    } catch {
      /* ignore */
    }
    const url = new URL(window.location.href);
    if (latest) url.searchParams.set("__build", latest);
    url.searchParams.set("__fresh", String(Date.now()));
    window.location.replace(url.toString());
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold">Build Debug</h1>
          <p className="text-sm text-muted-foreground">
            Internal page for diagnosing stale-shell / cache-bust issues.
          </p>
        </header>

        <div
          className={`rounded-lg border p-4 ${
            isStale ? "border-destructive bg-destructive/10" : "border-border bg-card"
          }`}
        >
          <div className="text-sm font-medium">
            Status:{" "}
            {state.loading
              ? "Checking…"
              : isStale
              ? "Stale shell detected"
              : "Up to date"}
          </div>
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              {rows.map(([k, v]) => (
                <tr key={k} className="border-b border-border last:border-b-0">
                  <td className="px-3 py-2 font-medium text-muted-foreground w-1/2 align-top">
                    {k}
                  </td>
                  <td className="px-3 py-2 font-mono break-all align-top">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={fetchVersion}
            className="rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:opacity-90"
          >
            Re-check /version.json
          </button>
          <button
            onClick={forceReload}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Force reload to latest
          </button>
        </div>
      </div>
    </div>
  );
}
