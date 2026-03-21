import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  RefreshCw, Play, RotateCcw, CheckCircle2, XCircle,
  Clock, Loader2, AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ShopifyPageShell, ShopifyEmptyState } from '@/components/shopify/ShopifyPageShell';
import { useShopifySync } from '@/hooks/useShopifySync';
import { useToast } from '@/hooks/use-toast';
import type { SyncResource, ShopifySyncJob } from '@/types/shopify';
import { formatDistanceToNow } from 'date-fns';

const SYNC_RESOURCES: { key: SyncResource; label: string; icon: string }[] = [
  { key: 'all', label: 'Full Sync', icon: '🔄' },
  { key: 'products', label: 'Products', icon: '📦' },
  { key: 'collections', label: 'Collections', icon: '📂' },
  { key: 'customers', label: 'Customers', icon: '👥' },
  { key: 'orders', label: 'Orders', icon: '🧾' },
  { key: 'abandoned_checkouts', label: 'Abandoned Checkouts', icon: '🛒' },
];

const STATUS_CONFIG: Record<string, { icon: React.ElementType; color: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  queued: { icon: Clock, color: 'text-amber-500', variant: 'secondary' },
  running: { icon: Loader2, color: 'text-blue-500', variant: 'default' },
  completed: { icon: CheckCircle2, color: 'text-green-500', variant: 'outline' },
  failed: { icon: XCircle, color: 'text-red-500', variant: 'destructive' },
  partial: { icon: AlertTriangle, color: 'text-amber-500', variant: 'secondary' },
};

function SyncJobRow({ job, onRetry }: { job: ShopifySyncJob; onRetry: (id: string) => void }) {
  const config = STATUS_CONFIG[job.status] || STATUS_CONFIG.queued;
  const StatusIcon = config.icon;

  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        <StatusIcon className={`h-4 w-4 shrink-0 ${config.color} ${job.status === 'running' ? 'animate-spin' : ''}`} />
        <div className="min-w-0">
          <p className="text-sm font-medium capitalize truncate">{job.job_type.replace(/_/g, ' ')}</p>
          <p className="text-xs text-muted-foreground">
            {job.started_at ? formatDistanceToNow(new Date(job.started_at), { addSuffix: true }) : 'Queued'}
            {job.items_processed > 0 && ` · ${job.items_processed} items`}
            {job.items_failed > 0 && ` · ${job.items_failed} failed`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Badge variant={config.variant} className="capitalize">{job.status}</Badge>
        {job.status === 'failed' && (
          <Button variant="ghost" size="sm" onClick={() => onRetry(job.id)}>
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}

export default function ShopifySyncCenter() {
  const { storeId } = useParams<{ storeId: string }>();
  const { toast } = useToast();
  const { syncJobs, isLoading, triggerSync, retrySync, isSyncing } = useShopifySync(storeId);

  const handleSync = async (resource: SyncResource) => {
    try {
      await triggerSync(resource);
      toast({ title: 'Sync Started', description: `${resource} sync has been queued.` });
    } catch (err: any) {
      toast({ title: 'Sync Failed', description: err.message, variant: 'destructive' });
    }
  };

  const handleRetry = async (jobId: string) => {
    try {
      await retrySync(jobId);
      toast({ title: 'Retry Queued' });
    } catch (err: any) {
      toast({ title: 'Retry Failed', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <ShopifyPageShell
      title="Sync Center"
      subtitle="Manage data synchronization with Shopify"
      icon={RefreshCw}
      backTo={`/app/integrations/shopify/${storeId}`}
      backLabel="Back to Store"
      isLoading={isLoading}
      maxWidth="md"
    >
      {/* Sync Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        {SYNC_RESOURCES.map(({ key, label, icon }) => (
          <Button
            key={key}
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2"
            onClick={() => handleSync(key)}
            disabled={isSyncing}
          >
            <span className="text-xl">{icon}</span>
            <span className="text-sm font-medium">{label}</span>
          </Button>
        ))}
      </div>

      {/* Sync History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sync History</CardTitle>
        </CardHeader>
        <CardContent>
          {syncJobs.length === 0 ? (
            <ShopifyEmptyState
              icon={RefreshCw}
              title="No sync jobs yet"
              description="Start a sync above to import your Shopify data."
            />
          ) : (
            <div>
              {syncJobs.map(job => (
                <SyncJobRow key={job.id} job={job} onRetry={handleRetry} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </ShopifyPageShell>
  );
}
