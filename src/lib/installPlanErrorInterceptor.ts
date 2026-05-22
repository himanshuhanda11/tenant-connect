// Globally intercepts plan-trigger errors by monkey-patching sonner's toast.error.
// When a Postgres "plan_access_denied:..." string flows into a toast, we open the
// upgrade modal instead of showing the raw error.
import { reportPlanError } from "./planErrorBus";

// Defer sonner import + patch to next microtask so module evaluation never
// races with the dynamically-imported <Toaster /> chunk on first paint.
void (async () => {
  try {
    const sonner = await import("sonner");
    const toast: any = (sonner as any).toast;
    if (!toast || typeof toast.error !== "function") return;
    const original = toast.error.bind(toast);
    toast.error = (message: any, opts?: any) => {
      const text = typeof message === "string" ? message : message?.message || "";
      if (text && reportPlanError({ message: text })) return;
      return original(message, opts);
    };
  } catch {
    // best-effort — never block app boot
  }
})();

export {};
