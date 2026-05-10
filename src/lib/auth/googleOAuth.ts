import { lovable } from "@/integrations/lovable";

type GoogleOAuthOptions = {
  nextPath?: string;
  extraParams?: Record<string, string>;
};

const LOG = "[GoogleOAuth]";

function persistLog(stage: string, data: Record<string, unknown>) {
  try {
    const entry = { t: new Date().toISOString(), stage, ...data };
    const prev = JSON.parse(sessionStorage.getItem("oauth_debug_log") || "[]");
    prev.push(entry);
    sessionStorage.setItem("oauth_debug_log", JSON.stringify(prev.slice(-50)));
  } catch {}
}

export async function signInWithManagedGoogle(options: GoogleOAuthOptions = {}) {
  const { extraParams } = options;

  const origin = window.location.origin;
  const href = window.location.href;
  console.info(`${LOG} initiate`, { origin, href, extraParams });
  persistLog("initiate", { origin, href, extraParams: extraParams ?? null });

  try {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: origin,
      extraParams: {
        prompt: "select_account",
        ...extraParams,
      },
    });

    console.info(`${LOG} signInWithOAuth result`, {
      error: result.error ?? null,
      redirected: result.redirected ?? false,
    });
    persistLog("result", {
      error: result.error ? String(result.error) : null,
      redirected: result.redirected ?? false,
    });

    if (result.redirected) {
      console.info(`${LOG} browser is redirecting now → expect to land on /~oauth/initiate then Google then /~oauth/callback`);
      persistLog("redirecting", { nextHref: window.location.href });
    }

    return {
      error: result.error ?? null,
      redirected: result.redirected ?? false,
    } as const;
  } catch (err) {
    console.error(`${LOG} signInWithOAuth threw`, err);
    persistLog("threw", { error: err instanceof Error ? err.message : String(err) });
    throw err;
  }
}
