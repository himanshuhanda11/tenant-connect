type GoogleOAuthOptions = {
  nextPath?: string;
  extraParams?: Record<string, string>;
};

import { lovable } from "@/integrations/lovable";

export function buildGoogleAuthRedirectUri(nextPath = "/select-workspace") {
  const normalizedPath = nextPath.startsWith("/") ? nextPath : `/${nextPath}`;
  const params = new URLSearchParams({ next: normalizedPath });
  return `${window.location.origin}/auth/callback?${params.toString()}`;
}

export async function signInWithManagedGoogle(options: GoogleOAuthOptions = {}) {
  const { nextPath = "/select-workspace", extraParams } = options;

  const result = await lovable.auth.signInWithOAuth("google", {
    redirect_uri: buildGoogleAuthRedirectUri(nextPath),
    extraParams,
  });

  return {
    error: result.error ?? null,
    redirected: Boolean(result.redirected) as boolean,
  };
}
