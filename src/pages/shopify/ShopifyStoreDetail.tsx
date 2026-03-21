import React from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Store, RefreshCw, Settings, Database, Webhook,
  Globe, CheckCircle2, AlertCircle, XCircle, Loader2,
  ShoppingCart, Zap, BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShopifyPageShell, ShopifyStatCard } from '@/components/shopify/ShopifyPageShell';
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
  const { triggerSync, isSyncing } = useShopifySync(storeId);
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

  if (!store && !isLoading) {
    return (
      <ShopifyPageShell
        title="Store Not Found"
        icon={XCircle}
        backTo="/app/integrations/shopify"
        backLabel="All Stores"
        error="The requested store could not be found."
      >
        <div />
      </ShopifyPageShell>
    );
  }

  const navItems = [
    { label: 'Sync Center', icon: RefreshCw, path: `/app/integrations/shopify/${storeId}/sync`, desc: 'Manual sync & job history' },
    { label: 'Webhooks', icon: Webhook, path: `/app/integrations/shopify/${storeId}/webhooks`, desc: 'Event delivery & retries' },
    { label: 'Data Explorer', icon: Database, path: `/app/integrations/shopify/${storeId}/data`, desc: 'Browse synced data' },
    { label: 'Cart Recovery', icon: ShoppingCart, path: `/app/integrations/shopify/${storeId}/recovery`, desc: 'Recover abandoned carts' },
    { label: 'Automations', icon: Zap, path: `/app/integrations/shopify/${storeId}/automations`, desc: 'Engagement rules' },
    { label: 'Analytics', icon: BarChart3, path: `/app/integrations/shopify/${storeId}/analytics`, desc: 'Sales & conversion data' },
    { label: 'Settings', icon: Settings, path: `/app/integrations/shopify/${storeId}/settings`, desc: 'Widget & feature toggles' },
  ];

  return (
    <ShopifyPageShell
      title={store?.store_name || store?.store_domain || 'Store'}
      subtitle={store?.store_domain}
      icon={Store}
      isLoading={isLoading}
      backTo="/app/integrations/shopify"
      backLabel="All Stores"
      actions={
        <>
          <Button variant="outline" size="sm" onClick={handleQuickSync} disabled={isSyncing}>
            {isSyncing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Sync Now
          </Button>
          <Button
            variant="outline" size="sm"
            className="text-destructive hover:text-destructive"
            onClick={handleDisconnect}
            disabled={isDisconnecting}
          >
            Disconnect
          </Button>
        </>
      }
    >
      {justConnected && (
        <div className="mb-6 p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
          <div>
            <p className="font-medium text-green-800 dark:text-green-200">Store Connected Successfully!</p>
            <p className="text-sm text-green-600 dark:text-green-400">Initial sync has been queued. Your data will be available shortly.</p>
          </div>
        </div>
      )}

      {/* Status Cards */}
      {store && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1">Status</p>
            <Badge variant={store.status === 'connected' ? 'default' : 'destructive'} className="capitalize">
              {store.status}
            </Badge>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1">Plan</p>
            <p className="font-semibold capitalize">{store.store_plan || '—'}</p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1">Webhooks</p>
            <div className="flex items-center gap-1">
              {store.webhooks_registered ? (
                <><CheckCircle2 className="h-4 w-4 text-green-500" /><span className="font-semibold">Active</span></>
              ) : (
                <><AlertCircle className="h-4 w-4 text-amber-500" /><span className="font-semibold">Inactive</span></>
              )}
            </div>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1">Last Sync</p>
            <p className="font-semibold">
              {store.last_synced_at ? formatDistanceToNow(new Date(store.last_synced_at), { addSuffix: true }) : 'Never'}
            </p>
          </div>
        </div>
      )}

      {/* Store Metadata */}
      {store && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-base">Store Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div><p className="text-muted-foreground">Domain</p><p className="font-medium">{store.store_domain}</p></div>
              <div><p className="text-muted-foreground">Currency</p><p className="font-medium">{store.store_currency || '—'}</p></div>
              <div><p className="text-muted-foreground">Timezone</p><p className="font-medium">{store.store_timezone || '—'}</p></div>
              <div><p className="text-muted-foreground">Email</p><p className="font-medium truncate">{store.store_email || '—'}</p></div>
              <div><p className="text-muted-foreground">Installed</p><p className="font-medium">{store.installed_at ? formatDistanceToNow(new Date(store.installed_at), { addSuffix: true }) : '—'}</p></div>
              <div><p className="text-muted-foreground">Scopes</p><p className="font-medium">{store.scopes?.length || 0} permissions</p></div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {navItems.map(({ label, icon: Icon, path, desc }) => (
          <Card
            key={path}
            className="cursor-pointer hover:shadow-md hover:border-primary/20 transition-all group"
            onClick={() => navigate(path)}
          >
            <CardContent className="flex flex-col items-center justify-center py-6 sm:py-8 px-3 text-center">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/15 transition-colors">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <p className="font-medium text-sm">{label}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 hidden sm:block">{desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </ShopifyPageShell>
  );
}
