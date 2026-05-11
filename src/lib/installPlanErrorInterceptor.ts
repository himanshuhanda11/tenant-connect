// Globally intercepts plan-trigger errors by monkey-patching sonner's toast.error.
// When a Postgres "plan_access_denied:..." string flows into a toast, we open the
// upgrade modal instead of showing the raw error.
import { toast } from "sonner";
import { reportPlanError } from "./planErrorBus";

const original = toast.error.bind(toast);

(toast as any).error = (message: any, opts?: any) => {
  const text = typeof message === "string" ? message : message?.message || "";
  if (text && reportPlanError({ message: text })) {
    return; // suppress raw toast — modal is shown instead
  }
  return original(message, opts);
};

export {};
