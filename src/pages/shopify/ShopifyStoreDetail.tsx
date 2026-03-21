import React from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Store,
  RefreshCw,
  Settings,
  Database,
  Webhook,
  Activity,
  Globe,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useShopifyStores } from '@/hooks/useShopifyStores';
import { useShopifySync } from '@/hooks/useShopifySync';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

export default function ShopifyStoreDetail() {
  const { storeId } = useParams<{ storeId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { storeByIdQuery, disconnect, isDisconnecting } = useShopifyStores();
  const { data: store, isLoading } = storeByIdQuery(storeId);
  const { syncJobs, triggerSync, isSyncing } = useShopifySync(storeId);

  const justConnected = searchParams.get('connected') === 'true';

  const handleQuickSync = async () => {
    try {
      await triggerSync('all');
      toast({ title: 'Sync Started', description: 'Full sync has been queued.' });
    } catch (err: any) {
      toast({ title: 'Sync Failed', description: err.message, variant: 'destructive' });
    }
  };

  const handleDisconnect = () => {
    if (!storeId) return;
    disconnect(storeId, {
      onSuccess: () => {
        toast({ title: 'Store Disconnected' });
        navigate('/app/integrations/shopify');
      },
    } as any);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-6 max-w-5xl space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!store) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-6 max-w-5xl text-center py-16">
          <XCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold mb-2">Store Not Found</h2>
          <Button variant="outline" onClick={() => navigate('/app/integrations/shopify')}>
            Back to Shopify
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const latestSync = syncJobs[0];

  const navItems = [
    { label: 'Sync Center', icon: RefreshCw, path: `/app/integrations/shopify/${storeId}/sync` },
    { label: 'Webhooks', icon: Webhook, path: `/app/integrations/shopify/${storeId}/webhooks` },
    { label: 'Data Explorer', icon: Database, path: `/app/integrations/shopify/${storeId}/data` },
    { label: 'Cart Recovery', icon: Activity, path: `/app/integrations/shopify/${storeId}/recovery` },
    { label: 'Automations', icon: Activity, path: `/app/integrations/shopify/${storeId}/automations` },
    { label: 'Analytics', icon: Activity, path: `/app/integrations/shopify/${storeId}/analytics` },
    { label: 'Settings', icon: Settings, path: `/app/integrations/shopify/${storeId}/settings` },
  ];

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <Button variant="ghost" size="sm" onClick={() => navigate('/app/integrations/shopify')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          All Stores
        </Button>

        {justConnected && (
          <div className="mb-6 p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800 dark:text-green-200">Store Connected Successfully!</p>
              <p className="text-sm text-green-600 dark:text-green-400">Initial sync has been queued. Your data will be available shortly.</p>
            </div>
          </div>
        )}

        {/* Store Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--primary)/0.1)] flex items-center justify-center">
              <Store className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{store.store_name || store.store_domain}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="w-3.5 h-3.5" />
                {store.store_domain}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleQuickSync} disabled={isSyncing}>
              {isSyncing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Sync Now
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={handleDisconnect}
              disabled={isDisconnecting}
            >
              Disconnect
            </Button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              <Badge variant={store.status === 'connected' ? 'default' : 'destructive'} className="capitalize">
                {store.status}
              </Badge>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground mb-1">Plan</p>
              <p className="font-semibold capitalize">{store.store_plan || '—'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground mb-1">Webhooks</p>
              <div className="flex items-center gap-1">
                {store.webhooks_registered ? (
                  <><CheckCircle2 className="w-4 h-4 text-green-500" /><span className="font-semibold">Active</span></>
                ) : (
                  <><AlertCircle className="w-4 h-4 text-amber-500" /><span className="font-semibold">Inactive</span></>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground mb-1">Last Sync</p>
              <p className="font-semibold">
                {store.last_synced_at
                  ? formatDistanceToNow(new Date(store.last_synced_at), { addSuffix: true })
                  : 'Never'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Meta Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-base">Store Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Domain</p>
                <p className="font-medium">{store.store_domain}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Currency</p>
                <p className="font-medium">{store.store_currency || '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Timezone</p>
                <p className="font-medium">{store.store_timezone || '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{store.store_email || '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Installed</p>
                <p className="font-medium">
                  {store.installed_at ? formatDistanceToNow(new Date(store.installed_at), { addSuffix: true }) : '—'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Scopes</p>
                <p className="font-medium">{store.scopes?.length || 0} permissions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {navItems.map(({ label, icon: Icon, path }) => (
            <Card
              key={path}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(path)}
            >
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Icon className="w-8 h-8 text-primary mb-3" />
                <p className="font-medium text-sm">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
