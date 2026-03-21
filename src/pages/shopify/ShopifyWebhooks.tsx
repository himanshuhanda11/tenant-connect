import React from 'react';
import { useParams } from 'react-router-dom';
import {
  Webhook, RotateCcw, CheckCircle2, XCircle, Clock, AlertTriangle, Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShopifyPageShell, ShopifyEmptyState, ShopifyStatCard } from '@/components/shopify/ShopifyPageShell';
import { useShopifyWebhooks } from '@/hooks/useShopifyWebhooks';
import { useToast } from '@/hooks/use-toast';
import type { ShopifyWebhookEvent } from '@/types/shopify';
import { formatDistanceToNow } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const STATUS_MAP: Record<string, { icon: React.ElementType; color: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  received: { icon: Clock, color: 'text-blue-500', variant: 'secondary' },
  processing: { icon: Clock, color: 'text-amber-500', variant: 'secondary' },
  processed: { icon: CheckCircle2, color: 'text-green-500', variant: 'outline' },
  failed: { icon: XCircle, color: 'text-red-500', variant: 'destructive' },
  ignored: { icon: AlertTriangle, color: 'text-muted-foreground', variant: 'outline' },
};

function WebhookEventRow({ event, onRetry }: { event: ShopifyWebhookEvent; onRetry: (id: string) => void }) {
  const config = STATUS_MAP[event.processing_status] || STATUS_MAP.received;
  const StatusIcon = config.icon;

  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        <StatusIcon className={`h-4 w-4 shrink-0 ${config.color}`} />
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{event.topic}</p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(event.received_at), { addSuffix: true })}
            {event.signature_valid ? ' · ✓ verified' : ' · ✗ unverified'}
          </p>
          {event.error_message && (
            <p className="text-xs text-destructive mt-0.5 truncate">{event.error_message}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Badge variant={config.variant} className="capitalize text-xs">{event.processing_status}</Badge>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm"><Eye className="h-3.5 w-3.5" /></Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
            <DialogHeader><DialogTitle>{event.topic} — Payload</DialogTitle></DialogHeader>
            <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto">{JSON.stringify(event.payload, null, 2)}</pre>
          </DialogContent>
        </Dialog>
        {event.processing_status === 'failed' && (
          <Button variant="ghost" size="sm" onClick={() => onRetry(event.id)}>
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}

export default function ShopifyWebhooks() {
  const { storeId } = useParams<{ storeId: string }>();
  const { toast } = useToast();
  const { events, isLoading, retryWebhook } = useShopifyWebhooks(storeId);

  const handleRetry = async (eventId: string) => {
    try {
      await retryWebhook(eventId);
      toast({ title: 'Webhook Retry Queued' });
    } catch (err: any) {
      toast({ title: 'Retry Failed', description: err.message, variant: 'destructive' });
    }
  };

  const stats = {
    total: events.length,
    processed: events.filter(e => e.processing_status === 'processed').length,
    failed: events.filter(e => e.processing_status === 'failed').length,
    unverified: events.filter(e => !e.signature_valid).length,
  };

  return (
    <ShopifyPageShell
      title="Webhook Events"
      subtitle="Monitor incoming Shopify webhook deliveries"
      icon={Webhook}
      backTo={`/app/integrations/shopify/${storeId}`}
      backLabel="Back to Store"
      isLoading={isLoading}
      maxWidth="md"
    >
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <ShopifyStatCard label="Total" value={stats.total} />
        <ShopifyStatCard label="Processed" value={stats.processed} icon={CheckCircle2} iconColor="text-green-500" valueColor="text-green-600" />
        <ShopifyStatCard label="Failed" value={stats.failed} icon={XCircle} iconColor="text-red-500" valueColor="text-destructive" />
        <ShopifyStatCard label="Unverified" value={stats.unverified} icon={AlertTriangle} iconColor="text-amber-500" valueColor="text-amber-600" />
      </div>

      {/* Events */}
      <Card>
        <CardHeader><CardTitle className="text-base">Recent Events</CardTitle></CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <ShopifyEmptyState icon={Webhook} title="No webhook events yet" description="Events will appear here once Shopify sends data." />
          ) : (
            <div>{events.map(event => <WebhookEventRow key={event.id} event={event} onRetry={handleRetry} />)}</div>
          )}
        </CardContent>
      </Card>
    </ShopifyPageShell>
  );
}
