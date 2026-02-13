import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, Pause, XCircle, RefreshCw, ArrowDownCircle } from 'lucide-react';
import { useSubscription } from '@/hooks/useBilling';
import { toast } from 'sonner';

type ActionType = 'cancel' | 'pause' | 'downgrade' | null;

export function SubscriptionActions() {
  const { data: subscription } = useSubscription();
  const [actionType, setActionType] = useState<ActionType>(null);

  const handleAction = () => {
    switch (actionType) {
      case 'cancel':
        toast.success('Subscription will be canceled at the end of the billing period');
        break;
      case 'pause':
        toast.success('Subscription paused');
        break;
      case 'downgrade':
        toast.success('Downgrade scheduled for next billing cycle');
        break;
    }
    setActionType(null);
  };

  const isCanceled = subscription?.cancel_at_period_end;
  const isPaused = (subscription?.status as string) === 'paused';

  return (
    <>
      <Card className="border-amber-200 dark:border-amber-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <AlertTriangle className="h-5 w-5" />
            Subscription Management
          </CardTitle>
          <CardDescription>
            Manage your subscription status. Changes take effect at the end of your billing period.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isCanceled && (
            <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  Subscription scheduled for cancellation
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Your subscription will end on your next billing date
                </p>
              </div>
              <Button variant="outline" onClick={() => toast.success('Subscription reactivated')}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reactivate
              </Button>
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-3">
            <Button 
              variant="outline" 
              className="h-auto py-4 flex-col gap-2"
              onClick={() => setActionType('downgrade')}
              disabled={isCanceled}
            >
              <ArrowDownCircle className="h-5 w-5" />
              <span>Downgrade Plan</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto py-4 flex-col gap-2"
              onClick={() => setActionType('pause')}
              disabled={isCanceled || isPaused}
            >
              <Pause className="h-5 w-5" />
              <span>{isPaused ? 'Paused' : 'Pause Subscription'}</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto py-4 flex-col gap-2 text-destructive hover:text-destructive"
              onClick={() => setActionType('cancel')}
              disabled={isCanceled}
            >
              <XCircle className="h-5 w-5" />
              <span>Cancel Subscription</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!actionType} onOpenChange={() => setActionType(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'cancel' && 'Cancel Subscription'}
              {actionType === 'pause' && 'Pause Subscription'}
              {actionType === 'downgrade' && 'Downgrade Plan'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'cancel' && (
                <div className="space-y-3">
                  <p>Are you sure you want to cancel your subscription?</p>
                  <div className="p-3 bg-muted rounded-lg space-y-2">
                    <p className="font-medium text-foreground">What you'll lose:</p>
                    <ul className="text-sm space-y-1">
                      <li>• Access to automation workflows</li>
                      <li>• Campaign scheduling</li>
                      <li>• Priority support</li>
                      <li>• API access</li>
                    </ul>
                  </div>
                  <p>Your subscription will remain active until the end of your current billing period.</p>
                </div>
              )}
              {actionType === 'pause' && (
                <p>
                  Pausing your subscription will temporarily stop billing. You'll retain access 
                  for the current period, but features will be limited when resumed.
                </p>
              )}
              {actionType === 'downgrade' && (
                <div className="space-y-3">
                  <p>Downgrading your plan may affect your current usage.</p>
                  <div className="p-3 bg-muted rounded-lg space-y-2">
                    <p className="font-medium text-foreground">Features that may be affected:</p>
                    <ul className="text-sm space-y-1">
                      <li>• Team member seats will be reduced</li>
                      <li>• Phone number limit may decrease</li>
                      <li>• Automation limits may apply</li>
                    </ul>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleAction}
              className={actionType === 'cancel' ? 'bg-destructive text-destructive-foreground' : ''}
            >
              {actionType === 'cancel' && 'Cancel Subscription'}
              {actionType === 'pause' && 'Pause Subscription'}
              {actionType === 'downgrade' && 'Continue to Downgrade'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
