type GoogleOAuthOptions = {
  nextPath?: string;
  extraParams?: Record<string, string>;
};

const MANAGED_OAUTH_BROKER_PATH = "/~oauth/initiate";

export function buildGoogleAuthRedirectUri(nextPath = "/select-workspace") {
  const normalizedPath = nextPath.startsWith("/") ? nextPath : `/${nextPath}`;
  const params = new URLSearchParams({ next: normalizedPath });
  return `${window.location.origin}/auth/callback?${params.toString()}`;
}

function buildManagedGoogleBrokerUrl(options: GoogleOAuthOptions = {}) {
  const { nextPath = "/select-workspace", extraParams } = options;
  const params = new URLSearchParams({
    provider: "google",
    redirect_uri: buildGoogleAuthRedirectUri(nextPath),
    ...extraParams,
  });

  return `${MANAGED_OAUTH_BROKER_PATH}?${params.toString()}`;
}

export async function signInWithManagedGoogle(options: GoogleOAuthOptions = {}) {
  window.location.assign(buildManagedGoogleBrokerUrl(options));
  return { error: null, redirected: true as const };
}
