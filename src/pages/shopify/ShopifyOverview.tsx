import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Store, Plus, RefreshCw, Activity, Webhook,
  AlertCircle, CheckCircle2, Clock, ShoppingBag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShopifyPageShell, ShopifyEmptyState, ShopifyStatCard } from '@/components/shopify/ShopifyPageShell';
import { useShopifyStores } from '@/hooks/useShopifyStores';
import type { ConnectedStore } from '@/types/shopify';
import { formatDistanceToNow } from 'date-fns';

const STATUS_BADGE: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
  connected: { variant: 'default', label: 'Connected' },
  pending: { variant: 'secondary', label: 'Pending' },
  disconnected: { variant: 'outline', label: 'Disconnected' },
  error: { variant: 'destructive', label: 'Error' },
  uninstalled: { variant: 'destructive', label: 'Uninstalled' },
};

function StoreCard({ store, onClick }: { store: ConnectedStore; onClick: () => void }) {
  const badge = STATUS_BADGE[store.status] || STATUS_BADGE.pending;
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow group" onClick={onClick}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
              <Store className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base truncate">{store.store_name || store.store_domain}</CardTitle>
              <CardDescription className="text-xs truncate">{store.store_domain}</CardDescription>
            </div>
          </div>
          <Badge variant={badge.variant}>{badge.label}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm text-muted-foreground">
          {store.store_plan && (
            <div className="flex justify-between">
              <span>Plan</span>
              <span className="font-medium text-foreground capitalize">{store.store_plan}</span>
            </div>
          )}
          {store.store_currency && (
            <div className="flex justify-between">
              <span>Currency</span>
              <span className="font-medium text-foreground">{store.store_currency}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Webhooks</span>
            <span className="flex items-center gap-1">
              {store.webhooks_registered ? (
                <><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Active</>
              ) : (
                <><AlertCircle className="h-3.5 w-3.5 text-amber-500" /> Not set</>
              )}
            </span>
          </div>
          {store.last_synced_at && (
            <div className="flex justify-between">
              <span>Last sync</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatDistanceToNow(new Date(store.last_synced_at), { addSuffix: true })}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ShopifyOverview() {
  const navigate = useNavigate();
  const { stores, isLoading, error, refetch } = useShopifyStores();
  const connectedStores = stores.filter(s => s.status === 'connected');

  return (
    <ShopifyPageShell
      title="Shopify Integration"
      subtitle="Connect your Shopify stores to enable commerce-driven engagement"
      icon={ShoppingBag}
      isLoading={isLoading}
      error={error?.message || null}
      maxWidth="2xl"
      actions={
        <>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
          <Button onClick={() => navigate('/app/integrations/shopify/connect')}>
            <Plus className="h-4 w-4 mr-2" /> Connect Store
          </Button>
        </>
      }
    >
      {/* Quick Stats */}
      {connectedStores.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <ShopifyStatCard label="Connected Stores" value={connectedStores.length} icon={Store} />
          <ShopifyStatCard label="Webhooks Active" value={connectedStores.filter(s => s.webhooks_registered).length} icon={Activity} iconColor="text-green-500" />
          <ShopifyStatCard label="Synced" value={connectedStores.filter(s => s.last_synced_at).length} icon={RefreshCw} iconColor="text-blue-500" />
          <ShopifyStatCard label="Widget Active" value={connectedStores.filter(s => s.app_embed_enabled).length} icon={Webhook} iconColor="text-purple-500" />
        </div>
      )}

      {/* Stores Grid */}
      {stores.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-0">
            <ShopifyEmptyState
              icon={ShoppingBag}
              title="No Shopify Stores Connected"
              description="Connect your Shopify store to sync products, customers, and orders for WhatsApp engagement."
              action={
                <Button onClick={() => navigate('/app/integrations/shopify/connect')}>
                  <Plus className="h-4 w-4 mr-2" /> Connect Your First Store
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map(store => (
            <StoreCard
              key={store.id}
              store={store}
              onClick={() => navigate(`/app/integrations/shopify/${store.id}`)}
            />
          ))}
        </div>
      )}
    </ShopifyPageShell>
  );
}
