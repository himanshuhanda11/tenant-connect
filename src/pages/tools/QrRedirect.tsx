import { useEffect } from "react";
import { useParams } from "react-router-dom";

export default function QrRedirect() {
  const { slug } = useParams<{ slug: string }>();

  useEffect(() => {
    if (!slug) return;
    const base = import.meta.env.VITE_SUPABASE_URL;
    // Hand off to edge function which tracks the scan and 302s to wa.me
    window.location.replace(`${base}/functions/v1/qr-redirect/${slug}`);
  }, [slug]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-3">
        <div className="h-10 w-10 mx-auto rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-sm text-muted-foreground">Opening WhatsApp…</p>
      </div>
    </div>
  );
}
