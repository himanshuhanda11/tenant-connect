type GoogleOAuthOptions = {
  nextPath?: string;
  extraParams?: Record<string, string>;
};

import { lovable } from "@/integrations/lovable";

const MANAGED_OAUTH_PATH = "/~oauth/initiate";
const PRIMARY_CUSTOM_ORIGIN = "https://www.aireatro.com";

function createOAuthState() {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    return Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((value) => value.toString(16).padStart(2, "0"))
      .join("");
  }

  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
}

function getOAuthBrokerOrigin() {
  // Use the configured primary domain as the OAuth broker so every Aireatro domain
  // goes through one stable managed OAuth entry point.
  const hostname = window.location.hostname;
  return hostname === "aireatro.com" || hostname.endsWith(".aireatro.com")
    ? PRIMARY_CUSTOM_ORIGIN
    : window.location.origin;
}

function redirectToOAuth(url: string) {
  try {
    if (window.top && window.top !== window.self) {
      window.open(url, "_top");
      return;
    }
  } catch {
    // Fall back to navigating the current frame if the parent frame is protected.
  }

  window.location.assign(url);
}

export function buildGoogleAuthRedirectUri(nextPath = "/select-workspace") {
  const normalizedPath = nextPath.startsWith("/") ? nextPath : `/${nextPath}`;
  const params = new URLSearchParams({ next: normalizedPath });
  return `${window.location.origin}/auth/callback?${params.toString()}`;
}

export async function signInWithManagedGoogle(options: GoogleOAuthOptions = {}) {
  const { nextPath = "/select-workspace", extraParams } = options;

  if (window.location.hostname === "aireatro.com" || window.location.hostname.endsWith(".aireatro.com")) {
    const params = new URLSearchParams({
      ...extraParams,
      provider: "google",
      redirect_uri: buildGoogleAuthRedirectUri(nextPath),
      state: createOAuthState(),
    });

    redirectToOAuth(`${getOAuthBrokerOrigin()}${MANAGED_OAUTH_PATH}?${params.toString()}`);
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
