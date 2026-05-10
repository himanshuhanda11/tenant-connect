import { AlertTriangle, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOpenBillingPortal } from '@/hooks/useWorkspaceBilling';

export function PaymentFailedBanner({
  workspaceId,
  message,
}: {
  workspaceId: string;
  message?: string;
}) {
  const portal = useOpenBillingPortal();
  return (
    <div className="rounded-2xl border border-red-200 dark:border-red-500/30 bg-red-50/80 dark:bg-red-500/10 backdrop-blur p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
      <div className="flex items-start gap-3 flex-1">
        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-300" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-red-900 dark:text-red-200 text-sm sm:text-base">
            Payment failed for this workspace
          </p>
          <p className="text-xs sm:text-sm text-red-800/80 dark:text-red-200/80 mt-0.5">
            {message ?? 'Your last payment did not go through. Update your payment method to keep paid features active.'}
          </p>
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        <Button
          size="sm"
          className="bg-red-600 hover:bg-red-700 text-white border-0 gap-1.5"
          onClick={() => portal.mutate(workspaceId)}
          disabled={portal.isPending}
        >
          {portal.isPending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ExternalLink className="w-3.5 h-3.5" />}
          Update Payment Method
        </Button>
      </div>
    </div>
  );
}
