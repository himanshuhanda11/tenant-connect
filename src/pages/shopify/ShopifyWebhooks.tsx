import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Webhook,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useShopifyWebhooks } from '@/hooks/useShopifyWebhooks';
import { useToast } from '@/hooks/use-toast';
import type { ShopifyWebhookEvent } from '@/types/shopify';
import { formatDistanceToNow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const STATUS_MAP: Record<string, { icon: React.ElementType; color: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  received: { icon: Clock, color: 'text-blue-500', variant: 'secondary' },
  processing: { icon: Clock, color: 'text-amber-500', variant: 'secondary' },
  processed: { icon: CheckCircle2, color: 'text-green-500', variant: 'outline' },
  failed: { icon: XCircle, color: 'text-red-500', variant: 'destructive' },
  ignored: { icon: AlertTriangle, color: 'text-gray-400', variant: 'outline' },
};

function WebhookEventRow({
  event,
  onRetry,
}: {
  event: ShopifyWebhookEvent;
  onRetry: (id: string) => void;
}) {
  const config = STATUS_MAP[event.processing_status] || STATUS_MAP.received;
  const StatusIcon = config.icon;

  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div className="flex items-center gap-3">
        <StatusIcon className={`w-4 h-4 ${config.color}`} />
        <div>
          <p className="text-sm font-medium">{event.topic}</p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(event.received_at), { addSuffix: true })}
            {event.signature_valid ? ' · ✓ verified' : ' · ✗ unverified'}
          </p>
          {event.error_message && (
            <p className="text-xs text-destructive mt-0.5">{event.error_message}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={config.variant} className="capitalize text-xs">
          {event.processing_status}
        </Badge>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
              <Eye className="w-3.5 h-3.5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>{event.topic} — Payload</DialogTitle>
            </DialogHeader>
            <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto">
              {JSON.stringify(event.payload, null, 2)}
            </pre>
          </DialogContent>
        </Dialog>
        {event.processing_status === 'failed' && (
          <Button variant="ghost" size="sm" onClick={() => onRetry(event.id)}>
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}

export default function ShopifyWebhooks() {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { events, isLoading, retryWebhook, isRetrying } = useShopifyWebhooks(storeId);

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
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/app/integrations/shopify/${storeId}`)} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Store
        </Button>

        <h1 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <Webhook className="w-6 h-6 text-primary" />
          Webhook Events
        </h1>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total', value: stats.total, color: 'text-foreground' },
            { label: 'Processed', value: stats.processed, color: 'text-green-500' },
            { label: 'Failed', value: stats.failed, color: 'text-red-500' },
            { label: 'Unverified', value: stats.unverified, color: 'text-amber-500' },
          ].map(({ label, value, color }) => (
            <Card key={label}>
              <CardContent className="pt-4 pb-4 text-center">
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Events List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Events</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12" />)}
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Webhook className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No webhook events yet.</p>
              </div>
            ) : (
              <div>
                {events.map(event => (
                  <WebhookEventRow key={event.id} event={event} onRetry={handleRetry} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
