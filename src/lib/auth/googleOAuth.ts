import { lovable } from "@/integrations/lovable";

type GoogleOAuthOptions = {
  nextPath?: string;
  extraParams?: Record<string, string>;
};

/**
 * Sign in with Google via the Lovable managed OAuth broker (`/~oauth/initiate`).
 *
 * Using the managed broker (instead of supabase.auth.signInWithOAuth directly)
 * makes Google's consent screen show your app's domain (e.g. aireatro.com)
 * instead of the Supabase project callback host.
 *
 * Per project rule: Lovable managed Google auth strictly uses ~oauth/initiate.
 */
export async function signInWithManagedGoogle(options: GoogleOAuthOptions = {}) {
  const { nextPath = "/select-workspace", extraParams } = options;

  // The broker returns the user back to redirect_uri after completing OAuth.
  // We send them to the app origin + nextPath so AuthCallback / route guards
  // can take over from there.
  const normalizedPath = nextPath.startsWith("/") ? nextPath : `/${nextPath}`;
  const redirect_uri =
    typeof window !== "undefined"
      ? `${window.location.origin}${normalizedPath}`
      : normalizedPath;

  const result = await lovable.auth.signInWithOAuth("google", {
    redirect_uri,
    extraParams: {
      prompt: "select_account",
      ...extraParams,
    },
  });

  if (result.error) {
    return { error: result.error as Error, redirected: false } as const;
  }

  return { error: null, redirected: !!result.redirected } as const;
}
