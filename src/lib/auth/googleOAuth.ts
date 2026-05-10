import { supabase } from "@/integrations/supabase/client";

type GoogleOAuthOptions = {
  nextPath?: string;
  extraParams?: Record<string, string>;
};

const PRODUCTION_ORIGIN = "https://www.aireatro.com";

function getAuthOrigin() {
  if (typeof window === "undefined") return PRODUCTION_ORIGIN;

  const { hostname, origin } = window.location;
  if (hostname === "aireatro.com" || hostname === "www.aireatro.com") {
    return PRODUCTION_ORIGIN;
  }

  return origin;
}

/**
 * Build the post-OAuth redirect URI on the current origin.
 *
 * NOTE: This project is hosted on Vercel, not Lovable. The Lovable managed
 * OAuth broker (`/~oauth/initiate`) only works on `*.lovable.app` domains
 * and Lovable-managed custom domains, so we MUST go through Supabase's
 * `signInWithOAuth` directly here.
 */
export function buildGoogleAuthRedirectUri(nextPath = "/select-workspace") {
  const normalizedPath = nextPath.startsWith("/") ? nextPath : `/${nextPath}`;
  const params = new URLSearchParams({ next: normalizedPath });
  return `${getAuthOrigin()}/auth/callback?${params.toString()}`;
}

/**
 * Sign in with Google directly via Supabase Auth (PKCE flow).
 *
 * Required Google OAuth client config (Google Cloud Console):
 *   Authorized JavaScript origins:
 *     https://www.aireatro.com
 *     https://aireatro.com
 *   Authorized redirect URIs:
 *     https://fygwjpdasnhaomoqdvcu.supabase.co/auth/v1/callback
 *     https://www.aireatro.com/auth/callback
 *     https://aireatro.com/auth/callback
 *
 * Required Supabase Auth → URL Configuration:
 *   Site URL:      https://www.aireatro.com
 *   Redirect URLs: https://www.aireatro.com/**, https://aireatro.com/**
 */
export async function signInWithManagedGoogle(options: GoogleOAuthOptions = {}) {
  const { nextPath = "/select-workspace", extraParams } = options;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: buildGoogleAuthRedirectUri(nextPath),
      queryParams: {
        prompt: "select_account",
        ...extraParams,
      },
    },
  });

  if (error) {
    return { error, redirected: false } as const;
  }

  // supabase-js usually redirects itself; force-navigate as a fallback
  // in case popup-blocking or iframe context prevents auto-redirect.
  if (data?.url && typeof window !== "undefined") {
    try {
      window.location.assign(data.url);
    } catch {
      window.location.href = data.url;
    }
  }

  return { error: null, redirected: true } as const;
}
