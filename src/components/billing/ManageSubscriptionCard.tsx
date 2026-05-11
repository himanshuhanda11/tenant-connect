import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, ExternalLink, AlertTriangle, Receipt, ShieldCheck, FileText, Loader2 } from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';
import { useWorkspaceBilling, useOpenBillingPortal } from '@/hooks/useWorkspaceBilling';

/**
 * Premium "Manage Subscription" card that opens the Stripe Customer Portal.
 * - Hidden for Free / no-Stripe-customer workspaces
 * - Visible for paid trial, active paid, past_due, unpaid
 * - Re-labels to "Update Payment Method" on payment failure
 */
export function ManageSubscriptionCard() {
  const { currentTenant } = useTenant();
  const { data: billing } = useWorkspaceBilling();
  const openPortal = useOpenBillingPortal();

  // Gate: only show when there is actually a Stripe customer to manage
  const canManage = !!billing?.has_subscription && !!billing?.stripe_customer_id;
  if (!canManage) return null;

  const paymentIssue =
    billing?.status === 'past_due' ||
    billing?.status === 'unpaid' ||
    billing?.last_payment_status === 'failed';

  const label = paymentIssue ? 'Update Payment Method' : 'Manage Subscription';
  const description = paymentIssue
    ? 'Your last payment failed. Update your card to keep your subscription active.'
    : 'Update card, download invoices, change billing details, or cancel — all in your secure Stripe portal.';

  const handleClick = () => {
    if (!currentTenant?.id) return;
    openPortal.mutate(currentTenant.id);
  };

  return (
    <Card
      className={[
        'overflow-hidden border-0 shadow-md',
        paymentIssue
          ? 'bg-gradient-to-br from-destructive/10 via-destructive/5 to-background ring-1 ring-destructive/30'
          : 'bg-gradient-to-br from-primary/10 via-primary/5 to-background ring-1 ring-primary/20',
      ].join(' ')}
    >
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div
              className={[
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm',
                paymentIssue
                  ? 'bg-destructive/15 text-destructive'
                  : 'bg-primary/15 text-primary',
              ].join(' ')}
            >
              {paymentIssue ? (
                <AlertTriangle className="h-5 w-5" />
              ) : (
                <CreditCard className="h-5 w-5" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-semibold tracking-tight">
                {paymentIssue ? 'Action required' : 'Subscription & Billing'}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" /> Secure Stripe portal
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Receipt className="h-3.5 w-3.5" /> Invoices & receipts
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" /> Update billing details
                </span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleClick}
            disabled={openPortal.isPending || !currentTenant?.id}
            size="lg"
            variant={paymentIssue ? 'destructive' : 'default'}
            className="w-full sm:w-auto gap-2 shadow-sm"
          >
            {openPortal.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Opening…
              </>
            ) : (
              <>
                {label} <ExternalLink className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default ManageSubscriptionCard;
