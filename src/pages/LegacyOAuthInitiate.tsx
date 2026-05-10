import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { signInWithManagedGoogle } from "@/lib/auth/googleOAuth";

function getNextPath(redirectUri: string | null) {
  if (!redirectUri) return "/select-workspace";

  try {
    const url = new URL(redirectUri);
    if (url.origin !== window.location.origin) return "/select-workspace";
    return `${url.pathname || "/"}${url.search || ""}${url.hash || ""}`;
  } catch {
    return "/select-workspace";
  }
}

export default function LegacyOAuthInitiate() {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const provider = searchParams.get("provider") || "google";

    if (provider !== "google") {
      setError("This sign-in provider is not available.");
      return;
    }

    signInWithManagedGoogle({
      nextPath: getNextPath(searchParams.get("redirect_uri")),
      extraParams: {
        prompt: searchParams.get("prompt") || "select_account",
        access_type: searchParams.get("access_type") || "offline",
      },
    }).then(({ error }) => {
      if (error) setError(error.message || "Could not start Google sign-in.");
    });
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3 px-6 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Starting Google sign-in…</p>
        {error ? <p className="text-xs text-destructive max-w-sm">{error}</p> : null}
      </div>
    </div>
  );
}