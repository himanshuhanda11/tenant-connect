import { supabase } from "@/integrations/supabase/client";

type GoogleOAuthOptions = {
  nextPath?: string;
  extraParams?: Record<string, string>;
};

/**
 * Build the post-OAuth redirect URI on the current origin.
 * Works on any host (Vercel, Lovable, custom domain) because it does not
 * rely on the Lovable managed OAuth broker (`/~oauth/initiate`).
 */
export function buildGoogleAuthRedirectUri(nextPath = "/select-workspace") {
  const normalizedPath = nextPath.startsWith("/") ? nextPath : `/${nextPath}`;
  const params = new URLSearchParams({ next: normalizedPath });
  return `${window.location.origin}/auth/callback?${params.toString()}`;
}

/**
 * Sign in with Google directly via Supabase Auth (PKCE flow).
 * The Google client ID/secret must be configured in
 * Cloud → Users → Auth Settings → Google.
 *
 * Make sure `https://<your-domain>/auth/callback` (and the Supabase callback
 * `https://<project-ref>.supabase.co/auth/v1/callback`) are listed in the
 * Google OAuth client's authorized redirect URIs, and that the URI allow list
 * in Cloud → Auth → URL Configuration includes:
 *   https://www.aireatro.com/**
 *   https://aireatro.com/**
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

  // supabase-js will redirect the browser itself, but in case it doesn't
  // (e.g. popup blocked / iframe), force-navigate to the returned URL.
  if (data?.url && typeof window !== "undefined") {
    try {
      window.location.assign(data.url);
    } catch {
      window.location.href = data.url;
    }
  }

  return { error: null, redirected: true } as const;
}
