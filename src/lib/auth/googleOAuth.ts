type GoogleOAuthOptions = {
  nextPath?: string;
  extraParams?: Record<string, string>;
};

import { lovable } from "@/integrations/lovable";

const MANAGED_OAUTH_PATH = "/~oauth/initiate";
const PRIMARY_CUSTOM_ORIGIN = "https://aireatro.com";

function createOAuthState() {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    return Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((value) => value.toString(16).padStart(2, "0"))
      .join("");
  }

  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
}

function getOAuthBrokerOrigin() {
  // www is served by the static host and does not proxy /~oauth, causing a client 404.
  // The apex domain is Lovable-managed and correctly forwards the OAuth broker route.
  return window.location.hostname === "www.aireatro.com" ? PRIMARY_CUSTOM_ORIGIN : window.location.origin;
}

export function buildGoogleAuthRedirectUri(nextPath = "/select-workspace") {
  const normalizedPath = nextPath.startsWith("/") ? nextPath : `/${nextPath}`;
  const params = new URLSearchParams({ next: normalizedPath });
  return `${window.location.origin}/auth/callback?${params.toString()}`;
}

export async function signInWithManagedGoogle(options: GoogleOAuthOptions = {}) {
  const { nextPath = "/select-workspace", extraParams } = options;

  if (window.location.hostname === "www.aireatro.com") {
    const params = new URLSearchParams({
      ...extraParams,
      provider: "google",
      redirect_uri: buildGoogleAuthRedirectUri(nextPath),
      state: createOAuthState(),
    });

    window.location.assign(`${getOAuthBrokerOrigin()}${MANAGED_OAUTH_PATH}?${params.toString()}`);
    return { error: null, redirected: true };
  }

  const result = await lovable.auth.signInWithOAuth("google", {
    redirect_uri: buildGoogleAuthRedirectUri(nextPath),
    extraParams,
  });

  return {
    error: result.error ?? null,
    redirected: Boolean(result.redirected) as boolean,
  };
}
