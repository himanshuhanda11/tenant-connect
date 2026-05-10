import { lovable } from "@/integrations/lovable";

type GoogleOAuthOptions = {
  nextPath?: string;
  extraParams?: Record<string, string>;
};

export async function signInWithManagedGoogle(options: GoogleOAuthOptions = {}) {
  const { extraParams } = options;

  const result = await lovable.auth.signInWithOAuth("google", {
    redirect_uri: window.location.origin,
    extraParams: {
      prompt: "select_account",
      ...extraParams,
    },
  });

  return {
    error: result.error ?? null,
    redirected: result.redirected ?? false,
  } as const;
}
